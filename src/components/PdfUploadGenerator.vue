<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Trash2,
  Play,
  Layers
} from 'lucide-vue-next'
import { useStudyStore } from '../composables/useStudyStore'
import {
  extractPdfInBrowser,
  generateQuestionsInBrowser,
  type ExtractedPage
} from '../services/pdfAndAiClient'

const emit = defineEmits<{
  (e: 'openDeck', deckId: string): void
}>()

const { aiSettings, customDecks, getDeckQuestions, addGeneratedDeck, deleteCustomDeck } = useStudyStore()

const isDragging = ref(false)
const isExtracting = ref(false)
const isGenerating = ref(false)
const batchProgressText = ref<string>('')
const batchProgressPercent = ref<number>(0)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const extractedFileName = ref<string>('')
const extractedText = ref<string>('')
const extractedPages = ref<ExtractedPage[]>([])
const extractedPdfBase64 = ref<string | undefined>(undefined)
const totalPages = ref<number>(0)

// Seitenbereich-Auswahl & Smart-Chunking für große PDFs (z.B. 45 Seiten)
const pageFrom = ref<number>(1)
const pageTo = ref<number>(1)
const useDeepChunking = ref<boolean>(false)
const pagesPerChunk = ref<number>(10)

const questionCount = ref<number>(15)
const focusAreas = ref<string>('')
const showApiConfig = ref<boolean>(false)

const selectedPageCount = computed(() => Math.max(0, pageTo.value - pageFrom.value + 1))
const estimatedChunks = computed(() =>
  useDeepChunking.value && selectedPageCount.value > pagesPerChunk.value
    ? Math.ceil(selectedPageCount.value / pagesPerChunk.value)
    : 1
)

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) await processPdfFile(file)
}

async function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) await processPdfFile(file)
}

function updateSelectedPagesText() {
  if (extractedPages.value.length === 0) return
  const from = Math.max(1, Math.min(pageFrom.value, totalPages.value))
  const to = Math.max(from, Math.min(pageTo.value, totalPages.value))
  pageFrom.value = from
  pageTo.value = to

  const slice = extractedPages.value.filter((p) => p.pageNumber >= from && p.pageNumber <= to)
  extractedText.value = slice.map((p) => `--- Seite ${p.pageNumber} ---\n${p.text}`).join('\n\n')
}

async function processPdfFile(file: File) {
  errorMessage.value = null
  successMessage.value = null
  isExtracting.value = true
  extractedFileName.value = file.name
  extractedPages.value = []

  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/extract-pdf', {
      method: 'POST',
      body: formData
    }).catch(() => null)

    if (res && res.ok) {
      const data = await res.json()
      extractedText.value = data.fullText || ''
      extractedPages.value = Array.isArray(data.pages) ? data.pages : []
      extractedPdfBase64.value = data.pdfBase64
      totalPages.value = data.totalPages || 1
      pageFrom.value = 1
      pageTo.value = totalPages.value
      useDeepChunking.value = totalPages.value > 12
      return
    }

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      if (file.size < 12 * 1024 * 1024) {
        extractedPdfBase64.value = await fileToBase64(file)
      } else {
        extractedPdfBase64.value = undefined
      }
      const parsed = await extractPdfInBrowser(file)
      extractedText.value = parsed.fullText
      extractedPages.value = parsed.pages
      totalPages.value = parsed.totalPages
      pageFrom.value = 1
      pageTo.value = parsed.totalPages
      useDeepChunking.value = parsed.totalPages > 12
    } else {
      extractedText.value = await file.text()
      totalPages.value = 1
      pageFrom.value = 1
      pageTo.value = 1
      useDeepChunking.value = false
    }
  } catch (err: any) {
    errorMessage.value = err?.message || 'Fehler beim Extrahieren der PDF-Datei.'
  } finally {
    isExtracting.value = false
  }
}

function getActiveApiKey(): string {
  switch (aiSettings.value.provider) {
    case 'gemini':
      return aiSettings.value.geminiKey
    case 'openai':
      return aiSettings.value.openaiKey
    case 'anthropic':
      return aiSettings.value.anthropicKey
    default:
      return ''
  }
}

function updateProviderModel(provider: 'gemini' | 'openai' | 'anthropic' | 'ollama') {
  aiSettings.value.provider = provider
  if (provider === 'gemini') aiSettings.value.model = 'gemini-3.8-flash'
  if (provider === 'openai') aiSettings.value.model = 'gpt-4o-mini'
  if (provider === 'anthropic') aiSettings.value.model = 'claude-3-5-sonnet-latest'
  if (provider === 'ollama') aiSettings.value.model = 'llama3.1'
}

async function runSingleAiCall(chunkText: string, chunkLabel: string, count: number, includePdfBinary: boolean) {
  const res = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: chunkText,
      pdfBase64: includePdfBinary && aiSettings.value.provider === 'gemini' ? extractedPdfBase64.value : undefined,
      fileName: chunkLabel,
      provider: aiSettings.value.provider,
      apiKey: getActiveApiKey(),
      model: aiSettings.value.model,
      ollamaUrl: aiSettings.value.ollamaUrl,
      questionCount: count,
      focusAreas: focusAreas.value
    })
  }).catch(() => null)

  if (res && res.ok) {
    return await res.json()
  }

  return await generateQuestionsInBrowser({
    text: chunkText,
    pdfBase64: includePdfBinary && aiSettings.value.provider === 'gemini' ? extractedPdfBase64.value : undefined,
    fileName: chunkLabel,
    provider: aiSettings.value.provider,
    apiKey: getActiveApiKey(),
    model: aiSettings.value.model,
    questionCount: count,
    focusAreas: focusAreas.value
  })
}

async function generateQuestionsFromContent() {
  if (!extractedText.value.trim() && !extractedPdfBase64.value) {
    errorMessage.value = 'Bitte lade zuerst eine PDF hoch oder füge Lerntext in das Textfeld ein.'
    return
  }

  errorMessage.value = null
  successMessage.value = null
  isGenerating.value = true
  batchProgressText.value = ''
  batchProgressPercent.value = 0

  try {
    // Fall A: Große PDF mit aktiviertem Tiefen-Modus (Seiten-Chunking in 10er-Blöcken)
    const activePages = extractedPages.value.filter(
      (p) => p.pageNumber >= pageFrom.value && p.pageNumber <= pageTo.value
    )

    if (useDeepChunking.value && activePages.length > pagesPerChunk.value) {
      const chunks: ExtractedPage[][] = []
      for (let i = 0; i < activePages.length; i += pagesPerChunk.value) {
        chunks.push(activePages.slice(i, i + pagesPerChunk.value))
      }

      const allCombinedQuestions: any[] = []
      const allCombinedSummary: string[] = []
      let mainTitle = extractedFileName.value.replace(/\.pdf$/i, '') || 'Großes PDF-Skript'
      let mainDescription = ''

      for (let idx = 0; idx < chunks.length; idx++) {
        const chunk = chunks[idx]
        const startP = chunk[0].pageNumber
        const endP = chunk[chunk.length - 1].pageNumber
        batchProgressText.value = `Analysiere Abschnitt ${idx + 1} von ${chunks.length} (Seite ${startP} bis ${endP})...`
        batchProgressPercent.value = Math.round(((idx + 0.2) / chunks.length) * 100)

        const chunkText = chunk.map((p) => `--- Seite ${p.pageNumber} ---\n${p.text}`).join('\n\n')
        const chunkResult = await runSingleAiCall(
          chunkText,
          `${extractedFileName.value} (S. ${startP}-${endP})`,
          questionCount.value,
          false // Bei Seiten-Blöcken nutzen wir den exakten Seitentext des jeweiligen Abschnitts
        )

        if (idx === 0 && chunkResult?.deckTitle) {
          mainTitle = chunkResult.deckTitle
          mainDescription = chunkResult.deckDescription || ''
        }
        if (Array.isArray(chunkResult?.summaryPoints)) {
          allCombinedSummary.push(...chunkResult.summaryPoints)
        }
        if (Array.isArray(chunkResult?.questions)) {
          const taggedQuestions = chunkResult.questions.map((q: any) => ({
            ...q,
            lawReference: q.lawReference ? `${q.lawReference} (S. ${startP}–${endP})` : `Skript S. ${startP}–${endP}`
          }))
          allCombinedQuestions.push(...taggedQuestions)
        }

        batchProgressPercent.value = Math.round(((idx + 1) / chunks.length) * 100)
      }

      if (allCombinedQuestions.length === 0) {
        throw new Error('Die KI konnte keine Fragen aus den Abschnitten generieren.')
      }

      const createdDeck = await addGeneratedDeck({
        deckTitle: `${mainTitle} (S. ${pageFrom.value}–${pageTo.value})`,
        deckDescription:
          mainDescription ||
          `Tiefen-Analyse aus ${activePages.length} Seiten (${chunks.length} Abschnitte) mit insgesamt ${allCombinedQuestions.length} Fragen.`,
        sourceFileName: `${extractedFileName.value} (S. ${pageFrom.value}–${pageTo.value})`,
        summaryPoints: allCombinedSummary.slice(0, 20),
        questions: allCombinedQuestions
      })

      successMessage.value = `Stark! Aus allen ${activePages.length} Seiten (${chunks.length} Abschnitte) wurde das Deck „${createdDeck.title}“ mit insgesamt ${allCombinedQuestions.length} tiefgehenden Prüfungsfragen & Karteikarten erstellt!`
      return
    }

    // Fall B: Standard-Modus (einzelner Durchlauf)
    batchProgressText.value = 'KI analysiert das Dokument und erstellt Prüfungsfragen...'
    batchProgressPercent.value = 50

    const data = await runSingleAiCall(
      extractedText.value,
      extractedFileName.value || 'Eigenes Skript',
      questionCount.value,
      totalPages.value <= 20
    )

    if (!Array.isArray(data?.questions) || data.questions.length === 0) {
      throw new Error('Die KI hat keine gültigen Fragen zurückgegeben. Bitte versuche es erneut.')
    }

    const createdDeck = await addGeneratedDeck({
      deckTitle: data.deckTitle || extractedFileName.value.replace(/\.pdf$/i, '') || 'Neues PDF-Lernset',
      deckDescription: data.deckDescription || `Generiert aus ${extractedFileName.value || 'Text-Eingabe'}`,
      sourceFileName: extractedFileName.value || 'Manuelle Eingabe',
      summaryPoints: Array.isArray(data.summaryPoints) ? data.summaryPoints : [],
      questions: data.questions
    })

    successMessage.value = `Erfolgreich! Das Deck „${createdDeck.title}“ mit ${data.questions.length} Prüfungsfragen & Karteikarten wurde erstellt.`
  } catch (err: any) {
    errorMessage.value = err?.message || 'Fehler bei der Fragengenerierung.'
    showApiConfig.value = true
  } finally {
    isGenerating.value = false
    batchProgressText.value = ''
    batchProgressPercent.value = 0
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Top Info & API Key Configuration -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-amber-400">PDF-zu-Prüfungsfragen Generator</span>
          <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
            <Sparkles class="w-6 h-6 text-amber-400" />
            Neue Skripte & PDFs hochladen (auch 45+ Seiten!)
          </h2>
          <p class="text-sm text-slate-400 max-w-2xl">
            Lade beliebige PDF-Skripte aus der MTR-Ausbildung hoch. Bei großen Skripten (z. B. 45 Seiten) teilt der automatische <strong>Tiefen-Modus</strong> das Dokument in 10-Seiten-Abschnitte auf, damit keine einzige Seite übersprungen wird!
          </p>
        </div>

        <button
          type="button"
          @click="showApiConfig = !showApiConfig"
          class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
        >
          <KeyRound class="w-4 h-4 text-amber-400" />
          <span>KI-Modell & API-Key ({{ aiSettings.provider.toUpperCase() }})</span>
        </button>
      </div>

      <!-- Collapsible AI Settings Panel -->
      <div v-if="showApiConfig" class="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="p in (['gemini', 'openai', 'anthropic', 'ollama'] as const)"
            :key="p"
            type="button"
            @click="updateProviderModel(p)"
            class="px-3.5 py-2 rounded-xl text-xs font-bold border transition"
            :class="
              aiSettings.provider === p
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            "
          >
            {{
              p === 'gemini'
                ? 'Google Gemini (Empfohlen für PDFs)'
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
            <label class="text-xs font-semibold text-slate-300">Google Gemini API-Key (oder in Netlify als VITE_GEMINI_API_KEY)</label>
            <input
              v-model="aiSettings.geminiKey"
              type="password"
              placeholder="AIzaSy..."
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div v-if="aiSettings.provider === 'openai'" class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-300">OpenAI API-Key (oder in Netlify als VITE_OPENAI_API_KEY)</label>
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

      <!-- PDF Dropzone -->
      <label
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        class="block border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all"
        :class="
          isDragging
            ? 'border-amber-400 bg-amber-500/10'
            : 'border-slate-700 hover:border-amber-500/60 bg-slate-950/50'
        "
      >
        <input type="file" accept="application/pdf,.txt,.md" class="hidden" @change="handleFileSelect" />
        <div class="space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Loader2 v-if="isExtracting" class="w-7 h-7 text-amber-400 animate-spin" />
            <Upload v-else class="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <div class="text-base font-bold text-white">
              {{ isExtracting ? 'PDF wird gelesen und analysiert...' : 'PDF-Skript hierher ziehen oder antippen zum Auswählen' }}
            </div>
            <div class="text-xs text-slate-400 mt-1">
              Egal ob 5 Seiten oder 60 Seiten – alle Seiten werden direkt ausgelesen
            </div>
          </div>
          <div v-if="extractedFileName" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <FileText class="w-4 h-4" />
            <span>{{ extractedFileName }} ({{ totalPages }} Seiten erkannt)</span>
          </div>
        </div>
      </label>

      <!-- Multi-Page Range & Smart Chunking Controls (Visible when PDF has multiple pages) -->
      <div
        v-if="totalPages > 1"
        class="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-5 space-y-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-0.5">
            <div class="text-sm font-bold text-white flex items-center gap-2">
              <Layers class="w-4 h-4 text-amber-400" />
              <span>Seiten-Auswahl & Tiefen-Modus ({{ totalPages }} Seiten erkannt)</span>
            </div>
            <p class="text-xs text-slate-400">
              Du kannst entweder das gesamte Skript oder nur bestimmte Seiten (z. B. Seite 1–15) auswählen.
            </p>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-400">Von Seite</span>
            <input
              v-model.number="pageFrom"
              @change="updateSelectedPagesText"
              type="number"
              min="1"
              :max="totalPages"
              class="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center font-bold text-white"
            />
            <span class="text-slate-400">bis</span>
            <input
              v-model.number="pageTo"
              @change="updateSelectedPagesText"
              type="number"
              :min="pageFrom"
              :max="totalPages"
              class="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center font-bold text-white"
            />
          </div>
        </div>

        <label class="flex items-start gap-3 cursor-pointer select-none pt-2 border-t border-slate-800/80">
          <input
            type="checkbox"
            v-model="useDeepChunking"
            class="accent-amber-500 rounded mt-1"
          />
          <div class="text-xs space-y-0.5">
            <div class="font-bold text-amber-300">
              Tiefen-Modus für große PDFs aktivieren (Automatisch in {{ pagesPerChunk }}-Seiten-Blöcken analysieren)
            </div>
            <div class="text-slate-400">
              Verhindert, dass die KI bei {{ selectedPageCount }} Seiten Details überspringt: Das Skript wird in
              <strong class="text-white">{{ estimatedChunks }} Abschnitten</strong> analysiert und erzeugt ca.
              <strong class="text-emerald-400">{{ estimatedChunks * questionCount }} detaillierte Prüfungsfragen</strong>.
            </div>
          </div>
        </label>
      </div>

      <!-- Extracted Text Preview / Direct Paste Area -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-400">
            Extrahierter PDF-Text / Oder eigenen Lerntext direkt einfügen:
          </label>
          <span v-if="extractedText" class="text-xs text-slate-500">
            {{ extractedText.length.toLocaleString('de-DE') }} Zeichen ({{ selectedPageCount || 1 }} Seiten)
          </span>
        </div>
        <textarea
          v-model="extractedText"
          rows="6"
          placeholder="Nach dem PDF-Upload erscheint hier der gesamte erkannte Text (du kannst hier auch direkt beliebige Abschnitte aus Word/PDF reinkopieren)..."
          class="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
        />
      </div>

      <!-- Generation Options -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-300">
            {{ estimatedChunks > 1 ? `Fragen pro ${pagesPerChunk}-Seiten-Block` : 'Anzahl zu generierender Fragen' }}
          </label>
          <select
            v-model.number="questionCount"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option :value="10">10 Fragen {{ estimatedChunks > 1 ? `(Gesamt ~${10 * estimatedChunks})` : '' }}</option>
            <option :value="15">15 Fragen {{ estimatedChunks > 1 ? `(Gesamt ~${15 * estimatedChunks})` : '(Empfohlen)' }}</option>
            <option :value="20">20 Fragen {{ estimatedChunks > 1 ? `(Gesamt ~${20 * estimatedChunks})` : '' }}</option>
          </select>
        </div>

        <div class="space-y-1.5 sm:col-span-2">
          <label class="text-xs font-semibold text-slate-300">Optionaler Schwerpunkt / Wunsch an die KI</label>
          <input
            v-model="focusAreas"
            type="text"
            placeholder="z.B. Fokus auf Grenzwerte, Fristen, Rechenaufgaben und Fallbeispiele fürs Examen..."
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <!-- Live Batch Progress Bar -->
      <div v-if="isGenerating && batchProgressText" class="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 space-y-2">
        <div class="flex items-center justify-between text-xs font-bold text-amber-300">
          <span class="flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin" />
            {{ batchProgressText }}
          </span>
          <span>{{ batchProgressPercent }}%</span>
        </div>
        <div class="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
            :style="{ width: `${batchProgressPercent}%` }"
          />
        </div>
      </div>

      <!-- Alerts -->
      <div
        v-if="errorMessage"
        class="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3"
      >
        <AlertCircle class="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>{{ errorMessage }}</div>
      </div>

      <div
        v-if="successMessage"
        class="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-sm flex items-start gap-3"
      >
        <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>{{ successMessage }}</div>
      </div>

      <!-- Generate Action Button -->
      <div class="flex justify-end">
        <button
          type="button"
          @click="generateQuestionsFromContent"
          :disabled="isGenerating || isExtracting"
          class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-extrabold text-sm transition flex items-center gap-2.5 shadow-xl shadow-amber-500/20"
        >
          <Loader2 v-if="isGenerating" class="w-5 h-5 animate-spin" />
          <Sparkles v-else class="w-5 h-5" />
          <span>
            {{
              isGenerating
                ? 'KI arbeitet...'
                : estimatedChunks > 1
                  ? `Tiefen-Analyse starten (~${estimatedChunks * questionCount} Fragen aus ${selectedPageCount} Seiten)`
                  : `${questionCount} Prüfungsfragen & Karteikarten generieren`
            }}
          </span>
        </button>
      </div>
    </div>

    <!-- Custom Generated Decks List -->
    <div v-if="customDecks.length > 0" class="space-y-4">
      <h3 class="text-base font-bold text-white">Deine selbst generierten PDF-Decks ({{ customDecks.length }})</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="deck in customDecks"
          :key="deck.id"
          class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-4"
        >
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
                {{ getDeckQuestions(deck.id).length }} Fragen
              </span>
              <span class="text-xs text-slate-500">{{ deck.createdAt }}</span>
            </div>
            <h4 class="font-bold text-white text-base">{{ deck.title }}</h4>
            <p class="text-xs text-slate-400">{{ deck.description }}</p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              @click="emit('openDeck', deck.id)"
              class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Play class="w-3.5 h-3.5" />
              Üben
            </button>
            <button
              type="button"
              @click="deleteCustomDeck(deck.id)"
              class="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
              title="Deck löschen"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
