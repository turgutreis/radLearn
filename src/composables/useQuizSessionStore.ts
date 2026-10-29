import { ref } from 'vue'
import type { Question } from '../types'
import { STORAGE_KEYS, loadJson } from '../services/storageKeys'

export interface SavedQuizSession {
  deckId: string
  currentIndex: number
  activeQuestions: Question[]
  sessionAnswers: Record<string, { selected: number; correct: boolean }>
  recordedInSession: string[]
  selectedOption: number | null
  isRevealed: boolean
  examMode: boolean
  shuffleQuestions: boolean
  isFinished: boolean
  savedAt: string
}

// In-memory reactive cache backed by localStorage
const sessionsMap = ref<Record<string, SavedQuizSession>>(
  loadJson<Record<string, SavedQuizSession>>(STORAGE_KEYS.QUIZ_SESSIONS, {})
)

function persistAll() {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_SESSIONS, JSON.stringify(sessionsMap.value))
  } catch (err) {
    console.warn('Could not persist quiz sessions to localStorage:', err)
  }
}

export function useQuizSessionStore() {
  function getSession(deckId: string): SavedQuizSession | null {
    const s = sessionsMap.value[deckId]
    if (!s) return null
    if (s.isFinished) return null
    if (!Array.isArray(s.activeQuestions) || s.activeQuestions.length === 0) return null
    return s
  }

  function saveSession(deckId: string, session: SavedQuizSession) {
    if (session.isFinished) {
      delete sessionsMap.value[deckId]
    } else {
      sessionsMap.value[deckId] = session
    }
    persistAll()
  }

  function clearSession(deckId: string) {
    if (sessionsMap.value[deckId]) {
      delete sessionsMap.value[deckId]
      persistAll()
    }
  }

  function getResumeInfo(deckId: string): { currentIndex: number; total: number } | null {
    const s = getSession(deckId)
    if (!s) return null
    // Nur als wiederaufnehmbar anzeigen wenn man bereits über Frage 1 hinaus ist oder mindestens eine Antwort gegeben hat
    const hasAnswers = Object.keys(s.sessionAnswers || {}).length > 0
    if (s.currentIndex > 0 || hasAnswers) {
      return {
        currentIndex: s.currentIndex,
        total: s.activeQuestions.length
      }
    }
    return null
  }

  return {
    sessionsMap,
    getSession,
    saveSession,
    clearSession,
    getResumeInfo
  }
}
