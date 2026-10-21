<script setup lang="ts">
import { ref } from 'vue'
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
  Award,
  Cloud,
  Check,
  Copy,
  X,
  RefreshCw
} from 'lucide-vue-next'
import { useStudyStore } from './composables/useStudyStore'
import { SUPABASE_SQL_SCHEMA } from './services/supabaseSync'
import QuizMode from './components/QuizMode.vue'
import FlashcardMode from './components/FlashcardMode.vue'
import MatchingTrainer from './components/MatchingTrainer.vue'
import CheatSheetView from './components/CheatSheetView.vue'
import PdfUploadGenerator from './components/PdfUploadGenerator.vue'

type TabId = 'dashboard' | 'quiz' | 'flashcards' | 'matching' | 'cheatsheet' | 'upload'

const activeTab = ref<TabId>('dashboard')
const activeDeckId = ref<string>('all')
const showCloudModal = ref<boolean>(false)
const sqlCopied = ref<boolean>(false)

const {
  allDecks,
  overallStats,
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

function startQuizForDeck(deckId: string) {
  activeDeckId.value = deckId
  activeTab.value = 'quiz'
}

function startFlashcardsForDeck(deckId: string) {
  activeDeckId.value = deckId
  activeTab.value = 'flashcards'
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
    } catch {
      alert('Ungültige Backup-Datei.')
    }
  }
  reader.readAsText(file)
}

function confirmResetProgress() {
  if (confirm('Möchtest du deinen gesamten Lernfortschritt wirklich zurücksetzen? (Deine hochgeladenen PDF-Decks bleiben erhalten)')) {
    resetProgress()
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <!-- Top Header -->
    <header class="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <!-- Brand -->
        <div class="flex items-center gap-3 cursor-pointer" @click="activeTab = 'dashboard'">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Radiation class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-extrabold tracking-tight text-white">RadLearn</h1>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MTR & Strahlenschutz
              </span>
            </div>
            <p class="text-xs text-slate-400 hidden sm:block">
              Interaktiver Prüfungs- & Karteikarten-Trainer (StrlSchG, StrlSchV, Dosimetrie, UKHD-Skripte)
            </p>
          </div>
        </div>

        <!-- Cloud Sync, Backup & Quick Stats -->
        <div class="flex items-center gap-2">
          <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Award class="w-4 h-4 text-amber-400" />
            <span class="text-slate-400">Gemeistert:</span>
            <strong class="text-white">{{ overallStats.mastered }} / {{ overallStats.total }}</strong>
            <span class="text-amber-400 font-bold">({{ overallStats.masteryPercent }}%)</span>
          </div>

          <!-- Cloud Sync Status Button -->
          <button
            type="button"
            @click="showCloudModal = true"
            class="px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition"
            :class="[
              cloudSyncStatus === 'synced'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                : cloudSyncStatus === 'syncing'
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : cloudSyncStatus === 'error'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            ]"
            title="Supabase Cloud-Sync für iPad, iPhone & Laptop konfigurieren"
          >
            <RefreshCw v-if="cloudSyncStatus === 'syncing'" class="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <Cloud v-else class="w-3.5 h-3.5" :class="cloudSyncStatus === 'synced' ? 'text-emerald-400' : 'text-amber-400'" />
            <span>
              {{
                cloudSyncStatus === 'synced'
                  ? 'Cloud-Sync aktiv'
                  : cloudSyncStatus === 'syncing'
                    ? 'Synchronisiere...'
                    : cloudSyncStatus === 'error'
                      ? 'Sync-Fehler'
                      : 'Cloud-Sync'
              }}
            </span>
          </button>

          <button
            type="button"
            @click="handleExportBackup"
            class="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition"
            title="Lernfortschritt & eigene PDF-Decks als JSON sichern"
          >
            <Download class="w-3.5 h-3.5 text-amber-400" />
            <span class="hidden sm:inline">Backup</span>
          </button>

          <label
            class="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition"
            title="JSON-Backup wiederherstellen"
          >
            <Upload class="w-3.5 h-3.5 text-cyan-400" />
            <span class="hidden sm:inline">Import</span>
            <input type="file" accept="application/json" class="hidden" @change="handleImportBackup" />
          </label>
        </div>
      </div>

      <!-- Navigation Bar (fits on 1 row on iPad/Desktop, wraps cleanly on phones without horizontal scrolling) -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
        <nav class="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            @click="activeTab = 'dashboard'"
            class="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center lg:justify-start gap-2 transition whitespace-nowrap"
            :class="activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80'"
          >
            <LayoutDashboard class="w-4 h-4 shrink-0" />
            <span>Übersicht</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'quiz'"
            class="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center lg:justify-start gap-2 transition whitespace-nowrap"
            :class="activeTab === 'quiz' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80'"
          >
            <CheckSquare class="w-4 h-4 shrink-0" />
            <span>MC-Quiz & Prüfung</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'flashcards'"
            class="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center lg:justify-start gap-2 transition whitespace-nowrap"
            :class="activeTab === 'flashcards' ? 'bg-cyan-500 text-slate-950 shadow' : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80'"
          >
            <Layers class="w-4 h-4 shrink-0" />
            <span>Karteikarten</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'matching'"
            class="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center lg:justify-start gap-2 transition whitespace-nowrap"
            :class="activeTab === 'matching' ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80'"
          >
            <Puzzle class="w-4 h-4 shrink-0" />
            <span>Zahlen- & Fristen</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'cheatsheet'"
            class="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center lg:justify-start gap-2 transition whitespace-nowrap"
            :class="activeTab === 'cheatsheet' ? 'bg-violet-500 text-white shadow' : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80'"
          >
            <BookOpen class="w-4 h-4 shrink-0" />
            <span>Spickzettel</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'upload'"
            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center lg:justify-start gap-2 transition whitespace-nowrap lg:ml-auto"
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

    <!-- Cloud Sync Setup Modal -->
    <div
      v-if="showCloudModal"
      class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
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
              Sobald verbunden, werden alle neu hochgeladenen PDF-Decks sowie der gesamte Lernfortschritt automatisch zwischen allen Geräten synchronisiert.
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
              Supabase Project URL (oder in Vercel als <code class="text-amber-300">VITE_SUPABASE_URL</code> setzen)
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
              Supabase Anon Public Key (oder in Vercel als <code class="text-amber-300">VITE_SUPABASE_ANON_KEY</code> setzen)
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
          <span>Erfolgreich mit Supabase verbunden! Alle Decks & Fortschritte sind synchron.</span>
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

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
      <!-- TAB 1: DASHBOARD -->
      <div v-if="activeTab === 'dashboard'" class="space-y-8">
        <!-- Hero Stats Banner -->
        <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <span class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Sparkles class="w-4 h-4" />
              Bereit für die Strahlenschutz- & Radiologie-Prüfung
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
              Willkommen beim MTR Lern-Trainer!
            </h2>
            <p class="text-sm text-slate-300 leading-relaxed">
              Beide hochgeladenen Strahlenschutz-PDFs (42 Seiten inkl. StrlSchG/StrlSchV, Dosisgrößen, Grenzwerte, SSV/SSB/MPE, Teleradiologie, Freigabe & alle Fristen) sind bereits komplett als Prüfungsfragen, Karteikarten und Tabellen hinterlegt. Du kannst jederzeit weitere Skripte hochladen!
            </p>
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                @click="startQuizForDeck('all')"
                class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
              >
                <Play class="w-4 h-4" />
                Alle Fragen trainieren ({{ overallStats.total }})
              </button>
              <button
                type="button"
                @click="activeTab = 'upload'"
                class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-sm flex items-center gap-2 transition"
              >
                <UploadCloud class="w-4 h-4 text-amber-400" />
                Neues PDF hochladen
              </button>
              <button
                v-if="overallStats.needsReview > 0"
                type="button"
                @click="startQuizForDeck('wrong')"
                class="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 font-semibold text-sm flex items-center gap-2 transition"
              >
                <AlertTriangle class="w-4 h-4 text-rose-400" />
                {{ overallStats.needsReview }} falsche Fragen wiederholen
              </button>
              <button
                v-if="overallStats.bookmarked > 0"
                type="button"
                @click="startQuizForDeck('bookmarked')"
                class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold text-sm flex items-center gap-2 transition"
              >
                <Bookmark class="w-4 h-4" />
                {{ overallStats.bookmarked }} gemerkte Fragen
              </button>
            </div>
          </div>

          <!-- KPI Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-80 shrink-0">
            <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <div class="text-2xl font-extrabold text-white">{{ overallStats.total }}</div>
              <div class="text-xs text-slate-400">Prüfungsfragen</div>
            </div>
            <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <div class="text-2xl font-extrabold text-emerald-400">{{ overallStats.masteryPercent }}%</div>
              <div class="text-xs text-slate-400">Sicher gemeistert</div>
            </div>
            <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <div class="text-2xl font-extrabold text-cyan-400">{{ overallStats.answered }}</div>
              <div class="text-xs text-slate-400">Bereits bearbeitet</div>
            </div>
            <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <div class="text-2xl font-extrabold text-rose-400">{{ overallStats.needsReview }}</div>
              <div class="text-xs text-slate-400">Wiederholen</div>
            </div>
          </div>
        </div>

        <!-- Study Decks Grid -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">Lernmodule & Themenblöcke ({{ allDecks.length }})</h3>
            <button
              type="button"
              @click="confirmResetProgress"
              class="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              Fortschritt zurücksetzen
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="deck in allDecks"
              :key="deck.id"
              class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between gap-5 transition-all shadow-lg"
            >
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-amber-300 border border-slate-700">
                    {{ getDeckStats(deck.id).total }} Fragen
                  </span>
                  <span class="text-xs font-semibold text-emerald-400">
                    {{ getDeckStats(deck.id).percent }}% gemeistert
                  </span>
                </div>

                <h4 class="text-base font-bold text-white leading-snug">
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

      <!-- TAB 6: PDF UPLOAD & AI GENERATOR -->
      <PdfUploadGenerator
        v-else-if="activeTab === 'upload'"
        @open-deck="(deckId) => startQuizForDeck(deckId)"
      />
    </main>
  </div>
</template>
