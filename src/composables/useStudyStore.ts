import { ref, computed, watch } from 'vue'
import { INITIAL_DECKS, INITIAL_QUESTIONS, DEFAULT_FOLDERS } from '../data/initialData'
import type {
  StudyDeck,
  StudyFolder,
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
  FOLDERS: 'radlearn_folders_v1',
  DECK_FOLDER_OVERRIDES: 'radlearn_deck_folder_overrides_v1',
  DECK_ORDER: 'radlearn_deck_order_v1',
  PROGRESS: 'radlearn_progress_v1',
  PROFILE: 'radlearn_user_profile_v2', // v2 = Strengeres Punkte- & Preis-Balancing!
  AI_SETTINGS: 'radlearn_ai_settings_v1',
  SUPABASE_CONFIG: 'radlearn_supabase_config_v1'
}

export const DEFAULT_REWARDS: RewardItem[] = [
  {
    id: 'rew-coffee',
    title: 'Lieblings-Kaffee & süßes Teilchen',
    description: 'Frisch vom Ehemann direkt an den Schreibtisch oder ans Bett serviert (~50 richtige Fragen).',
    cost: 250,
    emoji: '☕',
    redeemedCount: 0
  },
  {
    id: 'rew-massage',
    title: '30 Min. Nacken- & Rückenmassage',
    description: 'Entspannung pur nach mehreren intensiven Lerntagen (~120 richtige Fragen).',
    cost: 600,
    emoji: '💆‍♀️',
    redeemedCount: 0
  },
  {
    id: 'rew-movie',
    title: 'Kino- oder Serienabend deiner Wahl',
    description: 'Du bestimmst den Film/die Serie + Lieblingssnacks (~200 richtige Fragen).',
    cost: 1000,
    emoji: '🎬',
    redeemedCount: 0
  },
  {
    id: 'rew-sushi',
    title: 'Großes Sushi-Date (All you can eat!)',
    description: 'Schickes Sushi-Essen gehen komplett auf meinen Nacken (~360 richtige Fragen)!',
    cost: 1800,
    emoji: '🍣',
    redeemedCount: 0
  },
  {
    id: 'rew-shopping',
    title: 'Wunsch-Gutschein / Shopping-Treat',
    description: 'Eine schöne Belohnung von deiner Wunschliste für langes Durchhalten (~600 richtige Fragen).',
    cost: 3000,
    emoji: '🛍️',
    redeemedCount: 0
  },
  {
    id: 'rew-wellness',
    title: 'Wellness-Tag / Thermen-Ausflug zu zweit',
    description: 'Ein ganzer Tag Abschalten & Genießen als großes Examens-Ziel (~1.000 richtige Fragen)!',
    cost: 5000,
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
  dailyGoal: 25,
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

// Stellt sicher, dass alte (zu billige) Standardpreise auf das neue, anspruchsvollere Balancing gehoben werden
function migrateRewardsList(rewards: RewardItem[]): RewardItem[] {
  const defaultMap = new Map(DEFAULT_REWARDS.map((r) => [r.id, r]))
  if (!Array.isArray(rewards) || rewards.length === 0) return DEFAULT_REWARDS
  return rewards.map((item) => {
    const def = defaultMap.get(item.id)
    if (def && item.cost < def.cost) {
      return {
        ...item,
        cost: def.cost,
        description: def.description
      }
    }
    return item
  })
}

// Berechnet faire Maximal-XP anhand der tatsächlich richtig gelösten Fragen in progressMap
function recalculateFairXp(
  currentXp: number,
  progMap: Record<string, QuestionProgress>
): number {
  let totalCorrectAnswers = 0
  let uniqueMastered = 0
  for (const p of Object.values(progMap)) {
    if (!p || typeof p !== 'object') continue
    totalCorrectAnswers += p.correctCount || 0
    if ((p.correctCount || 0) > 0) uniqueMastered += 1
  }
  // Pro erstmalig richtiger Frage 5 Pkt + für jede weitere richtige Wiederholung 2 Pkt (+ kleiner Puffer für Zuordnungen)
  const fairMaxXp = uniqueMastered * 3 + totalCorrectAnswers * 2 + 15
  if (currentXp > fairMaxXp && totalCorrectAnswers < 40) {
    return Math.max(0, uniqueMastered * 3 + totalCorrectAnswers * 2)
  }
  return currentXp
}

export function detectBestFolderForDeck(title: string, description = ''): string {
  const text = (title + ' ' + description).toLowerCase()
  if (
    text.includes('nuklear') ||
    text.includes('szinti') ||
    text.includes('spect') ||
    text.includes('pet') ||
    text.includes('radiopharm') ||
    text.includes('tracer')
  ) {
    return 'nuklearmedizin'
  }
  if (
    text.includes('röntgen') ||
    text.includes('roentgen') ||
    text.includes('thorax') ||
    text.includes('einstelltechnik') ||
    text.includes('belichtung') ||
    text.includes('aufnahme')
  ) {
    return 'roentgendiagnostik'
  }
  if (
    text.includes('therapie') ||
    text.includes('radioonk') ||
    text.includes('linearbeschleuniger') ||
    text.includes('linac') ||
    text.includes('bestrahl') ||
    text.includes('brachy')
  ) {
    return 'strahlentherapie'
  }
  if (
    text.includes('anatomie') ||
    text.includes('skelett') ||
    text.includes('knochen') ||
    text.includes('organ')
  ) {
    return 'anatomie'
  }
  if (
    text.includes('strahlenschutz') ||
    text.includes('strlsch') ||
    text.includes('dosis') ||
    text.includes('dosimetrie') ||
    text.includes('grenzwert') ||
    text.includes('gesetz') ||
    text.includes('alara')
  ) {
    return 'strahlenschutz'
  }
  return 'custom'
}

const envMeta = (import.meta as any).env || {}

const rawLoadedFolders = loadJson<StudyFolder[]>(STORAGE_KEYS.FOLDERS, DEFAULT_FOLDERS)
const mergedFoldersMap = new Map<string, StudyFolder>()
for (const df of DEFAULT_FOLDERS) mergedFoldersMap.set(df.id, df)
for (const f of rawLoadedFolders) mergedFoldersMap.set(f.id, f)
const folders = ref<StudyFolder[]>(Array.from(mergedFoldersMap.values()))

const rawCustomDecks = loadJson<StudyDeck[]>(STORAGE_KEYS.CUSTOM_DECKS, [])
const migratedCustomDecks = rawCustomDecks.map((deck) => {
  if (!deck.folderId || deck.folderId === 'custom') {
    const detected = detectBestFolderForDeck(deck.title, deck.description)
    if (detected !== 'custom') {
      return { ...deck, folderId: detected }
    }
  }
  return deck
})
const customDecks = ref<StudyDeck[]>(migratedCustomDecks)
const customQuestions = ref<Question[]>(loadJson(STORAGE_KEYS.CUSTOM_QUESTIONS, []))
const deckFolderOverrides = ref<Record<string, string>>(loadJson(STORAGE_KEYS.DECK_FOLDER_OVERRIDES, {}))
const deckOrderList = ref<string[]>(loadJson(STORAGE_KEYS.DECK_ORDER, []))
const progressMap = ref<Record<string, QuestionProgress>>(loadJson(STORAGE_KEYS.PROGRESS, {}))

const loadedProfile = loadJson(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE)
const userProfile = ref<UserProfile>({
  ...DEFAULT_PROFILE,
  ...loadedProfile,
  dailyGoal: 25,
  xp: recalculateFairXp(loadedProfile.xp || 0, progressMap.value),
  rewards: migrateRewardsList(loadedProfile.rewards)
})

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

watch(folders, (val) => localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(val)), { deep: true })
watch(customDecks, (val) => localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(val)), { deep: true })
watch(customQuestions, (val) => localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(val)), { deep: true })
watch(deckFolderOverrides, (val) => localStorage.setItem(STORAGE_KEYS.DECK_FOLDER_OVERRIDES, JSON.stringify(val)), { deep: true })
watch(deckOrderList, (val) => localStorage.setItem(STORAGE_KEYS.DECK_ORDER, JSON.stringify(val)), { deep: true })
watch(progressMap, (val) => localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(val)), { deep: true })
watch(userProfile, (val) => localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(val)), { deep: true })
watch(aiSettings, (val) => localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(val)), { deep: true })
watch(supabaseConfig, (val) => localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(val)), { deep: true })

export const LEVEL_TIERS = [
  { level: 1, title: 'Strahlenschutz-Starterin', minXp: 0, badge: '🌱' },
  { level: 2, title: 'Dosimeter-Trägerin', minXp: 150, badge: '📟' },
  { level: 3, title: 'Röntgen-Kennerin', minXp: 400, badge: '⚡' },
  { level: 4, title: 'Kontrollbereich-Profi', minXp: 800, badge: '☢️' },
  { level: 5, title: 'ALARA-Meisterin', minXp: 1400, badge: '🛡️' },
  { level: 6, title: 'SSB-Ehrenrang', minXp: 2200, badge: '🏅' },
  { level: 7, title: 'MTR-Examens-Queen', minXp: 3500, badge: '👑' }
]

export function useStudyStore() {
  const isCloudConfigured = computed(() =>
    Boolean(supabaseConfig.value.url.trim() && supabaseConfig.value.anonKey.trim())
  )

  const allDecks = computed<StudyDeck[]>(() => {
    const map = new Map<string, StudyDeck>()
    for (const d of INITIAL_DECKS) {
      const folderId = deckFolderOverrides.value[d.id] || d.folderId || 'strahlenschutz'
      map.set(d.id, { ...d, folderId })
    }
    for (const d of customDecks.value) {
      const folderId =
        deckFolderOverrides.value[d.id] ||
        d.folderId ||
        detectBestFolderForDeck(d.title, d.description)
      map.set(d.id, { ...d, folderId })
    }
    const list = Array.from(map.values())
    if (deckOrderList.value.length > 0) {
      const orderMap = new Map(deckOrderList.value.map((id, index) => [id, index]))
      list.sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999
        return orderA - orderB
      })
    }
    return list
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
    }, 2200)
  }

  function addStudyActivityAndXp(xpEarned: number, reason: string, countTowardsDailyGoal = true) {
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

    if (countTowardsDailyGoal) {
      userProfile.value.todayAnsweredCount += 1
    }

    let totalGain = xpEarned
    // Tagesziel-Bonus (+15 Punkte) erst bei 25 richtig beantworteten Fragen am Tag!
    if (
      countTowardsDailyGoal &&
      userProfile.value.todayAnsweredCount === userProfile.value.dailyGoal
    ) {
      totalGain += 15
      triggerXpToast(totalGain, `Tagesziel (${userProfile.value.dailyGoal} richtige Fragen) erreicht! +15 Bonus-Punkte 🎉`)
    } else if (xpEarned > 0) {
      triggerXpToast(xpEarned, reason)
    }

    userProfile.value.xp += totalGain
  }

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

        if (cloudProgRaw._profile) {
          const remoteProf = cloudProgRaw._profile as UserProfile
          const rawXp = Math.max(remoteProf.xp || 0, userProfile.value.xp || 0)
          const calibratedXp = recalculateFairXp(rawXp, merged)
          userProfile.value = {
            ...DEFAULT_PROFILE,
            ...remoteProf,
            dailyGoal: 25,
            xp: calibratedXp,
            rewards: migrateRewardsList(remoteProf.rewards || userProfile.value.rewards),
            vouchers: Array.isArray(remoteProf.vouchers) ? remoteProf.vouchers : userProfile.value.vouchers
          }
          // Falls wir alte überhöhte XP aus v1 korrigiert haben, direkt in Supabase aktualisieren
          if (calibratedXp !== remoteProf.xp) {
            await pushProgressAndProfileToCloud()
          }
        }
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
    if (deckId.startsWith('folder:')) {
      const targetFolderId = deckId.replace('folder:', '')
      const decksInFolder = allDecks.value.filter((d) => (d.folderId || 'custom') === targetFolderId)
      const deckIds = new Set(decksInFolder.map((d) => d.id))
      return allQuestions.value.filter((q) => deckIds.has(q.deckId))
    }
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

    // Strenges & faires Punkte-System:
    // - Neue Frage erstmals richtig: +5 Punkte
    // - Bekannte Frage wiederholt richtig: +2 Punkte
    // - Falsch beantwortet: 0 Punkte (zählt auch nicht zum Tagesziel!)
    if (isCorrect) {
      const pts = isFirstTimeCorrect ? 5 : 2
      addStudyActivityAndXp(
        pts,
        isFirstTimeCorrect ? `+${pts} Pkt. (Neu gemeistert!)` : `+${pts} Pkt. (Wiederholung)`,
        true
      )
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

    // Nur für gewusste Karteikarten ("Gut" / "Einfach") gibt es +2 Punkte
    if (isCorrect) {
      addStudyActivityAndXp(2, '+2 Pkt. (Karteikarte gewusst)', true)
    }
    scheduleProgressPush()
  }

  function rewardMatchingRound(mistakesCount = 0) {
    const pts = mistakesCount === 0 ? 5 : 2
    addStudyActivityAndXp(pts, `+${pts} Pkt. (Zuordnungs-Runde gelöst!)`, false)
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
      cost: Math.max(50, Number(payload.cost) || 500),
      emoji: payload.emoji || '🎁',
      redeemedCount: 0
    })
    scheduleProgressPush()
  }

  function deleteReward(rewardId: string) {
    userProfile.value.rewards = userProfile.value.rewards.filter((r) => r.id !== rewardId)
    scheduleProgressPush()
  }

  function addFolder(payload: { name: string; icon?: string; color?: string; description?: string }) {
    const newFolder: StudyFolder = {
      id: `folder-custom-${Date.now()}`,
      name: payload.name.trim(),
      icon: payload.icon || 'Folder',
      color: payload.color || 'blue',
      description: payload.description || '',
      isBuiltIn: false
    }
    folders.value.push(newFolder)
    return newFolder
  }

  function deleteFolder(folderId: string) {
    const f = folders.value.find((item) => item.id === folderId)
    if (f?.isBuiltIn) return
    for (const d of customDecks.value) {
      if (d.folderId === folderId) {
        d.folderId = 'custom'
      }
    }
    folders.value = folders.value.filter((item) => item.id !== folderId)
  }

  function moveDeckToFolder(deckId: string, targetFolderId: string) {
    deckFolderOverrides.value = {
      ...deckFolderOverrides.value,
      [deckId]: targetFolderId
    }
    const cd = customDecks.value.find((d) => d.id === deckId)
    if (cd) {
      cd.folderId = targetFolderId
      if (isCloudConfigured.value) {
        upsertCloudDeck(
          supabaseConfig.value,
          cd,
          customQuestions.value.filter((q) => q.deckId === deckId)
        ).catch(console.error)
      }
    }
  }

  function moveDeckOrder(deckId: string, direction: 'up' | 'down') {
    const currentList = allDecks.value.map((d) => d.id)
    const index = currentList.indexOf(deckId)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= currentList.length) return
    const tmp = currentList[index]
    currentList[index] = currentList[targetIndex]
    currentList[targetIndex] = tmp
    deckOrderList.value = [...currentList]
  }

  function setDeckOrder(deckIds: string[]) {
    deckOrderList.value = [...deckIds]
  }

  function getFolderStats(folderId: string) {
    const decksInFolder = allDecks.value.filter((d) => (d.folderId || 'custom') === folderId)
    const deckIds = new Set(decksInFolder.map((d) => d.id))
    const qs = allQuestions.value.filter((q) => deckIds.has(q.deckId))
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
      deckCount: decksInFolder.length,
      total,
      answered,
      mastered,
      wrong,
      percent: total > 0 ? Math.round((mastered / total) * 100) : 0
    }
  }

  async function addGeneratedDeck(payload: {
    deckTitle: string
    deckDescription: string
    folderId?: string
    sourceFileName?: string
    summaryPoints?: string[]
    questions: Array<Omit<Question, 'id' | 'deckId'>>
  }): Promise<StudyDeck> {
    const deckId = `deck-custom-${Date.now()}`
    const colors = ['emerald', 'cyan', 'violet', 'amber', 'rose', 'blue']
    const color = colors[customDecks.value.length % colors.length]

    const newDeck: StudyDeck = {
      id: deckId,
      folderId: payload.folderId || 'custom',
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
    userProfile.value.xp = 0
    userProfile.value.spentCoins = 0
    userProfile.value.todayAnsweredCount = 0
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
        description: `Tagesziel von ${prof.dailyGoal} richtigen Fragen an einem Tag erreicht`,
        emoji: '⚡',
        unlocked: prof.todayAnsweredCount >= prof.dailyGoal
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
    folders,
    addFolder,
    deleteFolder,
    moveDeckToFolder,
    moveDeckOrder,
    setDeckOrder,
    detectBestFolderForDeck,
    getFolderStats,
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
