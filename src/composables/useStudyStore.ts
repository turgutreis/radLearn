import { ref, computed, watch } from 'vue'
import { INITIAL_DECKS, INITIAL_QUESTIONS } from '../data/initialData'
import type { StudyDeck, Question, QuestionProgress, AISettings } from '../types'

const STORAGE_KEYS = {
  CUSTOM_DECKS: 'radlearn_custom_decks_v1',
  CUSTOM_QUESTIONS: 'radlearn_custom_questions_v1',
  PROGRESS: 'radlearn_progress_v1',
  AI_SETTINGS: 'radlearn_ai_settings_v1',
  STREAK: 'radlearn_streak_v1'
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

const customDecks = ref<StudyDeck[]>(loadJson(STORAGE_KEYS.CUSTOM_DECKS, []))
const customQuestions = ref<Question[]>(loadJson(STORAGE_KEYS.CUSTOM_QUESTIONS, []))
const progressMap = ref<Record<string, QuestionProgress>>(loadJson(STORAGE_KEYS.PROGRESS, {}))

const aiSettings = ref<AISettings>(
  loadJson(STORAGE_KEYS.AI_SETTINGS, {
    provider: 'gemini',
    geminiKey: '',
    openaiKey: '',
    anthropicKey: '',
    ollamaUrl: 'http://localhost:11434',
    model: 'gemini-2.5-flash'
  })
)

watch(customDecks, (val) => localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(val)), { deep: true })
watch(customQuestions, (val) => localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(val)), { deep: true })
watch(progressMap, (val) => localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(val)), { deep: true })
watch(aiSettings, (val) => localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(val)), { deep: true })

export function useStudyStore() {
  const allDecks = computed<StudyDeck[]>(() => [...INITIAL_DECKS, ...customDecks.value])
  const allQuestions = computed<Question[]>(() => [...INITIAL_QUESTIONS, ...customQuestions.value])

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
  }

  function toggleBookmark(questionId: string) {
    const existing = getProgress(questionId)
    progressMap.value[questionId] = {
      ...existing,
      bookmarked: !existing.bookmarked
    }
  }

  function addGeneratedDeck(payload: {
    deckTitle: string
    deckDescription: string
    sourceFileName?: string
    summaryPoints?: string[]
    questions: Array<Omit<Question, 'id' | 'deckId'>>
  }): StudyDeck {
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

      // Antwortoptionen beim Speichern zufällig mischen, falls die KI immer Option A als richtig generiert
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
    return newDeck
  }

  function deleteCustomDeck(deckId: string) {
    customDecks.value = customDecks.value.filter((d) => d.id !== deckId)
    customQuestions.value = customQuestions.value.filter((q) => q.deckId !== deckId)
  }

  function resetProgress() {
    progressMap.value = {}
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
    overallStats,
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
