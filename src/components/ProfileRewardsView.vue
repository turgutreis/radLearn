<script setup lang="ts">
import { ref } from 'vue'
import {
  Gift,
  Trophy,
  Flame,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Heart,
  Star,
  Ticket
} from 'lucide-vue-next'
import { useStudyStore, LEVEL_TIERS } from '../composables/useStudyStore'

const {
  userProfile,
  availableCoins,
  levelInfo,
  achievements,
  overallStats,
  scheduleProgressPush,
  redeemReward,
  toggleVoucherFulfilled,
  addCustomReward,
  deleteReward
} = useStudyStore()

const showAddReward = ref(false)
const newRewardTitle = ref('')
const newRewardDesc = ref('')
const newRewardCost = ref(400)
const newRewardEmoji = ref('🍣')
const redeemedBanner = ref<string | null>(null)

function handleRedeem(rewardId: string, title: string, emoji: string) {
  const ok = redeemReward(rewardId)
  if (ok) {
    redeemedBanner.value = `${emoji} Juhu! Du hast „${title}“ eingelöst! Zeig den Gutschein unten deinem Mann!`
    setTimeout(() => {
      redeemedBanner.value = null
    }, 6000)
  }
}

function submitNewReward() {
  if (!newRewardTitle.value.trim()) return
  addCustomReward({
    title: newRewardTitle.value.trim(),
    description: newRewardDesc.value.trim() || 'Wohlverdiente Belohnung fürs fleißige Lernen!',
    cost: Number(newRewardCost.value) || 300,
    emoji: newRewardEmoji.value || '🎁'
  })
  newRewardTitle.value = ''
  newRewardDesc.value = ''
  newRewardCost.value = 400
  showAddReward.value = false
}
</script>

<template>
  <div class="space-y-8">
    <!-- Celebration Banner on Redemption -->
    <div
      v-if="redeemedBanner"
      class="bg-gradient-to-r from-emerald-500/25 via-amber-500/25 to-rose-500/25 border border-amber-400/60 rounded-3xl p-5 text-center shadow-xl animate-bounce"
    >
      <p class="text-base sm:text-lg font-extrabold text-white">{{ redeemedBanner }}</p>
    </div>

    <!-- 1. Personal Account & Level Hero Card -->
    <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-rose-400 to-violet-500 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-rose-500/20 shrink-0">
            {{ levelInfo.current.badge }}
          </div>
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950">
                Level {{ levelInfo.current.level }}
              </span>
              <span class="text-xs font-bold uppercase tracking-wider text-amber-300">
                {{ levelInfo.current.title }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="userProfile.name"
                @change="scheduleProgressPush()"
                type="text"
                class="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-400 text-xl sm:text-2xl font-extrabold text-white focus:outline-none w-48 sm:w-64"
                title="Name anklicken zum Ändern"
              />
            </div>
            <p class="text-xs text-slate-400">
              Neue richtige Frage: <strong class="text-amber-300">+5 Punkte</strong> · Richtige Wiederholung: <strong class="text-amber-300">+2 Punkte</strong> · Tagesziel (25 richtige): <strong class="text-emerald-300">+15 Bonus-Punkte</strong>!
            </p>
          </div>
        </div>

        <!-- Quick Account Metrics -->
        <div class="grid grid-cols-3 gap-3 w-full lg:w-auto">
          <div class="bg-slate-800/80 border border-rose-500/30 rounded-2xl p-4 text-center min-w-[110px]">
            <div class="flex items-center justify-center gap-1 text-rose-400 text-xs font-bold">
              <Heart class="w-3.5 h-3.5 fill-rose-400" />
              <span>Guthaben</span>
            </div>
            <div class="text-2xl font-extrabold text-white mt-1">{{ availableCoins }}</div>
            <div class="text-[11px] text-slate-300">Belohnungs-Punkte</div>
          </div>

          <div class="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-4 text-center min-w-[110px]">
            <div class="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold">
              <Flame class="w-3.5 h-3.5 fill-amber-400" />
              <span>Streak</span>
            </div>
            <div class="text-2xl font-extrabold text-white mt-1">{{ userProfile.streakDays }}</div>
            <div class="text-[11px] text-slate-300">Tage in Folge</div>
          </div>

          <div class="bg-slate-800/80 border border-cyan-500/30 rounded-2xl p-4 text-center min-w-[110px]">
            <div class="flex items-center justify-center gap-1 text-cyan-400 text-xs font-bold">
              <Star class="w-3.5 h-3.5 fill-cyan-400" />
              <span>Gesamt-XP</span>
            </div>
            <div class="text-2xl font-extrabold text-white mt-1">{{ userProfile.xp }}</div>
            <div class="text-[11px] text-slate-300">Erfahrungspunkte</div>
          </div>
        </div>
      </div>

      <!-- Level Progress & Daily Goal Bars -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
        <!-- Level XP Bar -->
        <div class="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-200">
              Nächster Rang: <strong class="text-amber-300">{{ levelInfo.next.badge }} {{ levelInfo.next.title }}</strong>
            </span>
            <span class="text-slate-400">
              {{ levelInfo.isMax ? 'Max-Level erreicht!' : `Noch ${levelInfo.xpToNext} XP` }}
            </span>
          </div>
          <div class="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
              :style="{ width: `${levelInfo.progressInTier}%` }"
            />
          </div>
        </div>

        <!-- Daily Goal Bar -->
        <div class="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-200">
              Tagesziel (+50 Bonus-Punkte):
            </span>
            <span class="font-bold" :class="userProfile.todayAnsweredCount >= userProfile.dailyGoal ? 'text-emerald-400' : 'text-cyan-400'">
              {{ userProfile.todayAnsweredCount }} / {{ userProfile.dailyGoal }} Fragen heute
            </span>
          </div>
          <div class="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
              :style="{ width: `${Math.min(100, Math.round((userProfile.todayAnsweredCount / userProfile.dailyGoal) * 100))}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Belohnungs-Shop (Sushi, Massage, Date Night etc.) -->
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-xl font-extrabold text-white flex items-center gap-2">
            <Gift class="w-6 h-6 text-rose-400" />
            Dein Belohnungs-Shop (Ehemann-Gutscheine)
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Tausche deine erlernten Punkte gegen echte Belohnungen ein – dein Lernfortschritt bleibt dabei natürlich zu 100% erhalten!
          </p>
        </div>

        <button
          type="button"
          @click="showAddReward = !showAddReward"
          class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
        >
          <Plus class="w-4 h-4" />
          <span>Eigene Belohnung hinzufügen</span>
        </button>
      </div>

      <!-- Add Custom Reward Form -->
      <div v-if="showAddReward" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h4 class="text-sm font-bold text-white">Neue Wunsch-Belohnung anlegen</h4>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label class="text-xs text-slate-400">Emoji / Icon</label>
            <input
              v-model="newRewardEmoji"
              type="text"
              placeholder="🍣"
              class="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs text-slate-400">Titel der Belohnung (z. B. Sushi Essen gehen)</label>
            <input
              v-model="newRewardTitle"
              type="text"
              placeholder="z.B. Italienisch essen gehen / Blumenstrauß"
              class="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label class="text-xs text-slate-400">Benötigte Punkte</label>
            <input
              v-model.number="newRewardCost"
              type="number"
              step="50"
              min="50"
              class="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div class="sm:col-span-4">
            <label class="text-xs text-slate-400">Kurze Beschreibung</label>
            <input
              v-model="newRewardDesc"
              type="text"
              placeholder="Worauf darf sie sich freuen?"
              class="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" @click="showAddReward = false" class="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300">
            Abbrechen
          </button>
          <button
            type="button"
            @click="submitNewReward"
            class="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Belohnung speichern
          </button>
        </div>
      </div>

      <!-- Rewards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="reward in userProfile.rewards"
          :key="reward.id"
          class="bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between gap-4 transition-all relative group"
          :class="
            availableCoins >= reward.cost
              ? 'border-amber-500/60 shadow-lg shadow-amber-500/10'
              : 'border-slate-800'
          "
        >
          <button
            type="button"
            @click="deleteReward(reward.id)"
            class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Belohnung entfernen"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-4xl">{{ reward.emoji }}</span>
              <span
                class="px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1"
                :class="
                  availableCoins >= reward.cost
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                "
              >
                <Heart class="w-3.5 h-3.5 fill-current" />
                {{ reward.cost }} Punkte
              </span>
            </div>

            <h4 class="text-base font-bold text-white">{{ reward.title }}</h4>
            <p class="text-xs text-slate-400 leading-relaxed">{{ reward.description }}</p>

            <!-- Progress towards this reward -->
            <div class="space-y-1 pt-1">
              <div class="flex justify-between text-[11px] text-slate-300">
                <span>Fortschritt</span>
                <span>{{ Math.min(availableCoins, reward.cost) }} / {{ reward.cost }} Pkt.</span>
              </div>
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all"
                  :style="{ width: `${Math.min(100, Math.round((availableCoins / reward.cost) * 100))}%` }"
                />
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <span v-if="reward.redeemedCount > 0" class="text-[11px] text-emerald-400 font-semibold">
              Schon {{ reward.redeemedCount }}× eingelöst
            </span>
            <span v-else class="text-[11px] text-slate-500">
              {{ availableCoins >= reward.cost ? 'Bereit zum Einlösen!' : `Noch ${reward.cost - availableCoins} Pkt.` }}
            </span>

            <button
              type="button"
              @click="handleRedeem(reward.id, reward.title, reward.emoji)"
              :disabled="availableCoins < reward.cost"
              class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              :class="
                availableCoins >= reward.cost
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              "
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>Einlösen</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Redeemed Vouchers Wallet -->
    <div v-if="userProfile.vouchers.length > 0" class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
      <h3 class="text-lg font-bold text-white flex items-center gap-2">
        <Ticket class="w-5 h-5 text-amber-400" />
        Deine eingelösten Gutscheine ({{ userProfile.vouchers.length }})
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="v in userProfile.vouchers"
          :key="v.id"
          class="p-4 rounded-2xl border flex items-center justify-between gap-4"
          :class="v.fulfilled ? 'bg-slate-800/40 border-slate-700 opacity-60' : 'bg-amber-500/10 border-amber-500/40'"
        >
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ v.emoji }}</span>
            <div>
              <div class="font-bold text-sm text-white">{{ v.title }}</div>
              <div class="text-xs text-slate-400">Freigeschaltet am {{ v.redeemedAt }}</div>
            </div>
          </div>

          <button
            type="button"
            @click="toggleVoucherFulfilled(v.id)"
            class="px-3 py-1.5 rounded-xl text-xs font-bold border transition shrink-0"
            :class="
              v.fulfilled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400'
            "
          >
            {{ v.fulfilled ? '✓ Eingelöst' : 'Als eingelöst markieren' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 4. Achievements & Badges -->
    <div class="space-y-4">
      <h3 class="text-lg font-bold text-white flex items-center gap-2">
        <Trophy class="w-5 h-5 text-amber-400" />
        Deine Erfolge & Abzeichen
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="ach in achievements"
          :key="ach.id"
          class="p-5 rounded-2xl border flex items-start gap-3.5 transition"
          :class="
            ach.unlocked
              ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
              : 'bg-slate-900/50 border-slate-800/80 text-slate-500 opacity-65'
          "
        >
          <div class="text-3xl shrink-0">{{ ach.emoji }}</div>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-sm">{{ ach.title }}</h4>
              <CheckCircle2 v-if="ach.unlocked" class="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <p class="text-xs text-slate-400">{{ ach.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Career Level Ladder Overview -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
      <h3 class="text-base font-bold text-white">MTR-Karriereleiter (Alle 7 Ränge)</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div
          v-for="tier in LEVEL_TIERS"
          :key="tier.level"
          class="p-3 rounded-2xl border text-center space-y-1"
          :class="
            userProfile.xp >= tier.minXp
              ? 'bg-amber-500/15 border-amber-500/50 text-white'
              : 'bg-slate-800/50 border-slate-700 text-slate-400'
          "
        >
          <div class="text-2xl">{{ tier.badge }}</div>
          <div class="text-[11px] font-bold">Lvl {{ tier.level }}</div>
          <div class="text-xs font-semibold leading-tight">{{ tier.title }}</div>
          <div class="text-[10px] text-slate-400">ab {{ tier.minXp }} XP</div>
        </div>
      </div>
    </div>
  </div>
</template>
