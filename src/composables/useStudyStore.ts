import { ref, computed, watch } from 'vue'
import { INITIAL_DECKS, INITIAL_QUESTIONS } from '../data/initialData'
import type {
  StudyDeck,
  Question,
  QuestionProgress,
  AISettings,
  UserProfile,
  RewardItem
} from '../types'
import {
  type SupabaseConfig,
  fetchCloudDecks,
  upsertCloudDeck,
  removeCloudDeck,
  fetchCloudProgress,
  saveCloudProgress
} from '../services/supabaseSync'

const STORAGE_KEYS = {
  CUSTOM_DECKS: 'radlearn_custom_decks_v1',
  CUSTOM_QUESTIONS: 'radlearn_custom_questions_v1',
  PROGRESS: 'radlearn_progress_v1',
  PROFILE: 'radlearn_user_profile_v1',
  AI_SETTINGS: 'radlearn_ai_settings_v1',
  SUPABASE_CONFIG: 'radlearn_supabase_config_v1'
}

const DEFAULT_REWARDS: RewardItem[] = [
  {
    id: 'rew-coffee',
    title: 'Lieblings-Kaffee & süßes Teilchen',
    description: 'Frisch vom Ehemann direkt an den Schreibtisch oder ans Bett serviert.',
    cost: 150,
    emoji: '☕',
    redeemedCount: 0
  },
  {
    id: 'rew-massage',
    title: '30 Min. Nacken- & Rückenmassage',
    description: 'Entspannung pur nach einem langen Lerntag im Strahlenschutz.',
    cost: 350,
    emoji: '💆‍♀️',
    redeemedCount: 0
  },
  {
    id: 'rew-movie',
    title: 'Kino- oder Serienabend deiner Wahl',
    description: 'Du bestimmst den Film/die Serie + Lieblingssnacks ohne Diskussion!',
    cost: 500,
    emoji: '🎬',
    redeemedCount: 0
  },
  {
    id: 'rew-sushi',
    title: 'Großes Sushi-Date (All you can eat!)',
    description: 'Schickes Sushi-Essen gehen (oder bestellen) komplett auf meinen Nacken!',
    cost: 800,
    emoji: '🍣',
    redeemedCount: 0
  },
  {
    id: 'rew-shopping',
    title: 'Wunsch-Gutschein / Shopping-Treat',
    description: 'Eine schöne Belohnung von deiner Wunschliste für deinen Fleiß.',
    cost: 1200,
    emoji: '🛍️',
    redeemedCount: 0
  },
  {
    id: 'rew-wellness',
    title: 'Wellness-Tag / Thermen-Ausflug zu zweit',
    description: 'Ein ganzer Tag Abschalten & Genießen nach der bestandenen Prüfung!',
    cost: 2000,
    emoji: '🧖‍♀️',
    redeemedCount: 0
  }
]

const DEFAULT_PROFILE: UserProfile = {
  name: 'Schatz',
  xp: 0,
  spentCoins: 0,
  streakDays: 0,
  lastStudyDate: '',
  dailyGoal: 15,
  todayAnsweredCount: 0,
  rewards: DEFAULT_REWARDS,
  vouchers: []
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function getYesterdayIso(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

const envMeta = (import.meta as any).env || {}

const customDecks = ref<StudyDeck[]>(loadJson(STORAGE_KEYS.CUSTOM_DECKS, []))
const customQuestions = ref<Question[]>(loadJson(STORAGE_KEYS.CUSTOM_QUESTIONS, []))
const progressMap = ref<Record<string, QuestionProgress>>(loadJson(STORAGE_KEYS.PROGRESS, {}))
const userProfile = ref<UserProfile>({
  ...DEFAULT_PROFILE,
  ...loadJson(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE)
})

// Tageszähler zurücksetzen, falls ein neuer Tag begonnen hat
const today = getTodayIso()
if (userProfile.value.lastStudyDate && userProfile.value.lastStudyDate !== today) {
  userProfile.value.todayAnsweredCount = 0
}

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

// Automatische Migration, falls im LocalStorage noch das veraltete gemini-2.5-flash gespeichert war
if (aiSettings.value.provider === 'gemini' && aiSettings.value.model === 'gemini-2.5-flash') {
  aiSettings.value.model = 'gemini-3.8-flash'
}

if (!aiSettings.value.geminiKey && envMeta.VITE_GEMINI_API_KEY) {
  aiSettings.value.geminiKey = envMeta.VITE_GEMINI_API_KEY
}
if (!aiSettings.value.openaiKey && envMeta.VITE_OPENAI_API_KEY) {
  aiSettings.value.openaiKey = envMeta.VITE_OPENAI_API_KEY
}

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

const cloudSyncStatus = ref<'disconnected' | 'syncing' | 'synced' | 'error'>('disconnected')
const cloudSyncError = ref<string | null>(null)
const lastXpGain = ref<{ amount: number; label: string } | null>(null)
let xpGainTimer: ReturnType<typeof setTimeout> | null = null
let hasInitialSyncRun = false
let progressSyncTimer: ReturnType<typeof setTimeout> | null = null

watch(customDecks, (val) => localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(val)), { deep: true })
watch(customQuestions, (val) => localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(val)), { deep: true })
watch(progressMap, (val) => localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(val)), { deep: true })
watch(userProfile, (val) => localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(val)), { deep: true })
watch(aiSettings, (val) => localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(val)), { deep: true })
watch(supabaseConfig, (val) => localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(val)), { deep: true })

export const LEVEL_TIERS = [
  { level: 1, title: 'Strahlenschutz-Starterin', minXp: 0, badge: '🌱' },
  { level: 2, title: 'Dosimeter-Trägerin', minXp: 150, badge: '📟' },
  { level: 3, title: 'Röntgen-Kennerin', minXp: 350, badge: '⚡' },
  { level: 4, title: 'Kontrollbereich-Profi', minXp: 650, badge: '☢️' },
  { level: 5, title: 'ALARA-Meisterin', minXp: 1000, badge: '🛡️' },
  { level: 6, title: 'SSB-Ehrenrang', minXp: 1500, badge: '🏅' },
  { level: 7, title: 'MTR-Examens-Queen', minXp: 2200, badge: '👑' }
]

export function useStudyStore() {
  const isCloudConfigured = computed(() =>
    Boolean(supabaseConfig.value.url.trim() && supabaseConfig.value.anonKey.trim())
  )

  const allDecks = computed<StudyDeck[]>(() => {
    const map = new Map<string, StudyDeck>()
    for (const d of INITIAL_DECKS) map.set(d.id, d)
    for (const d of customDecks.value) map.set(d.id, d)
    return Array.from(map.values())
  })

  const allQuestions = computed<Question[]>(() => {
    const map = new Map<string, Question>()
    for (const q of INITIAL_QUESTIONS) map.set(q.id, q)
    for (const q of customQuestions.value) map.set(q.id, q)
    return Array.from(map.values())
  })

  function triggerXpToast(amount: number, label: string) {
    lastXpGain.value = { amount, label }
    if (xpGainTimer) clearTimeout(xpGainTimer)
    xpGainTimer = setTimeout(() => {
      lastXpGain.value = null
    }, 2600)
  }

  function addStudyActivityAndXp(xpEarned: number, reason: string) {
    const todayStr = getTodayIso()
    const yesterdayStr = getYesterdayIso()

    if (userProfile.value.lastStudyDate !== todayStr) {
      if (userProfile.value.lastStudyDate === yesterdayStr) {
        userProfile.value.streakDays += 1
      } else {
        userProfile.value.streakDays = 1
      }
      userProfile.value.lastStudyDate = todayStr
      userProfile.value.todayAnsweredCount = 0
    }

    userProfile.value.todayAnsweredCount += 1

    // Tagesziel-Bonus beim genauen Erreichen des Tagesziels!
    let totalGain = xpEarned
    if (userProfile.value.todayAnsweredCount === userProfile.value.dailyGoal) {
      totalGain += 50
      triggerXpToast(totalGain, `Tagesziel erreicht! +50 Bonus-Punkte 🎉`)
    } else if (xpEarned > 0) {
      triggerXpToast(xpEarned, reason)
    }

    userProfile.value.xp += totalGain
  }

  // Verfügbare Belohnungs-Punkte (Coins) = Gesamt-XP minus bereits eingelöste Punkte
  const availableCoins = computed(() =>
    Math.max(0, userProfile.value.xp - (userProfile.value.spentCoins || 0))
  )

  const levelInfo = computed(() => {
    const xp = userProfile.value.xp
    let current = LEVEL_TIERS[0]
    let next = LEVEL_TIERS[1]

    for (let i = 0; i < LEVEL_TIERS.length; i++) {
      if (xp >= LEVEL_TIERS[i].minXp) {
        current = LEVEL_TIERS[i]
        next = LEVEL_TIERS[i + 1] || LEVEL_TIERS[i]
      }
    }

    const isMax = current.level === next.level
    const progressInTier = isMax ? 100 : Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100))

    return {
      current,
      next,
      isMax,
      progressInTier,
      xpToNext: isMax ? 0 : Math.max(0, next.minXp - xp)
    }
  })

  async function syncFromCloud() {
    if (!isCloudConfigured.value) {
      cloudSyncStatus.value = 'disconnected'
      return
    }

    cloudSyncStatus.value = 'syncing'
    cloudSyncError.value = null

    try {
      const cloudData = await fetchCloudDecks(supabaseConfig.value)
      const cloudDeckIds = new Set(cloudData.decks.map((d) => d.id))

      for (const initDeck of INITIAL_DECKS) {
        if (!cloudDeckIds.has(initDeck.id)) {
          const qs = INITIAL_QUESTIONS.filter((q) => q.deckId === initDeck.id)
          await upsertCloudDeck(supabaseConfig.value, initDeck, qs)
          cloudDeckIds.add(initDeck.id)
          cloudData.decks.push(initDeck)
          cloudData.questions.push(...qs)
        }
      }

      for (const localDeck of customDecks.value) {
        if (!cloudDeckIds.has(localDeck.id)) {
          const qs = customQuestions.value.filter((q) => q.deckId === localDeck.id)
          await upsertCloudDeck(supabaseConfig.value, localDeck, qs)
          cloudData.decks.unshift(localDeck)
          cloudData.questions.push(...qs)
        }
      }

      const builtInIds = new Set(INITIAL_DECKS.map((d) => d.id))
      customDecks.value = cloudData.decks.filter((d) => !builtInIds.has(d.id))
      customQuestions.value = cloudData.questions.filter((q) => !builtInIds.has(q.deckId))

      const cloudProgRaw = (await fetchCloudProgress(supabaseConfig.value)) as any
      if (cloudProgRaw) {
        // Profil-Daten aus _profile Key extrahieren, falls vorhanden
        if (cloudProgRaw._profile) {
          const remoteProf = cloudProgRaw._profile as UserProfile
          if ((remoteProf.xp || 0) >= (userProfile.value.xp || 0)) {
            userProfile.value = {
              ...DEFAULT_PROFILE,
              ...remoteProf,
              rewards: Array.isArray(remoteProf.rewards) && remoteProf.rewards.length > 0 ? remoteProf.rewards : userProfile.value.rewards,
              vouchers: Array.isArray(remoteProf.vouchers) ? remoteProf.vouchers : userProfile.value.vouchers
            }
          }
        }

        const merged: Record<string, QuestionProgress> = {}
        for (const [key, val] of Object.entries(cloudProgRaw)) {
          if (key === '_profile') continue
          merged[key] = val as QuestionProgress
        }

        for (const [qId, localP] of Object.entries(progressMap.value)) {
          const remoteP = merged[qId]
          if (!remoteP || (localP.attempts || 0) > (remoteP.attempts || 0) || localP.personalNote) {
            merged[qId] = {
              ...remoteP,
              ...localP,
              personalNote: localP.personalNote || remoteP?.personalNote
            }
          }
        }
        progressMap.value = merged
      } else {
        await pushProgressAndProfileToCloud()
      }

      cloudSyncStatus.value = 'synced'
    } catch (err: any) {
      console.error('Supabase Sync Error:', err)
      cloudSyncStatus.value = 'error'
      cloudSyncError.value = err?.message || 'Verbindung zu Supabase fehlgeschlagen.'
    }
  }

  async function pushProgressAndProfileToCloud() {
    const payload: any = {
      ...progressMap.value,
      _profile: userProfile.value
    }
    await saveCloudProgress(supabaseConfig.value, payload)
  }

  function scheduleProgressPush() {
    if (!isCloudConfigured.value) return
    if (progressSyncTimer) clearTimeout(progressSyncTimer)
    progressSyncTimer = setTimeout(async () => {
      try {
        cloudSyncStatus.value = 'syncing'
        await pushProgressAndProfileToCloud()
        cloudSyncStatus.value = 'synced'
      } catch (err: any) {
        cloudSyncStatus.value = 'error'
        cloudSyncError.value = err?.message || 'Fehler beim Speichern des Lernfortschritts.'
      }
    }, 700)
  }

  if (!hasInitialSyncRun) {
    hasInitialSyncRun = true
    if (isCloudConfigured.value) {
      syncFromCloud()
    }
  }

  function getDeckQuestions(deckId: string): Question[] {
    if (deckId === 'all') return allQuestions.value
    if (deckId === 'wrong') {
      return allQuestions.value.filter((q) => {
        const p = progressMap.value[q.id]
        return p && p.lastCorrect === false
      })
    }
    if (deckId === 'bookmarked') {
      return allQuestions.value.filter((q) => progressMap.value[q.id]?.bookmarked)
    }
    if (deckId === 'workout') {
      // Intelligentes 10-Fragen-Workout: Zuerst falsche, dann noch nie beantwortete, Rest zufällig
      const wrong = allQuestions.value.filter((q) => progressMap.value[q.id]?.lastCorrect === false)
      const unseen = allQuestions.value.filter((q) => !progressMap.value[q.id]?.attempts)
      const others = allQuestions.value.filter(
        (q) => progressMap.value[q.id]?.attempts && progressMap.value[q.id]?.lastCorrect !== false
      )
      return [...wrong, ...unseen, ...others].slice(0, 10)
    }
    return allQuestions.value.filter((q) => q.deckId === deckId)
  }

  function getProgress(questionId: string): QuestionProgress {
    return (
      progressMap.value[questionId] || {
        questionId,
        attempts: 0,
        correctCount: 0,
        wrongCount: 0,
        box: 0,
        bookmarked: false,
        personalNote: ''
      }
    )
  }

  function recordAnswer(questionId: string, isCorrect: boolean) {
    const existing = getProgress(questionId)
    const isFirstTimeCorrect = existing.correctCount === 0 && isCorrect
    const nextBox = isCorrect ? Math.min(4, existing.box + 1) : 1

    progressMap.value[questionId] = {
      ...existing,
      attempts: existing.attempts + 1,
      correctCount: existing.correctCount + (isCorrect ? 1 : 0),
      wrongCount: existing.wrongCount + (isCorrect ? 0 : 1),
      lastAnsweredAt: new Date().toISOString(),
      lastCorrect: isCorrect,
      box: nextBox
    }

    if (isCorrect) {
      addStudyActivityAndXp(isFirstTimeCorrect ? 25 : 15, isFirstTimeCorrect ? '+25 Punkte (Neu gemeistert!)' : '+15 Punkte')
    } else {
      addStudyActivityAndXp(5, '+5 Punkte fürs Dranbleiben!')
    }

    scheduleProgressPush()
  }

  function recordFlashcardRating(questionId: string, rating: 'again' | 'hard' | 'good' | 'easy') {
    const existing = getProgress(questionId)
    const boxMap = { again: 1, hard: 2, good: 3, easy: 4 }
    const isCorrect = rating === 'good' || rating === 'easy'
    progressMap.value[questionId] = {
      ...existing,
      attempts: existing.attempts + 1,
      correctCount: existing.correctCount + (isCorrect ? 1 : 0),
      wrongCount: existing.wrongCount + (rating === 'again' ? 1 : 0),
      lastAnsweredAt: new Date().toISOString(),
      lastCorrect: isCorrect,
      box: boxMap[rating]
    }

    const xpMap = { again: 5, hard: 10, good: 15, easy: 20 }
    addStudyActivityAndXp(xpMap[rating], `+${xpMap[rating]} Punkte (Karteikarte)`)
    scheduleProgressPush()
  }

  function rewardMatchingRound() {
    addStudyActivityAndXp(30, '+30 Punkte (Zuordnungs-Runde gelöst!)')
    scheduleProgressPush()
  }

  function toggleBookmark(questionId: string) {
    const existing = getProgress(questionId)
    progressMap.value[questionId] = {
      ...existing,
      bookmarked: !existing.bookmarked
    }
    scheduleProgressPush()
  }

  function savePersonalNote(questionId: string, note: string) {
    const existing = getProgress(questionId)
    progressMap.value[questionId] = {
      ...existing,
      personalNote: note
    }
    scheduleProgressPush()
  }

  function redeemReward(rewardId: string): boolean {
    const reward = userProfile.value.rewards.find((r) => r.id === rewardId)
    if (!reward) return false
    if (availableCoins.value < reward.cost) return false

    userProfile.value.spentCoins = (userProfile.value.spentCoins || 0) + reward.cost
    reward.redeemedCount = (reward.redeemedCount || 0) + 1
    reward.lastRedeemedAt = new Date().toISOString()

    userProfile.value.vouchers.unshift({
      id: `voucher-${Date.now()}`,
      rewardId: reward.id,
      title: reward.title,
      emoji: reward.emoji,
      cost: reward.cost,
      redeemedAt: new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      fulfilled: false
    })

    scheduleProgressPush()
    return true
  }

  function toggleVoucherFulfilled(voucherId: string) {
    const v = userProfile.value.vouchers.find((item) => item.id === voucherId)
    if (v) {
      v.fulfilled = !v.fulfilled
      scheduleProgressPush()
    }
  }

  function addCustomReward(payload: { title: string; description: string; cost: number; emoji: string }) {
    userProfile.value.rewards.push({
      id: `rew-custom-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      cost: Math.max(10, Number(payload.cost) || 200),
      emoji: payload.emoji || '🎁',
      redeemedCount: 0
    })
    scheduleProgressPush()
  }

  function deleteReward(rewardId: string) {
    userProfile.value.rewards = userProfile.value.rewards.filter((r) => r.id !== rewardId)
    scheduleProgressPush()
  }

  async function addGeneratedDeck(payload: {
    deckTitle: string
    deckDescription: string
    sourceFileName?: string
    summaryPoints?: string[]
    questions: Array<Omit<Question, 'id' | 'deckId'>>
  }): Promise<StudyDeck> {
    const deckId = `deck-custom-${Date.now()}`
    const colors = ['emerald', 'cyan', 'violet', 'amber', 'rose', 'blue']
    const color = colors[customDecks.value.length % colors.length]

    const newDeck: StudyDeck = {
      id: deckId,
      title: payload.deckTitle || `PDF-Lernset (${new Date().toLocaleDateString('de-DE')})`,
      description: payload.deckDescription || 'Automatisch aus deinem hochgeladenen Dokument generierte Prüfungsfragen.',
      icon: 'FileText',
      color,
      sourceFileName: payload.sourceFileName,
      createdAt: new Date().toISOString().slice(0, 10),
      isBuiltIn: false,
      summaryPoints: payload.summaryPoints || []
    }

    const createdQuestions: Question[] = payload.questions.map((q, idx) => {
      const rawOptions =
        Array.isArray(q.options) && q.options.length >= 2
          ? q.options
          : ['Ja', 'Nein', 'Nur im Notfall', 'Keine Angabe']
      const origCorrectIdx = typeof q.correctIndex === 'number' ? q.correctIndex : 0

      const indexed = rawOptions.map((text, i) => ({ text, isCorrect: i === origCorrectIdx }))
      for (let i = indexed.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[indexed[i], indexed[j]] = [indexed[j], indexed[i]]
      }
      const shuffledOptions = indexed.map((item) => item.text)
      const newCorrectIdx = Math.max(0, indexed.findIndex((item) => item.isCorrect))

      return {
        id: `${deckId}-q-${idx + 1}`,
        deckId,
        question: q.question,
        options: shuffledOptions,
        correctIndex: newCorrectIdx,
        explanation: q.explanation || '',
        mnemonic: q.mnemonic || '',
        lawReference: q.lawReference || '',
        pdfSource: payload.sourceFileName || 'Eigener Upload',
        difficulty: q.difficulty || 'mittel',
        type: q.type || 'mc',
        flashcardFront: q.flashcardFront || q.question,
        flashcardBack: q.flashcardBack || `${rawOptions[origCorrectIdx] || ''}\n\n${q.explanation || ''}`
      }
    })

    customDecks.value.unshift(newDeck)
    customQuestions.value.push(...createdQuestions)

    if (isCloudConfigured.value) {
      try {
        cloudSyncStatus.value = 'syncing'
        await upsertCloudDeck(supabaseConfig.value, newDeck, createdQuestions)
        cloudSyncStatus.value = 'synced'
      } catch (err: any) {
        cloudSyncStatus.value = 'error'
        cloudSyncError.value = err?.message || 'Deck lokal gespeichert, aber Cloud-Upload fehlgeschlagen.'
      }
    }

    return newDeck
  }

  async function deleteCustomDeck(deckId: string) {
    customDecks.value = customDecks.value.filter((d) => d.id !== deckId)
    customQuestions.value = customQuestions.value.filter((q) => q.deckId !== deckId)

    if (isCloudConfigured.value) {
      try {
        await removeCloudDeck(supabaseConfig.value, deckId)
      } catch (err) {
        console.error(err)
      }
    }
  }

  async function resetProgress() {
    progressMap.value = {}
    if (isCloudConfigured.value) {
      await pushProgressAndProfileToCloud().catch(() => {})
    }
  }

  function exportBackupJson(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        customDecks: customDecks.value,
        customQuestions: customQuestions.value,
        progress: progressMap.value,
        userProfile: userProfile.value
      },
      null,
      2
    )
  }

  function importBackupJson(rawJson: string) {
    const parsed = JSON.parse(rawJson)
    if (Array.isArray(parsed.customDecks)) customDecks.value = parsed.customDecks
    if (Array.isArray(parsed.customQuestions)) customQuestions.value = parsed.customQuestions
    if (parsed.progress && typeof parsed.progress === 'object') progressMap.value = parsed.progress
    if (parsed.userProfile && typeof parsed.userProfile === 'object') {
      userProfile.value = { ...DEFAULT_PROFILE, ...parsed.userProfile }
    }
    if (isCloudConfigured.value) {
      syncFromCloud()
    }
  }

  const overallStats = computed(() => {
    const total = allQuestions.value.length
    let answered = 0
    let mastered = 0
    let needsReview = 0
    let bookmarked = 0

    for (const q of allQuestions.value) {
      const p = progressMap.value[q.id]
      if (!p) continue
      if (p.attempts > 0) answered++
      if (p.box >= 3 && p.lastCorrect) mastered++
      if (p.lastCorrect === false) needsReview++
      if (p.bookmarked) bookmarked++
    }

    const masteryPercent = total > 0 ? Math.round((mastered / total) * 100) : 0
    return {
      total,
      answered,
      mastered,
      needsReview,
      bookmarked,
      masteryPercent
    }
  })

  const achievements = computed(() => {
    const stats = overallStats.value
    const prof = userProfile.value
    return [
      {
        id: 'ach-first10',
        title: 'Erste Schritte im Strahlenschutz',
        description: 'Mindestens 10 Prüfungsfragen bearbeitet',
        emoji: '🎯',
        unlocked: stats.answered >= 10
      },
      {
        id: 'ach-streak3',
        title: 'Dranbleiberin',
        description: '3 Tage in Folge gelernt (Streak)',
        emoji: '🔥',
        unlocked: prof.streakDays >= 3
      },
      {
        id: 'ach-daily',
        title: 'Tagesziel-Champion',
        description: `Tagesziel von ${prof.dailyGoal} Fragen an einem Tag erreicht`,
        emoji: '⚡',
        unlocked: prof.todayAnsweredCount >= prof.dailyGoal || prof.xp >= 300
      },
      {
        id: 'ach-halfway',
        title: 'Halbzeit-Meisterin',
        description: 'Mindestens 50% aller Fragen sicher gemeistert',
        emoji: '🛡️',
        unlocked: stats.masteryPercent >= 50
      },
      {
        id: 'ach-sushi',
        title: 'Gönnjamin (Erste Belohnung)',
        description: 'Den ersten Gutschein im Belohnungs-Shop eingelöst',
        emoji: '🍣',
        unlocked: prof.vouchers.length > 0
      },
      {
        id: 'ach-examready',
        title: 'Prüfungsreif fürs Examen',
        description: 'Mindestens 85% aller Fragen sicher gemeistert',
        emoji: '👑',
        unlocked: stats.masteryPercent >= 85
      }
    ]
  })

  function getDeckStats(deckId: string) {
    const qs = getDeckQuestions(deckId)
    const total = qs.length
    let answered = 0
    let mastered = 0
    let wrong = 0

    for (const q of qs) {
      const p = progressMap.value[q.id]
      if (!p) continue
      if (p.attempts > 0) answered++
      if (p.box >= 3 && p.lastCorrect) mastered++
      if (p.lastCorrect === false) wrong++
    }

    return {
      total,
      answered,
      mastered,
      wrong,
      percent: total > 0 ? Math.round((mastered / total) * 100) : 0
    }
  }

  return {
    allDecks,
    allQuestions,
    customDecks,
    customQuestions,
    progressMap,
    userProfile,
    availableCoins,
    levelInfo,
    achievements,
    lastXpGain,
    aiSettings,
    supabaseConfig,
    isCloudConfigured,
    cloudSyncStatus,
    cloudSyncError,
    overallStats,
    syncFromCloud,
    scheduleProgressPush,
    getDeckQuestions,
    getDeckStats,
    getProgress,
    recordAnswer,
    recordFlashcardRating,
    rewardMatchingRound,
    toggleBookmark,
    savePersonalNote,
    redeemReward,
    toggleVoucherFulfilled,
    addCustomReward,
    deleteReward,
    addGeneratedDeck,
    deleteCustomDeck,
    resetProgress,
    exportBackupJson,
    importBackupJson
  }
}
