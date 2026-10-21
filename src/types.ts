export type QuestionType = 'mc' | 'calculation' | 'case'
export type Difficulty = 'leicht' | 'mittel' | 'schwer'

export interface Question {
  id: string
  deckId: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  mnemonic?: string
  lawReference?: string
  pdfSource?: string
  difficulty: Difficulty
  type: QuestionType
  flashcardFront: string
  flashcardBack: string
}

export interface StudyDeck {
  id: string
  title: string
  description: string
  icon: string
  color: string
  sourceFileName?: string
  createdAt: string
  isBuiltIn?: boolean
  summaryPoints: string[]
}

export interface QuestionProgress {
  questionId: string
  attempts: number
  correctCount: number
  wrongCount: number
  lastAnsweredAt?: string
  lastCorrect?: boolean
  // Spaced Repetition (SM-2 light)
  box: number // 0 = neu, 1 = nochmal, 2 = schwer, 3 = gut, 4 = gemeistert
  nextReviewAt?: string
  bookmarked?: boolean
}

export interface MatchingPair {
  id: string
  category: 'fristen' | 'grenzwerte' | 'gewebe' | 'organisation' | 'bereiche'
  left: string
  right: string
  hint?: string
}

export interface AISettings {
  provider: 'gemini' | 'openai' | 'anthropic' | 'ollama'
  geminiKey: string
  openaiKey: string
  anthropicKey: string
  ollamaUrl: string
  model: string
}
