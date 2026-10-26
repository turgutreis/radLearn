<script setup lang="ts">
import { ref } from 'vue'
import { Cloud, X, Check, Copy, RefreshCw } from 'lucide-vue-next'
import { SUPABASE_SQL_SCHEMA, type SupabaseConfig } from '../services/supabaseSync'

const props = defineProps<{
  isOpen: boolean
  supabaseConfig: SupabaseConfig
  isCloudConfigured: boolean
  cloudSyncStatus: 'disconnected' | 'syncing' | 'synced' | 'error'
  cloudSyncError: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'sync'): void
}>()

const sqlCopied = ref(false)

function copySqlSchema() {
  navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA)
  sqlCopied.value = true
  setTimeout(() => {
    sqlCopied.value = false
  }, 2000)
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain"
    @click.self="emit('close')"
  >
    <div
      class="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Echtzeit-Synchronisation (iPad, iPhone & Mac)
          </span>
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
          @click="emit('close')"
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
          @click="emit('close')"
          class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
        >
          Schließen
        </button>

        <button
          type="button"
          @click="emit('sync')"
          :disabled="!isCloudConfigured || cloudSyncStatus === 'syncing'"
          class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': cloudSyncStatus === 'syncing' }" />
          <span>Verbinden & Jetzt synchronisieren</span>
        </button>
      </div>
    </div>
  </div>
</template>
