import { extractText, getDocumentProxy } from 'unpdf'

export const SYSTEM_PROMPT = `Du bist ein erfahrener Prüfer und Fachdozent für Radiologie, Strahlenschutz (StrlSchG, StrlSchV), Dosimetrie, Nuklearmedizin, Strahlentherapie, Einstelltechnik und Röntgendiagnostik für die MTR-Ausbildung (Medizinische Technologinnen und Technologen für Radiologie) in Deutschland.

Deine Aufgabe: Erstelle aus dem bereitgestellten Lernskript / PDF-Abschnitt hochwertige, prüfungsnahe Lernfragen UND Karteikarten (Flashcards). Deck alle wichtigen Fakten, Zahlen, Tabellen, Paragraphen und Zusammenhänge dieses Abschnitts gründlich ab!

KRITISCH WICHTIGE REGELN FÜR MULTIPLE-CHOICE & 'correctIndex':
1. "options" MUSS genau 4 Antwortmöglichkeiten enthalten (1 fachlich korrekte Antwort und 3 realistische falsche Distraktoren).
2. "correctIndex" MUSS ZWINGEND und EXAKT der 0-basierte Index der tatsächlichen richtigen Antwort im "options"-Array sein:
   - 0 = wenn die 1. Option richtig ist
   - 1 = wenn die 2. Option richtig ist
   - 2 = wenn die 3. Option richtig ist
   - 3 = wenn die 4. Option richtig ist
3. BEST PRACTICE: Setze die richtige Antwort im "options"-Array bevorzugt an Index 0 ("correctIndex": 0) und die 3 falschen Ablenker an Index 1, 2 und 3. Unser System mischt die Optionen für den Lerner automatisch zufällig durch. Wenn du die richtige Option an eine andere Position setzt, MUSS "correctIndex" zwingend diese Position haben!
4. Die in "explanation" als richtig begründete Tatsache und der "mnemonic"-Merksatz MÜSSEN zu 100% mit options[correctIndex] übereinstimmen und dürfen ihr NIEMALS widersprechen!

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt in folgendem Schema (ohne Markdown-Codeblöcke drumherum, reines JSON):
{
  "deckTitle": "Kurzer prägnanter Titel des Themenblocks",
  "deckDescription": "Kurze Zusammenfassung der enthaltenen Prüfungsthemen (1-2 Sätze)",
  "summaryPoints": [
    "Wichtiger Merksatz oder Kernfakt 1 aus dem Dokument",
    "Wichtiger Merksatz oder Kernfakt 2 aus dem Dokument"
  ],
  "questions": [
    {
      "question": "Klare, präzise Prüfungsfrage (gerne auch Fallbeispiel oder Rechenfrage)",
      "options": [
        "Die tatsächliche korrekte Antwort (Index 0)",
        "Plausible falsche Antwort 1 (Index 1)",
        "Plausible falsche Antwort 2 (Index 2)",
        "Plausible falsche Antwort 3 (Index 3)"
      ],
      "correctIndex": 0,
      "explanation": "Ausführliche, leicht verständliche Erklärung, warum options[correctIndex] richtig ist und warum die anderen Optionen falsch sind.",
      "mnemonic": "Kurze Eselsbrücke oder Merkhilfe zum schnellen Einprägen",
      "lawReference": "z.B. § 78 StrlSchG / Seite im Skript (optional)",
      "difficulty": "leicht",
      "type": "mc",
      "flashcardFront": "Kompakte Frage für die Karteikarten-Vorderseite",
      "flashcardBack": "Knackige, strukturierte Antwort für die Karteikarten-Rückseite"
    }
  ]
}`

export function cleanJsonResponse(raw: string): any {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1)
  }
  return JSON.parse(cleaned)
}

export interface ExtractedPage {
  pageNumber: number
  text: string
}

export async function extractPdfInBrowser(file: File): Promise<{
  fullText: string
  totalPages: number
  pages: ExtractedPage[]
}> {
  const arrayBuffer = await file.arrayBuffer()
  const uint8 = new Uint8Array(arrayBuffer)
  const pdf = await getDocumentProxy(uint8)
  const { totalPages, text } = await extractText(pdf, { mergePages: false })

  const pages: ExtractedPage[] = Array.isArray(text)
    ? text.map((pageText, idx) => ({
        pageNumber: idx + 1,
        text: pageText.trim()
      }))
    : [{ pageNumber: 1, text: String(text).trim() }]

  const fullText = pages.map((p) => `--- Seite ${p.pageNumber} ---\n${p.text}`).join('\n\n')

  return {
    fullText,
    totalPages,
    pages
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const PREFERRED_GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
]

async function listAvailableGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    if (!res.ok) return PREFERRED_GEMINI_MODELS
    const data = await res.json()
    const models: Array<{ name: string; supportedGenerationMethods?: string[] }> = data?.models || []
    const candidates = models
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => m.name.replace(/^models\//, ''))
      .filter(
        (name) =>
          name.startsWith('gemini-') &&
          !name.includes('embedding') &&
          !name.includes('vision') &&
          !name.includes('imagen') &&
          !name.includes('tts') &&
          !name.includes('audio') &&
          !name.includes('omni') &&
          !name.includes('transcribe') &&
          !name.includes('image') &&
          !name.includes('customtools') &&
          !name.includes('banana') &&
          !name.includes('2.5-flash') &&
          !name.includes('2.5-pro')
      )

    // Sortiere nach Priorität: Schnelle, stabile Flash-Lite Modelle zuerst
    const sorted = candidates.sort((a, b) => {
      const idxA = PREFERRED_GEMINI_MODELS.indexOf(a)
      const idxB = PREFERRED_GEMINI_MODELS.indexOf(b)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      if (a.includes('lite') && !b.includes('lite')) return -1
      if (!a.includes('lite') && b.includes('lite')) return 1
      if (a.includes('flash') && !b.includes('flash')) return -1
      if (!a.includes('flash') && b.includes('flash')) return 1
      return a.localeCompare(b)
    })

    return sorted.length > 0 ? sorted : PREFERRED_GEMINI_MODELS
  } catch {
    return PREFERRED_GEMINI_MODELS
  }
}

async function callGeminiModel(modelName: string, apiKey: string, parts: any[]) {
  const cleanModel = modelName.replace(/^models\//, '')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    })
  })
}

export async function generateQuestionsInBrowser(params: {
  text?: string
  pdfBase64?: string
  imageBase64?: string
  imageMimeType?: string
  images?: Array<{ base64: string; mimeType: string }>
  fileName?: string
  provider: 'gemini' | 'openai' | 'anthropic' | 'ollama'
  apiKey: string
  model: string
  questionCount: number
  focusAreas?: string
  onStatusUpdate?: (msg: string) => void
}) {
  const count = Math.min(Math.max(Number(params.questionCount) || 12, 3), 25)

  if (params.provider === 'gemini') {
    if (!params.apiKey) {
      throw new Error('Bitte trage deinen Google Gemini API-Key oben unter „KI-Modell & API-Key“ ein.')
    }

    const parts: any[] = []
    if (params.pdfBase64 && params.pdfBase64.length < 14_000_000) {
      parts.push({
        inline_data: {
          mime_type: 'application/pdf',
          data: params.pdfBase64
        }
      })
    }

    if (params.images && params.images.length > 0) {
      for (const img of params.images) {
        if (img.base64 && img.base64.length < 14_000_000) {
          parts.push({
            inline_data: {
              mime_type: img.mimeType || 'image/jpeg',
              data: img.base64
            }
          })
        }
      }
    } else if (params.imageBase64 && params.imageBase64.length < 14_000_000) {
      parts.push({
        inline_data: {
          mime_type: params.imageMimeType || 'image/jpeg',
          data: params.imageBase64
        }
      })
    }

    const isImageSource = Boolean(params.imageBase64 || (params.images && params.images.length > 0))
    const userPrompt = `Erstelle bitte genau ${count} vielfältige, detailreiche Prüfungsfragen (Multiple Choice, Fallbeispiele, Diagramm- & Schemafragen, Rechenaufgaben) inklusive Flashcards aus diesem Lernmaterial (${isImageSource ? 'Buchfoto / Abbildung' : 'Skript / PDF'}). Beziehe auch enthaltene Schemata, Grafiken, Bildbeschriftungen und Tabellen mit ein!${
      params.focusAreas ? `\nBesonderer Fokus auf: ${params.focusAreas}` : ''
    }${params.text ? `\n\nExtrahierter Text (${params.fileName || 'Lernmaterial'}):\n${params.text.slice(0, 120000)}` : ''}`

    parts.push({ text: userPrompt })

    const primaryModel = params.model || 'gemini-3.5-flash-lite'
    let response = await callGeminiModel(primaryModel, params.apiKey, parts)

    // 1. Falls 404 (Modellname veraltet): Empfohlenes Modell aus Fehlermeldung oder /models Liste holen
    if (response.status === 404) {
      const errText = await response.text()
      const suggestedMatch = errText.match(/use models\/([a-zA-Z0-9._-]+)/i)
      const available = await listAvailableGeminiModels(params.apiKey)
      const targetModel = suggestedMatch?.[1] || available[0] || 'gemini-3.5-flash-lite'
      params.onStatusUpdate?.(`Modell veraltet – wechsle zu ${targetModel}...`)
      response = await callGeminiModel(targetModel, params.apiKey, parts)
    }

    // 2. Falls 503 (High Demand / Überlastung bei Google) oder 429 (Rate Limit):
    // Automatischer schneller Wechsel auf die stabilen Flash-Lite Modelle!
    if (response.status === 503 || response.status === 429) {
      const available = await listAvailableGeminiModels(params.apiKey)
      const fallbackList = [
        ...PREFERRED_GEMINI_MODELS,
        ...available
      ].filter((m, idx, arr) => arr.indexOf(m) === idx && m !== primaryModel)

      for (let attempt = 0; attempt < Math.min(5, fallbackList.length); attempt++) {
        const nextModel = fallbackList[attempt]
        const waitMs = (attempt + 1) * 1200
        params.onStatusUpdate?.(
          `Google Server überlastet (${response.status}) – wechsle automatisch zu ${nextModel}...`
        )
        await sleep(waitMs)
        response = await callGeminiModel(nextModel, params.apiKey, parts)
        if (response.ok) break
      }
    }

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API Fehler (${response.status}): ${errText}`)
    }

    const data = await response.json()
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) throw new Error('Keine Antwort von Gemini erhalten.')
    return cleanJsonResponse(content)
  }

  if (params.provider === 'openai') {
    if (!params.apiKey) {
      throw new Error('Bitte trage deinen OpenAI API-Key oben unter „KI-Modell & API-Key“ ein.')
    }
    const model = params.model || 'gpt-4o-mini'
    const userPrompt = `Erstelle bitte genau ${count} vielfältige Prüfungsfragen inklusive Flashcards aus diesem Lernmaterial.${
      params.focusAreas ? `\nBesonderer Fokus auf: ${params.focusAreas}` : ''
    }\n\nLernmaterial (${params.fileName || 'Skript'}):\n${(params.text || '').slice(0, 100000)}`

    const userContent: any[] = [{ type: 'text', text: userPrompt }]
    if (params.imageBase64) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${params.imageMimeType || 'image/jpeg'};base64,${params.imageBase64}`
        }
      })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent }
        ]
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`OpenAI API Fehler (${response.status}): ${errText}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) throw new Error('Keine Antwort von OpenAI erhalten.')
    return cleanJsonResponse(content)
  }

  throw new Error('Für Anthropic/Ollama auf Vercel/Netlify bitte Gemini oder OpenAI im Browser nutzen oder lokal über Bun starten.')
}
