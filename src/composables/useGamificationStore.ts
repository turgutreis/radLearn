import { ref, computed, watch } from 'vue'
import type { UserProfile, RewardItem, QuestionProgress } from '../types'
import { STORAGE_KEYS, loadJson, getTodayIso, getYesterdayIso } from '../services/storageKeys'

export const DEFAULT_REWARDS: RewardItem[] = [
  {
    id: 'rew-coffee',
    title: 'Lieblings-Kaffee & süßes Teilchen',
    description: 'Frisch vom Ehemann direkt an den Schreibtisch oder ans Bett serviert (~50 richtige Fragen).',
    cost: 250,
    emoji: '☕',
    redeemedCount: 0
  },
  {
    id: 'rew-massage',
    title: '30 Min. Nacken- & Rückenmassage',
    description: 'Entspannung pur nach mehreren intensiven Lerntagen (~120 richtige Fragen).',
    cost: 600,
    emoji: '💆‍♀️',
    redeemedCount: 0
  },
  {
    id: 'rew-movie',
    title: 'Kino- oder Serienabend deiner Wahl',
    description: 'Du bestimmst den Film/die Serie + Lieblingssnacks (~200 richtige Fragen).',
    cost: 1000,
    emoji: '🎬',
    redeemedCount: 0
  },
  {
    id: 'rew-sushi',
    title: 'Großes Sushi-Date (All you can eat!)',
    description: 'Schickes Sushi-Essen gehen komplett auf meinen Nacken (~360 richtige Fragen)!',
    cost: 1800,
    emoji: '🍣',
    redeemedCount: 0
  },
  {
    id: 'rew-shopping',
    title: 'Wunsch-Gutschein / Shopping-Treat',
    description: 'Eine schöne Belohnung von deiner Wunschliste für langes Durchhalten (~600 richtige Fragen).',
    cost: 3000,
    emoji: '🛍️',
    redeemedCount: 0
  },
  {
    id: 'rew-wellness',
    title: 'Wellness-Tag / Thermen-Ausflug zu zweit',
    description: 'Ein ganzer Tag Abschalten & Genießen als großes Examens-Ziel (~1.000 richtige Fragen)!',
    cost: 5000,
    emoji: '🧖‍♀️',
    redeemedCount: 0
  }
]

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Schatz',
  xp: 0,
  spentCoins: 0,
  streakDays: 0,
  lastStudyDate: '',
  dailyGoal: 25,
  todayAnsweredCount: 0,
  rewards: DEFAULT_REWARDS,
  vouchers: []
}

export const LEVEL_TIERS = [
  { level: 1, title: 'Strahlenschutz-Starterin', minXp: 0, badge: '🌱' },
  { level: 2, title: 'Dosimeter-Trägerin', minXp: 150, badge: '📟' },
  { level: 3, title: 'Röntgen-Kennerin', minXp: 400, badge: '⚡' },
  { level: 4, title: 'Kontrollbereich-Profi', minXp: 800, badge: '☢️' },
  { level: 5, title: 'ALARA-Meisterin', minXp: 1400, badge: '🛡️' },
  { level: 6, title: 'SSB-Ehrenrang', minXp: 2200, badge: '🏅' },
  { level: 7, title: 'MTR-Examens-Queen', minXp: 3500, badge: '👑' }
]

export function migrateRewardsList(rewards: RewardItem[]): RewardItem[] {
  const defaultMap = new Map(DEFAULT_REWARDS.map((r) => [r.id, r]))
  if (!Array.isArray(rewards) || rewards.length === 0) return DEFAULT_REWARDS
  return rewards.map((item) => {
    const def = defaultMap.get(item.id)
    if (def && item.cost < def.cost) {
      return {
        ...item,
        cost: def.cost,
        description: def.description
      }
    }
    return item
  })
}

export function recalculateFairXp(
  currentXp: number,
  progMap: Record<string, QuestionProgress>
): number {
  let totalCorrectAnswers = 0
  let uniqueMastered = 0
  for (const p of Object.values(progMap)) {
    if (!p || typeof p !== 'object') continue
    totalCorrectAnswers += p.correctCount || 0
    if ((p.correctCount || 0) > 0) uniqueMastered += 1
  }
  const fairMaxXp = uniqueMastered * 3 + totalCorrectAnswers * 2 + 15
  if (currentXp > fairMaxXp && totalCorrectAnswers < 40) {
    return Math.max(0, uniqueMastered * 3 + totalCorrectAnswers * 2)
  }
  return currentXp
}

// Global state singleton
const rawProgForInit = loadJson<Record<string, QuestionProgress>>(STORAGE_KEYS.PROGRESS, {})
const loadedProfile = loadJson<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE)

const userProfile = ref<UserProfile>({
  ...DEFAULT_PROFILE,
  ...loadedProfile,
  dailyGoal: 25,
  xp: recalculateFairXp(loadedProfile.xp || 0, rawProgForInit),
  rewards: migrateRewardsList(loadedProfile.rewards)
})

const today = getTodayIso()
if (userProfile.value.lastStudyDate && userProfile.value.lastStudyDate !== today) {
  userProfile.value.todayAnsweredCount = 0
}

watch(userProfile, (val) => localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(val)), { deep: true })

const lastXpGain = ref<{ amount: number; label: string } | null>(null)
let xpGainTimer: ReturnType<typeof setTimeout> | null = null

export function useGamificationStore() {
  function triggerXpToast(amount: number, label: string) {
    lastXpGain.value = { amount, label }
    if (xpGainTimer) clearTimeout(xpGainTimer)
    xpGainTimer = setTimeout(() => {
      lastXpGain.value = null
    }, 2200)
  }

  function addStudyActivityAndXp(xpEarned: number, reason: string, countTowardsDailyGoal = true) {
    const todayStr = getTodayIso()
    const yesterdayStr = getYesterdayIso()

    if (userProfile.value.lastStudyDate !== todayStr) {
      if (userProfile.value.lastStudyDate === yesterdayStr) {
        userProfile.value.streakDays += 1
      } else {
        userProfile.value.streakDays = 1
      }
      userProfile.value.lastStudyDate = todayStr
      userProfile.value.todayAnsweredCount = 0
    }

    if (countTowardsDailyGoal) {
      userProfile.value.todayAnsweredCount += 1
    }

    let totalGain = xpEarned
    if (
      countTowardsDailyGoal &&
      userProfile.value.todayAnsweredCount === userProfile.value.dailyGoal
    ) {
      totalGain += 15
      triggerXpToast(totalGain, `Tagesziel (${userProfile.value.dailyGoal} richtige Fragen) erreicht! +15 Bonus-Punkte 🎉`)
    } else if (xpEarned > 0) {
      triggerXpToast(xpEarned, reason)
    }

    userProfile.value.xp += totalGain
  }

  const availableCoins = computed(() =>
    Math.max(0, userProfile.value.xp - (userProfile.value.spentCoins || 0))
  )

  const levelInfo = computed(() => {
    const xp = userProfile.value.xp
    let current = LEVEL_TIERS[0]
    let next = LEVEL_TIERS[1]

    for (let i = 0; i < LEVEL_TIERS.length; i++) {
      if (xp >= LEVEL_TIERS[i].minXp) {
        current = LEVEL_TIERS[i]
        next = LEVEL_TIERS[i + 1] || LEVEL_TIERS[i]
      }
    }

    const isMax = current.level === next.level
    const progressInTier = isMax
      ? 100
      : Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100))

    return {
      current,
      next,
      isMax,
      progressInTier,
      xpToNext: isMax ? 0 : Math.max(0, next.minXp - xp)
    }
  })

  function redeemReward(rewardId: string, onRewardChange?: () => void): boolean {
    const reward = userProfile.value.rewards.find((r) => r.id === rewardId)
    if (!reward) return false
    if (availableCoins.value < reward.cost) return false

    userProfile.value.spentCoins = (userProfile.value.spentCoins || 0) + reward.cost
    reward.redeemedCount = (reward.redeemedCount || 0) + 1
    reward.lastRedeemedAt = new Date().toISOString()

    userProfile.value.vouchers.unshift({
      id: `voucher-${Date.now()}`,
      rewardId: reward.id,
      title: reward.title,
      emoji: reward.emoji,
      cost: reward.cost,
      redeemedAt: new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      fulfilled: false
    })

    onRewardChange?.()
    return true
  }

  function toggleVoucherFulfilled(voucherId: string, onVoucherChange?: () => void) {
    const v = userProfile.value.vouchers.find((item) => item.id === voucherId)
    if (v) {
      v.fulfilled = !v.fulfilled
      onVoucherChange?.()
    }
  }

  function addCustomReward(
    payload: { title: string; description: string; cost: number; emoji: string },
    onRewardChange?: () => void
  ) {
    userProfile.value.rewards.push({
      id: `rew-custom-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      cost: Math.max(50, Number(payload.cost) || 500),
      emoji: payload.emoji || '🎁',
      redeemedCount: 0
    })
    onRewardChange?.()
  }

  function deleteReward(rewardId: string, onRewardChange?: () => void) {
    userProfile.value.rewards = userProfile.value.rewards.filter((r) => r.id !== rewardId)
    onRewardChange?.()
  }

  return {
    userProfile,
    lastXpGain,
    availableCoins,
    levelInfo,
    triggerXpToast,
    addStudyActivityAndXp,
    redeemReward,
    toggleVoucherFulfilled,
    addCustomReward,
    deleteReward
  }
}
