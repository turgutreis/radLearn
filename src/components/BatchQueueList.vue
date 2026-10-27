<script setup lang="ts">
import {
  FileStack,
  Plus,
  Trash2,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Check,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-vue-next'
import type { QueueItem } from './PdfUploadGenerator.vue'

const props = defineProps<{
  queue: QueueItem[]
  totalEstimate: number
  isGenerating: boolean
  mergeIntoSingleDeck: boolean
  batchDeckTitle: string
}>()

const emit = defineEmits<{
  (e: 'update:mergeIntoSingleDeck', val: boolean): void
  (e: 'update:batchDeckTitle', val: string): void
  (e: 'addMore'): void
  (e: 'clear'): void
  (e: 'moveItem', index: number, direction: 'up' | 'down'): void
  (e: 'removeItem', id: string): void
}>()

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div v-if="queue.length > 0" class="space-y-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5">
    <!-- Queue Header -->
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
      <div class="flex items-center gap-2">
        <FileStack class="w-5 h-5 text-amber-400 shrink-0" />
        <span class="text-sm font-bold text-white">
          Warteschlange ({{ queue.length }} {{ queue.length === 1 ? 'Datei' : 'Dateien / Seiten' }})
        </span>
        <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
          ≈ {{ totalEstimate }} Fragen
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="emit('addMore')"
          class="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 transition font-medium"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>+ Mehr hinzufügen</span>
        </button>
        <button
          type="button"
          @click="emit('clear')"
          class="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 transition"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Leeren</span>
        </button>
      </div>
    </div>

    <!-- Queue Cards List -->
    <div class="space-y-2">
      <div
        v-for="(item, idx) in queue"
        :key="item.id"
        class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/90 border transition"
        :class="
          item.status === 'processing'
            ? 'border-amber-500 shadow-md shadow-amber-500/10'
            : item.status === 'done'
              ? 'border-emerald-500/40 bg-emerald-950/10'
              : item.status === 'error'
                ? 'border-rose-500/50 bg-rose-950/10'
                : 'border-slate-800'
        "
      >
        <!-- Order Number Badge -->
        <span class="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
          {{ idx + 1 }}
        </span>

        <!-- Image Thumbnail or Document Icon -->
        <div class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
          <img
            v-if="item.previewUrl"
            :src="item.previewUrl"
            :alt="item.name"
            class="w-full h-full object-cover"
          />
          <FileText v-else-if="item.type === 'pdf'" class="w-6 h-6 text-rose-400" />
          <FileText v-else class="w-6 h-6 text-amber-400" />
        </div>

        <!-- Title & Status -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-xs sm:text-sm font-semibold text-white truncate" :title="item.name">
              {{ item.name }}
            </p>
            <span v-if="item.type === 'pdf' && item.totalPages" class="text-[10px] text-slate-400 shrink-0">
              ({{ item.totalPages }} S.)
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2 mt-1">
            <span
              v-if="item.status === 'extracting'"
              class="text-[10px] text-amber-400 flex items-center gap-1 font-medium"
            >
              <Loader2 class="w-3 h-3 animate-spin" />
              Wird eingelesen...
            </span>
            <span
              v-else-if="item.status === 'processing'"
              class="text-[10px] text-amber-300 flex items-center gap-1 font-bold animate-pulse"
            >
              <Loader2 class="w-3 h-3 animate-spin" />
              KI analysiert Seite...
            </span>
            <span
              v-else-if="item.status === 'done'"
              class="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"
            >
              <CheckCircle2 class="w-3 h-3" />
              {{ item.generatedQuestionsCount }} Fragen erstellt
            </span>
            <span
              v-else-if="item.status === 'error'"
              class="text-[10px] text-rose-400 flex items-center gap-1 font-medium truncate"
              :title="item.error"
            >
              <AlertCircle class="w-3 h-3 shrink-0" />
              {{ item.error || 'Fehler' }}
            </span>
            <span
              v-else
              class="text-[10px] text-slate-400 flex items-center gap-1"
            >
              <Check class="w-3 h-3 text-emerald-400" />
              Bereit
            </span>

            <span class="text-[10px] text-slate-500">
              {{ formatFileSize(item.size) }}
            </span>
          </div>
        </div>

        <!-- Reorder & Delete Buttons -->
        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            :disabled="idx === 0 || isGenerating"
            @click="emit('moveItem', idx, 'up')"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition"
            title="Nach oben verschieben"
          >
            <ChevronUp class="w-4 h-4" />
          </button>
          <button
            type="button"
            :disabled="idx === queue.length - 1 || isGenerating"
            @click="emit('moveItem', idx, 'down')"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition"
            title="Nach unten verschieben"
          >
            <ChevronDown class="w-4 h-4" />
          </button>
          <button
            type="button"
            :disabled="isGenerating"
            @click="emit('removeItem', item.id)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-20 transition"
            title="Entfernen"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Merge Settings (if > 1 file) -->
    <div v-if="queue.length > 1" class="pt-3 border-t border-slate-800/80 space-y-3">
      <label class="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          :checked="mergeIntoSingleDeck"
          @change="emit('update:mergeIntoSingleDeck', ($event.target as HTMLInputElement).checked)"
          class="accent-amber-500 rounded mt-0.5"
        />
        <div class="text-xs space-y-0.5">
          <div class="font-bold text-amber-300">
            Alle {{ queue.length }} Seiten zu EINEM gemeinsamen Lernset zusammenfassen (Empfohlen)
          </div>
          <div class="text-slate-400">
            Optimal für Buchkapitel: Erstellt ein zusammenhängendes Prüfungsdeck mit insgesamt ca.
            <strong class="text-white">{{ totalEstimate }} Fragen</strong>, sortiert nach den Buchseiten.
          </div>
        </div>
      </label>

      <div v-if="mergeIntoSingleDeck" class="space-y-1">
        <label class="text-xs font-semibold text-slate-300">Name des gemeinsamen Decks:</label>
        <input
          :value="batchDeckTitle"
          @input="emit('update:batchDeckTitle', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="z.B. Prinzipien der Nuklearmedizin (5 Seiten)..."
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        />
      </div>
    </div>
  </div>
</template>
