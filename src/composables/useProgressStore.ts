import { ref, computed, watch } from 'vue'
import { INITIAL_QUESTIONS } from '../data/initialData'
import type { Question, QuestionProgress, StudyDeck, UserProfile } from '../types'
import { STORAGE_KEYS, loadJson } from '../services/storageKeys'

// Global state singleton
const customQuestions = ref<Question[]>(loadJson<Question[]>(STORAGE_KEYS.CUSTOM_QUESTIONS, []))
const progressMap = ref<Record<string, QuestionProgress>>(loadJson(STORAGE_KEYS.PROGRESS, {}))

watch(customQuestions, (val) => localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(val)), { deep: true })
watch(progressMap, (val) => localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(val)), { deep: true })

export function useProgressStore() {
  const allQuestions = computed<Question[]>(() => {
    const map = new Map<string, Question>()
    for (const q of INITIAL_QUESTIONS) map.set(q.id, q)
    for (const q of customQuestions.value) map.set(q.id, q)
    return Array.from(map.values())
  })

  function getDeckQuestions(deckId: string, allDecks: StudyDeck[]): Question[] {
    if (deckId === 'all') return allQuestions.value
    if (deckId.startsWith('folder:')) {
      const targetFolderId = deckId.replace('folder:', '')
      const decksInFolder = allDecks.filter((d) => (d.folderId || 'custom') === targetFolderId)
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

  function isQuestionMcMastered(p?: QuestionProgress): boolean {
    if (!p) return false
    if (p.mcLastCorrect !== undefined) {
      return p.mcLastCorrect === true && (p.mcCorrectCount || 0) > 0
    }
    // Fallback für ältere Daten vor der Trennung von MC & Karteikarten:
    return p.lastCorrect === true && (p.correctCount || 0) > 0
  }

  function isQuestionMcAnswered(p?: QuestionProgress): boolean {
    if (!p) return false
    if (p.mcAttempts !== undefined) {
      return p.mcAttempts > 0
    }
    return p.attempts > 0
  }

  function recordAnswer(
    questionId: string,
    isCorrect: boolean,
    callbacks?: {
      onActivityXp?: (pts: number, reason: string, countDaily: boolean) => void
      onScheduleSync?: () => void
    }
  ) {
    const existing = getProgress(questionId)
    const isFirstTimeCorrect = ((existing.mcCorrectCount ?? existing.correctCount) === 0) && isCorrect
    const nextBox = isCorrect ? Math.min(4, existing.box + 1) : 1

    progressMap.value[questionId] = {
      ...existing,
      attempts: existing.attempts + 1,
      correctCount: existing.correctCount + (isCorrect ? 1 : 0),
      wrongCount: existing.wrongCount + (isCorrect ? 0 : 1),
      lastAnsweredAt: new Date().toISOString(),
      lastCorrect: isCorrect,
      box: nextBox,
      // Dedizierte MC-Quiz Fortschrittsdaten:
      mcAttempts: (existing.mcAttempts || 0) + 1,
      mcCorrectCount: (existing.mcCorrectCount || 0) + (isCorrect ? 1 : 0),
      mcLastCorrect: isCorrect
    }

    if (isCorrect) {
      const pts = isFirstTimeCorrect ? 5 : 2
      callbacks?.onActivityXp?.(
        pts,
        isFirstTimeCorrect ? `+${pts} Pkt. (Neu gemeistert!)` : `+${pts} Pkt. (Wiederholung)`,
        true
      )
    }

    callbacks?.onScheduleSync?.()
  }

  function recordFlashcardRating(
    questionId: string,
    rating: 'again' | 'hard' | 'good' | 'easy',
    callbacks?: {
      onActivityXp?: (pts: number, reason: string, countDaily: boolean) => void
      onScheduleSync?: () => void
    }
  ) {
    const existing = getProgress(questionId)
    const boxMap = { again: 1, hard: 2, good: 3, easy: 4 }
    const isCorrect = rating === 'good' || rating === 'easy'
    progressMap.value[questionId] = {
      ...existing,
      attempts: existing.attempts + 1,
      lastAnsweredAt: new Date().toISOString(),
      box: boxMap[rating],
      flashcardAttempts: (existing.flashcardAttempts || 0) + 1,
      flashcardBox: boxMap[rating]
      // WICHTIG: mcAttempts und mcCorrectCount bleiben unberührt, damit die MC-Quiz Progress-Bar unbeeinflusst bleibt!
    }

    if (isCorrect) {
      callbacks?.onActivityXp?.(2, '+2 Pkt. (Karteikarte gewusst)', true)
    }
    callbacks?.onScheduleSync?.()
  }

  function rewardMatchingRound(
    mistakesCount = 0,
    callbacks?: {
      onActivityXp?: (pts: number, reason: string, countDaily: boolean) => void
      onScheduleSync?: () => void
    }
  ) {
    const pts = mistakesCount === 0 ? 5 : 2
    callbacks?.onActivityXp?.(pts, `+${pts} Pkt. (Zuordnungs-Runde gelöst!)`, false)
    callbacks?.onScheduleSync?.()
  }

  function toggleBookmark(questionId: string, onScheduleSync?: () => void) {
    const existing = getProgress(questionId)
    progressMap.value[questionId] = {
      ...existing,
      bookmarked: !existing.bookmarked
    }
    onScheduleSync?.()
  }

  function savePersonalNote(questionId: string, note: string, onScheduleSync?: () => void) {
    const existing = getProgress(questionId)
    progressMap.value[questionId] = {
      ...existing,
      personalNote: note
    }
    onScheduleSync?.()
  }

  function resetProgress() {
    progressMap.value = {}
  }

  function getFolderStats(folderId: string, allDecks: StudyDeck[]) {
    const decksInFolder = allDecks.filter((d) => (d.folderId || 'custom') === folderId)
    const deckIds = new Set(decksInFolder.map((d) => d.id))
    const qs = allQuestions.value.filter((q) => deckIds.has(q.deckId))
    const total = qs.length
    let answered = 0
    let mastered = 0
    let wrong = 0

    for (const q of qs) {
      const p = progressMap.value[q.id]
      if (!p) continue
      if (isQuestionMcAnswered(p)) answered++
      if (isQuestionMcMastered(p)) mastered++
      if (p.mcLastCorrect === false || (p.mcLastCorrect === undefined && p.lastCorrect === false)) wrong++
    }

    const percent = total > 0 ? Math.round((mastered / total) * 100) : 0
    const answeredPercent = total > 0 ? Math.round((answered / total) * 100) : 0

    return {
      deckCount: decksInFolder.length,
      total,
      answered,
      mastered,
      mcCorrect: mastered,
      wrong,
      percent,
      answeredPercent
    }
  }

  function getDeckStats(deckId: string, allDecks: StudyDeck[]) {
    const qs = getDeckQuestions(deckId, allDecks)
    const total = qs.length
    let answered = 0
    let mastered = 0
    let wrong = 0

    for (const q of qs) {
      const p = progressMap.value[q.id]
      if (!p) continue
      if (isQuestionMcAnswered(p)) answered++
      if (isQuestionMcMastered(p)) mastered++
      if (p.mcLastCorrect === false || (p.mcLastCorrect === undefined && p.lastCorrect === false)) wrong++
    }

    const percent = total > 0 ? Math.round((mastered / total) * 100) : 0
    const answeredPercent = total > 0 ? Math.round((answered / total) * 100) : 0

    return {
      total,
      answered,
      mastered,
      mcCorrect: mastered,
      wrong,
      percent,
      answeredPercent
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
      if (isQuestionMcAnswered(p)) answered++
      if (isQuestionMcMastered(p)) mastered++
      if (p.mcLastCorrect === false || (p.mcLastCorrect === undefined && p.lastCorrect === false)) needsReview++
      if (p.bookmarked) bookmarked++
    }

    const masteryPercent = total > 0 ? Math.round((mastered / total) * 100) : 0
    return {
      total,
      answered,
      mastered,
      mcCorrect: mastered,
      needsReview,
      bookmarked,
      masteryPercent
    }
  })

  function getAchievements(profile: UserProfile) {
    const stats = overallStats.value
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
        unlocked: profile.streakDays >= 3
      },
      {
        id: 'ach-daily',
        title: 'Tagesziel-Champion',
        description: `Tagesziel von ${profile.dailyGoal} richtigen Fragen an einem Tag erreicht`,
        emoji: '⚡',
        unlocked: profile.todayAnsweredCount >= profile.dailyGoal
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
        unlocked: profile.vouchers.length > 0
      },
      {
        id: 'ach-examready',
        title: 'Prüfungsreif fürs Examen',
        description: 'Mindestens 85% aller Fragen sicher gemeistert',
        emoji: '👑',
        unlocked: stats.masteryPercent >= 85
      }
    ]
  }

  return {
    customQuestions,
    progressMap,
    allQuestions,
    overallStats,
    getDeckQuestions,
    getProgress,
    recordAnswer,
    recordFlashcardRating,
    rewardMatchingRound,
    toggleBookmark,
    savePersonalNote,
    resetProgress,
    getFolderStats,
    getDeckStats,
    getAchievements
  }
}
