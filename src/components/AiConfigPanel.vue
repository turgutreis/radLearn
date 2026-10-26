<script setup lang="ts">
import type { AISettings } from '../types'

const props = defineProps<{
  isOpen: boolean
  aiSettings: AISettings
}>()

const emit = defineEmits<{
  (e: 'updateProvider', provider: 'gemini' | 'openai' | 'anthropic' | 'ollama'): void
}>()
</script>

<template>
  <div v-if="isOpen" class="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="p in (['gemini', 'openai', 'anthropic', 'ollama'] as const)"
        :key="p"
        type="button"
        @click="emit('updateProvider', p)"
        class="px-3.5 py-2 rounded-xl text-xs font-bold border transition"
        :class="
          aiSettings.provider === p
            ? 'bg-amber-500 text-slate-950 border-amber-400'
            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
        "
      >
        {{
          p === 'gemini'
            ? 'Google Gemini (Empfohlen für Fotos & PDFs)'
            : p === 'openai'
              ? 'OpenAI (GPT-4o)'
              : p === 'anthropic'
                ? 'Anthropic Claude'
                : 'Lokal: Ollama (Kostenlos/Offline)'
        }}
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-if="aiSettings.provider === 'gemini'" class="space-y-1.5">
        <label class="text-xs font-semibold text-slate-300">
          Google Gemini API-Key (oder in Netlify als VITE_GEMINI_API_KEY)
        </label>
        <input
          v-model="aiSettings.geminiKey"
          type="password"
          placeholder="AIzaSy..."
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      <div v-if="aiSettings.provider === 'openai'" class="space-y-1.5">
        <label class="text-xs font-semibold text-slate-300">
          OpenAI API-Key (oder in Netlify als VITE_OPENAI_API_KEY)
        </label>
        <input
          v-model="aiSettings.openaiKey"
          type="password"
          placeholder="sk-..."
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      <div v-if="aiSettings.provider === 'anthropic'" class="space-y-1.5">
        <label class="text-xs font-semibold text-slate-300">Anthropic API-Key</label>
        <input
          v-model="aiSettings.anthropicKey"
          type="password"
          placeholder="sk-ant-..."
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      <div v-if="aiSettings.provider === 'ollama'" class="space-y-1.5">
        <label class="text-xs font-semibold text-slate-300">Lokale Ollama URL</label>
        <input
          v-model="aiSettings.ollamaUrl"
          type="text"
          placeholder="http://localhost:11434"
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      <div class="space-y-1.5">
        <label class="text-xs font-semibold text-slate-300">Modell-Name</label>
        <input
          v-model="aiSettings.model"
          type="text"
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        />
      </div>
    </div>
  </div>
</template>
