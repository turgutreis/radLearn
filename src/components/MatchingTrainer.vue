<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { MATCHING_PAIRS } from '../data/initialData'
import type { MatchingPair } from '../types'
import { CheckCircle2, RotateCcw, Sparkles, ArrowUpDown, Trophy } from 'lucide-vue-next'

type CategoryKey = 'fristen' | 'grenzwerte' | 'gewebe' | 'bereiche'

const activeCategory = ref<CategoryKey>('fristen')
const selectedLeftId = ref<string | null>(null)
const matchedIds = ref<Set<string>>(new Set())
const wrongFlash = ref<boolean>(false)
const mistakes = ref<number>(0)

const categories: Array<{ id: CategoryKey; label: string; subtitle: string }> = [
  { id: 'fristen', label: 'Aufbewahrungsfristen & Intervalle', subtitle: '1 J., 3 J., 5 J., 10 J., 30 J., 75./100. LJ' },
  { id: 'grenzwerte', label: 'Dosisgrenzwerte & Kategorien', subtitle: 'mSv/a, Kat. A/B, Uterus, Radon, Freigabe' },
  { id: 'gewebe', label: 'Wichtungsfaktoren (wT & wR)', subtitle: 'Knochen, Leber/SD/Niere, Lunge/KM, Keimdrüsen' },
  { id: 'bereiche', label: 'Strahlenschutzbereiche', subtitle: 'Überwachungs-, Kontroll- & Sperrbereich' }
]

const currentPairs = computed<MatchingPair[]>(() =>
  MATCHING_PAIRS.filter((p) => p.category === activeCategory.value)
)

const shuffledRight = ref<MatchingPair[]>([])

function initRound() {
  matchedIds.value = new Set()
  selectedLeftId.value = null
  mistakes.value = 0
  const arr = [...currentPairs.value]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  shuffledRight.value = arr
}

watch(activeCategory, initRound, { immediate: true })

function selectLeft(id: string) {
  if (matchedIds.value.has(id)) return
  selectedLeftId.value = id
}

function selectRight(pair: MatchingPair) {
  if (matchedIds.value.has(pair.id) || !selectedLeftId.value) return
  if (selectedLeftId.value === pair.id) {
    const next = new Set(matchedIds.value)
    next.add(pair.id)
    matchedIds.value = next
    selectedLeftId.value = null
  } else {
    mistakes.value++
    wrongFlash.value = true
    setTimeout(() => {
      wrongFlash.value = false
    }, 450)
  }
}

const allMatched = computed(() => matchedIds.value.size === currentPairs.value.length && currentPairs.value.length > 0)

// Interactive Sorting Exercise for Gewebewichtungsfaktoren wT (from PDF page 1)
interface OrganItem {
  id: string
  name: string
  wt: number
  groupOrder: number
}

const initialOrgans: OrganItem[] = [
  { id: 'o-keim', name: 'Keimdrüsen (Gonaden)', wt: 0.2, groupOrder: 4 },
  { id: 'o-knochen', name: 'Knochenoberfläche (KNO) / Haut', wt: 0.01, groupOrder: 1 },
  { id: 'o-lunge', name: 'Lunge & rotes Knochenmark (KM)', wt: 0.12, groupOrder: 3 },
  { id: 'o-sd', name: 'Schilddrüse (SD), Leber & Nieren', wt: 0.05, groupOrder: 2 }
]

const userOrgans = ref<OrganItem[]>([...initialOrgans])
const sortChecked = ref(false)

function moveOrgan(index: number, dir: -1 | 1) {
  const target = index + dir
  if (target < 0 || target >= userOrgans.value.length) return
  const copy = [...userOrgans.value]
  ;[copy[index], copy[target]] = [copy[target], copy[index]]
  userOrgans.value = copy
  sortChecked.value = false
}

const isSortCorrect = computed(() =>
  userOrgans.value.every((item, idx) => item.groupOrder === idx + 1)
)
</script>

<template>
  <div class="space-y-8">
    <!-- Category Selector -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        @click="activeCategory = cat.id"
        class="p-4 rounded-2xl border text-left transition-all"
        :class="
          activeCategory === cat.id
            ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
        "
      >
        <div class="font-bold text-sm">{{ cat.label }}</div>
        <div class="text-xs text-slate-400 mt-1">{{ cat.subtitle }}</div>
      </button>
    </div>

    <!-- Matching Game Arena -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-amber-400" />
            Zuordnungs-Trainer: Klicke links einen Begriff und rechts den passenden Wert!
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Perfekt zum schnellen Einprägen der vielen Prüfungszahlen, Grenzwerte und Fristen aus deinen PDFs.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
            Gelöst: <strong class="text-emerald-400">{{ matchedIds.size }} / {{ currentPairs.length }}</strong>
          </span>
          <span class="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
            Fehlversuche: <strong class="text-rose-400">{{ mistakes }}</strong>
          </span>
          <button
            type="button"
            @click="initRound"
            class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Neu mischen
          </button>
        </div>
      </div>

      <!-- Success Banner -->
      <div
        v-if="allMatched"
        class="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-3"
      >
        <Trophy class="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 class="text-lg font-extrabold text-white">Alle Paare richtig zugeordnet!</h3>
        <p class="text-sm text-emerald-200">
          Du hast alle {{ currentPairs.length }} Zuordnungen mit {{ mistakes }} Fehlversuchen gelöst.
        </p>
        <button
          type="button"
          @click="initRound"
          class="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition"
        >
          Nochmal spielen
        </button>
      </div>

      <!-- Matching Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" :class="{ 'animate-pulse': wrongFlash }">
        <!-- Left Column: Terms -->
        <div class="space-y-2.5">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">1. Begriff / Größe wählen</div>
          <button
            v-for="pair in currentPairs"
            :key="pair.id"
            type="button"
            @click="selectLeft(pair.id)"
            :disabled="matchedIds.has(pair.id)"
            class="w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3"
            :class="[
              matchedIds.has(pair.id)
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300/70 opacity-60 cursor-default'
                : selectedLeftId === pair.id
                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-600 text-slate-200'
            ]"
          >
            <div>
              <div class="font-semibold text-sm">{{ pair.left }}</div>
              <div v-if="pair.hint" class="text-xs text-slate-500 mt-0.5">{{ pair.hint }}</div>
            </div>
            <CheckCircle2 v-if="matchedIds.has(pair.id)" class="w-5 h-5 text-emerald-400 shrink-0" />
          </button>
        </div>

        <!-- Right Column: Values -->
        <div class="space-y-2.5">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">2. Passenden Wert / Frist zuordnen</div>
          <button
            v-for="pair in shuffledRight"
            :key="pair.id"
            type="button"
            @click="selectRight(pair)"
            :disabled="matchedIds.has(pair.id)"
            class="w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3"
            :class="[
              matchedIds.has(pair.id)
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300/70 opacity-60 cursor-default'
                : selectedLeftId
                  ? 'bg-slate-950/80 border-slate-700 hover:border-cyan-400 text-slate-100 cursor-pointer'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-300'
            ]"
          >
            <div class="text-sm font-medium">{{ pair.right }}</div>
            <CheckCircle2 v-if="matchedIds.has(pair.id)" class="w-5 h-5 text-emerald-400 shrink-0" />
          </button>
        </div>
      </div>
    </div>

    <!-- Special Exam Task: Sort Gewebewichtungsfaktoren wT (from Page 1 of both PDFs!) -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-cyan-400">Klassische Prüfungsaufgabe (Skript 1 & 2, Seite 1)</span>
          <h3 class="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
            <ArrowUpDown class="w-5 h-5 text-cyan-400" />
            Sortiere die Gewebewichtungsfaktoren (wT) in ZUNEHMENDER Strahlenempfindlichkeit!
          </h3>
          <p class="text-xs text-slate-400 mt-1">
            Oben (Platz 1) das unempfindlichste Gewebe (kleinster wT) → unten (Platz 4) das strahlenempfindlichste Gewebe (größter wT).
          </p>
        </div>

        <button
          type="button"
          @click="sortChecked = true"
          class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition"
        >
          Reihenfolge prüfen
        </button>
      </div>

      <div class="space-y-2.5 max-w-2xl">
        <div
          v-for="(item, idx) in userOrgans"
          :key="item.id"
          class="p-4 rounded-2xl border bg-slate-950/80 flex items-center justify-between gap-4"
          :class="
            sortChecked
              ? item.groupOrder === idx + 1
                ? 'border-emerald-500/60 bg-emerald-950/20'
                : 'border-rose-500/60 bg-rose-950/20'
              : 'border-slate-800'
          "
        >
          <div class="flex items-center gap-3.5">
            <span class="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
              {{ idx + 1 }}.
            </span>
            <div>
              <div class="font-semibold text-sm text-white">{{ item.name }}</div>
              <div v-if="sortChecked" class="text-xs font-bold mt-0.5" :class="item.groupOrder === idx + 1 ? 'text-emerald-400' : 'text-rose-400'">
                wT = {{ item.wt.toString().replace('.', ',') }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              @click="moveOrgan(idx, -1)"
              :disabled="idx === 0"
              class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-200"
            >
              ↑ Hoch
            </button>
            <button
              type="button"
              @click="moveOrgan(idx, 1)"
              :disabled="idx === userOrgans.length - 1"
              class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-200"
            >
              ↓ Runter
            </button>
          </div>
        </div>
      </div>

      <div v-if="sortChecked" class="text-sm font-semibold" :class="isSortCorrect ? 'text-emerald-400' : 'text-rose-400'">
        {{
          isSortCorrect
            ? '✓ Perfekt sortiert! Knochen (0,01) < SD/Leber/Niere (0,05) < Lunge/KM (0,12) < Keimdrüsen (0,20).'
            : '✗ Noch nicht ganz in der richtigen Reihenfolge – nutze die Pfeile zum Tauschen!'
        }}
      </div>
    </div>
  </div>
</template>
