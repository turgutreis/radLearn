<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import {
  LayoutDashboard,
  CheckSquare,
  Layers,
  Puzzle,
  BookOpen,
  UploadCloud,
  RotateCcw,
  Play,
  Sparkles,
  AlertTriangle,
  Bookmark,
  Gift,
  Zap,
  Menu,
  ChevronRight,
  Folder,
  ChevronDown,
  ChevronUp,
  Shield,
  Atom,
  Crosshair,
  Activity,
  ArrowUpDown
} from 'lucide-vue-next'
import { useStudyStore } from './composables/useStudyStore'
import QuizMode from './components/QuizMode.vue'
import FlashcardMode from './components/FlashcardMode.vue'
import MatchingTrainer from './components/MatchingTrainer.vue'
import CheatSheetView from './components/CheatSheetView.vue'
import PdfUploadGenerator from './components/PdfUploadGenerator.vue'
import ProfileRewardsView from './components/ProfileRewardsView.vue'
import AppHeader from './components/AppHeader.vue'
import NavigationDrawer from './components/NavigationDrawer.vue'
import CloudSyncModal from './components/CloudSyncModal.vue'
import MoveDeckModal from './components/MoveDeckModal.vue'

type TabId = 'dashboard' | 'quiz' | 'flashcards' | 'matching' | 'cheatsheet' | 'rewards' | 'upload'

const activeTab = ref<TabId>('dashboard')
const activeDeckId = ref<string>('all')
const showCloudModal = ref<boolean>(false)
const isMobileMenuOpen = ref<boolean>(false)

const {
  allDecks,
  folders,
  addFolder,
  moveDeckToFolder,
  moveDeckOrder,
  getFolderStats,
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

const selectedFolderFilter = ref<string>('all')
const collapsedFolders = ref<Record<string, boolean>>({})

const showMoveDeckModal = ref<boolean>(false)
const deckToMove = ref<any>(null)

type SortMode = 'default' | 'az' | 'questions' | 'progress-low' | 'progress-high'
const activeSortMode = ref<SortMode>('default')

function openMoveModal(deck: any) {
  deckToMove.value = deck
  showMoveDeckModal.value = true
}

function handleSelectFolder(folderId: string) {
  if (deckToMove.value) {
    moveDeckToFolder(deckToMove.value.id, folderId)
  }
  showMoveDeckModal.value = false
  deckToMove.value = null
}

function handleCreateFolder(name: string) {
  const created = addFolder({ name })
  if (deckToMove.value) {
    moveDeckToFolder(deckToMove.value.id, created.id)
  }
  showMoveDeckModal.value = false
  deckToMove.value = null
}

function getFolderName(folderId?: string) {
  const f = folders.value.find((item) => item.id === folderId)
  return f ? f.name : 'Allgemein'
}

function toggleFolderCollapse(folderId: string) {
  collapsedFolders.value[folderId] = !collapsedFolders.value[folderId]
}

const displayedFolders = computed(() => {
  if (selectedFolderFilter.value === 'all') {
    return folders.value
  }
  return folders.value.filter((f) => f.id === selectedFolderFilter.value)
})

function getDecksForFolder(folderId: string) {
  let list = allDecks.value.filter((d) => (d.folderId || 'custom') === folderId)
  if (activeSortMode.value === 'az') {
    list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'de'))
  } else if (activeSortMode.value === 'questions') {
    list = [...list].sort((a, b) => getDeckStats(b.id).total - getDeckStats(a.id).total)
  } else if (activeSortMode.value === 'progress-low') {
    list = [...list].sort((a, b) => getDeckStats(a.id).percent - getDeckStats(b.id).percent)
  } else if (activeSortMode.value === 'progress-high') {
    list = [...list].sort((a, b) => getDeckStats(b.id).percent - getDeckStats(a.id).percent)
  }
  return list
}

// Scroll-Lock für Drawer & Modal (inkl. iOS Safari)
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

watch(
  () => isMobileMenuOpen.value || showCloudModal.value || showMoveDeckModal.value,
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
    <!-- Header Component -->
    <AppHeader
      :active-tab="activeTab"
      :user-profile="userProfile"
      :level-info="levelInfo"
      :available-coins="availableCoins"
      :last-xp-gain="lastXpGain"
      :cloud-sync-status="cloudSyncStatus"
      :is-cloud-configured="isCloudConfigured"
      @select-tab="(t) => setTab(t as TabId)"
      @open-cloud="showCloudModal = true"
      @open-mobile-menu="isMobileMenuOpen = true"
    />

    <!-- Desktop Sub-Navigation Bar (lg only) -->
    <div class="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 pb-3 pt-3 w-full">
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

    <!-- Mobile Navigation Drawer Component -->
    <NavigationDrawer
      :is-open="isMobileMenuOpen"
      :active-tab="activeTab"
      :user-profile="userProfile"
      :level-info="levelInfo"
      :available-coins="availableCoins"
      :overall-stats="overallStats"
      @close="isMobileMenuOpen = false"
      @select-tab="(t) => setTab(t as TabId)"
      @open-cloud="showCloudModal = true"
      @export-backup="handleExportBackup"
      @import-backup="handleImportBackup"
      @reset-progress="confirmResetProgress"
    />

    <!-- Cloud Sync Modal Component -->
    <CloudSyncModal
      :is-open="showCloudModal"
      :supabase-config="supabaseConfig"
      :is-cloud-configured="isCloudConfigured"
      :cloud-sync-status="cloudSyncStatus"
      :cloud-sync-error="cloudSyncError"
      @close="showCloudModal = false"
      @sync="syncFromCloud"
    />

    <!-- Move Deck Modal Component -->
    <MoveDeckModal
      :is-open="showMoveDeckModal"
      :deck="deckToMove"
      :folders="folders"
      :get-folder-stats="getFolderStats"
      @close="showMoveDeckModal = false"
      @select-folder="handleSelectFolder"
      @create-folder="handleCreateFolder"
    />

    <!-- Main Content Area -->
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

        <!-- Folders Header & Quick-Filter Bar -->
        <div class="space-y-3 pt-2">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Folder class="w-5 h-5 text-amber-400" />
                <span>Themen-Ordner & Lernmodule ({{ allDecks.length }} Decks)</span>
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                Strukturiert nach den offiziellen MTR-Ausbildungsbereichen. Trainiere einzelne Decks oder ganze Themenblöcke!
              </p>
            </div>
            
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="setTab('upload')"
                class="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <UploadCloud class="w-3.5 h-3.5" />
                <span>+ Neues Deck / Foto</span>
              </button>
              <button
                type="button"
                @click="confirmResetProgress"
                class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500 hover:text-rose-400 transition"
                title="Lernfortschritt zurücksetzen"
              >
                <RotateCcw class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Quick Filter Pills & Sort Row -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-[260px]">
              <button
                type="button"
                @click="selectedFolderFilter = 'all'"
                class="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border"
                :class="
                  selectedFolderFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                    : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                "
              >
                Alle Themen ({{ allDecks.length }})
              </button>

              <button
                v-for="folder in folders"
                :key="folder.id"
                type="button"
                @click="selectedFolderFilter = folder.id"
                class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border flex items-center gap-1.5"
                :class="[
                  selectedFolderFilter === folder.id
                    ? 'bg-slate-800 text-white border-amber-400 shadow'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800'
                ]"
              >
                <span>{{ folder.name }}</span>
                <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-slate-400 font-bold">
                  {{ getFolderStats(folder.id).deckCount }}
                </span>
              </button>
            </div>

            <!-- Sort Selector -->
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs text-slate-400 hidden sm:inline-flex items-center gap-1 font-medium">
                <ArrowUpDown class="w-3.5 h-3.5 text-amber-400" />
                Sortierung:
              </span>
              <select
                v-model="activeSortMode"
                class="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="default">Standard / Manuelle Reihenfolge</option>
                <option value="az">Titel (A–Z)</option>
                <option value="questions">Meiste Fragen zuerst</option>
                <option value="progress-low">Wenigster Fortschritt (noch zu lernen)</option>
                <option value="progress-high">Höchster Fortschritt</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Folders Accordion & Deck Cards List -->
        <div class="space-y-6">
          <div
            v-for="folder in displayedFolders"
            :key="folder.id"
            class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm"
          >
            <!-- Folder Header -->
            <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div
                class="flex items-center gap-3 cursor-pointer select-none group flex-1 min-w-[200px]"
                @click="toggleFolderCollapse(folder.id)"
              >
                <div
                  class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition group-hover:scale-105"
                  :class="[
                    folder.id === 'nuklearmedizin' ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' :
                    folder.id === 'strahlenschutz' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' :
                    folder.id === 'roentgendiagnostik' ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' :
                    folder.id === 'strahlentherapie' ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' :
                    folder.id === 'anatomie' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                    'bg-blue-500/15 border-blue-500/30 text-blue-400'
                  ]"
                >
                  <Atom v-if="folder.id === 'nuklearmedizin'" class="w-5 h-5" />
                  <Shield v-else-if="folder.id === 'strahlenschutz'" class="w-5 h-5" />
                  <Crosshair v-else-if="folder.id === 'strahlentherapie'" class="w-5 h-5" />
                  <Activity v-else-if="folder.id === 'anatomie'" class="w-5 h-5" />
                  <Folder v-else class="w-5 h-5" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-extrabold text-base sm:text-lg text-white group-hover:text-amber-300 transition">
                      {{ folder.name }}
                    </h4>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                      {{ getDecksForFolder(folder.id).length }} {{ getDecksForFolder(folder.id).length === 1 ? 'Deck' : 'Decks' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 mt-0.5">
                    {{ folder.description || `${getFolderStats(folder.id).total} Fragen in diesem Themenblock` }}
                  </p>
                </div>
              </div>

              <!-- Folder Actions -->
              <div class="flex items-center gap-2 shrink-0">
                <button
                  v-if="getFolderStats(folder.id).total > 0"
                  type="button"
                  @click="startQuizForDeck(`folder:${folder.id}`)"
                  class="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                  title="Alle Fragen dieses Ordners trainieren"
                >
                  <Zap class="w-3.5 h-3.5" />
                  <span class="hidden sm:inline">Ganzen Ordner trainieren</span>
                  <span class="sm:hidden">Ordner üben</span>
                  <span class="text-[11px] opacity-80">({{ getFolderStats(folder.id).total }})</span>
                </button>

                <button
                  type="button"
                  @click="toggleFolderCollapse(folder.id)"
                  class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  :title="collapsedFolders[folder.id] ? 'Ausklappen' : 'Einklappen'"
                >
                  <ChevronDown v-if="collapsedFolders[folder.id]" class="w-4 h-4" />
                  <ChevronUp v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Folder Decks Grid -->
            <div v-show="!collapsedFolders[folder.id]">
              <div v-if="getDecksForFolder(folder.id).length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="deck in getDecksForFolder(folder.id)"
                  :key="deck.id"
                  class="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div class="space-y-2.5">
                    <!-- Deck Header Row -->
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex flex-wrap items-center gap-1.5">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {{ getDeckStats(deck.id).total }} Fragen
                        </span>
                        
                        <!-- Move Deck Button / Pill -->
                        <button
                          type="button"
                          @click="openMoveModal(deck)"
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 transition"
                          title="Themenordner wechseln"
                        >
                          <Folder class="w-3 h-3 text-amber-400" />
                          <span>{{ getFolderName(deck.folderId) }}</span>
                          <span class="text-[9px] text-slate-500">✎</span>
                        </button>
                      </div>

                      <!-- Reorder Buttons -->
                      <div class="flex items-center gap-0.5">
                        <button
                          type="button"
                          @click="moveDeckOrder(deck.id, 'up')"
                          class="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-850 transition"
                          title="Nach oben / links"
                        >
                          <ChevronUp class="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          @click="moveDeckOrder(deck.id, 'down')"
                          class="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-850 transition"
                          title="Nach unten / rechts"
                        >
                          <ChevronDown class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h5 class="font-bold text-white text-base leading-snug line-clamp-2">
                        {{ deck.title }}
                      </h5>
                      <p class="text-xs text-slate-400 line-clamp-2 mt-1">
                        {{ deck.description }}
                      </p>
                    </div>

                    <!-- Progress Bar -->
                    <div class="space-y-1 pt-1">
                      <div class="flex items-center justify-between text-[11px]">
                        <span class="text-slate-400 font-medium">Gemeistert</span>
                        <span class="text-emerald-400 font-bold">{{ getDeckStats(deck.id).percent }}%</span>
                      </div>
                      <div class="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all"
                          :style="{ width: `${getDeckStats(deck.id).percent}%` }"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
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
                      class="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Layers class="w-3.5 h-3.5" />
                      Karteikarten
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty Folder Placeholder -->
              <div v-else class="text-center p-8 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl space-y-2">
                <p class="text-xs text-slate-400">In diesem Themengebiet sind noch keine Module vorhanden.</p>
                <button
                  type="button"
                  @click="setTab('upload')"
                  class="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
                >
                  <UploadCloud class="w-3.5 h-3.5" />
                  <span>PDF-Skript oder Buchfoto hochladen</span>
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

    <!-- Native App Style Mobile Bottom Navigation Bar (Pixel 9 XL & iPhone) -->
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
