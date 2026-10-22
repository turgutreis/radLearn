<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import {
  Radiation,
  LayoutDashboard,
  CheckSquare,
  Layers,
  Puzzle,
  BookOpen,
  UploadCloud,
  Download,
  Upload,
  RotateCcw,
  Play,
  Sparkles,
  AlertTriangle,
  Bookmark,
  Cloud,
  Check,
  Copy,
  X,
  RefreshCw,
  Gift,
  Flame,
  Heart,
  Zap,
  Menu,
  ChevronRight
} from 'lucide-vue-next'
import { useStudyStore } from './composables/useStudyStore'
import { SUPABASE_SQL_SCHEMA } from './services/supabaseSync'
import QuizMode from './components/QuizMode.vue'
import FlashcardMode from './components/FlashcardMode.vue'
import MatchingTrainer from './components/MatchingTrainer.vue'
import CheatSheetView from './components/CheatSheetView.vue'
import PdfUploadGenerator from './components/PdfUploadGenerator.vue'
import ProfileRewardsView from './components/ProfileRewardsView.vue'

type TabId = 'dashboard' | 'quiz' | 'flashcards' | 'matching' | 'cheatsheet' | 'rewards' | 'upload'

const activeTab = ref<TabId>('dashboard')
const activeDeckId = ref<string>('all')
const showCloudModal = ref<boolean>(false)
const isMobileMenuOpen = ref<boolean>(false)
const sqlCopied = ref<boolean>(false)

const {
  allDecks,
  overallStats,
  userProfile,
  availableCoins,
  levelInfo,
  lastXpGain,
  supabaseConfig,
  isCloudConfigured,
  cloudSyncStatus,
  cloudSyncError,
  syncFromCloud,
  getDeckStats,
  exportBackupJson,
  importBackupJson,
  resetProgress
} = useStudyStore()

// Scroll-Lock für Drawer & Modal (inkl. iOS Safari, wo overflow:hidden allein nicht reicht)
let lockedScrollY = 0
let isScrollLocked = false

function lockBodyScroll() {
  if (isScrollLocked) return
  isScrollLocked = true
  lockedScrollY = window.scrollY
  const body = document.body
  body.style.position = 'fixed'
  body.style.top = `-${lockedScrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
  body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
}

function unlockBodyScroll() {
  if (!isScrollLocked) return
  isScrollLocked = false
  const body = document.body
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.overflow = ''
  document.documentElement.style.overflow = ''
  window.scrollTo(0, lockedScrollY)
}

// flush: 'sync', damit das Entsperren sofort passiert (bevor setTab nach oben scrollt)
watch(
  () => isMobileMenuOpen.value || showCloudModal.value,
  (shouldLock) => (shouldLock ? lockBodyScroll() : unlockBodyScroll()),
  { flush: 'sync' }
)

onUnmounted(unlockBodyScroll)

const nextRewardTarget = computed(() => {
  const sorted = [...userProfile.value.rewards].sort((a, b) => a.cost - b.cost)
  return sorted.find((r) => r.cost > availableCoins.value) || sorted[sorted.length - 1]
})

function setTab(tab: TabId) {
  activeTab.value = tab
  isMobileMenuOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function startQuizForDeck(deckId: string) {
  activeDeckId.value = deckId
  setTab('quiz')
}

function startFlashcardsForDeck(deckId: string) {
  activeDeckId.value = deckId
  setTab('flashcards')
}

function copySqlSchema() {
  navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA)
  sqlCopied.value = true
  setTimeout(() => {
    sqlCopied.value = false
  }, 2000)
}

async function saveAndTestCloudSync() {
  await syncFromCloud()
}

function handleExportBackup() {
  const json = exportBackupJson()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `RadLearn_Backup_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  isMobileMenuOpen.value = false
}

function handleImportBackup(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      importBackupJson(String(reader.result))
      alert('Lernstand und eigene PDF-Decks wurden erfolgreich importiert!')
      isMobileMenuOpen.value = false
    } catch {
      alert('Ungültige Backup-Datei.')
    }
  }
  reader.readAsText(file)
}

function confirmResetProgress() {
  if (confirm('Möchtest du deinen gesamten Lernfortschritt wirklich zurücksetzen? (Deine hochgeladenen PDF-Decks bleiben erhalten)')) {
    resetProgress()
    isMobileMenuOpen.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
    <!-- Floating XP Gain Toast -->
    <div
      v-if="lastXpGain"
      class="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-bounce"
    >
      <Sparkles class="w-4 h-4" />
      <span>{{ lastXpGain.label }}</span>
    </div>

    <!-- Top Header -->
    <header class="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        <!-- Brand -->
        <div class="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0" @click="setTab('dashboard')">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Radiation class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div class="flex items-center gap-1.5 sm:gap-2">
              <h1 class="text-base sm:text-lg font-extrabold tracking-tight text-white">RadLearn</h1>
              <span class="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MTR
              </span>
            </div>
            <p class="text-[11px] text-slate-400 hidden sm:block">
              Hallo {{ userProfile.name }}! {{ levelInfo.current.badge }} {{ levelInfo.current.title }} (Level {{ levelInfo.current.level }})
            </p>
          </div>
        </div>

        <!-- Header Actions: Coins, Cloud Status, Desktop Backups & Mobile Hamburger -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- Profile / Coins / Streak Pill -->
          <button
            type="button"
            @click="setTab('rewards')"
            class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition"
            title="Zu deinem Profil & Belohnungs-Shop"
          >
            <span class="flex items-center gap-1 text-amber-400">
              <Flame class="w-3.5 h-3.5 fill-amber-400" />
              <span>{{ userProfile.streakDays }}d</span>
            </span>
            <span class="text-slate-700">|</span>
            <span class="flex items-center gap-1 text-rose-300">
              <Heart class="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span>{{ availableCoins }}</span>
              <span class="hidden sm:inline">Pkt.</span>
            </span>
          </button>

          <!-- Cloud Sync Status Button -->
          <button
            type="button"
            @click="showCloudModal = true"
            class="p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition"
            :class="[
              cloudSyncStatus === 'synced'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                : cloudSyncStatus === 'syncing'
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : cloudSyncStatus === 'error'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            ]"
            title="Supabase Cloud-Sync konfigurieren"
          >
            <RefreshCw v-if="cloudSyncStatus === 'syncing'" class="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <Cloud v-else class="w-3.5 h-3.5" :class="cloudSyncStatus === 'synced' ? 'text-emerald-400' : 'text-amber-400'" />
            <span class="hidden md:inline">
              {{
                cloudSyncStatus === 'synced'
                  ? 'Cloud aktiv'
                  : cloudSyncStatus === 'syncing'
                    ? 'Sync...'
                    : cloudSyncStatus === 'error'
                      ? 'Fehler'
                      : 'Cloud'
              }}
            </span>
          </button>

          <!-- Desktop Backup Buttons (hidden on mobile, inside drawer instead) -->
          <button
            type="button"
            @click="handleExportBackup"
            class="hidden lg:flex p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium items-center gap-1 transition"
            title="Lernfortschritt & Decks als JSON sichern"
          >
            <Download class="w-3.5 h-3.5 text-amber-400" />
          </button>

          <label
            class="hidden lg:flex p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium items-center gap-1 cursor-pointer transition"
            title="JSON-Backup wiederherstellen"
          >
            <Upload class="w-3.5 h-3.5 text-cyan-400" />
            <input type="file" accept="application/json" class="hidden" @change="handleImportBackup" />
          </label>

          <!-- Mobile Hamburger Menu Button (visible only on mobile/tablet < lg) -->
          <button
            type="button"
            @click="isMobileMenuOpen = true"
            class="lg:hidden p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition"
            aria-label="Menü öffnen"
          >
            <Menu class="w-5 h-5 text-amber-400" />
          </button>
        </div>
      </div>

      <!-- Desktop Navigation Bar (Only on large screens / iPad Landscape >= 1024px) -->
      <div class="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 pb-3 pt-1">
        <nav class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            @click="setTab('dashboard')"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap"
            :class="activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80'"
          >
            <LayoutDashboard class="w-4 h-4 shrink-0" />
            <span>Übersicht</span>
          </button>

          <button
            type="button"
            @click="setTab('quiz')"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap"
            :class="activeTab === 'quiz' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80'"
          >
            <CheckSquare class="w-4 h-4 shrink-0" />
            <span>MC-Quiz & Prüfung</span>
          </button>

          <button
            type="button"
            @click="setTab('flashcards')"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap"
            :class="activeTab === 'flashcards' ? 'bg-cyan-500 text-slate-950 shadow' : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80'"
          >
            <Layers class="w-4 h-4 shrink-0" />
            <span>Karteikarten</span>
          </button>

          <button
            type="button"
            @click="setTab('matching')"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap"
            :class="activeTab === 'matching' ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80'"
          >
            <Puzzle class="w-4 h-4 shrink-0" />
            <span>Zahlen & Fristen</span>
          </button>

          <button
            type="button"
            @click="setTab('cheatsheet')"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap"
            :class="activeTab === 'cheatsheet' ? 'bg-violet-500 text-white shadow' : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80'"
          >
            <BookOpen class="w-4 h-4 shrink-0" />
            <span>Spickzettel</span>
          </button>

          <button
            type="button"
            @click="setTab('rewards')"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap"
            :class="
              activeTab === 'rewards'
                ? 'bg-rose-500 text-white font-bold shadow'
                : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30'
            "
          >
            <Gift class="w-4 h-4 shrink-0" />
            <span>Belohnungen 🍣</span>
          </button>

          <button
            type="button"
            @click="setTab('upload')"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ml-auto"
            :class="
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold shadow'
                : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/40'
            "
          >
            <UploadCloud class="w-4 h-4 shrink-0" />
            <span>PDF-Upload & KI</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- Mobile Fullscreen Navigation Drawer -->
    <Teleport to="body">
      <Transition name="drawer">
      <div v-if="isMobileMenuOpen" class="fixed inset-0 z-[60] lg:hidden">
        <!-- Fullscreen Panel (eigener Scroll-Container, Hintergrund bleibt fixiert) -->
        <div
          class="absolute inset-0 bg-slate-950 flex flex-col overflow-y-auto overscroll-contain px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <div class="space-y-5 flex-1">
            <!-- Drawer Header -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-extrabold text-sm">
                  {{ levelInfo.current.badge }}
                </div>
                <div>
                  <div class="font-bold text-sm text-white">{{ userProfile.name }}</div>
                  <div class="text-[11px] text-amber-400 font-semibold">Level {{ levelInfo.current.level }} · {{ levelInfo.current.title }}</div>
                </div>
              </div>

              <button
                type="button"
                @click="isMobileMenuOpen = false"
                class="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Profile Stats Mini Card -->
            <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-around text-center">
              <div>
                <div class="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                  <Flame class="w-3 h-3 fill-current" />
                  {{ userProfile.streakDays }} Tage
                </div>
                <div class="text-[10px] text-slate-400">Streak</div>
              </div>
              <div class="w-px h-6 bg-slate-800" />
              <div>
                <div class="text-xs font-bold text-rose-300 flex items-center justify-center gap-1">
                  <Heart class="w-3 h-3 fill-current text-rose-400" />
                  {{ availableCoins }} Pkt.
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
                @click="setTab('dashboard')"
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
                @click="setTab('quiz')"
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
                @click="setTab('flashcards')"
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
                @click="setTab('matching')"
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
                @click="setTab('cheatsheet')"
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
                @click="setTab('rewards')"
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
              @click="setTab('upload')"
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
              @click="isMobileMenuOpen = false; showCloudModal = true"
              class="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-2 hover:text-white"
            >
              <Cloud class="w-4 h-4 text-emerald-400" />
              <span>Cloud-Sync konfigurieren</span>
            </button>

            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="handleExportBackup"
                class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:text-white"
              >
                <Download class="w-3.5 h-3.5 text-amber-400" />
                <span>Backup</span>
              </button>

              <label
                class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:text-white"
              >
                <Upload class="w-3.5 h-3.5 text-cyan-400" />
                <span>Import</span>
                <input type="file" accept="application/json" class="hidden" @change="handleImportBackup" />
              </label>
            </div>

            <button
              type="button"
              @click="confirmResetProgress"
              class="w-full text-center text-[11px] text-slate-500 hover:text-rose-400 pt-1"
            >
              Lernfortschritt zurücksetzen
            </button>
          </div>
        </div>
      </div>
      </Transition>
    </Teleport>

    <!-- Cloud Sync Setup Modal -->
    <div
      v-if="showCloudModal"
      class="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain"
      @click.self="showCloudModal = false"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">Echtzeit-Synchronisation (iPad, iPhone & Mac)</span>
            <h3 class="text-xl font-extrabold text-white mt-0.5 flex items-center gap-2">
              <Cloud class="w-5 h-5 text-emerald-400" />
              Supabase Cloud-Sync
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              Sobald verbunden, werden alle neu hochgeladenen PDF-Decks, der Lernfortschritt und ihre eingelösten Belohnungen automatisch zwischen allen Geräten synchronisiert.
            </p>
          </div>
          <button
            type="button"
            @click="showCloudModal = false"
            class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-semibold text-slate-300">
              Supabase Project URL (oder in Netlify/Vercel als <code class="text-amber-300">VITE_SUPABASE_URL</code> setzen)
            </label>
            <input
              v-model="supabaseConfig.url"
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-semibold text-slate-300">
              Supabase Anon Public Key (oder in Netlify/Vercel als <code class="text-amber-300">VITE_SUPABASE_ANON_KEY</code> setzen)
            </label>
            <input
              v-model="supabaseConfig.anonKey"
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-semibold text-slate-300">Profil-Name / Sync-ID (gleich auf allen Geräten)</label>
            <input
              v-model="supabaseConfig.syncId"
              type="text"
              placeholder="mtr-strahlenschutz"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <!-- SQL Snippet Box -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300">Einmaliges Tabellen-Setup im Supabase SQL Editor:</span>
            <button
              type="button"
              @click="copySqlSchema"
              class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 border border-slate-700"
            >
              <Check v-if="sqlCopied" class="w-3.5 h-3.5 text-emerald-400" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ sqlCopied ? 'SQL kopiert!' : 'SQL kopieren' }}</span>
            </button>
          </div>
          <pre class="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-[11px] text-slate-300 overflow-x-auto font-mono leading-relaxed">{{ SUPABASE_SQL_SCHEMA }}</pre>
        </div>

        <div
          v-if="cloudSyncError"
          class="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200"
        >
          {{ cloudSyncError }}
        </div>

        <div
          v-else-if="cloudSyncStatus === 'synced'"
          class="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2"
        >
          <Check class="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Erfolgreich mit Supabase verbunden! Alle Decks, Erfolge & Fortschritte sind synchron.</span>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            @click="showCloudModal = false"
            class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Schließen
          </button>
          <button
            type="button"
            @click="saveAndTestCloudSync"
            :disabled="!isCloudConfigured || cloudSyncStatus === 'syncing'"
            class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': cloudSyncStatus === 'syncing' }" />
            <span>Verbinden & Jetzt synchronisieren</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area (pb-28 on mobile so bottom bar doesn't cover anything) -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-28 lg:pb-8">
      <!-- TAB 1: DASHBOARD -->
      <div v-if="activeTab === 'dashboard'" class="space-y-6 sm:space-y-8">
        <!-- Hero Stats Banner -->
        <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 rounded-3xl p-5 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div class="space-y-3 max-w-2xl">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sparkles class="w-4 h-4" />
                {{ levelInfo.current.badge }} Level {{ levelInfo.current.level }}: {{ levelInfo.current.title }}
              </span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                Heute: {{ userProfile.todayAnsweredCount }} / {{ userProfile.dailyGoal }} Tagesziel
              </span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
              Viel Erfolg beim Lernen, {{ userProfile.name }}!
            </h2>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sammle mit jeder beantworteten Frage Punkte für deine nächste Belohnung
              <span v-if="nextRewardTarget" class="text-amber-300 font-semibold">
                ({{ nextRewardTarget.emoji }} {{ nextRewardTarget.title }}: {{ availableCoins }} / {{ nextRewardTarget.cost }} Pkt.)
              </span>!
            </p>

            <div class="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                @click="startQuizForDeck('workout')"
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
              >
                <Zap class="w-4 h-4" />
                10-Fragen Tages-Workout
              </button>

              <button
                type="button"
                @click="startQuizForDeck('all')"
                class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm flex items-center gap-2 transition"
              >
                <Play class="w-4 h-4 text-amber-400" />
                Alle Fragen ({{ overallStats.total }})
              </button>

              <button
                type="button"
                @click="setTab('rewards')"
                class="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 border border-rose-500/30 font-semibold text-sm flex items-center gap-2 transition"
              >
                <Gift class="w-4 h-4 text-rose-400" />
                Belohnungs-Shop 🍣
              </button>

              <button
                v-if="overallStats.needsReview > 0"
                type="button"
                @click="startQuizForDeck('wrong')"
                class="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 font-semibold text-sm flex items-center gap-2 transition"
              >
                <AlertTriangle class="w-4 h-4 text-rose-400" />
                {{ overallStats.needsReview }} falsche wiederholen
              </button>

              <button
                v-if="overallStats.bookmarked > 0"
                type="button"
                @click="startQuizForDeck('bookmarked')"
                class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold text-sm flex items-center gap-2 transition"
              >
                <Bookmark class="w-4 h-4" />
                {{ overallStats.bookmarked }} gemerkte
              </button>
            </div>
          </div>

          <!-- KPI Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 sm:gap-3 w-full lg:w-80 shrink-0">
            <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
              <div class="text-xl sm:text-2xl font-extrabold text-white">{{ overallStats.total }}</div>
              <div class="text-[11px] sm:text-xs text-slate-400">Prüfungsfragen</div>
            </div>
            <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
              <div class="text-xl sm:text-2xl font-extrabold text-emerald-400">{{ overallStats.masteryPercent }}%</div>
              <div class="text-[11px] sm:text-xs text-slate-400">Sicher gemeistert</div>
            </div>
            <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 cursor-pointer hover:border-rose-500/40 transition" @click="setTab('rewards')">
              <div class="text-xl sm:text-2xl font-extrabold text-rose-400">{{ availableCoins }} 💖</div>
              <div class="text-[11px] sm:text-xs text-slate-400">Belohnungs-Punkte</div>
            </div>
            <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
              <div class="text-xl sm:text-2xl font-extrabold text-amber-400">{{ userProfile.streakDays }} 🔥</div>
              <div class="text-[11px] sm:text-xs text-slate-400">Tage Streak</div>
            </div>
          </div>
        </div>

        <!-- Study Decks Grid -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base sm:text-lg font-bold text-white">Lernmodule & Themenblöcke ({{ allDecks.length }})</h3>
            <button
              type="button"
              @click="confirmResetProgress"
              class="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div
              v-for="deck in allDecks"
              :key="deck.id"
              class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5 transition-all shadow-lg"
            >
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-amber-300 border border-slate-700">
                    {{ getDeckStats(deck.id).total }} Fragen
                  </span>
                  <span class="text-xs font-semibold text-emerald-400">
                    {{ getDeckStats(deck.id).percent }}% gemeistert
                  </span>
                </div>

                <h4 class="text-sm sm:text-base font-bold text-white leading-snug">
                  {{ deck.title }}
                </h4>
                <p class="text-xs text-slate-400 leading-relaxed">
                  {{ deck.description }}
                </p>

                <!-- Progress bar -->
                <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all"
                    :style="{ width: `${getDeckStats(deck.id).percent}%` }"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  @click="startQuizForDeck(deck.id)"
                  class="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <CheckSquare class="w-3.5 h-3.5" />
                  MC-Quiz
                </button>
                <button
                  type="button"
                  @click="startFlashcardsForDeck(deck.id)"
                  class="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Layers class="w-3.5 h-3.5" />
                  Karteikarten
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: QUIZ MODE -->
      <QuizMode v-else-if="activeTab === 'quiz'" :initial-deck-id="activeDeckId" />

      <!-- TAB 3: FLASHCARDS MODE -->
      <FlashcardMode v-else-if="activeTab === 'flashcards'" :initial-deck-id="activeDeckId" />

      <!-- TAB 4: MATCHING & SORTING TRAINER -->
      <MatchingTrainer v-else-if="activeTab === 'matching'" />

      <!-- TAB 5: CHEAT SHEET & TABLES -->
      <CheatSheetView v-else-if="activeTab === 'cheatsheet'" />

      <!-- TAB 6: PROFILE, ACHIEVEMENTS & REWARDS SHOP -->
      <ProfileRewardsView v-else-if="activeTab === 'rewards'" />

      <!-- TAB 7: PDF UPLOAD & AI GENERATOR -->
      <PdfUploadGenerator
        v-else-if="activeTab === 'upload'"
        @open-deck="(deckId) => startQuizForDeck(deckId)"
      />
    </main>

    <!-- Native App Style Mobile Bottom Navigation Bar (Pixel 9 XL & iPhone Optimized) -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div class="grid grid-cols-5 items-center text-center">
        <!-- 1. Übersicht -->
        <button
          type="button"
          @click="setTab('dashboard')"
          class="flex flex-col items-center justify-center py-1 transition group"
          :class="activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
        >
          <div
            class="p-1 rounded-xl transition"
            :class="activeTab === 'dashboard' ? 'bg-amber-500/20' : ''"
          >
            <LayoutDashboard class="w-5 h-5" />
          </div>
          <span class="text-[10px] mt-0.5">Übersicht</span>
        </button>

        <!-- 2. MC-Quiz -->
        <button
          type="button"
          @click="setTab('quiz')"
          class="flex flex-col items-center justify-center py-1 transition group"
          :class="activeTab === 'quiz' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
        >
          <div
            class="p-1 rounded-xl transition"
            :class="activeTab === 'quiz' ? 'bg-amber-500/20' : ''"
          >
            <CheckSquare class="w-5 h-5" />
          </div>
          <span class="text-[10px] mt-0.5">Quiz</span>
        </button>

        <!-- 3. Karteikarten -->
        <button
          type="button"
          @click="setTab('flashcards')"
          class="flex flex-col items-center justify-center py-1 transition group"
          :class="activeTab === 'flashcards' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
        >
          <div
            class="p-1 rounded-xl transition"
            :class="activeTab === 'flashcards' ? 'bg-cyan-500/20' : ''"
          >
            <Layers class="w-5 h-5" />
          </div>
          <span class="text-[10px] mt-0.5">Karten</span>
        </button>

        <!-- 4. Belohnungen 🍣 -->
        <button
          type="button"
          @click="setTab('rewards')"
          class="flex flex-col items-center justify-center py-1 transition group relative"
          :class="activeTab === 'rewards' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
        >
          <div
            class="p-1 rounded-xl transition"
            :class="activeTab === 'rewards' ? 'bg-rose-500/20' : ''"
          >
            <Gift class="w-5 h-5" />
          </div>
          <span class="text-[10px] mt-0.5">Prämien</span>
          <span class="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />
        </button>

        <!-- 5. Hamburger Menü (Öffnet Drawer) -->
        <button
          type="button"
          @click="isMobileMenuOpen = true"
          class="flex flex-col items-center justify-center py-1 transition text-slate-400 hover:text-slate-200"
        >
          <div class="p-1 rounded-xl">
            <Menu class="w-5 h-5 text-slate-300" />
          </div>
          <span class="text-[10px] mt-0.5">Mehr</span>
        </button>
      </div>
    </nav>
  </div>
</template>
