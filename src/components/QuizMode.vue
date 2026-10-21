<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Bookmark,
  Trophy,
  Sparkles,
  Scale,
  Calculator,
  HelpCircle,
  Filter
} from 'lucide-vue-next'
import { useStudyStore } from '../composables/useStudyStore'
import type { Question } from '../types'

const props = defineProps<{
  initialDeckId?: string
}>()

const { allDecks, getDeckQuestions, getProgress, recordAnswer, toggleBookmark } = useStudyStore()

const selectedDeckId = ref<string>(props.initialDeckId || 'all')
const examMode = ref<boolean>(false) // false = Sofort-Feedback (Lernmodus), true = Prüfungsmodus
const shuffleQuestions = ref<boolean>(false)

watch(
  () => props.initialDeckId,
  (newVal) => {
    if (newVal) {
      selectedDeckId.value = newVal
      restartQuiz()
    }
  }
)

const rawQuestions = computed<Question[]>(() => getDeckQuestions(selectedDeckId.value))

const activeQuestions = ref<Question[]>([])
const currentIndex = ref(0)
const selectedOption = ref<number | null>(null)
const isRevealed = ref(false)
const sessionAnswers = ref<Record<string, { selected: number; correct: boolean }>>({})
const isFinished = ref(false)

function shuffleOptionsForQuestion(q: Question): Question {
  const indexed = q.options.map((text, idx) => ({
    text,
    isCorrect: idx === q.correctIndex
  }))
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indexed[i], indexed[j]] = [indexed[j], indexed[i]]
  }
  return {
    ...q,
    options: indexed.map((item) => item.text),
    correctIndex: indexed.findIndex((item) => item.isCorrect)
  }
}

function buildQuestionList() {
  const list = rawQuestions.value.map((q) => shuffleOptionsForQuestion(q))
  if (shuffleQuestions.value) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[list[i], list[j]] = [list[j], list[i]]
    }
  }
  activeQuestions.value = list
}

function restartQuiz() {
  buildQuestionList()
  currentIndex.value = 0
  selectedOption.value = null
  isRevealed.value = false
  sessionAnswers.value = {}
  isFinished.value = false
}

watch([selectedDeckId, shuffleQuestions], () => {
  restartQuiz()
}, { immediate: true })

const currentQuestion = computed<Question | undefined>(() => activeQuestions.value[currentIndex.value])
const currentProgress = computed(() => (currentQuestion.value ? getProgress(currentQuestion.value.id) : null))

function selectAnswer(idx: number) {
  if (!currentQuestion.value) return
  if (isRevealed.value && !examMode.value) return

  selectedOption.value = idx
  const isCorrect = idx === currentQuestion.value.correctIndex

  if (!examMode.value) {
    isRevealed.value = true
    sessionAnswers.value[currentQuestion.value.id] = { selected: idx, correct: isCorrect }
    recordAnswer(currentQuestion.value.id, isCorrect)
  } else {
    sessionAnswers.value[currentQuestion.value.id] = { selected: idx, correct: isCorrect }
  }
}

function nextQuestion() {
  if (!currentQuestion.value) return

  if (examMode.value && selectedOption.value !== null) {
    const isCorrect = selectedOption.value === currentQuestion.value.correctIndex
    recordAnswer(currentQuestion.value.id, isCorrect)
  }

  if (currentIndex.value < activeQuestions.value.length - 1) {
    currentIndex.value++
    const nextQ = activeQuestions.value[currentIndex.value]
    const prevAns = nextQ ? sessionAnswers.value[nextQ.id] : undefined
    selectedOption.value = prevAns ? prevAns.selected : null
    isRevealed.value = !examMode.value && Boolean(prevAns)
  } else {
    isFinished.value = true
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    const prevQ = activeQuestions.value[currentIndex.value]
    const prevAns = prevQ ? sessionAnswers.value[prevQ.id] : undefined
    selectedOption.value = prevAns ? prevAns.selected : null
    isRevealed.value = !examMode.value && Boolean(prevAns)
  }
}

const sessionStats = computed(() => {
  const entries = Object.values(sessionAnswers.value)
  const totalAnswered = entries.length
  const correct = entries.filter((e) => e.correct).length
  const percent = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0
  return { totalAnswered, correct, wrong: totalAnswered - correct, percent }
})

function repeatWrongOnly() {
  const wrongIds = new Set(
    Object.entries(sessionAnswers.value)
      .filter(([, val]) => !val.correct)
      .map(([id]) => id)
  )
  activeQuestions.value = activeQuestions.value.filter((q) => wrongIds.has(q.id))
  currentIndex.value = 0
  selectedOption.value = null
  isRevealed.value = false
  sessionAnswers.value = {}
  isFinished.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Top Filter & Mode Bar -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <div class="flex items-center gap-2 text-slate-400 text-sm font-medium shrink-0">
          <Filter class="w-4 h-4 text-amber-400" />
          <span>Thema:</span>
        </div>
        <select
          v-model="selectedDeckId"
          class="bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-xl px-3.5 py-2 max-w-full sm:max-w-md truncate focus:outline-none focus:border-amber-500"
        >
          <option value="all">Alle Themen ({{ getDeckQuestions('all').length }} Fragen)</option>
          <option value="wrong">⚡ Zuletzt falsch beantwortet ({{ getDeckQuestions('wrong').length }})</option>
          <option value="bookmarked">⭐ Gemerkte Fragen ({{ getDeckQuestions('bookmarked').length }})</option>
          <option v-for="deck in allDecks" :key="deck.id" :value="deck.id">
            {{ deck.title }} ({{ getDeckQuestions(deck.id).length }})
          </option>
        </select>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Mode Toggle -->
        <div class="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            @click="examMode = false; restartQuiz()"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              !examMode ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            Lernmodus (Sofort-Hilfe)
          </button>
          <button
            type="button"
            @click="examMode = true; restartQuiz()"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              examMode ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            Prüfungssimulation
          </button>
        </div>

        <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-800/70 px-3 py-2 rounded-xl border border-slate-700/70">
          <input type="checkbox" v-model="shuffleQuestions" class="accent-amber-500 rounded" />
          <span>Zufällige Reihenfolge</span>
        </label>

        <button
          type="button"
          @click="restartQuiz"
          class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title="Quiz neu starten"
        >
          <RotateCcw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="activeQuestions.length === 0"
      class="bg-slate-900/70 border border-slate-800 rounded-2xl p-12 text-center space-y-3"
    >
      <CheckCircle2 class="w-12 h-12 text-emerald-400 mx-auto" />
      <h3 class="text-lg font-bold text-white">Keine Fragen in diesem Filter vorhanden</h3>
      <p class="text-sm text-slate-400 max-w-md mx-auto">
        Wähle oben ein anderes Themen-Deck aus oder lade im Tab „PDF-Upload & KI“ ein neues Skript hoch.
      </p>
      <button
        type="button"
        @click="selectedDeckId = 'all'"
        class="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400 transition"
      >
        Alle Fragen anzeigen
      </button>
    </div>

    <!-- Finished Summary Screen -->
    <div
      v-else-if="isFinished"
      class="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6"
    >
      <div class="text-center space-y-3">
        <div class="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto">
          <Trophy class="w-8 h-8 text-amber-400" />
        </div>
        <h2 class="text-2xl font-extrabold text-white">Durchgang abgeschlossen!</h2>
        <p class="text-slate-400 text-sm">
          Du hast <span class="text-white font-semibold">{{ sessionStats.correct }}</span> von
          <span class="text-white font-semibold">{{ sessionStats.totalAnswered }}</span> Fragen richtig beantwortet
          (<span class="text-amber-400 font-bold">{{ sessionStats.percent }}%</span>).
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
        <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
          <div class="text-2xl font-extrabold text-emerald-400">{{ sessionStats.correct }}</div>
          <div class="text-xs text-emerald-200/80">Richtig</div>
        </div>
        <div class="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-center">
          <div class="text-2xl font-extrabold text-rose-400">{{ sessionStats.wrong }}</div>
          <div class="text-xs text-rose-200/80">Noch üben</div>
        </div>
        <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
          <div class="text-2xl font-extrabold text-amber-400">{{ sessionStats.percent }}%</div>
          <div class="text-xs text-amber-200/80">Erfolgsquote</div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          v-if="sessionStats.wrong > 0"
          type="button"
          @click="repeatWrongOnly"
          class="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm transition flex items-center gap-2"
        >
          <RotateCcw class="w-4 h-4" />
          Nur die {{ sessionStats.wrong }} falschen Fragen wiederholen
        </button>
        <button
          type="button"
          @click="restartQuiz"
          class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition flex items-center gap-2"
        >
          <RotateCcw class="w-4 h-4" />
          Komplettes Set neu starten
        </button>
      </div>

      <!-- Review list in Exam Mode -->
      <div v-if="examMode" class="space-y-4 pt-6 border-t border-slate-800">
        <h3 class="text-base font-bold text-white">Detaillierte Prüfungs-Auswertung:</h3>
        <div
          v-for="(q, idx) in activeQuestions"
          :key="q.id"
          class="p-4 rounded-2xl border bg-slate-950/60 space-y-2"
          :class="sessionAnswers[q.id]?.correct ? 'border-emerald-500/30' : 'border-rose-500/40'"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">Frage {{ idx + 1 }}</span>
            <span
              class="text-xs font-bold px-2.5 py-1 rounded-lg"
              :class="sessionAnswers[q.id]?.correct ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'"
            >
              {{ sessionAnswers[q.id]?.correct ? '✓ Richtig' : '✗ Falsch' }}
            </span>
          </div>
          <p class="font-semibold text-slate-100 text-sm">{{ q.question }}</p>
          <p class="text-xs text-emerald-300">
            <strong>Richtige Antwort:</strong> {{ q.options[q.correctIndex] }}
          </p>
          <p class="text-xs text-slate-400">{{ q.explanation }}</p>
        </div>
      </div>
    </div>

    <!-- Active Question Card -->
    <div v-else-if="currentQuestion" class="space-y-5">
      <!-- Progress Bar -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>Frage <strong class="text-white">{{ currentIndex + 1 }}</strong> von <strong class="text-white">{{ activeQuestions.length }}</strong></span>
          <div class="flex items-center gap-4">
            <span class="text-emerald-400 font-medium">✓ {{ sessionStats.correct }} richtig</span>
            <span class="text-rose-400 font-medium">✗ {{ sessionStats.wrong }} falsch</span>
          </div>
        </div>
        <div class="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            class="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
            :style="{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }"
          />
        </div>
      </div>

      <!-- Main Question Container -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <!-- Badges & Bookmark -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
              :class="{
                'bg-emerald-500/10 text-emerald-300 border-emerald-500/30': currentQuestion.difficulty === 'leicht',
                'bg-amber-500/10 text-amber-300 border-amber-500/30': currentQuestion.difficulty === 'mittel',
                'bg-rose-500/10 text-rose-300 border-rose-500/30': currentQuestion.difficulty === 'schwer'
              }"
            >
              {{ currentQuestion.difficulty.toUpperCase() }}
            </span>

            <span
              v-if="currentQuestion.type === 'calculation'"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
            >
              <Calculator class="w-3.5 h-3.5" />
              Rechenaufgabe
            </span>

            <span
              v-if="currentQuestion.lawReference"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/30"
            >
              <Scale class="w-3.5 h-3.5" />
              {{ currentQuestion.lawReference }}
            </span>

            <span
              v-if="currentQuestion.pdfSource"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs text-slate-400 bg-slate-800/80 border border-slate-700"
            >
              <BookOpen class="w-3.5 h-3.5 text-amber-400" />
              {{ currentQuestion.pdfSource }}
            </span>
          </div>

          <button
            type="button"
            @click="toggleBookmark(currentQuestion.id)"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition"
            :class="
              currentProgress?.bookmarked
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            "
          >
            <Bookmark class="w-3.5 h-3.5" :class="{ 'fill-amber-400': currentProgress?.bookmarked }" />
            {{ currentProgress?.bookmarked ? 'Gemerkt' : 'Merken' }}
          </button>
        </div>

        <!-- Question Text -->
        <h2 class="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {{ currentQuestion.question }}
        </h2>

        <!-- Options List -->
        <div class="space-y-3">
          <button
            v-for="(option, idx) in currentQuestion.options"
            :key="idx"
            type="button"
            @click="selectAnswer(idx)"
            class="w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 group"
            :class="[
              !isRevealed
                ? selectedOption === idx
                  ? 'bg-amber-500/15 border-amber-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-600 text-slate-200'
                : idx === currentQuestion.correctIndex
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-100'
                  : selectedOption === idx
                    ? 'bg-rose-500/15 border-rose-500 text-rose-100'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-75'
            ]"
          >
            <div
              class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border transition-colors"
              :class="[
                !isRevealed
                  ? selectedOption === idx
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 text-slate-400 border-slate-700 group-hover:border-slate-500'
                  : idx === currentQuestion.correctIndex
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : selectedOption === idx
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
              ]"
            >
              {{ ['A', 'B', 'C', 'D'][idx] || idx + 1 }}
            </div>

            <div class="flex-1 text-sm sm:text-base leading-relaxed">
              {{ option }}
            </div>

            <div v-if="isRevealed" class="shrink-0 mt-0.5">
              <CheckCircle2 v-if="idx === currentQuestion.correctIndex" class="w-5 h-5 text-emerald-400" />
              <XCircle v-else-if="selectedOption === idx" class="w-5 h-5 text-rose-400" />
            </div>
          </button>
        </div>

        <!-- Instant Explanation & Mnemonic Box -->
        <div
          v-if="isRevealed"
          class="rounded-2xl p-5 border space-y-3 transition-all"
          :class="
            selectedOption === currentQuestion.correctIndex
              ? 'bg-emerald-950/30 border-emerald-500/30'
              : 'bg-rose-950/30 border-rose-500/30'
          "
        >
          <div class="flex items-center gap-2 font-bold text-sm" :class="selectedOption === currentQuestion.correctIndex ? 'text-emerald-300' : 'text-rose-300'">
            <CheckCircle2 v-if="selectedOption === currentQuestion.correctIndex" class="w-5 h-5" />
            <HelpCircle v-else class="w-5 h-5" />
            <span>
              {{ selectedOption === currentQuestion.correctIndex ? 'Stark! Das ist vollkommen richtig.' : 'Nicht ganz – hier ist die Erklärung fürs Examen:' }}
            </span>
          </div>

          <p class="text-sm text-slate-200 leading-relaxed">
            {{ currentQuestion.explanation }}
          </p>

          <div
            v-if="currentQuestion.mnemonic"
            class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3"
          >
            <Lightbulb class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div class="text-xs sm:text-sm text-amber-200">
              <strong class="font-bold text-amber-300">Eselsbrücke / Merksatz: </strong>
              {{ currentQuestion.mnemonic }}
            </div>
          </div>
        </div>

        <!-- Navigation Footer -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            type="button"
            @click="prevQuestion"
            :disabled="currentIndex === 0"
            class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 text-sm font-medium transition"
          >
            Zurück
          </button>

          <div class="flex items-center gap-3">
            <button
              v-if="!isRevealed && !examMode"
              type="button"
              @click="isRevealed = true"
              class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-sm font-medium transition flex items-center gap-1.5"
            >
              <Sparkles class="w-4 h-4" />
              Lösung zeigen
            </button>

            <button
              type="button"
              @click="nextQuestion"
              :disabled="examMode && selectedOption === null"
              class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <span>{{ currentIndex === activeQuestions.length - 1 ? 'Auswertung anzeigen' : 'Nächste Frage' }}</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
