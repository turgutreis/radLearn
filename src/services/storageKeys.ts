export const STORAGE_KEYS = {
  CUSTOM_DECKS: 'radlearn_custom_decks_v1',
  CUSTOM_QUESTIONS: 'radlearn_custom_questions_v1',
  FOLDERS: 'radlearn_folders_v1',
  DECK_FOLDER_OVERRIDES: 'radlearn_deck_folder_overrides_v1',
  DECK_ORDER: 'radlearn_deck_order_v1',
  PROGRESS: 'radlearn_progress_v1',
  PROFILE: 'radlearn_user_profile_v2', // v2 = Strengeres Punkte- & Preis-Balancing!
  AI_SETTINGS: 'radlearn_ai_settings_v1',
  SUPABASE_CONFIG: 'radlearn_supabase_config_v1',
  QUIZ_SESSIONS: 'radlearn_quiz_sessions_v1',
  FLASHCARD_SESSIONS: 'radlearn_flashcard_sessions_v1'
}

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getYesterdayIso(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}
