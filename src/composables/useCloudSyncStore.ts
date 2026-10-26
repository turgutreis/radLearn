import { ref, computed, watch } from 'vue'
import {
  type SupabaseConfig,
  fetchCloudDecks,
  upsertCloudDeck,
  removeCloudDeck,
  fetchCloudProgress,
  saveCloudProgress
} from '../services/supabaseSync'
import { INITIAL_DECKS, INITIAL_QUESTIONS } from '../data/initialData'
import type { StudyDeck, Question, QuestionProgress, UserProfile } from '../types'
import { STORAGE_KEYS, loadJson } from '../services/storageKeys'
import { recalculateFairXp, migrateRewardsList, DEFAULT_PROFILE } from './useGamificationStore'

const envMeta = (import.meta as any).env || {}

const supabaseConfig = ref<SupabaseConfig>(
  loadJson(STORAGE_KEYS.SUPABASE_CONFIG, {
    url: envMeta.VITE_SUPABASE_URL || '',
    anonKey: envMeta.VITE_SUPABASE_ANON_KEY || '',
    syncId: envMeta.VITE_SUPABASE_SYNC_ID || 'mtr-strahlenschutz'
  })
)

if (!supabaseConfig.value.url && envMeta.VITE_SUPABASE_URL) {
  supabaseConfig.value.url = envMeta.VITE_SUPABASE_URL
}
if (!supabaseConfig.value.anonKey && envMeta.VITE_SUPABASE_ANON_KEY) {
  supabaseConfig.value.anonKey = envMeta.VITE_SUPABASE_ANON_KEY
}

watch(supabaseConfig, (val) => localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(val)), { deep: true })

const cloudSyncStatus = ref<'disconnected' | 'syncing' | 'synced' | 'error'>('disconnected')
const cloudSyncError = ref<string | null>(null)
let hasInitialSyncRun = false
let progressSyncTimer: ReturnType<typeof setTimeout> | null = null

export function useCloudSyncStore() {
  const isCloudConfigured = computed(() =>
    Boolean(supabaseConfig.value.url.trim() && supabaseConfig.value.anonKey.trim())
  )

  async function pushProgressAndProfileToCloud(
    progressMap: Record<string, QuestionProgress>,
    userProfile: UserProfile
  ) {
    const payload: any = {
      ...progressMap,
      _profile: userProfile
    }
    await saveCloudProgress(supabaseConfig.value, payload)
  }

  function scheduleProgressPush(
    progressMap: Record<string, QuestionProgress>,
    userProfile: UserProfile
  ) {
    if (!isCloudConfigured.value) return
    if (progressSyncTimer) clearTimeout(progressSyncTimer)
    progressSyncTimer = setTimeout(async () => {
      try {
        cloudSyncStatus.value = 'syncing'
        await pushProgressAndProfileToCloud(progressMap, userProfile)
        cloudSyncStatus.value = 'synced'
      } catch (err: any) {
        cloudSyncStatus.value = 'error'
        cloudSyncError.value = err?.message || 'Fehler beim Speichern des Lernfortschritts.'
      }
    }, 700)
  }

  async function syncFromCloud(options: {
    customDecks: { value: StudyDeck[] }
    customQuestions: { value: Question[] }
    progressMap: { value: Record<string, QuestionProgress> }
    userProfile: { value: UserProfile }
  }) {
    if (!isCloudConfigured.value) {
      cloudSyncStatus.value = 'disconnected'
      return
    }

    cloudSyncStatus.value = 'syncing'
    cloudSyncError.value = null

    try {
      const cloudData = await fetchCloudDecks(supabaseConfig.value)
      const cloudDeckIds = new Set(cloudData.decks.map((d) => d.id))

      // 1. Initial Decks in Supabase sichern falls noch nicht vorhanden
      for (const initDeck of INITIAL_DECKS) {
        if (!cloudDeckIds.has(initDeck.id)) {
          const qs = INITIAL_QUESTIONS.filter((q) => q.deckId === initDeck.id)
          await upsertCloudDeck(supabaseConfig.value, initDeck, qs)
          cloudDeckIds.add(initDeck.id)
          cloudData.decks.push(initDeck)
          cloudData.questions.push(...qs)
        }
      }

      // 2. Lokale benutzerdefinierte Decks sichern
      for (const localDeck of options.customDecks.value) {
        if (!cloudDeckIds.has(localDeck.id)) {
          const qs = options.customQuestions.value.filter((q) => q.deckId === localDeck.id)
          await upsertCloudDeck(supabaseConfig.value, localDeck, qs)
          cloudData.decks.unshift(localDeck)
          cloudData.questions.push(...qs)
        }
      }

      const builtInIds = new Set(INITIAL_DECKS.map((d) => d.id))
      options.customDecks.value = cloudData.decks.filter((d) => !builtInIds.has(d.id))
      options.customQuestions.value = cloudData.questions.filter((q) => !builtInIds.has(q.deckId))

      // 3. Lernfortschritt & Profil abgleichen
      const cloudProgRaw = (await fetchCloudProgress(supabaseConfig.value)) as any
      if (cloudProgRaw) {
        const merged: Record<string, QuestionProgress> = {}
        for (const [key, val] of Object.entries(cloudProgRaw)) {
          if (key === '_profile') continue
          merged[key] = val as QuestionProgress
        }

        for (const [qId, localP] of Object.entries(options.progressMap.value)) {
          const remoteP = merged[qId]
          if (!remoteP || (localP.attempts || 0) > (remoteP.attempts || 0) || localP.personalNote) {
            merged[qId] = {
              ...remoteP,
              ...localP,
              personalNote: localP.personalNote || remoteP?.personalNote
            }
          }
        }
        options.progressMap.value = merged

        if (cloudProgRaw._profile) {
          const remoteProf = cloudProgRaw._profile as UserProfile
          const rawXp = Math.max(remoteProf.xp || 0, options.userProfile.value.xp || 0)
          const calibratedXp = recalculateFairXp(rawXp, merged)
          options.userProfile.value = {
            ...DEFAULT_PROFILE,
            ...remoteProf,
            dailyGoal: 25,
            xp: calibratedXp,
            rewards: migrateRewardsList(remoteProf.rewards || options.userProfile.value.rewards),
            vouchers: Array.isArray(remoteProf.vouchers) ? remoteProf.vouchers : options.userProfile.value.vouchers
          }
          if (calibratedXp !== remoteProf.xp) {
            await pushProgressAndProfileToCloud(options.progressMap.value, options.userProfile.value)
          }
        }
      } else {
        await pushProgressAndProfileToCloud(options.progressMap.value, options.userProfile.value)
      }

      cloudSyncStatus.value = 'synced'
    } catch (err: any) {
      console.error('Supabase Sync Error:', err)
      cloudSyncStatus.value = 'error'
      cloudSyncError.value = err?.message || 'Verbindung zu Supabase fehlgeschlagen.'
    }
  }

  function triggerInitialSyncOnce(options: {
    customDecks: { value: StudyDeck[] }
    customQuestions: { value: Question[] }
    progressMap: { value: Record<string, QuestionProgress> }
    userProfile: { value: UserProfile }
  }) {
    if (!hasInitialSyncRun) {
      hasInitialSyncRun = true
      if (isCloudConfigured.value) {
        syncFromCloud(options)
      }
    }
  }

  return {
    supabaseConfig,
    cloudSyncStatus,
    cloudSyncError,
    isCloudConfigured,
    syncFromCloud,
    pushProgressAndProfileToCloud,
    scheduleProgressPush,
    triggerInitialSyncOnce,
    upsertCloudDeck,
    removeCloudDeck
  }
}
