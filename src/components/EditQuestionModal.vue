<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Check, CheckCircle2, AlertCircle, Edit3 } from 'lucide-vue-next'
import type { Question } from '../types'

const props = defineProps<{
  isOpen: boolean
  question: Question | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', updated: Question): void
}>()

const formQuestion = ref('')
const formOptions = ref<string[]>(['', '', '', ''])
const formCorrectIndex = ref(0)
const formExplanation = ref('')
const formMnemonic = ref('')
const formDifficulty = ref<'leicht' | 'mittel' | 'schwer'>('mittel')

watch(
  () => props.question,
  (q) => {
    if (q) {
      formQuestion.value = q.question
      formOptions.value = Array.isArray(q.options) && q.options.length >= 2
        ? [...q.options]
        : ['', '', '', '']
      while (formOptions.value.length < 4) formOptions.value.push('')
      formCorrectIndex.value = typeof q.correctIndex === 'number' ? q.correctIndex : 0
      formExplanation.value = q.explanation || ''
      formMnemonic.value = q.mnemonic || ''
      formDifficulty.value = q.difficulty || 'mittel'
    }
  },
  { immediate: true }
)

function setCorrect(idx: number) {
  formCorrectIndex.value = idx
}

function handleSave() {
  if (!props.question) return
  if (!formQuestion.value.trim()) {
    alert('Bitte gib einen Fragetext ein.')
    return
  }

  const cleanedOptions = formOptions.value.map((o) => o.trim())
  if (cleanedOptions.some((o) => !o)) {
    alert('Bitte fülle alle 4 Antwortmöglichkeiten aus.')
    return
  }

  const updated: Question = {
    ...props.question,
    question: formQuestion.value.trim(),
    options: cleanedOptions,
    correctIndex: Math.max(0, Math.min(cleanedOptions.length - 1, formCorrectIndex.value)),
    explanation: formExplanation.value.trim(),
    mnemonic: formMnemonic.value.trim(),
    difficulty: formDifficulty.value,
    flashcardFront: formQuestion.value.trim(),
    flashcardBack: `${cleanedOptions[formCorrectIndex.value]}\n\n${formExplanation.value.trim()}`
  }

  emit('save', updated)
}
</script>

<template>
  <div
    v-if="isOpen && question"
    class="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl my-auto text-left"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Edit3 class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-white">
              Frage & richtige Antwort anpassen
            </h3>
            <p class="text-xs text-slate-400">
              Korragiere Ungenauigkeiten der KI oder passe Optionen und Erklärungen an.
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          aria-label="Schließen"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <div class="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
        <!-- Question Text -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-300">Fragetext:</label>
          <textarea
            v-model="formQuestion"
            rows="3"
            class="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>

        <!-- Options with Correct Answer Selector -->
        <div class="space-y-2">
          <label class="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Antwortoptionen (tippe auf den Button, um die richtige Antwort festzulegen):</span>
            <span class="text-[11px] text-amber-400 font-normal">
              Aktuell richtig: Option {{ ['A', 'B', 'C', 'D'][formCorrectIndex] || (formCorrectIndex + 1) }}
            </span>
          </label>

          <div class="space-y-2.5">
            <div
              v-for="(opt, idx) in formOptions"
              :key="idx"
              class="p-2.5 sm:p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
              :class="
                formCorrectIndex === idx
                  ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/70 border-slate-800'
              "
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span
                  class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                  :class="
                    formCorrectIndex === idx
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400'
                  "
                >
                  {{ ['A', 'B', 'C', 'D'][idx] || idx + 1 }}
                </span>
                <input
                  v-model="formOptions[idx]"
                  type="text"
                  placeholder="Antworttext..."
                  class="flex-1 bg-transparent border-0 text-sm text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <button
                type="button"
                @click="setCorrect(idx)"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
                :class="
                  formCorrectIndex === idx
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 border border-slate-700/80'
                "
              >
                <CheckCircle2 v-if="formCorrectIndex === idx" class="w-4 h-4" />
                <span>{{ formCorrectIndex === idx ? '✓ Richtige Antwort' : 'Als richtig markieren' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Explanation -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-300">Erklärung fürs Examen:</label>
          <textarea
            v-model="formExplanation"
            rows="3"
            placeholder="Begründung, warum die Antwort stimmt..."
            class="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>

        <!-- Mnemonic / Eselsbrücke -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-300">Eselsbrücke / Merksatz:</label>
          <input
            v-model="formMnemonic"
            type="text"
            placeholder="z.B. Sub-Nano = Mikrogramm/Pikogramm"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-amber-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        <!-- Difficulty -->
        <div class="flex items-center gap-3 pt-1">
          <span class="text-xs font-semibold text-slate-300">Schwierigkeit:</span>
          <div class="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              v-for="diff in (['leicht', 'mittel', 'schwer'] as const)"
              :key="diff"
              type="button"
              @click="formDifficulty = diff"
              class="px-3 py-1 rounded-lg capitalize transition"
              :class="
                formDifficulty === diff
                  ? diff === 'leicht' ? 'bg-emerald-500 text-slate-950 font-bold' : diff === 'mittel' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-rose-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              "
            >
              {{ diff }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition"
        >
          Abbrechen
        </button>
        <button
          type="button"
          @click="handleSave"
          class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
        >
          <Check class="w-4 h-4" />
          <span>Änderungen speichern</span>
        </button>
      </div>
    </div>
  </div>
</template>
