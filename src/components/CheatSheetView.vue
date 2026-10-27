<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, BookOpen, ShieldAlert, Clock, Users, Scale, Atom } from 'lucide-vue-next'
import { useStudyStore } from '../composables/useStudyStore'

const { allDecks } = useStudyStore()
const searchQuery = ref('')

const filteredDecks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allDecks.value
  return allDecks.value
    .map((d) => ({
      ...d,
      summaryPoints: d.summaryPoints.filter(
        (p) => p.toLowerCase().includes(q) || d.title.toLowerCase().includes(q)
      )
    }))
    .filter((d) => d.summaryPoints.length > 0)
})
</script>

<template>
  <div class="space-y-8">
    <!-- Search Header -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen class="w-5 h-5 text-amber-400" />
          Prüfungs-Kompendium & Tabellen-Spickzettel
        </h2>
        <p class="text-xs text-slate-400 mt-0.5">
          Alle wichtigen Vergleichstabellen, Grenzwerte, Fristen und Formeln aus deinen Strahlenschutz-PDFs auf einen Blick.
        </p>
      </div>

      <div class="relative min-w-[260px]">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Nach Begriff, § oder Zahl suchen..."
          class="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
        />
      </div>
    </div>

    <!-- Quick Reference Tables from PDFs -->
    <div v-if="!searchQuery.trim()" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Table 1: Grenzwerte & Kategorien -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 overflow-x-auto">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert class="w-5 h-5 text-rose-400" />
          Grenzwerte & Kategorien (§§ 77, 78, 80 StrlSchG)
        </h3>
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400">
              <th class="py-2 pr-2">Personengruppe</th>
              <th class="py-2 px-2">Effektive Dosis</th>
              <th class="py-2 px-2">Augenlinse</th>
              <th class="py-2 pl-2">Haut / Hände</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/70 text-slate-200">
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-amber-300">Kategorie A (Arzt 1x/J.)</td>
              <td class="py-2.5 px-2">&gt; 6 bis max. 20 mSv/a</td>
              <td class="py-2.5 px-2">20 mSv/a</td>
              <td class="py-2.5 pl-2">&gt; 150 bis 500 mSv/a</td>
            </tr>
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-cyan-300">Kategorie B („wir“, UKHD 3J.)</td>
              <td class="py-2.5 px-2">&gt; 1 bis max. 6 mSv/a</td>
              <td class="py-2.5 px-2">&gt; 15 mSv/a</td>
              <td class="py-2.5 pl-2">&gt; 50 mSv/a</td>
            </tr>
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-emerald-300">Unter 18 J. (Azubis)</td>
              <td class="py-2.5 px-2">max. 1 mSv/a</td>
              <td class="py-2.5 px-2">15 mSv/a</td>
              <td class="py-2.5 pl-2">50 mSv/a</td>
            </tr>
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-slate-300">Bevölkerung (§ 80)</td>
              <td class="py-2.5 px-2">≤ 1 mSv/a (≤ 0,5 µSv/h)</td>
              <td class="py-2.5 px-2">15 mSv/a</td>
              <td class="py-2.5 pl-2">50 mSv/a</td>
            </tr>
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-pink-300">Gebärfähige / Schwangere</td>
              <td class="py-2.5 px-2" colspan="3">Uterus: 2 mSv/Monat | Ungeborenes Kind: 1 mSv (ab Mitteilung bis Ende SS)</td>
            </tr>
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-violet-300">Berufslebensdosis (§ 77)</td>
              <td class="py-2.5 px-2" colspan="3">400 mSv (danach mit schriftl. Zustimmung max. 5 J. × 10 mSv/a)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table 2: Strahlenschutzbereiche -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 overflow-x-auto">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <Atom class="w-5 h-5 text-cyan-400" />
          Strahlenschutzbereiche (§ 52 StrlSchV)
        </h3>
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400">
              <th class="py-2 pr-2">Bereich</th>
              <th class="py-2 px-2">Grenzwerte (Deff / ODL)</th>
              <th class="py-2 pl-2">Beispiele & Zutritt</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/70 text-slate-200">
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-emerald-300">Allg. Staatsgebiet</td>
              <td class="py-2.5 px-2">≤ 1 mSv/a<br />≤ 0,5 µSv/h</td>
              <td class="py-2.5 pl-2">Betriebsgelände, Normalbevölkerung</td>
            </tr>
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-cyan-300">Überwachungsbereich</td>
              <td class="py-2.5 px-2">&gt; 1 bis ≤ 6 mSv/a<br />&gt; 0,5 bis ≤ 3 µSv/h<br />Haut &gt; 50 mSv/a</td>
              <td class="py-2.5 pl-2">Schaltraum / Schaltpult („Da sitzen wir“), LB-Raum (Strahl aus)</td>
            </tr>
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-amber-300">Kontrollbereich</td>
              <td class="py-2.5 px-2">&gt; 6 bis 20 mSv/a<br />&gt; 3 µSv/h bis ≤ 3 mSv/h<br />Auge &gt; 15, Haut &gt; 150</td>
              <td class="py-2.5 pl-2">Permanent: Heißlabor NUK.<br />Temporär: Röntgenraum (wenn an), LB kurz nach Abschalten.</td>
            </tr>
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-rose-400">Sperrbereich</td>
              <td class="py-2.5 px-2">ODL &gt; 3 mSv/h</td>
              <td class="py-2.5 pl-2">Teil des Kontrollbereichs („Kein Zutritt“), LB-Raum bei Bestrahlung. Nur Patient!</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table 3: Betriebliche Organisation (SSV, SSBV, SSB, MPE) -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 overflow-x-auto">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <Users class="w-5 h-5 text-violet-400" />
          Organisation: SSV, SSBV, SSB & MPE (PDF 1, S. 6–7)
        </h3>
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400">
              <th class="py-2 pr-2">Rolle</th>
              <th class="py-2 px-2">Fachkunde?</th>
              <th class="py-2 px-2">Führungszeugnis?</th>
              <th class="py-2 pl-2">Wichtige Prüfungsfakten</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/70 text-slate-200">
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-amber-300">SSV (Verantwortlicher)</td>
              <td class="py-2.5 px-2 text-rose-300 font-bold">NEIN (auch keine Kenntnisse)</td>
              <td class="py-2.5 px-2 text-emerald-300">JA (alle 5 J.)</td>
              <td class="py-2.5 pl-2">Oberste rechtl. Pflicht (auch bei Delegation!), kann jur. Person sein, bestellt SSB schriftlich.</td>
            </tr>
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-cyan-300">SSBV (Bevollmächtigter)</td>
              <td class="py-2.5 px-2 text-emerald-300 font-bold">JA (alle 5 J.)</td>
              <td class="py-2.5 px-2 text-emerald-300">JA (alle 5 J.)</td>
              <td class="py-2.5 pl-2">Vertreter des SSV in größeren Betrieben (z. B. Hr. Knoch, Fr. Soiné).</td>
            </tr>
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-emerald-300">SSB (Beauftragter)</td>
              <td class="py-2.5 px-2 text-emerald-300 font-bold">JA (alle 5 J.)</td>
              <td class="py-2.5 px-2 text-emerald-300">JA (alle 5 J.)</td>
              <td class="py-2.5 pl-2">1 J. Kündigungsschutz nach Ende, keine Benachteiligung, in 15 Min. vor Ort bei Vorkommnis!</td>
            </tr>
            <tr>
              <td class="py-2.5 pr-2 font-semibold text-violet-300">MPE (Medizinphysiker)</td>
              <td class="py-2.5 px-2 text-emerald-300 font-bold">JA (alle 5 J.)</td>
              <td class="py-2.5 px-2 text-emerald-300">JA (alle 5 J.)</td>
              <td class="py-2.5 pl-2">Master Med. Physik. Darf Strahlung auslösen, aber NICHT am Menschen anwenden!</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table 4: Alle Aufbewahrungsfristen -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 overflow-x-auto">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <Clock class="w-5 h-5 text-emerald-400" />
          Alle Aufbewahrungsfristen & Intervalle (PDF 1, S. 13–14)
        </h3>
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400">
              <th class="py-2 pr-2">Frist</th>
              <th class="py-2 pl-2">Welche Unterlagen / Dokumente?</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/70 text-slate-200">
            <tr>
              <td class="py-2 pr-2 font-bold text-amber-300">1 Jahr</td>
              <td class="py-2 pl-2">Unterweisungsunterlagen von Begleitpersonen / Helfern</td>
            </tr>
            <tr>
              <td class="py-2 pr-2 font-bold text-cyan-300">5 Jahre</td>
              <td class="py-2 pl-2">Unterweisung Personal, Messtechn. Überwachung, Bildgebung, Radon-Messwerte, Dosisrichtwert, Dosis SS</td>
            </tr>
            <tr>
              <td class="py-2 pr-2 font-bold text-emerald-300">10 Jahre</td>
              <td class="py-2 pl-2">Untersuchungsdaten (Diagnostik Volljährige), Konstanzprüfung, Messgeräte-Wartung (§ 90), OSL-Auswertung beim SSV (§ 76), Grenzüberschreitung Kontamination</td>
            </tr>
            <tr>
              <td class="py-2 pr-2 font-bold text-rose-300">30 Jahre</td>
              <td class="py-2 pl-2">Behandlung (Strahlentherapie), Vorkommnis (ab Eintreten), Bestand radioaktiver Stoffe mit HWZ &gt; 100d</td>
            </tr>
            <tr>
              <td class="py-2 pr-2 font-bold text-violet-300">Dauer Betrieb</td>
              <td class="py-2 pl-2">Einweisung Personal, Genehmigungsbescheid, 1. SV-Prüfung, Abnahmeprüfung (bzw. mind. 3 J. nach nächster)</td>
            </tr>
            <tr>
              <td class="py-2 pr-2 font-bold text-pink-300">75. / 100. LJ</td>
              <td class="py-2 pl-2">Summe der beruflichen Exposition (§ 167): Bis 75. LJ, mind. 30 J. nach Beschäftigungsende, max. 100. LJ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Deck Bullet Summaries -->
    <div class="space-y-4">
      <h3 class="text-base font-bold text-white flex items-center gap-2">
        <Scale class="w-5 h-5 text-amber-400" />
        Themen-Zusammenfassungen (inkl. hochgeladener PDFs)
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="deck in filteredDecks"
          :key="deck.id"
          class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3"
        >
          <div class="flex items-center justify-between gap-2">
            <h4 class="font-bold text-white text-base">{{ deck.title }}</h4>
            <span v-if="deck.sourceFileName" class="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400">
              {{ deck.sourceFileName }}
            </span>
          </div>
          <ul class="space-y-2 text-xs sm:text-sm text-slate-300">
            <li v-for="(point, idx) in deck.summaryPoints" :key="idx" class="flex items-start gap-2.5 leading-relaxed">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
              <span>{{ point }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
