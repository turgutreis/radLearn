<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  RotateCw,
  Lightbulb,
  Scale,
  BookOpen,
  Download,
  Bookmark,
  Filter,
  Sparkles,
  CheckCircle2
} from 'lucide-vue-next'
import { useStudyStore } from '../composables/useStudyStore'
import type { Question } from '../types'

const props = defineProps<{
  initialDeckId?: string
}>()

const { allDecks, folders, getDeckQuestions, getProgress, recordFlashcardRating, toggleBookmark } = useStudyStore()

function getFolderDecks(folderId: string) {
  return allDecks.value.filter((d) => (d.folderId || 'custom') === folderId)
}

const selectedDeckId = ref<string>(props.initialDeckId || 'all')
const onlyUnmastered = ref<boolean>(false)
const currentIndex = ref<number>(0)
const isFlipped = ref<boolean>(false)

watch(
  () => props.initialDeckId,
  (val) => {
    if (val) {
      selectedDeckId.value = val
      currentIndex.value = 0
      isFlipped.value = false
    }
  }
)

const filteredCards = computed<Question[]>(() => {
  const base = getDeckQuestions(selectedDeckId.value)
  if (!onlyUnmastered.value) return base
  return base.filter((q) => {
    const p = getProgress(q.id)
    return p.box < 3
  })
})

watch([selectedDeckId, onlyUnmastered], () => {
  currentIndex.value = 0
  isFlipped.value = false
})

const currentCard = computed<Question | undefined>(() => filteredCards.value[currentIndex.value])
const currentProgress = computed(() => (currentCard.value ? getProgress(currentCard.value.id) : null))

function rateCard(rating: 'again' | 'hard' | 'good' | 'easy') {
  if (!currentCard.value) return
  recordFlashcardRating(currentCard.value.id, rating)
  isFlipped.value = false
  if (currentIndex.value < filteredCards.value.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

function exportAnkiTsv() {
  const cards = getDeckQuestions(selectedDeckId.value)
  const lines = cards.map((c) => {
    const front = (c.flashcardFront || c.question).replace(/\t|\n/g, ' ')
    const back = `${(c.flashcardBack || '').replace(/\n/g, '<br>')}${
      c.mnemonic ? `<br><br><b>Merksatz:</b> ${c.mnemonic.replace(/\n/g, ' ')}` : ''
    }`.replace(/\t/g, ' ')
    const tag = (c.lawReference || 'Strahlenschutz').replace(/\s+/g, '_')
    return `${front}\t${back}\t${tag}`
  })
  const blob = new Blob([lines.join('\n')], { type: 'text/tab-separated-values;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Anki_Export_${selectedDeckId.value}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

function handleKeydown(e: KeyboardEvent) {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return
  if (e.code === 'Space') {
    e.preventDefault()
    isFlipped.value = !isFlipped.value
  } else if (isFlipped.value) {
    if (e.key === '1') rateCard('again')
    if (e.key === '2') rateCard('hard')
    if (e.key === '3') rateCard('good')
    if (e.key === '4') rateCard('easy')
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="space-y-6">
    <!-- Top Controls -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <div class="flex items-center gap-2 text-slate-400 text-sm font-medium shrink-0">
          <Filter class="w-4 h-4 text-cyan-400" />
          <span>Kartendeck:</span>
        </div>
        <select
          v-model="selectedDeckId"
          class="bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-xl px-3.5 py-2 max-w-full sm:max-w-md truncate focus:outline-none focus:border-cyan-500"
        >
          <option value="all">Alle Karteikarten ({{ getDeckQuestions('all').length }})</option>
          <option value="bookmarked">⭐ Gemerkte Karten ({{ getDeckQuestions('bookmarked').length }})</option>

          <optgroup v-for="folder in folders" :key="folder.id" :label="folder.name">
            <option v-if="getFolderDecks(folder.id).length > 1" :value="'folder:' + folder.id">
              📂 Ganzen Ordner lernen ({{ getDeckQuestions('folder:' + folder.id).length }} Karten)
            </option>
            <option v-for="deck in getFolderDecks(folder.id)" :key="deck.id" :value="deck.id">
              {{ deck.title }} ({{ getDeckQuestions(deck.id).length }})
            </option>
          </optgroup>
        </select>

        <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-800/70 px-3 py-2 rounded-xl border border-slate-700/70">
          <input type="checkbox" v-model="onlyUnmastered" class="accent-cyan-500 rounded" />
          <span>Nur noch nicht sicher gelernte Karten (Box 0–2)</span>
        </label>
      </div>

      <button
        type="button"
        @click="exportAnkiTsv"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition"
        title="Exportiert dieses Deck als Tab-getrennte Datei für den direkten Import in Anki"
      >
        <Download class="w-4 h-4" />
        Als Anki-Deck (.txt) exportieren
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredCards.length === 0"
      class="bg-slate-900/70 border border-slate-800 rounded-2xl p-12 text-center space-y-3"
    >
      <CheckCircle2 class="w-12 h-12 text-emerald-400 mx-auto" />
      <h3 class="text-lg font-bold text-white">Alle Karten in diesem Filter gemeistert!</h3>
      <p class="text-sm text-slate-400">
        Deaktiviere den Filter „Nur noch nicht sicher gelernte Karten“ oder wähle ein anderes Thema.
      </p>
      <button
        type="button"
        @click="onlyUnmastered = false"
        class="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-sm hover:bg-cyan-400 transition"
      >
        Alle Karten dieses Decks zeigen
      </button>
    </div>

    <div v-else-if="currentCard" class="max-w-3xl mx-auto space-y-5">
      <!-- Progress header -->
      <div class="flex items-center justify-between text-xs text-slate-400">
        <span>
          Karte <strong class="text-white">{{ currentIndex + 1 }}</strong> von
          <strong class="text-white">{{ filteredCards.length }}</strong>
        </span>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Lern-Box: <strong class="text-cyan-400">{{ currentProgress?.box || 0 }} / 4</strong>
          </span>
          <span class="hidden sm:inline text-slate-500">Tipp: [Leertaste] zum Umdrehen, [1–4] zum Bewerten</span>
        </div>
      </div>

      <!-- Flashcard Box -->
      <div
        @click="isFlipped = !isFlipped"
        class="cursor-pointer select-none rounded-3xl border transition-all duration-300 min-h-[340px] p-7 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden"
        :class="
          !isFlipped
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800 hover:border-cyan-500/50'
            : 'bg-gradient-to-br from-slate-900 via-cyan-950/25 to-slate-950 border-cyan-500/50'
        "
      >
        <!-- Card Header -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              :class="!isFlipped ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'"
            >
              {{ !isFlipped ? 'Frage (Vorderseite)' : 'Antwort (Rückseite)' }}
            </span>
            <span
              v-if="currentCard.lawReference"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-violet-500/10 text-violet-300 border border-violet-500/30"
            >
              <Scale class="w-3 h-3" />
              {{ currentCard.lawReference }}
            </span>
            <span
              v-if="currentCard.pdfSource"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-400"
            >
              <BookOpen class="w-3 h-3 text-amber-400" />
              {{ currentCard.pdfSource }}
            </span>
          </div>

          <button
            type="button"
            @click.stop="toggleBookmark(currentCard.id)"
            class="p-2 rounded-xl border transition"
            :class="
              currentProgress?.bookmarked
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-white'
            "
          >
            <Bookmark class="w-4 h-4" :class="{ 'fill-amber-400': currentProgress?.bookmarked }" />
          </button>
        </div>

        <!-- Card Body -->
        <div class="my-auto py-8">
          <div v-if="!isFlipped" class="text-center space-y-4">
            <h2 class="text-xl sm:text-2xl font-bold text-white leading-relaxed">
              {{ currentCard.flashcardFront || currentCard.question }}
            </h2>
          </div>

          <div v-else class="space-y-4">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {{ currentCard.flashcardFront || currentCard.question }}
            </div>
            <div class="text-base sm:text-lg text-slate-100 whitespace-pre-line leading-relaxed font-medium bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              {{ currentCard.flashcardBack }}
            </div>

            <div
              v-if="currentCard.mnemonic"
              class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3"
            >
              <Lightbulb class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div class="text-xs sm:text-sm text-amber-200">
                <strong class="text-amber-300">Eselsbrücke: </strong>
                {{ currentCard.mnemonic }}
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer Hint -->
        <div class="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/70">
          <RotateCw class="w-3.5 h-3.5 text-cyan-400" />
          <span>Klicken oder [Leertaste] drücken, um die Karte {{ !isFlipped ? 'umzudrehen' : 'wieder zurückzudrehen' }}</span>
        </div>
      </div>

      <!-- Rating Buttons (Anki style) -->
      <div v-if="isFlipped" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          @click="rateCard('again')"
          class="p-3.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-200 transition text-center space-y-0.5"
        >
          <div class="text-xs text-rose-400 font-semibold">[1] Nochmal</div>
          <div class="text-sm font-bold">Wusste ich nicht</div>
        </button>

        <button
          type="button"
          @click="rateCard('hard')"
          class="p-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 transition text-center space-y-0.5"
        >
          <div class="text-xs text-amber-400 font-semibold">[2] Schwer</div>
          <div class="text-sm font-bold">Mit Mühe</div>
        </button>

        <button
          type="button"
          @click="rateCard('good')"
          class="p-3.5 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 transition text-center space-y-0.5"
        >
          <div class="text-xs text-cyan-400 font-semibold">[3] Gut</div>
          <div class="text-sm font-bold">Gewusst</div>
        </button>

        <button
          type="button"
          @click="rateCard('easy')"
          class="p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 transition text-center space-y-0.5"
        >
          <div class="text-xs text-emerald-400 font-semibold">[4] Einfach</div>
          <div class="text-sm font-bold">Sitzt perfekt!</div>
        </button>
      </div>

      <div v-else class="flex items-center justify-between">
        <button
          type="button"
          @click="currentIndex = Math.max(0, currentIndex - 1)"
          :disabled="currentIndex === 0"
          class="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm disabled:opacity-40"
        >
          Vorherige Karte
        </button>
        <button
          type="button"
          @click="isFlipped = true"
          class="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <Sparkles class="w-4 h-4" />
          Antwort aufdecken
        </button>
        <button
          type="button"
          @click="currentIndex = (currentIndex + 1) % filteredCards.length"
          class="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm"
        >
          Überspringen
        </button>
      </div>
    </div>
  </div>
</template>
