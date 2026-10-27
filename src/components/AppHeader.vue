<script setup lang="ts">
import {
  Radiation,
  Sparkles,
  Flame,
  Heart,
  Cloud,
  Check,
  Menu,
  Sun,
  Moon
} from 'lucide-vue-next'
import type { UserProfile } from '../types'
import { useTheme } from '../composables/useTheme'

const { currentTheme, toggleTheme } = useTheme()

const props = defineProps<{
  activeTab: string
  userProfile: UserProfile
  levelInfo: any
  availableCoins: number
  lastXpGain: { amount: number; label: string } | null
  cloudSyncStatus: 'disconnected' | 'syncing' | 'synced' | 'error'
  isCloudConfigured: boolean
}>()

const emit = defineEmits<{
  (e: 'selectTab', tab: string): void
  (e: 'openCloud'): void
  (e: 'openMobileMenu'): void
}>()
</script>

<template>
  <header class="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
      <!-- Logo & App Name -->
      <div
        class="flex items-center gap-3 cursor-pointer group select-none"
        @click="emit('selectTab', 'dashboard')"
      >
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
          <Radiation class="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-black tracking-tight text-white">radLearn</h1>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              MTR EXAM
            </span>
          </div>
          <p class="text-[11px] text-slate-400 font-medium hidden sm:block">
            Strahlenschutz, Nuklearmedizin & Radiologie Trainer
          </p>
        </div>
      </div>

      <!-- Center / Right Gamification HUD -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Floating XP Toast -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-2 scale-95"
        >
          <div
            v-if="lastXpGain"
            class="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 animate-bounce"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>{{ lastXpGain.label }}</span>
          </div>
        </Transition>

        <!-- Streak Badge -->
        <div
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold"
          :class="userProfile.streakDays > 0 ? 'text-amber-400 border-amber-500/30' : 'text-slate-400'"
          title="Tages-Streak"
        >
          <Flame class="w-4 h-4" :class="userProfile.streakDays > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'" />
          <span>{{ userProfile.streakDays }}</span>
        </div>

        <!-- Available Coins / Points Button -->
        <button
          type="button"
          @click="emit('selectTab', 'rewards')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-rose-300 hover:border-rose-500/40 hover:bg-rose-500/10 transition group"
          title="Verfügbare Belohnungs-Punkte für den Shop"
        >
          <Heart class="w-4 h-4 text-rose-400 group-hover:scale-110 transition" />
          <span>{{ availableCoins }}</span>
          <span class="text-[10px] text-slate-400 hidden sm:inline">Pkt.</span>
        </button>

        <!-- Level Badge -->
        <div
          class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs"
          :title="`Level ${levelInfo.current.level}: ${levelInfo.current.title} (${levelInfo.xpToNext} XP bis nächster Rang)`"
        >
          <span class="text-base leading-none">{{ levelInfo.current.badge }}</span>
          <div class="space-y-0.5">
            <div class="text-[10px] font-bold text-slate-300 leading-none">
              Lvl {{ levelInfo.current.level }}
            </div>
            <div class="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                :style="{ width: `${levelInfo.progressInTier}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Cloud Sync Button Indicator -->
        <button
          type="button"
          @click="emit('openCloud')"
          class="p-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition"
          :class="[
            cloudSyncStatus === 'synced'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : cloudSyncStatus === 'syncing'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                : cloudSyncStatus === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          ]"
          :title="isCloudConfigured ? `Cloud-Sync: ${cloudSyncStatus}` : 'Cloud-Sync einrichten'"
        >
          <Cloud class="w-4 h-4" />
          <span class="hidden md:inline text-[11px]">
            {{
              cloudSyncStatus === 'synced'
                ? 'Cloud Sync'
                : cloudSyncStatus === 'syncing'
                  ? 'Sync...'
                  : cloudSyncStatus === 'error'
                    ? 'Sync Fehler'
                    : 'Cloud'
            }}
          </span>
          <Check v-if="cloudSyncStatus === 'synced'" class="w-3 h-3 text-emerald-400 hidden sm:inline" />
        </button>

        <!-- Theme Toggle Button (Dark / Light) -->
        <button
          type="button"
          @click="toggleTheme"
          class="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
          :title="currentTheme === 'dark' ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'"
          :aria-label="currentTheme === 'dark' ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'"
        >
          <Sun v-if="currentTheme === 'dark'" class="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          <Moon v-else class="w-4 h-4 text-indigo-500 hover:-rotate-12 transition-transform" />
        </button>

        <!-- Mobile Drawer Toggle Button -->
        <button
          type="button"
          @click="emit('openMobileMenu')"
          class="lg:hidden p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          aria-label="Navigation öffnen"
        >
          <Menu class="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
</template>
