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
  Layers,
  Image as ImageIcon,
  Folder,
  Plus,
  Camera,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  FileStack
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

const {
  aiSettings,
  folders,
  addFolder,
  customDecks,
  getDeckQuestions,
  addGeneratedDeck,
  deleteCustomDeck,
  moveDeckToFolder
} = useStudyStore()

export interface QueueItem {
  id: string
  file: File
  name: string
  size: number
  type: 'image' | 'pdf' | 'text'
  previewUrl?: string
  base64?: string
  mimeType?: string
  extractedText?: string
  extractedPages?: ExtractedPage[]
  totalPages?: number
  status: 'pending' | 'extracting' | 'ready' | 'processing' | 'done' | 'error'
  error?: string
  generatedQuestionsCount?: number
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadQueue = ref<QueueItem[]>([])
const mergeIntoSingleDeck = ref<boolean>(true)
const batchDeckTitle = ref<string>('')
const batchQuestionsPerFile = ref<number>(6)

const isDragging = ref(false)
const isExtracting = ref(false)
const isGenerating = ref(false)
const batchProgressText = ref<string>('')
const batchProgressPercent = ref<number>(0)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const manualText = ref<string>('')
const selectedFolderId = ref<string>('nuklearmedizin')
const showNewFolderInput = ref(false)
const newFolderName = ref('')

// Single PDF Deep Chunking controls (when exactly 1 multi-page PDF is in queue)
const pageFrom = ref<number>(1)
const pageTo = ref<number>(1)
const useDeepChunking = ref<boolean>(false)
const pagesPerChunk = ref<number>(10)

const questionCount = ref<number>(15)
const focusAreas = ref<string>('')
const showApiConfig = ref<boolean>(false)

const singlePdfItem = computed(() => {
  if (uploadQueue.value.length === 1 && uploadQueue.value[0].type === 'pdf') {
    return uploadQueue.value[0]
  }
  return null
})

const selectedPageCount = computed(() => Math.max(0, pageTo.value - pageFrom.value + 1))
const estimatedChunks = computed(() =>
  useDeepChunking.value && selectedPageCount.value > pagesPerChunk.value
    ? Math.ceil(selectedPageCount.value / pagesPerChunk.value)
    : 1
)

const totalReadyQuestionsEstimate = computed(() => {
  if (uploadQueue.value.length === 0) return questionCount.value
  if (singlePdfItem.value && useDeepChunking.value && estimatedChunks.value > 1) {
    return estimatedChunks.value * questionCount.value
  }
  if (uploadQueue.value.length > 1) {
    return uploadQueue.value.length * batchQuestionsPerFile.value
  }
  return questionCount.value
})

function handleCreateNewFolder() {
  if (!newFolderName.value.trim()) return
  const created = addFolder({ name: newFolderName.value.trim() })
  selectedFolderId.value = created.id
  newFolderName.value = ''
  showNewFolderInput.value = false
}

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function extractItemData(item: QueueItem) {
  try {
    if (item.type === 'image') {
      item.base64 = await fileToBase64(item.file)
      item.extractedText = `[Foto/Buchseite: ${item.name}]`
      item.status = 'ready'
    } else if (item.type === 'pdf') {
      if (item.file.size < 12 * 1024 * 1024) {
        item.base64 = await fileToBase64(item.file)
      }
      const parsed = await extractPdfInBrowser(item.file)
      item.extractedText = parsed.fullText
      item.extractedPages = parsed.pages
      item.totalPages = parsed.totalPages
      item.status = 'ready'

      if (uploadQueue.value.length === 1) {
        pageFrom.value = 1
        pageTo.value = parsed.totalPages
        useDeepChunking.value = parsed.totalPages > 12
      }
    } else {
      item.extractedText = await item.file.text()
      item.status = 'ready'
    }
  } catch (err: any) {
    console.error('Extraktionsfehler:', err)
    item.status = 'error'
    item.error = err?.message || 'Fehler beim Extrahieren'
  }
}

async function handleIncomingFiles(fileList: FileList | File[]) {
  const incoming = Array.from(fileList)
  if (!incoming.length) return

  errorMessage.value = null
  successMessage.value = null
  isExtracting.value = true

  for (const file of incoming) {
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|gif)$/i.test(file.name)
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)

    const item: QueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      name: file.name,
      size: file.size,
      type: isImage ? 'image' : isPdf ? 'pdf' : 'text',
      status: 'extracting',
      totalPages: 1
    }

    if (isImage) {
      item.previewUrl = URL.createObjectURL(file)
      item.mimeType = file.type || 'image/jpeg'
    }

    uploadQueue.value.push(item)
    // Run extraction in background
    extractItemData(item)
  }

  isExtracting.value = false

  // Auto-suggest deck title if empty
  if (!batchDeckTitle.value.trim() && uploadQueue.value.length > 0) {
    const firstCleanName = uploadQueue.value[0].name.replace(/\.[^/.]+$/, '')
    if (uploadQueue.value.length > 1) {
      batchDeckTitle.value = `${firstCleanName} & weitere (${uploadQueue.value.length} Seiten)`
    } else {
      batchDeckTitle.value = firstCleanName
    }
  }
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    await handleIncomingFiles(input.files)
  }
  // reset input so the same files can be re-selected if desired
  input.value = ''
}

async function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files?.length) {
    await handleIncomingFiles(event.dataTransfer.files)
  }
}

function moveQueueItem(index: number, direction: 'up' | 'down') {
  if (direction === 'up' && index > 0) {
    const item = uploadQueue.value[index]
    uploadQueue.value.splice(index, 1)
    uploadQueue.value.splice(index - 1, 0, item)
  } else if (direction === 'down' && index < uploadQueue.value.length - 1) {
    const item = uploadQueue.value[index]
    uploadQueue.value.splice(index, 1)
    uploadQueue.value.splice(index + 1, 0, item)
  }
}

function removeQueueItem(id: string) {
  const idx = uploadQueue.value.findIndex((item) => item.id === id)
  if (idx !== -1) {
    const item = uploadQueue.value[idx]
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
    uploadQueue.value.splice(idx, 1)
  }
  if (uploadQueue.value.length === 0) {
    batchDeckTitle.value = ''
  }
}

function clearQueue() {
  uploadQueue.value.forEach((item) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
  })
  uploadQueue.value = []
  batchDeckTitle.value = ''
  errorMessage.value = null
  successMessage.value = null
}

function updateSelectedPagesText() {
  if (!singlePdfItem.value?.extractedPages) return
  const pages = singlePdfItem.value.extractedPages
  const max = singlePdfItem.value.totalPages || 1
  const from = Math.max(1, Math.min(pageFrom.value, max))
  const to = Math.max(from, Math.min(pageTo.value, max))
  pageFrom.value = from
  pageTo.value = to

  const slice = pages.filter((p) => p.pageNumber >= from && p.pageNumber <= to)
  singlePdfItem.value.extractedText = slice.map((p) => `--- Seite ${p.pageNumber} ---\n${p.text}`).join('\n\n')
}

const isLocalDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

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

async function runSingleAiCall(
  chunkText: string,
  chunkLabel: string,
  count: number,
  options?: {
    pdfBase64?: string
    imageBase64?: string
    imageMimeType?: string
  }
) {
  if (isLocalDev) {
    const res = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: chunkText,
        pdfBase64: options?.pdfBase64 && aiSettings.value.provider === 'gemini' ? options.pdfBase64 : undefined,
        imageBase64: options?.imageBase64,
        imageMimeType: options?.imageMimeType || 'image/jpeg',
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
  }

  return await generateQuestionsInBrowser({
    text: chunkText,
    pdfBase64: options?.pdfBase64 && aiSettings.value.provider === 'gemini' ? options.pdfBase64 : undefined,
    imageBase64: options?.imageBase64,
    imageMimeType: options?.imageMimeType || 'image/jpeg',
    fileName: chunkLabel,
    provider: aiSettings.value.provider,
    apiKey: getActiveApiKey(),
    model: aiSettings.value.model,
    questionCount: count,
    focusAreas: focusAreas.value,
    onStatusUpdate: (msg) => {
      batchProgressText.value = msg
    }
  })
}

async function startBatchProcessing() {
  if (uploadQueue.value.length === 0 && !manualText.value.trim()) {
    errorMessage.value = 'Bitte lade mindestens ein Dokument / Buchfoto hoch oder gib einen Lerntext ein.'
    return
  }

  // Check if any queue item is still extracting
  if (uploadQueue.value.some((it) => it.status === 'extracting')) {
    errorMessage.value = 'Bitte warte einen Moment, bis alle Dateien eingelesen sind.'
    return
  }

  errorMessage.value = null
  successMessage.value = null
  isGenerating.value = true
  batchProgressText.value = ''
  batchProgressPercent.value = 0

  // Fall A: Reiner manueller Text ohne Dateien
  if (uploadQueue.value.length === 0 && manualText.value.trim()) {
    try {
      batchProgressText.value = 'KI analysiert den Lerntext...'
      batchProgressPercent.value = 40
      const data = await runSingleAiCall(
        manualText.value,
        'Manuelle Notizen',
        questionCount.value
      )
      if (!Array.isArray(data?.questions) || data.questions.length === 0) {
        throw new Error('Die KI konnte keine Fragen aus dem Text generieren.')
      }
      const deck = await addGeneratedDeck({
        deckTitle: batchDeckTitle.value.trim() || data.deckTitle || 'Neues Lernset',
        deckDescription: data.deckDescription || 'Generiert aus manuellem Lerntext',
        folderId: selectedFolderId.value,
        sourceFileName: 'Manuelle Eingabe',
        summaryPoints: Array.isArray(data.summaryPoints) ? data.summaryPoints : [],
        questions: data.questions
      })
      successMessage.value = `Erfolgreich! Deck „${deck.title}“ mit ${data.questions.length} Fragen erstellt.`
    } catch (err: any) {
      errorMessage.value = err?.message || 'Fehler bei der Generierung.'
      showApiConfig.value = true
    } finally {
      isGenerating.value = false
      batchProgressText.value = ''
      batchProgressPercent.value = 0
    }
    return
  }

  // Fall B: Genau 1 PDF mit aktiviertem Tiefen-Modus (Seiten-Chunking)
  if (
    singlePdfItem.value &&
    useDeepChunking.value &&
    (singlePdfItem.value.extractedPages?.length || 0) > pagesPerChunk.value
  ) {
    const item = singlePdfItem.value
    item.status = 'processing'

    try {
      const activePages = (item.extractedPages || []).filter(
        (p) => p.pageNumber >= pageFrom.value && p.pageNumber <= pageTo.value
      )
      const chunks: ExtractedPage[][] = []
      for (let i = 0; i < activePages.length; i += pagesPerChunk.value) {
        chunks.push(activePages.slice(i, i + pagesPerChunk.value))
      }

      const allCombinedQuestions: any[] = []
      const allCombinedSummary: string[] = []
      let mainTitle = batchDeckTitle.value.trim() || item.name.replace(/\.pdf$/i, '') || 'Großes PDF-Skript'
      let mainDescription = ''

      for (let idx = 0; idx < chunks.length; idx++) {
        const chunk = chunks[idx]
        const startP = chunk[0].pageNumber
        const endP = chunk[chunk.length - 1].pageNumber
        batchProgressText.value = `Abschnitt ${idx + 1} von ${chunks.length}: Seite ${startP} bis ${endP}...`
        batchProgressPercent.value = Math.round(((idx + 0.2) / chunks.length) * 100)

        const chunkText = chunk.map((p) => `--- Seite ${p.pageNumber} ---\n${p.text}`).join('\n\n')
        try {
          const chunkResult = await runSingleAiCall(
            chunkText,
            `${item.name} (S. ${startP}-${endP})`,
            questionCount.value,
            { pdfBase64: undefined }
          )

          if (idx === 0 && chunkResult?.deckTitle && !batchDeckTitle.value.trim()) {
            mainTitle = chunkResult.deckTitle
            mainDescription = chunkResult.deckDescription || ''
          }
          if (Array.isArray(chunkResult?.summaryPoints)) {
            allCombinedSummary.push(...chunkResult.summaryPoints)
          }
          if (Array.isArray(chunkResult?.questions)) {
            const tagged = chunkResult.questions.map((q: any) => ({
              ...q,
              lawReference: q.lawReference ? `${q.lawReference} (S. ${startP}–${endP})` : `Skript S. ${startP}–${endP}`
            }))
            allCombinedQuestions.push(...tagged)
          }
        } catch (chunkErr) {
          console.warn(`Abschnitt ${startP}-${endP} übersprungen:`, chunkErr)
        }

        if (idx < chunks.length - 1) {
          await new Promise((r) => setTimeout(r, 1200))
        }
      }

      if (allCombinedQuestions.length === 0) {
        throw new Error('Die KI konnte aus den Abschnitten keine Fragen generieren.')
      }

      const createdDeck = await addGeneratedDeck({
        deckTitle: `${mainTitle} (S. ${pageFrom.value}–${pageTo.value})`,
        deckDescription:
          mainDescription ||
          `Tiefen-Analyse aus ${activePages.length} Seiten (${chunks.length} Abschnitte) mit ${allCombinedQuestions.length} Fragen.`,
        folderId: selectedFolderId.value,
        sourceFileName: `${item.name} (S. ${pageFrom.value}–${pageTo.value})`,
        summaryPoints: allCombinedSummary.slice(0, 20),
        questions: allCombinedQuestions
      })

      item.status = 'done'
      item.generatedQuestionsCount = allCombinedQuestions.length
      successMessage.value = `Stark! Aus allen ${activePages.length} Seiten wurde das Deck „${createdDeck.title}“ mit ${allCombinedQuestions.length} Prüfungsfragen & Karteikarten erstellt!`
    } catch (err: any) {
      item.status = 'error'
      item.error = err?.message
      errorMessage.value = err?.message || 'Fehler beim Verarbeiten des PDFs.'
      showApiConfig.value = true
    } finally {
      isGenerating.value = false
      batchProgressText.value = ''
      batchProgressPercent.value = 0
    }
    return
  }

  // Fall C: Multi-File Batch Queue (Schritt-für-Schritt Verarbeitung)
  const itemsToProcess = uploadQueue.value.filter((it) => it.status !== 'done')
  const totalCount = itemsToProcess.length
  if (totalCount === 0) {
    successMessage.value = 'Alle Dateien in der Warteschlange wurden bereits verarbeitet.'
    isGenerating.value = false
    return
  }

  const allCombinedQuestions: any[] = []
  const allCombinedSummary: string[] = []
  let defaultTitle =
    batchDeckTitle.value.trim() ||
    `${uploadQueue.value[0].name.replace(/\.[^/.]+$/, '')}${uploadQueue.value.length > 1 ? ` (${uploadQueue.value.length} Seiten)` : ''}`
  let defaultDescription = ''
  let processedSuccessfully = 0

  for (let i = 0; i < totalCount; i++) {
    const item = itemsToProcess[i]
    item.status = 'processing'
    item.error = undefined

    const pageNum = i + 1
    batchProgressText.value = `Verarbeite Datei ${pageNum} von ${totalCount}: „${item.name}“...`
    batchProgressPercent.value = Math.round(((i + 0.1) / totalCount) * 100)

    try {
      const perFileQuestions =
        uploadQueue.value.length > 1 ? batchQuestionsPerFile.value : questionCount.value

      const data = await runSingleAiCall(
        item.extractedText || `[Datei: ${item.name}]`,
        item.name,
        perFileQuestions,
        {
          imageBase64: item.type === 'image' ? item.base64 : undefined,
          imageMimeType: item.mimeType || 'image/jpeg',
          pdfBase64: item.type === 'pdf' && (item.totalPages || 1) <= 15 ? item.base64 : undefined
        }
      )

      if (!Array.isArray(data?.questions) || data.questions.length === 0) {
        throw new Error('Keine Fragen von der KI erhalten.')
      }

      item.status = 'done'
      item.generatedQuestionsCount = data.questions.length
      processedSuccessfully++

      const cleanFileName = item.name.replace(/\.[^/.]+$/, '')
      const taggedQuestions = data.questions.map((q: any) => ({
        ...q,
        lawReference: q.lawReference ? `${q.lawReference} (${cleanFileName})` : cleanFileName
      }))

      if (mergeIntoSingleDeck.value) {
        allCombinedQuestions.push(...taggedQuestions)
        if (Array.isArray(data.summaryPoints)) {
          allCombinedSummary.push(...data.summaryPoints)
        }
        if (!defaultDescription && data.deckDescription) {
          defaultDescription = data.deckDescription
        }
      } else {
        await addGeneratedDeck({
          deckTitle: data.deckTitle || cleanFileName,
          deckDescription: data.deckDescription || `Generiert aus ${item.name}`,
          folderId: selectedFolderId.value,
          sourceFileName: item.name,
          summaryPoints: Array.isArray(data.summaryPoints) ? data.summaryPoints : [],
          questions: taggedQuestions
        })
      }
    } catch (err: any) {
      console.error(`Fehler bei Datei ${item.name}:`, err)
      item.status = 'error'
      item.error = err?.message || 'Fehler bei der KI-Analyse'
    }

    batchProgressPercent.value = Math.round(((i + 1) / totalCount) * 100)

    // Schutz vor Google Gemini 503/429 Überlastung: 1.2s Pause zwischen Requests
    if (i < totalCount - 1) {
      batchProgressText.value = `Kurze Pause vor nächster Datei (Schutz vor Server-Überlastung)...`
      await new Promise((r) => setTimeout(r, 1200))
    }
  }

  if (mergeIntoSingleDeck.value && allCombinedQuestions.length > 0) {
    const finalDeck = await addGeneratedDeck({
      deckTitle: defaultTitle,
      deckDescription:
        defaultDescription ||
        `Gemeinsames Deck aus ${processedSuccessfully} Seiten mit insgesamt ${allCombinedQuestions.length} Fragen & Flashcards.`,
      folderId: selectedFolderId.value,
      sourceFileName: `${processedSuccessfully} Dokumente/Buchseiten`,
      summaryPoints: allCombinedSummary.slice(0, 25),
      questions: allCombinedQuestions
    })

    successMessage.value = `🎉 Genial! Alle ${processedSuccessfully} Seiten wurden zusammengefasst in das neue Deck „${finalDeck.title}“ mit insgesamt ${allCombinedQuestions.length} Prüfungsfragen & Karteikarten!`
  } else if (!mergeIntoSingleDeck.value && processedSuccessfully > 0) {
    successMessage.value = `🎉 Fertig! ${processedSuccessfully} separate Decks wurden erfolgreich im Ordner erstellt.`
  } else if (processedSuccessfully === 0) {
    errorMessage.value = 'Keine der Dateien konnte erfolgreich verarbeitet werden. Bitte prüfe deinen API-Key.'
    showApiConfig.value = true
  }

  isGenerating.value = false
  batchProgressText.value = ''
  batchProgressPercent.value = 0
}
</script>

<template>
  <div class="space-y-8">
    <!-- Top Info & API Key Configuration -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-amber-400">PDF- & Foto-Generator</span>
          <h2 class="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Sparkles class="w-6 h-6 text-amber-400 shrink-0" />
            <span>Skripte & Buchfotos hochladen</span>
          </h2>
          <p class="text-sm text-slate-400 max-w-2xl">
            Lade <strong>mehrere Buchseiten oder PDFs gleichzeitig</strong> hoch (z.&thinsp;B. 5 Fotos eines Kapitels). Die KI analysiert sie nacheinander Stück für Stück und erstellt auf Wunsch <strong>ein gemeinsames umfassendes Deck</strong>!
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

      <!-- Hidden Multi-File Input -->
      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="application/pdf,image/*,.txt,.md"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Drag & Drop Zone -->
      <label
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInputRef?.click()"
        class="block border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all"
        :class="
          isDragging
            ? 'border-amber-400 bg-amber-500/10'
            : uploadQueue.length > 0
              ? 'border-slate-800 hover:border-amber-500/50 bg-slate-950/30'
              : 'border-slate-700 hover:border-amber-500/60 bg-slate-950/50'
        "
      >
        <div class="space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Loader2 v-if="isExtracting" class="w-7 h-7 text-amber-400 animate-spin" />
            <Camera v-else-if="uploadQueue.length > 0" class="w-7 h-7 text-amber-400" />
            <Upload v-else class="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <div class="text-base font-bold text-white">
              {{
                isExtracting
                  ? 'Dateien werden eingelesen...'
                  : uploadQueue.length > 0
                    ? '+ Weitere Buchfotos oder PDFs hinzufügen'
                    : 'Fotos von Buchseiten oder PDF-Skripte hierher ziehen'
              }}
            </div>
            <div class="text-xs text-slate-400 mt-1">
              Antippen zum Auswählen: <strong class="text-amber-300">Mehrfachauswahl möglich!</strong> Unterstützt Fotos (JPEG, PNG, HEIC) und PDFs.
            </div>
          </div>
        </div>
      </label>

      <!-- Multi-File Batch Queue List -->
      <div v-if="uploadQueue.length > 0" class="space-y-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div class="flex items-center gap-2">
            <FileStack class="w-5 h-5 text-amber-400 shrink-0" />
            <span class="text-sm font-bold text-white">
              Warteschlange ({{ uploadQueue.length }} {{ uploadQueue.length === 1 ? 'Datei' : 'Dateien / Seiten' }})
            </span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
              ≈ {{ totalReadyQuestionsEstimate }} Fragen
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="fileInputRef?.click()"
              class="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 transition font-medium"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>+ Mehr hinzufügen</span>
            </button>
            <button
              type="button"
              @click="clearQueue"
              class="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 transition"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Leeren</span>
            </button>
          </div>
        </div>

        <!-- Queue Cards List -->
        <div class="space-y-2">
          <div
            v-for="(item, idx) in uploadQueue"
            :key="item.id"
            class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/90 border transition"
            :class="
              item.status === 'processing'
                ? 'border-amber-500 shadow-md shadow-amber-500/10'
                : item.status === 'done'
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : item.status === 'error'
                    ? 'border-rose-500/50 bg-rose-950/10'
                    : 'border-slate-800'
            "
          >
            <!-- Order Number Badge -->
            <span class="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
              {{ idx + 1 }}
            </span>

            <!-- Image Thumbnail or Document Icon -->
            <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                v-if="item.previewUrl"
                :src="item.previewUrl"
                :alt="item.name"
                class="w-full h-full object-cover"
              />
              <FileText v-else-if="item.type === 'pdf'" class="w-6 h-6 text-rose-400" />
              <FileText v-else class="w-6 h-6 text-amber-400" />
            </div>

            <!-- Title & Status -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-xs sm:text-sm font-semibold text-white truncate" :title="item.name">
                  {{ item.name }}
                </p>
                <span v-if="item.type === 'pdf' && item.totalPages" class="text-[10px] text-slate-400 shrink-0">
                  ({{ item.totalPages }} S.)
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-2 mt-1">
                <span
                  v-if="item.status === 'extracting'"
                  class="text-[10px] text-amber-400 flex items-center gap-1 font-medium"
                >
                  <Loader2 class="w-3 h-3 animate-spin" />
                  Wird eingelesen...
                </span>
                <span
                  v-else-if="item.status === 'processing'"
                  class="text-[10px] text-amber-300 flex items-center gap-1 font-bold animate-pulse"
                >
                  <Loader2 class="w-3 h-3 animate-spin" />
                  KI analysiert Seite...
                </span>
                <span
                  v-else-if="item.status === 'done'"
                  class="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"
                >
                  <CheckCircle2 class="w-3 h-3" />
                  {{ item.generatedQuestionsCount }} Fragen erstellt
                </span>
                <span
                  v-else-if="item.status === 'error'"
                  class="text-[10px] text-rose-400 flex items-center gap-1 font-medium truncate"
                  :title="item.error"
                >
                  <AlertCircle class="w-3 h-3 shrink-0" />
                  {{ item.error || 'Fehler' }}
                </span>
                <span
                  v-else
                  class="text-[10px] text-slate-400 flex items-center gap-1"
                >
                  <Check class="w-3 h-3 text-emerald-400" />
                  Bereit
                </span>

                <span class="text-[10px] text-slate-500">
                  {{ formatFileSize(item.size) }}
                </span>
              </div>
            </div>

            <!-- Reorder & Delete Buttons -->
            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                :disabled="idx === 0 || isGenerating"
                @click="moveQueueItem(idx, 'up')"
                class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition"
                title="Nach oben verschieben"
              >
                <ChevronUp class="w-4 h-4" />
              </button>
              <button
                type="button"
                :disabled="idx === uploadQueue.length - 1 || isGenerating"
                @click="moveQueueItem(idx, 'down')"
                class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition"
                title="Nach unten verschieben"
              >
                <ChevronDown class="w-4 h-4" />
              </button>
              <button
                type="button"
                :disabled="isGenerating"
                @click="removeQueueItem(item.id)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-20 transition"
                title="Entfernen"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Merge Settings (if > 1 file) -->
        <div v-if="uploadQueue.length > 1" class="pt-3 border-t border-slate-800/80 space-y-3">
          <label class="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="mergeIntoSingleDeck"
              class="accent-amber-500 rounded mt-0.5"
            />
            <div class="text-xs space-y-0.5">
              <div class="font-bold text-amber-300">
                Alle {{ uploadQueue.length }} Seiten zu EINEM gemeinsamen Lernset zusammenfassen (Empfohlen)
              </div>
              <div class="text-slate-400">
                Optimal für Buchkapitel: Erstellt ein zusammenhängendes Prüfungsdeck mit insgesamt ca.
                <strong class="text-white">{{ totalReadyQuestionsEstimate }} Fragen</strong>, sortiert nach den Buchseiten.
              </div>
            </div>
          </label>

          <div v-if="mergeIntoSingleDeck" class="space-y-1">
            <label class="text-xs font-semibold text-slate-300">Name des gemeinsamen Decks:</label>
            <input
              v-model="batchDeckTitle"
              type="text"
              placeholder="z.B. Prinzipien der Nuklearmedizin (5 Seiten)..."
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      <!-- Single Multi-Page PDF Deep Chunking Controls -->
      <div
        v-if="singlePdfItem && (singlePdfItem.totalPages || 0) > 1"
        class="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-5 space-y-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-0.5">
            <div class="text-sm font-bold text-white flex items-center gap-2">
              <Layers class="w-4 h-4 text-amber-400" />
              <span>Seiten-Auswahl & Tiefen-Modus ({{ singlePdfItem.totalPages }} Seiten erkannt)</span>
            </div>
            <p class="text-xs text-slate-400">
              Wähle entweder das gesamte Skript oder nur bestimmte Seiten (z. B. Seite 1–15) aus.
            </p>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-400">Von Seite</span>
            <input
              v-model.number="pageFrom"
              @change="updateSelectedPagesText"
              type="number"
              min="1"
              :max="singlePdfItem.totalPages"
              class="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center font-bold text-white"
            />
            <span class="text-slate-400">bis</span>
            <input
              v-model.number="pageTo"
              @change="updateSelectedPagesText"
              type="number"
              :min="pageFrom"
              :max="singlePdfItem.totalPages"
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
              Tiefen-Modus für große PDFs aktivieren (In {{ pagesPerChunk }}-Seiten-Blöcken analysieren)
            </div>
            <div class="text-slate-400">
              Verhindert, dass die KI bei {{ selectedPageCount }} Seiten Details überspringt: Das Skript wird in
              <strong class="text-white">{{ estimatedChunks }} Abschnitten</strong> analysiert und erzeugt ca.
              <strong class="text-emerald-400">{{ estimatedChunks * questionCount }} detaillierte Prüfungsfragen</strong>.
            </div>
          </div>
        </label>
      </div>

      <!-- Optional Manual Text / Direct Paste Area (Visible when queue is empty) -->
      <div v-if="uploadQueue.length === 0" class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-400">
            Oder Text direkt aus Word/PDF hier reinkopieren:
          </label>
          <span v-if="manualText" class="text-xs text-slate-500">
            {{ manualText.length.toLocaleString('de-DE') }} Zeichen
          </span>
        </div>
        <textarea
          v-model="manualText"
          rows="4"
          placeholder="Hier kannst du auch Notizen, Zusammenfassungen oder Textpassagen aus beliebigen Quellen direkt einfügen..."
          class="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
        />
      </div>

      <!-- Generation Options (Folder & Questions Count) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <!-- Target Folder Selector -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <Folder class="w-3.5 h-3.5 text-amber-400" />
              Ziel-Themenordner:
            </span>
            <button
              type="button"
              @click="showNewFolderInput = !showNewFolderInput"
              class="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
            >
              <Plus class="w-3 h-3" />
              {{ showNewFolderInput ? 'Abbrechen' : 'Neuer Ordner' }}
            </button>
          </label>

          <div v-if="showNewFolderInput" class="flex gap-2">
            <input
              v-model="newFolderName"
              type="text"
              placeholder="z.B. Nuklearmedizin..."
              class="flex-1 bg-slate-950 border border-amber-500/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              @keyup.enter="handleCreateNewFolder"
            />
            <button
              type="button"
              @click="handleCreateNewFolder"
              class="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              OK
            </button>
          </div>

          <select
            v-else
            v-model="selectedFolderId"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option v-for="folder in folders" :key="folder.id" :value="folder.id">
              {{ folder.name }}
            </option>
          </select>
        </div>

        <!-- Questions Count Selector -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-300">
            {{ uploadQueue.length > 1 ? 'Fragen pro Buchseite / Datei' : 'Anzahl zu generierender Fragen' }}
          </label>
          <select
            v-if="uploadQueue.length > 1"
            v-model.number="batchQuestionsPerFile"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option :value="4">4 Fragen pro Seite (Kompakt)</option>
            <option :value="6">6 Fragen pro Seite (Empfohlen: ~{{ uploadQueue.length * 6 }} Fragen)</option>
            <option :value="8">8 Fragen pro Seite (~{{ uploadQueue.length * 8 }} Fragen)</option>
            <option :value="10">10 Fragen pro Seite (~{{ uploadQueue.length * 10 }} Fragen)</option>
          </select>
          <select
            v-else
            v-model.number="questionCount"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option :value="8">8 Fragen (Kompakt)</option>
            <option :value="12">12 Fragen</option>
            <option :value="15">15 Fragen (Empfohlen)</option>
            <option :value="20">20 Fragen</option>
          </select>
        </div>

        <!-- Optional Focus Areas -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-300">Optionaler KI-Fokus</label>
          <input
            v-model="focusAreas"
            type="text"
            placeholder="z.B. Schemata, Grenzwerte, Fallbeispiele..."
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <!-- Live Batch Progress Bar -->
      <div v-if="isGenerating && batchProgressText" class="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 space-y-2">
        <div class="flex items-center justify-between text-xs font-bold text-amber-300">
          <span class="flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin shrink-0" />
            <span class="truncate">{{ batchProgressText }}</span>
          </span>
          <span class="shrink-0 ml-2">{{ batchProgressPercent }}%</span>
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
          @click="startBatchProcessing"
          :disabled="isGenerating || isExtracting || (uploadQueue.length === 0 && !manualText.trim())"
          class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-extrabold text-sm transition flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20"
        >
          <Loader2 v-if="isGenerating" class="w-5 h-5 animate-spin" />
          <Sparkles v-else class="w-5 h-5" />
          <span>
            {{
              isGenerating
                ? 'KI verarbeitet stück für stück...'
                : uploadQueue.length > 1
                  ? `${uploadQueue.length} Seiten nacheinander verarbeiten (~${totalReadyQuestionsEstimate} Fragen)`
                  : singlePdfItem && estimatedChunks > 1
                    ? `Tiefen-Analyse starten (~${estimatedChunks * questionCount} Fragen aus ${selectedPageCount} Seiten)`
                    : `${questionCount} Prüfungsfragen & Karteikarten generieren`
            }}
          </span>
        </button>
      </div>
    </div>

    <!-- Custom Generated Decks List with Folder Tag -->
    <div v-if="customDecks.length > 0" class="space-y-4">
      <h3 class="text-base font-bold text-white">Deine selbst generierten Decks ({{ customDecks.length }})</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="deck in customDecks"
          :key="deck.id"
          class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-4"
        >
          <div class="space-y-2 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
                {{ getDeckQuestions(deck.id).length }} Fragen
              </span>
              <!-- Folder Badge with quick move dropdown -->
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-amber-300 border border-slate-700">
                <Folder class="w-3 h-3 text-amber-400" />
                <select
                  :value="deck.folderId || 'custom'"
                  @change="(e) => moveDeckToFolder(deck.id, (e.target as HTMLSelectElement).value)"
                  class="bg-transparent text-amber-300 text-xs focus:outline-none cursor-pointer"
                  title="In anderen Ordner verschieben"
                >
                  <option v-for="f in folders" :key="f.id" :value="f.id" class="bg-slate-900 text-white">
                    {{ f.name }}
                  </option>
                </select>
              </span>
              <span class="text-xs text-slate-500">{{ deck.createdAt }}</span>
            </div>
            <h4 class="font-bold text-white text-base leading-snug">{{ deck.title }}</h4>
            <p class="text-xs text-slate-400 line-clamp-2">{{ deck.description }}</p>
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
