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

async function resolveAvailableGeminiModel(apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    if (!res.ok) return null
    const data = await res.json()
    const models: Array<{ name: string; supportedGenerationMethods?: string[] }> = data?.models || []
    const candidates = models
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => m.name.replace(/^models\//, ''))
      .filter((name) => name.startsWith('gemini-') && !name.includes('embedding') && !name.includes('vision') && !name.includes('imagen'))

    // Bevorzuge neueste Flash-Modelle
    const flashModels = candidates.filter((n) => n.includes('flash')).sort().reverse()
    if (flashModels.length > 0) return flashModels[0]
    if (candidates.length > 0) return candidates.sort().reverse()[0]
    return null
  } catch {
    return null
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
  fileName?: string
  provider: 'gemini' | 'openai' | 'anthropic' | 'ollama'
  apiKey: string
  model: string
  questionCount: number
  focusAreas?: string
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

    const userPrompt = `Erstelle bitte genau ${count} vielfältige, detailreiche Prüfungsfragen (Multiple Choice, Fallbeispiele, Rechenaufgaben) inklusive Flashcards aus diesem Lernmaterial.${
      params.focusAreas ? `\nBesonderer Fokus auf: ${params.focusAreas}` : ''
    }${params.text ? `\n\nExtrahierter Text (${params.fileName || 'Skript'}):\n${params.text.slice(0, 120000)}` : ''}`

    parts.push({ text: userPrompt })

    const primaryModel = params.model || 'gemini-3.8-flash'
    let response = await callGeminiModel(primaryModel, params.apiKey, parts)

    // Automatischer Fallback, falls das eingestellte Modell (z.B. gemini-2.5-flash) 404 NOT_FOUND liefert!
    if (response.status === 404) {
      const errText = await response.text()
      // 1. Prüfen, ob die Google-Fehlermeldung direkt das neue Modell nennt ("use models/xyz")
      const suggestedMatch = errText.match(/use models\/([a-zA-Z0-9._-]+)/i)
      if (suggestedMatch?.[1]) {
        response = await callGeminiModel(suggestedMatch[1], params.apiKey, parts)
      }

      // 2. Falls immer noch 404, frage die API nach den für diesen Key freigeschalteten Modellen
      if (response.status === 404) {
        const discoveredModel = await resolveAvailableGeminiModel(params.apiKey)
        if (discoveredModel) {
          response = await callGeminiModel(discoveredModel, params.apiKey, parts)
        }
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
          { role: 'user', content: userPrompt }
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
