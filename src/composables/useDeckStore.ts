import { ref, computed, watch } from 'vue'
import { INITIAL_DECKS, DEFAULT_FOLDERS } from '../data/initialData'
import type { StudyDeck, StudyFolder, Question } from '../types'
import { STORAGE_KEYS, loadJson } from '../services/storageKeys'

export function detectBestFolderForDeck(title: string, description = ''): string {
  const text = (title + ' ' + description).toLowerCase()
  if (
    text.includes('nuklear') ||
    text.includes('szinti') ||
    text.includes('spect') ||
    text.includes('pet') ||
    text.includes('radiopharm') ||
    text.includes('tracer')
  ) {
    return 'nuklearmedizin'
  }
  if (
    text.includes('röntgen') ||
    text.includes('roentgen') ||
    text.includes('thorax') ||
    text.includes('einstelltechnik') ||
    text.includes('belichtung') ||
    text.includes('aufnahme')
  ) {
    return 'roentgendiagnostik'
  }
  if (
    text.includes('therapie') ||
    text.includes('radioonk') ||
    text.includes('linearbeschleuniger') ||
    text.includes('linac') ||
    text.includes('bestrahl') ||
    text.includes('brachy')
  ) {
    return 'strahlentherapie'
  }
  if (
    text.includes('anatomie') ||
    text.includes('skelett') ||
    text.includes('knochen') ||
    text.includes('organ')
  ) {
    return 'anatomie'
  }
  if (
    text.includes('strahlenschutz') ||
    text.includes('strlsch') ||
    text.includes('dosis') ||
    text.includes('dosimetrie') ||
    text.includes('grenzwert') ||
    text.includes('gesetz') ||
    text.includes('alara')
  ) {
    return 'strahlenschutz'
  }
  return 'custom'
}

// Global state singleton
const rawLoadedFolders = loadJson<StudyFolder[]>(STORAGE_KEYS.FOLDERS, DEFAULT_FOLDERS)
const mergedFoldersMap = new Map<string, StudyFolder>()
for (const df of DEFAULT_FOLDERS) mergedFoldersMap.set(df.id, df)
for (const f of rawLoadedFolders) mergedFoldersMap.set(f.id, f)
const folders = ref<StudyFolder[]>(Array.from(mergedFoldersMap.values()))

const rawCustomDecks = loadJson<StudyDeck[]>(STORAGE_KEYS.CUSTOM_DECKS, [])
const migratedCustomDecks = rawCustomDecks.map((deck) => {
  if (!deck.folderId || deck.folderId === 'custom') {
    const detected = detectBestFolderForDeck(deck.title, deck.description)
    if (detected !== 'custom') {
      return { ...deck, folderId: detected }
    }
  }
  return deck
})
const customDecks = ref<StudyDeck[]>(migratedCustomDecks)
const deckFolderOverrides = ref<Record<string, string>>(loadJson(STORAGE_KEYS.DECK_FOLDER_OVERRIDES, {}))
const deckOrderList = ref<string[]>(loadJson(STORAGE_KEYS.DECK_ORDER, []))

watch(folders, (val) => localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(val)), { deep: true })
watch(customDecks, (val) => localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(val)), { deep: true })
watch(deckFolderOverrides, (val) => localStorage.setItem(STORAGE_KEYS.DECK_FOLDER_OVERRIDES, JSON.stringify(val)), { deep: true })
watch(deckOrderList, (val) => localStorage.setItem(STORAGE_KEYS.DECK_ORDER, JSON.stringify(val)), { deep: true })

export function useDeckStore() {
  const allDecks = computed<StudyDeck[]>(() => {
    const map = new Map<string, StudyDeck>()
    for (const d of INITIAL_DECKS) {
      const folderId = deckFolderOverrides.value[d.id] || d.folderId || 'strahlenschutz'
      map.set(d.id, { ...d, folderId })
    }
    for (const d of customDecks.value) {
      const folderId =
        deckFolderOverrides.value[d.id] ||
        d.folderId ||
        detectBestFolderForDeck(d.title, d.description)
      map.set(d.id, { ...d, folderId })
    }
    const list = Array.from(map.values())
    if (deckOrderList.value.length > 0) {
      const orderMap = new Map(deckOrderList.value.map((id, index) => [id, index]))
      list.sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999
        return orderA - orderB
      })
    }
    return list
  })

  function addFolder(payload: { name: string; icon?: string; color?: string; description?: string }) {
    const newFolder: StudyFolder = {
      id: `folder-custom-${Date.now()}`,
      name: payload.name.trim(),
      icon: payload.icon || 'Folder',
      color: payload.color || 'blue',
      description: payload.description || '',
      isBuiltIn: false
    }
    folders.value.push(newFolder)
    return newFolder
  }

  function deleteFolder(folderId: string) {
    const f = folders.value.find((item) => item.id === folderId)
    if (f?.isBuiltIn) return
    for (const d of customDecks.value) {
      if (d.folderId === folderId) {
        d.folderId = 'custom'
      }
    }
    folders.value = folders.value.filter((item) => item.id !== folderId)
  }

  function moveDeckToFolder(deckId: string, targetFolderId: string, onMoveDeckCloud?: (deck: StudyDeck) => void) {
    deckFolderOverrides.value = {
      ...deckFolderOverrides.value,
      [deckId]: targetFolderId
    }
    const cd = customDecks.value.find((d) => d.id === deckId)
    if (cd) {
      cd.folderId = targetFolderId
      onMoveDeckCloud?.(cd)
    }
  }

  function moveDeckOrder(deckId: string, direction: 'up' | 'down') {
    const currentList = allDecks.value.map((d) => d.id)
    const index = currentList.indexOf(deckId)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= currentList.length) return
    const tmp = currentList[index]
    currentList[index] = currentList[targetIndex]
    currentList[targetIndex] = tmp
    deckOrderList.value = [...currentList]
  }

  function setDeckOrder(deckIds: string[]) {
    deckOrderList.value = [...deckIds]
  }

  function createGeneratedDeckObject(payload: {
    deckTitle: string
    deckDescription: string
    folderId?: string
    sourceFileName?: string
    summaryPoints?: string[]
    questions: Array<Omit<Question, 'id' | 'deckId'>>
  }): { newDeck: StudyDeck; createdQuestions: Question[] } {
    const deckId = `deck-custom-${Date.now()}`
    const colors = ['emerald', 'cyan', 'violet', 'amber', 'rose', 'blue']
    const color = colors[customDecks.value.length % colors.length]

    const newDeck: StudyDeck = {
      id: deckId,
      folderId: payload.folderId || 'custom',
      title: payload.deckTitle || `PDF-Lernset (${new Date().toLocaleDateString('de-DE')})`,
      description: payload.deckDescription || 'Automatisch aus deinem hochgeladenen Dokument generierte Prüfungsfragen.',
      icon: 'FileText',
      color,
      sourceFileName: payload.sourceFileName,
      createdAt: new Date().toISOString().slice(0, 10),
      isBuiltIn: false,
      summaryPoints: payload.summaryPoints || []
    }

    const createdQuestions: Question[] = payload.questions.map((q, idx) => {
      const rawOptions =
        Array.isArray(q.options) && q.options.length >= 2
          ? q.options
          : ['Ja', 'Nein', 'Nur im Notfall', 'Keine Angabe']
      const origCorrectIdx = typeof q.correctIndex === 'number' ? q.correctIndex : 0

      const indexed = rawOptions.map((text, i) => ({ text, isCorrect: i === origCorrectIdx }))
      for (let i = indexed.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[indexed[i], indexed[j]] = [indexed[j], indexed[i]]
      }
      const shuffledOptions = indexed.map((item) => item.text)
      const newCorrectIdx = Math.max(0, indexed.findIndex((item) => item.isCorrect))

      return {
        id: `${deckId}-q-${idx + 1}`,
        deckId,
        question: q.question,
        options: shuffledOptions,
        correctIndex: newCorrectIdx,
        explanation: q.explanation || '',
        mnemonic: q.mnemonic || '',
        lawReference: q.lawReference || '',
        pdfSource: payload.sourceFileName || 'Eigener Upload',
        difficulty: q.difficulty || 'mittel',
        type: q.type || 'mc',
        flashcardFront: q.flashcardFront || q.question,
        flashcardBack: q.flashcardBack || `${rawOptions[origCorrectIdx] || ''}\n\n${q.explanation || ''}`
      }
    })

    return { newDeck, createdQuestions }
  }

  return {
    folders,
    customDecks,
    deckFolderOverrides,
    deckOrderList,
    allDecks,
    detectBestFolderForDeck,
    addFolder,
    deleteFolder,
    moveDeckToFolder,
    moveDeckOrder,
    setDeckOrder,
    createGeneratedDeckObject
  }
}
