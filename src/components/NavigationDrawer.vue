<script setup lang="ts">
import {
  X,
  LayoutDashboard,
  CheckSquare,
  Layers,
  Puzzle,
  BookOpen,
  Gift,
  UploadCloud,
  ChevronRight,
  Cloud,
  Download,
  Upload
} from 'lucide-vue-next'
import type { UserProfile } from '../types'

const props = defineProps<{
  isOpen: boolean
  activeTab: string
  userProfile: UserProfile
  levelInfo: any
  availableCoins: number
  overallStats: { total: number; mastered: number }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'selectTab', tab: string): void
  (e: 'openCloud'): void
  (e: 'exportBackup'): void
  (e: 'importBackup', event: Event): void
  (e: 'resetProgress'): void
}>()

function handleSelectTab(tab: string) {
  emit('selectTab', tab)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm lg:hidden overscroll-contain"
        @click.self="emit('close')"
      >
        <div
          class="fixed inset-y-0 right-0 w-full sm:w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto overscroll-contain shadow-2xl"
        >
          <!-- Drawer Header -->
          <div class="space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">
                  {{ levelInfo.current.badge }}
                </div>
                <div>
                  <div class="font-bold text-sm text-white">{{ userProfile.name }}</div>
                  <div class="text-[11px] text-amber-400 font-semibold">
                    Lvl {{ levelInfo.current.level }}: {{ levelInfo.current.title }}
                  </div>
                </div>
              </div>
              <button
                type="button"
                @click="emit('close')"
                class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Quick Stats in Drawer -->
            <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 grid grid-cols-3 text-center gap-1">
              <div>
                <div class="text-xs font-bold text-amber-400">{{ userProfile.streakDays }} 🔥</div>
                <div class="text-[10px] text-slate-400">Tage Streak</div>
              </div>
              <div class="w-px h-6 bg-slate-800" />
              <div>
                <div class="text-xs font-bold text-rose-400 flex items-center justify-center gap-0.5">
                  <span>{{ availableCoins }}</span>
                  <span class="text-[10px]">🍣</span>
                </div>
                <div class="text-[10px] text-slate-400">Guthaben</div>
              </div>
              <div class="w-px h-6 bg-slate-800" />
              <div>
                <div class="text-xs font-bold text-cyan-400">{{ overallStats.mastered }}</div>
                <div class="text-[10px] text-slate-400">Gemeistert</div>
              </div>
            </div>

            <!-- Nav Links List -->
            <div class="space-y-1">
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">Lernbereiche</div>

              <button
                type="button"
                @click="handleSelectTab('dashboard')"
                class="w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition"
                :class="activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800/80'"
              >
                <div class="flex items-center gap-3">
                  <LayoutDashboard class="w-4 h-4" />
                  <span>Übersicht & Module</span>
                </div>
                <ChevronRight class="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                @click="handleSelectTab('quiz')"
                class="w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition"
                :class="activeTab === 'quiz' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800/80'"
              >
                <div class="flex items-center gap-3">
                  <CheckSquare class="w-4 h-4" />
                  <span>Multiple-Choice & Prüfung</span>
                </div>
                <ChevronRight class="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                @click="handleSelectTab('flashcards')"
                class="w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition"
                :class="activeTab === 'flashcards' ? 'bg-cyan-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800/80'"
              >
                <div class="flex items-center gap-3">
                  <Layers class="w-4 h-4" />
                  <span>Karteikarten (Anki-Modus)</span>
                </div>
                <ChevronRight class="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                @click="handleSelectTab('matching')"
                class="w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition"
                :class="activeTab === 'matching' ? 'bg-emerald-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800/80'"
              >
                <div class="flex items-center gap-3">
                  <Puzzle class="w-4 h-4" />
                  <span>Zahlen- & Fristen-Trainer</span>
                </div>
                <ChevronRight class="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                @click="handleSelectTab('cheatsheet')"
                class="w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition"
                :class="activeTab === 'cheatsheet' ? 'bg-violet-500 text-white' : 'text-slate-200 hover:bg-slate-800/80'"
              >
                <div class="flex items-center gap-3">
                  <BookOpen class="w-4 h-4" />
                  <span>Spickzettel & Tabellen</span>
                </div>
                <ChevronRight class="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                @click="handleSelectTab('rewards')"
                class="w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition"
                :class="activeTab === 'rewards' ? 'bg-rose-500 text-white' : 'text-rose-300 hover:bg-rose-500/10'"
              >
                <div class="flex items-center gap-3">
                  <Gift class="w-4 h-4" />
                  <span>Belohnungs-Shop 🍣</span>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                  {{ availableCoins }} Pkt.
                </span>
              </button>
            </div>

            <!-- PDF Upload Link -->
            <button
              type="button"
              @click="handleSelectTab('upload')"
              class="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 text-left text-sm font-bold flex items-center justify-between transition hover:border-amber-400"
            >
              <div class="flex items-center gap-3">
                <UploadCloud class="w-5 h-5 text-amber-400" />
                <div>
                  <div>PDF-Upload & KI</div>
                  <div class="text-[11px] font-normal text-slate-400">Neue Skripte hochladen</div>
                </div>
              </div>
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>

          <!-- Drawer Footer Tools (Cloud Sync, Backup, Reset) -->
          <div class="pt-4 mt-6 border-t border-slate-800 space-y-2">
            <button
              type="button"
              @click="emit('close'); emit('openCloud')"
              class="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 hover:text-white hover:border-slate-600 transition"
            >
              <Cloud class="w-4 h-4 text-emerald-400" />
              <span>Cloud-Sync konfigurieren</span>
            </button>

            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="emit('exportBackup')"
                class="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 hover:text-white hover:border-slate-600 transition"
              >
                <Download class="w-3.5 h-3.5 text-amber-400" />
                <span>Backup</span>
              </button>

              <label
                class="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:text-white hover:border-slate-600 transition"
              >
                <Upload class="w-3.5 h-3.5 text-cyan-400" />
                <span>Import</span>
                <input type="file" accept="application/json" class="hidden" @change="emit('importBackup', $event)" />
              </label>
            </div>

            <button
              type="button"
              @click="emit('resetProgress')"
              class="w-full text-center text-[11px] text-slate-500 hover:text-rose-400 pt-1"
            >
              Lernfortschritt zurücksetzen
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
