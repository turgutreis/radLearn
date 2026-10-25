import { extractText, getDocumentProxy } from 'unpdf'

export const SYSTEM_PROMPT = `Du bist ein erfahrener Prüfer und Fachdozent für Radiologie, Strahlenschutz (StrlSchG, StrlSchV), Dosimetrie, Nuklearmedizin, Strahlentherapie, Einstelltechnik und Röntgendiagnostik für die MTR-Ausbildung (Medizinische Technologinnen und Technologen für Radiologie) in Deutschland.

Deine Aufgabe: Erstelle aus dem bereitgestellten Lernskript / PDF-Abschnitt hochwertige, prüfungsnahe Lernfragen UND Karteikarten (Flashcards). Deck alle wichtigen Fakten, Zahlen, Tabellen, Paragraphen und Zusammenhänge dieses Abschnitts gründlich ab!
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
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctIndex": 0,
      "explanation": "Ausführliche, leicht verständliche Erklärung, warum diese Antwort richtig ist und warum die anderen falsch sind.",
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

async function listAvailableGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    if (!res.ok) return []
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
          !name.includes('audio')
      )

    // Sortiere so, dass Flash- und Lite-Modelle zuerst kommen (schnell & hohe Verfügbarkeit)
    const flash = candidates.filter((n) => n.includes('flash')).sort().reverse()
    const rest = candidates.filter((n) => !n.includes('flash')).sort().reverse()
    return [...flash, ...rest]
  } catch {
    return []
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

    const primaryModel = params.model || 'gemini-3.8-flash'
    let response = await callGeminiModel(primaryModel, params.apiKey, parts)

    // 1. Falls 404 (Modellname veraltet): Empfohlenes Modell aus Fehlermeldung oder /models Liste holen
    if (response.status === 404) {
      const errText = await response.text()
      const suggestedMatch = errText.match(/use models\/([a-zA-Z0-9._-]+)/i)
      if (suggestedMatch?.[1]) {
        response = await callGeminiModel(suggestedMatch[1], params.apiKey, parts)
      }
      if (response.status === 404) {
        const available = await listAvailableGeminiModels(params.apiKey)
        if (available.length > 0) {
          response = await callGeminiModel(available[0], params.apiKey, parts)
        }
      }
    }

    // 2. Falls 503 (High Demand / Überlastung bei Google) oder 429 (Rate Limit):
    // Automatischer Retry mit Backoff + Ausweichen auf alternative Gemini-Modelle (z.B. flash-lite / pro)!
    if (response.status === 503 || response.status === 429) {
      const available = await listAvailableGeminiModels(params.apiKey)
      const fallbackModels = [
        primaryModel,
        ...available.filter((m) => m !== primaryModel)
      ].slice(0, 4)

      for (let attempt = 1; attempt <= 4; attempt++) {
        const waitMs = attempt * 2200
        const nextModel = fallbackModels[attempt % fallbackModels.length] || primaryModel
        params.onStatusUpdate?.(
          `Google Server ausgelastet (503) – automatischer Versuch ${attempt}/4 mit ${nextModel} in ${(waitMs / 1000).toFixed(1)}s...`
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
