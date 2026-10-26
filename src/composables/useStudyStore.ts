import { ref, computed, watch } from 'vue'
import type { Question, StudyDeck, AISettings } from '../types'
import { STORAGE_KEYS, loadJson } from '../services/storageKeys'
import { useGamificationStore, DEFAULT_REWARDS, LEVEL_TIERS, DEFAULT_PROFILE } from './useGamificationStore'
import { useDeckStore, detectBestFolderForDeck } from './useDeckStore'
import { useProgressStore } from './useProgressStore'
import { useCloudSyncStore } from './useCloudSyncStore'
import { upsertCloudDeck, removeCloudDeck } from '../services/supabaseSync'

export { DEFAULT_REWARDS, LEVEL_TIERS, detectBestFolderForDeck }

const envMeta = (import.meta as any).env || {}

// AI Settings singleton
const aiSettings = ref<AISettings>(
  loadJson(STORAGE_KEYS.AI_SETTINGS, {
    provider: 'gemini',
    geminiKey: envMeta.VITE_GEMINI_API_KEY || '',
    openaiKey: envMeta.VITE_OPENAI_API_KEY || '',
    anthropicKey: envMeta.VITE_ANTHROPIC_API_KEY || '',
    ollamaUrl: 'http://localhost:11434',
    model: 'gemini-3.8-flash'
  })
)

if (aiSettings.value.provider === 'gemini' && aiSettings.value.model === 'gemini-2.5-flash') {
  aiSettings.value.model = 'gemini-3.8-flash'
}
if (!aiSettings.value.geminiKey && envMeta.VITE_GEMINI_API_KEY) {
  aiSettings.value.geminiKey = envMeta.VITE_GEMINI_API_KEY
}
if (!aiSettings.value.openaiKey && envMeta.VITE_OPENAI_API_KEY) {
  aiSettings.value.openaiKey = envMeta.VITE_OPENAI_API_KEY
}

watch(aiSettings, (val) => localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(val)), { deep: true })

export function useStudyStore() {
  const gamification = useGamificationStore()
  const deckStore = useDeckStore()
  const progressStore = useProgressStore()
  const cloudSync = useCloudSyncStore()

  // Initial cloud sync trigger
  cloudSync.triggerInitialSyncOnce({
    customDecks: deckStore.customDecks,
    customQuestions: progressStore.customQuestions,
    progressMap: progressStore.progressMap,
    userProfile: gamification.userProfile
  })

  function syncFromCloud() {
    return cloudSync.syncFromCloud({
      customDecks: deckStore.customDecks,
      customQuestions: progressStore.customQuestions,
      progressMap: progressStore.progressMap,
      userProfile: gamification.userProfile
    })
  }

  function scheduleProgressPush() {
    cloudSync.scheduleProgressPush(progressStore.progressMap.value, gamification.userProfile.value)
  }

  function getDeckQuestions(deckId: string): Question[] {
    return progressStore.getDeckQuestions(deckId, deckStore.allDecks.value)
  }

  function getDeckStats(deckId: string) {
    return progressStore.getDeckStats(deckId, deckStore.allDecks.value)
  }

  function getFolderStats(folderId: string) {
    return progressStore.getFolderStats(folderId, deckStore.allDecks.value)
  }

  const achievements = computed(() => {
    return progressStore.getAchievements(gamification.userProfile.value)
  })

  function recordAnswer(questionId: string, isCorrect: boolean) {
    progressStore.recordAnswer(questionId, isCorrect, {
      onActivityXp: (pts, reason, countDaily) => {
        gamification.addStudyActivityAndXp(pts, reason, countDaily)
      },
      onScheduleSync: scheduleProgressPush
    })
  }

  function recordFlashcardRating(questionId: string, rating: 'again' | 'hard' | 'good' | 'easy') {
    progressStore.recordFlashcardRating(questionId, rating, {
      onActivityXp: (pts, reason, countDaily) => {
        gamification.addStudyActivityAndXp(pts, reason, countDaily)
      },
      onScheduleSync: scheduleProgressPush
    })
  }

  function rewardMatchingRound(mistakesCount = 0) {
    progressStore.rewardMatchingRound(mistakesCount, {
      onActivityXp: (pts, reason, countDaily) => {
        gamification.addStudyActivityAndXp(pts, reason, countDaily)
      },
      onScheduleSync: scheduleProgressPush
    })
  }

  function toggleBookmark(questionId: string) {
    progressStore.toggleBookmark(questionId, scheduleProgressPush)
  }

  function savePersonalNote(questionId: string, note: string) {
    progressStore.savePersonalNote(questionId, note, scheduleProgressPush)
  }

  function moveDeckToFolder(deckId: string, targetFolderId: string) {
    deckStore.moveDeckToFolder(deckId, targetFolderId, (cd) => {
      if (cloudSync.isCloudConfigured.value) {
        upsertCloudDeck(
          cloudSync.supabaseConfig.value,
          cd,
          progressStore.customQuestions.value.filter((q) => q.deckId === deckId)
        ).catch(console.error)
      }
    })
  }

  async function addGeneratedDeck(payload: {
    deckTitle: string
    deckDescription: string
    folderId?: string
    sourceFileName?: string
    summaryPoints?: string[]
    questions: Array<Omit<Question, 'id' | 'deckId'>>
  }): Promise<StudyDeck> {
    const { newDeck, createdQuestions } = deckStore.createGeneratedDeckObject(payload)
    deckStore.customDecks.value.unshift(newDeck)
    progressStore.customQuestions.value.push(...createdQuestions)

    if (cloudSync.isCloudConfigured.value) {
      try {
        cloudSync.cloudSyncStatus.value = 'syncing'
        await upsertCloudDeck(cloudSync.supabaseConfig.value, newDeck, createdQuestions)
        cloudSync.cloudSyncStatus.value = 'synced'
      } catch (err: any) {
        cloudSync.cloudSyncStatus.value = 'error'
        cloudSync.cloudSyncError.value = err?.message || 'Deck lokal gespeichert, aber Cloud-Upload fehlgeschlagen.'
      }
    }

    return newDeck
  }

  async function deleteCustomDeck(deckId: string) {
    deckStore.customDecks.value = deckStore.customDecks.value.filter((d) => d.id !== deckId)
    progressStore.customQuestions.value = progressStore.customQuestions.value.filter((q) => q.deckId !== deckId)

    if (cloudSync.isCloudConfigured.value) {
      try {
        await removeCloudDeck(cloudSync.supabaseConfig.value, deckId)
      } catch (err) {
        console.error(err)
      }
    }
  }

  async function resetProgress() {
    progressStore.resetProgress()
    gamification.userProfile.value.xp = 0
    gamification.userProfile.value.spentCoins = 0
    gamification.userProfile.value.todayAnsweredCount = 0
    if (cloudSync.isCloudConfigured.value) {
      await cloudSync.pushProgressAndProfileToCloud(
        progressStore.progressMap.value,
        gamification.userProfile.value
      ).catch(() => {})
    }
  }

  function exportBackupJson(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        customDecks: deckStore.customDecks.value,
        customQuestions: progressStore.customQuestions.value,
        progress: progressStore.progressMap.value,
        userProfile: gamification.userProfile.value
      },
      null,
      2
    )
  }

  function importBackupJson(rawJson: string) {
    const parsed = JSON.parse(rawJson)
    if (Array.isArray(parsed.customDecks)) deckStore.customDecks.value = parsed.customDecks
    if (Array.isArray(parsed.customQuestions)) progressStore.customQuestions.value = parsed.customQuestions
    if (parsed.progress && typeof parsed.progress === 'object') progressStore.progressMap.value = parsed.progress
    if (parsed.userProfile && typeof parsed.userProfile === 'object') {
      gamification.userProfile.value = { ...DEFAULT_PROFILE, ...parsed.userProfile }
    }
    if (cloudSync.isCloudConfigured.value) {
      syncFromCloud()
    }
  }

  return {
    // Decks & Folders
    allDecks: deckStore.allDecks,
    folders: deckStore.folders,
    customDecks: deckStore.customDecks,
    addFolder: deckStore.addFolder,
    deleteFolder: deckStore.deleteFolder,
    moveDeckToFolder,
    moveDeckOrder: deckStore.moveDeckOrder,
    setDeckOrder: deckStore.setDeckOrder,
    detectBestFolderForDeck,
    getFolderStats,
    addGeneratedDeck,
    deleteCustomDeck,

    // Questions & Progress
    allQuestions: progressStore.allQuestions,
    customQuestions: progressStore.customQuestions,
    progressMap: progressStore.progressMap,
    overallStats: progressStore.overallStats,
    getDeckQuestions,
    getDeckStats,
    getProgress: progressStore.getProgress,
    recordAnswer,
    recordFlashcardRating,
    rewardMatchingRound,
    toggleBookmark,
    savePersonalNote,
    resetProgress,

    // Gamification & Profile
    userProfile: gamification.userProfile,
    availableCoins: gamification.availableCoins,
    levelInfo: gamification.levelInfo,
    achievements,
    lastXpGain: gamification.lastXpGain,
    redeemReward: (id: string) => gamification.redeemReward(id, scheduleProgressPush),
    toggleVoucherFulfilled: (id: string) => gamification.toggleVoucherFulfilled(id, scheduleProgressPush),
    addCustomReward: (p: any) => gamification.addCustomReward(p, scheduleProgressPush),
    deleteReward: (id: string) => gamification.deleteReward(id, scheduleProgressPush),

    // Cloud & AI
    aiSettings,
    supabaseConfig: cloudSync.supabaseConfig,
    isCloudConfigured: cloudSync.isCloudConfigured,
    cloudSyncStatus: cloudSync.cloudSyncStatus,
    cloudSyncError: cloudSync.cloudSyncError,
    syncFromCloud,
    scheduleProgressPush,

    // Backup
    exportBackupJson,
    importBackupJson
  }
}
