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
  box: number // 0 = neu, 1 = nochmal, 2 = schwer, 3 = gut, 4 = gemeistert
  nextReviewAt?: string
  bookmarked?: boolean
  personalNote?: string
}

export interface RewardItem {
  id: string
  title: string
  description: string
  cost: number
  emoji: string
  redeemedCount: number
  lastRedeemedAt?: string
}

export interface RedeemedVoucher {
  id: string
  rewardId: string
  title: string
  emoji: string
  cost: number
  redeemedAt: string
  fulfilled: boolean
}

export interface UserProfile {
  name: string
  xp: number
  spentCoins: number
  streakDays: number
  lastStudyDate: string // YYYY-MM-DD
  dailyGoal: number
  todayAnsweredCount: number
  rewards: RewardItem[]
  vouchers: RedeemedVoucher[]
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
