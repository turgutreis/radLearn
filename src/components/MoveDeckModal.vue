<script setup lang="ts">
import { ref } from 'vue'
import {
  X,
  Plus,
  Check,
  ChevronRight,
  Folder,
  Shield,
  Atom,
  Crosshair,
  Activity,
  GraduationCap
} from 'lucide-vue-next'
import type { StudyDeck, StudyFolder } from '../types'

const props = defineProps<{
  isOpen: boolean
  deck: StudyDeck | null
  folders: StudyFolder[]
  getFolderStats: (id: string) => { deckCount: number; total: number }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'selectFolder', folderId: string): void
  (e: 'createFolder', folderName: string): void
}>()

const showInlineNewFolder = ref(false)
const inlineNewFolderName = ref('')

function handleCreateFolder() {
  if (!inlineNewFolderName.value.trim()) return
  emit('createFolder', inlineNewFolderName.value.trim())
  inlineNewFolderName.value = ''
  showInlineNewFolder.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain"
        @click.self="emit('close')"
      >
        <div
          class="bg-slate-900 border border-slate-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200"
        >
          <!-- Mobile Grab Handle -->
          <div class="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto sm:hidden" />

          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-amber-400">Themenordner wechseln</span>
              <h3 class="text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
                „{{ deck?.title }}“
              </h3>
              <p class="text-xs text-slate-400 mt-1">
                Tippe auf den gewünschten Ordner, um dieses Lernset dorthin zu verschieben:
              </p>
            </div>
            <button
              type="button"
              @click="emit('close')"
              class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- List of Folders -->
          <div class="space-y-2 pt-1">
            <button
              v-for="folder in folders"
              :key="folder.id"
              type="button"
              @click="emit('selectFolder', folder.id)"
              class="w-full text-left p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 active:scale-[0.99]"
              :class="[
                (deck?.folderId || 'custom') === folder.id
                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                  : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-200'
              ]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                  :class="[
                    folder.id === 'examen' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-1 ring-amber-400/30' :
                    folder.id === 'nuklearmedizin' ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' :
                    folder.id === 'strahlenschutz' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' :
                    folder.id === 'roentgendiagnostik' ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' :
                    folder.id === 'strahlentherapie' ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' :
                    folder.id === 'anatomie' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                    'bg-blue-500/15 border-blue-500/30 text-blue-400'
                  ]"
                >
                  <GraduationCap v-if="folder.id === 'examen'" class="w-5 h-5" />
                  <Atom v-else-if="folder.id === 'nuklearmedizin'" class="w-5 h-5" />
                  <Shield v-else-if="folder.id === 'strahlenschutz'" class="w-5 h-5" />
                  <Crosshair v-else-if="folder.id === 'strahlentherapie'" class="w-5 h-5" />
                  <Activity v-else-if="folder.id === 'anatomie'" class="w-5 h-5" />
                  <Folder v-else class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-sm text-white truncate">{{ folder.name }}</div>
                  <div class="text-[11px] text-slate-400">
                    {{ getFolderStats(folder.id).deckCount }} Decks · {{ getFolderStats(folder.id).total }} Fragen
                  </div>
                </div>
              </div>

              <div v-if="(deck?.folderId || 'custom') === folder.id" class="flex items-center gap-1.5 text-xs font-bold text-amber-400 shrink-0">
                <Check class="w-4 h-4" />
                <span class="text-[11px]">Hier</span>
              </div>
              <ChevronRight v-else class="w-4 h-4 text-slate-600 shrink-0" />
            </button>
          </div>

          <!-- Inline New Folder Creator -->
          <div class="pt-2 border-t border-slate-800">
            <div v-if="!showInlineNewFolder">
              <button
                type="button"
                @click="showInlineNewFolder = true"
                class="w-full p-3 rounded-2xl bg-slate-800/90 border border-dashed border-slate-700 text-slate-200 hover:text-white hover:border-amber-500/50 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Plus class="w-4 h-4 text-amber-400" />
                <span>Neuen Themenordner anlegen & dorthin verschieben</span>
              </button>
            </div>
            <div v-else class="space-y-2">
              <label class="text-xs font-semibold text-slate-300">Name des neuen Ordners:</label>
              <div class="flex gap-2">
                <input
                  v-model="inlineNewFolderName"
                  type="text"
                  placeholder="z.B. Mammographie / CT..."
                  class="flex-1 bg-slate-800 border border-amber-500/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  @keyup.enter="handleCreateFolder"
                />
                <button
                  type="button"
                  @click="handleCreateFolder"
                  class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
                >
                  Erstellen
                </button>
                <button
                  type="button"
                  @click="showInlineNewFolder = false"
                  class="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
