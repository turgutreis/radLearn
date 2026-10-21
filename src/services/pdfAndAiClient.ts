import { extractText, getDocumentProxy } from 'unpdf'

export const SYSTEM_PROMPT = `Du bist ein erfahrener Prüfer und Fachdozent für Radiologie, Strahlenschutz (StrlSchG, StrlSchV), Dosimetrie, Nuklearmedizin, Strahlentherapie und Röntgendiagnostik für die MTR-Ausbildung (Medizinische Technologinnen und Technologen für Radiologie) in Deutschland.

Deine Aufgabe: Erstelle aus dem bereitgestellten Lernskript / PDF-Inhalt hochwertige, prüfungsnahe Lernfragen UND Karteikarten (Flashcards).
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
      "lawReference": "z.B. § 78 StrlSchG / StrlSchV (optional)",
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

export async function extractPdfInBrowser(file: File): Promise<{
  fullText: string
  totalPages: number
}> {
  const arrayBuffer = await file.arrayBuffer()
  const uint8 = new Uint8Array(arrayBuffer)
  const pdf = await getDocumentProxy(uint8)
  const { totalPages, text } = await extractText(pdf, { mergePages: false })

  const pages = Array.isArray(text)
    ? text.map((pageText, idx) => `--- Seite ${idx + 1} ---\n${pageText.trim()}`)
    : [`--- Seite 1 ---\n${String(text).trim()}`]

  return {
    fullText: pages.join('\n\n'),
    totalPages
  }
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
  const count = Math.min(Math.max(Number(params.questionCount) || 12, 3), 35)

  if (params.provider === 'gemini') {
    if (!params.apiKey) {
      throw new Error('Bitte trage deinen Google Gemini API-Key oben unter „KI-Modell & API-Key“ ein.')
    }
    const model = params.model || 'gemini-2.5-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${params.apiKey}`

    const parts: any[] = []
    if (params.pdfBase64) {
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

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json'
        }
      })
    })

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
