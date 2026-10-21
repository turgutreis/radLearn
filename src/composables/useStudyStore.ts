import { ref, computed, watch } from 'vue'
import { INITIAL_DECKS, INITIAL_QUESTIONS } from '../data/initialData'
import type { StudyDeck, Question, QuestionProgress, AISettings } from '../types'
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
  AI_SETTINGS: 'radlearn_ai_settings_v1',
  SUPABASE_CONFIG: 'radlearn_supabase_config_v1'
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

const envMeta = (import.meta as any).env || {}

const customDecks = ref<StudyDeck[]>(loadJson(STORAGE_KEYS.CUSTOM_DECKS, []))
const customQuestions = ref<Question[]>(loadJson(STORAGE_KEYS.CUSTOM_QUESTIONS, []))
const progressMap = ref<Record<string, QuestionProgress>>(loadJson(STORAGE_KEYS.PROGRESS, {}))

const aiSettings = ref<AISettings>(
  loadJson(STORAGE_KEYS.AI_SETTINGS, {
    provider: 'gemini',
    geminiKey: envMeta.VITE_GEMINI_API_KEY || '',
    openaiKey: envMeta.VITE_OPENAI_API_KEY || '',
    anthropicKey: envMeta.VITE_ANTHROPIC_API_KEY || '',
    ollamaUrl: 'http://localhost:11434',
    model: 'gemini-2.5-flash'
  })
)

// Falls in Vercel VITE_GEMINI_API_KEY hinterlegt wurde, immer als Fallback nutzen
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
let hasInitialSyncRun = false
let progressSyncTimer: ReturnType<typeof setTimeout> | null = null

watch(customDecks, (val) => localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(val)), { deep: true })
watch(customQuestions, (val) => localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(val)), { deep: true })
watch(progressMap, (val) => localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(val)), { deep: true })
watch(aiSettings, (val) => localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(val)), { deep: true })
watch(supabaseConfig, (val) => localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(val)), { deep: true })

export function useStudyStore() {
  const isCloudConfigured = computed(() =>
    Boolean(supabaseConfig.value.url.trim() && supabaseConfig.value.anonKey.trim())
  )

  const allDecks = computed<StudyDeck[]>(() => [...INITIAL_DECKS, ...customDecks.value])
  const allQuestions = computed<Question[]>(() => [...INITIAL_QUESTIONS, ...customQuestions.value])

  async function syncFromCloud() {
    if (!isCloudConfigured.value) {
      cloudSyncStatus.value = 'disconnected'
      return
    }

    cloudSyncStatus.value = 'syncing'
    cloudSyncError.value = null

    try {
      // 1. Lade alle Cloud-Decks & Fragen
      const cloudData = await fetchCloudDecks(supabaseConfig.value)
      const cloudDeckIds = new Set(cloudData.decks.map((d) => d.id))

      // Lokale Decks, die noch nicht in der Cloud sind, hochladen
      for (const localDeck of customDecks.value) {
        if (!cloudDeckIds.has(localDeck.id)) {
          const qs = customQuestions.value.filter((q) => q.deckId === localDeck.id)
          await upsertCloudDeck(supabaseConfig.value, localDeck, qs)
          cloudData.decks.unshift(localDeck)
          cloudData.questions.push(...qs)
        }
      }

      customDecks.value = cloudData.decks
      customQuestions.value = cloudData.questions

      // 2. Lade & merge Lernfortschritt
      const cloudProg = await fetchCloudProgress(supabaseConfig.value)
      if (cloudProg) {
        const merged: Record<string, QuestionProgress> = { ...cloudProg }
        for (const [qId, localP] of Object.entries(progressMap.value)) {
          const remoteP = merged[qId]
          if (!remoteP || (localP.attempts || 0) > (remoteP.attempts || 0)) {
            merged[qId] = localP
          }
        }
        progressMap.value = merged
      } else if (Object.keys(progressMap.value).length > 0) {
        await saveCloudProgress(supabaseConfig.value, progressMap.value)
      }

      cloudSyncStatus.value = 'synced'
    } catch (err: any) {
      console.error('Supabase Sync Error:', err)
      cloudSyncStatus.value = 'error'
      cloudSyncError.value = err?.message || 'Verbindung zu Supabase fehlgeschlagen.'
    }
  }

  function scheduleProgressPush() {
    if (!isCloudConfigured.value) return
    if (progressSyncTimer) clearTimeout(progressSyncTimer)
    progressSyncTimer = setTimeout(async () => {
      try {
        cloudSyncStatus.value = 'syncing'
        await saveCloudProgress(supabaseConfig.value, progressMap.value)
        cloudSyncStatus.value = 'synced'
      } catch (err: any) {
        cloudSyncStatus.value = 'error'
        cloudSyncError.value = err?.message || 'Fehler beim Speichern des Lernfortschritts.'
      }
    }, 800)
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
        bookmarked: false
      }
    )
  }

  function recordAnswer(questionId: string, isCorrect: boolean) {
    const existing = getProgress(questionId)
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

    // Direkt in Supabase Cloud speichern, falls aktiv
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
      await saveCloudProgress(supabaseConfig.value, {}).catch(() => {})
    }
  }

  function exportBackupJson(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        customDecks: customDecks.value,
        customQuestions: customQuestions.value,
        progress: progressMap.value
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
    aiSettings,
    supabaseConfig,
    isCloudConfigured,
    cloudSyncStatus,
    cloudSyncError,
    overallStats,
    syncFromCloud,
    getDeckQuestions,
    getDeckStats,
    getProgress,
    recordAnswer,
    recordFlashcardRating,
    toggleBookmark,
    addGeneratedDeck,
    deleteCustomDeck,
    resetProgress,
    exportBackupJson,
    importBackupJson
  }
}
