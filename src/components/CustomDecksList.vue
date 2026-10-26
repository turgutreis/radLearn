<script setup lang="ts">
import { Folder, Play, Trash2 } from 'lucide-vue-next'
import type { StudyDeck, StudyFolder, Question } from '../types'

const props = defineProps<{
  customDecks: StudyDeck[]
  folders: StudyFolder[]
  getDeckQuestions: (deckId: string) => Question[]
}>()

const emit = defineEmits<{
  (e: 'openDeck', deckId: string): void
  (e: 'deleteDeck', deckId: string): void
  (e: 'moveDeck', deckId: string, folderId: string): void
}>()
</script>

<template>
  <div v-if="customDecks.length > 0" class="space-y-4">
    <h3 class="text-base font-bold text-white">Deine selbst generierten Decks ({{ customDecks.length }})</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="deck in customDecks"
        :key="deck.id"
        class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-4"
      >
        <div class="space-y-2 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
              {{ getDeckQuestions(deck.id).length }} Fragen
            </span>
            <!-- Folder Badge with quick move dropdown -->
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-amber-300 border border-slate-700">
              <Folder class="w-3 h-3 text-amber-400" />
              <select
                :value="deck.folderId || 'custom'"
                @change="(e) => emit('moveDeck', deck.id, (e.target as HTMLSelectElement).value)"
                class="bg-transparent text-amber-300 text-xs focus:outline-none cursor-pointer"
                title="In anderen Ordner verschieben"
              >
                <option v-for="f in folders" :key="f.id" :value="f.id" class="bg-slate-900 text-white">
                  {{ f.name }}
                </option>
              </select>
            </span>
            <span class="text-xs text-slate-500">{{ deck.createdAt }}</span>
          </div>
          <h4 class="font-bold text-white text-base leading-snug">{{ deck.title }}</h4>
          <p class="text-xs text-slate-400 line-clamp-2">{{ deck.description }}</p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            @click="emit('openDeck', deck.id)"
            class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Play class="w-3.5 h-3.5" />
            Üben
          </button>
          <button
            type="button"
            @click="emit('deleteDeck', deck.id)"
            class="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
            title="Deck löschen"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
