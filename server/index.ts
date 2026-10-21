import { extractText, getDocumentProxy } from 'unpdf'

const PORT = Number(process.env.PORT || 3001)

interface GenerateRequest {
  text?: string
  pdfBase64?: string
  fileName?: string
  topicTitle?: string
  provider: 'gemini' | 'openai' | 'anthropic' | 'ollama'
  apiKey?: string
  model?: string
  ollamaUrl?: string
  questionCount?: number
  focusAreas?: string
}

const SYSTEM_PROMPT = `Du bist ein erfahrener Prüfer und Fachdozent für Radiologie, Strahlenschutz (StrlSchG, StrlSchV), Dosimetrie, Nuklearmedizin, Strahlentherapie und Röntgendiagnostik für die MTR-Ausbildung (Medizinische Technologinnen und Technologen für Radiologie) in Deutschland.

Deine Aufgabe: Erstelle aus dem bereitgestellten Lernskript / PDF-Inhalt hochwertige, prüfungsnahe Lernfragen UND Karteikarten (Flashcards).
Achte besonders auf:
- Gesetzliche Grundlagen (EURATOM, Atomgesetz, StrlSchG, StrlSchV, MTBG, Paragraphen wie § 77, § 78, § 83, § 85, § 90, § 125 etc.)
- Physikalische & biologische Größen (Gray, Sievert, Energiedosis, Äquivalentdosis, Effektive Dosis, LET, RBW, DFP, ODL, Hp(10), Hp(0,07), Hp(3), Strahlenwichtungsfaktoren wR, Gewebewichtungsfaktoren wT, Halbwertszeiten physikalisch/biologisch/effektiv)
- Grenzwerte & Strahlenschutzbereiche (Überwachungs-, Kontroll-, Sperrbereich, Kat. A & B, Berufslebensdosis 400 mSv, Schwangere/Ungeborenes Kind, Augenlinse, Haut/Extremitäten, Bevölkerung)
- Betriebliche Organisation (SSV, SSBV, SSB, MPE, Fachkunde vs. Kenntnisse, Teleradiologie, Ärztliche Stelle, BfS, Regierungspräsidien)
- Inbetriebnahme, Genehmigungs- vs. Anzeigeverfahren, Abnahmeprüfung, Konstanzprüfung, Sachverständigenprüfung
- Freigabe (10 µSv/a, 10 HWZ), Kontamination, Ableitung, Radon (300 Bq/m³), Aufbewahrungsfristen (1, 3, 5, 10, 30 Jahre, 75./100. LJ)
- Kleine praxisnahe Rechenaufgaben (z.B. ODL am Schaltpult bei 40h/Woche und 50 Wochen/Jahr, Effektive Dosis, Effektive HWZ, Abstandsquadratgesetz)

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
      "difficulty": "leicht" | "mittel" | "schwer",
      "type": "mc" | "calculation" | "case",
      "flashcardFront": "Kompakte Frage für die Karteikarten-Vorderseite",
      "flashcardBack": "Knackige, strukturierte Antwort für die Karteikarten-Rückseite"
    }
  ]
}`

function cleanJsonResponse(raw: string): any {
  let cleaned = raw.trim()
  // Remove ```json ... ``` wrapper if present
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

async function generateWithGemini(req: GenerateRequest, count: number) {
  const apiKey = req.apiKey || process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Kein Gemini API-Key angegeben. Bitte in den Einstellungen eintragen oder als GEMINI_API_KEY in .env setzen.')
  }
  const model = req.model || 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const parts: any[] = []
  if (req.pdfBase64) {
    parts.push({
      inline_data: {
        mime_type: 'application/pdf',
        data: req.pdfBase64
      }
    })
  }

  const userPrompt = `Erstelle bitte genau ${count} vielfältige, detailreiche Prüfungsfragen (Multiple Choice, Fallbeispiele, Rechenaufgaben) inklusive Flashcards aus diesem Lernmaterial.${
    req.focusAreas ? `\nBesonderer Fokus auf: ${req.focusAreas}` : ''
  }${req.text ? `\n\nExtrahierter Text aus dem Dokument (${req.fileName || 'Skript'}):\n${req.text.slice(0, 120000)}` : ''}`

  parts.push({ text: userPrompt })

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
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
  if (!content) {
    throw new Error('Keine Antwort von Gemini erhalten.')
  }
  return cleanJsonResponse(content)
}

async function generateWithOpenAI(req: GenerateRequest, count: number) {
  const apiKey = req.apiKey || process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('Kein OpenAI API-Key angegeben. Bitte in den Einstellungen eintragen oder als OPENAI_API_KEY in .env setzen.')
  }
  const model = req.model || 'gpt-4o-mini'
  const userPrompt = `Erstelle bitte genau ${count} vielfältige, detailreiche Prüfungsfragen inklusive Flashcards aus diesem Lernmaterial.${
    req.focusAreas ? `\nBesonderer Fokus auf: ${req.focusAreas}` : ''
  }\n\nLernmaterial (${req.fileName || 'Skript'}):\n${(req.text || '').slice(0, 100000)}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
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
  if (!content) {
    throw new Error('Keine Antwort von OpenAI erhalten.')
  }
  return cleanJsonResponse(content)
}

async function generateWithAnthropic(req: GenerateRequest, count: number) {
  const apiKey = req.apiKey || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('Kein Anthropic API-Key angegeben. Bitte in den Einstellungen eintragen.')
  }
  const model = req.model || 'claude-3-5-sonnet-latest'
  const userPrompt = `Erstelle bitte genau ${count} vielfältige, detailreiche Prüfungsfragen inklusive Flashcards aus diesem Lernmaterial.${
    req.focusAreas ? `\nBesonderer Fokus auf: ${req.focusAreas}` : ''
  }\n\nLernmaterial (${req.fileName || 'Skript'}):\n${(req.text || '').slice(0, 100000)}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      temperature: 0.4,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Anthropic API Fehler (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const content = data?.content?.[0]?.text
  if (!content) {
    throw new Error('Keine Antwort von Claude erhalten.')
  }
  return cleanJsonResponse(content)
}

async function generateWithOllama(req: GenerateRequest, count: number) {
  const baseUrl = (req.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '')
  const model = req.model || 'llama3.1'
  const userPrompt = `Erstelle bitte genau ${count} vielfältige Prüfungsfragen inklusive Flashcards im angegebenen JSON-Format aus diesem Lernmaterial.${
    req.focusAreas ? `\nBesonderer Fokus auf: ${req.focusAreas}` : ''
  }\n\nLernmaterial (${req.fileName || 'Skript'}):\n${(req.text || '').slice(0, 45000)}`

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ]
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Ollama Fehler (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const content = data?.message?.content
  if (!content) {
    throw new Error('Keine Antwort von Ollama erhalten.')
  }
  return cleanJsonResponse(content)
}

const server = Bun.serve({
  port: PORT,
  maxRequestBodySize: 50 * 1024 * 1024, // 50 MB for large PDFs
  async fetch(req) {
    const url = new URL(req.url)

    // CORS headers for local dev
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (url.pathname === '/api/health') {
      return Response.json(
        {
          status: 'ok',
          runtime: `Bun ${Bun.version}`,
          hasEnvGemini: Boolean(process.env.GEMINI_API_KEY),
          hasEnvOpenAI: Boolean(process.env.OPENAI_API_KEY),
          hasEnvAnthropic: Boolean(process.env.ANTHROPIC_API_KEY)
        },
        { headers: corsHeaders }
      )
    }

    if (url.pathname === '/api/extract-pdf' && req.method === 'POST') {
      try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        if (!file) {
          return Response.json({ error: 'Keine PDF-Datei übergeben.' }, { status: 400, headers: corsHeaders })
        }

        const arrayBuffer = await file.arrayBuffer()
        const uint8 = new Uint8Array(arrayBuffer)
        const pdf = await getDocumentProxy(uint8)
        const { totalPages, text } = await extractText(pdf, { mergePages: false })

        const pages = Array.isArray(text)
          ? text.map((pageText, idx) => ({
              pageNumber: idx + 1,
              text: pageText.trim()
            }))
          : [{ pageNumber: 1, text: String(text).trim() }]

        const fullText = pages.map((p) => `--- Seite ${p.pageNumber} ---\n${p.text}`).join('\n\n')
        const base64 = Buffer.from(arrayBuffer).toString('base64')

        return Response.json(
          {
            fileName: file.name,
            fileSize: file.size,
            totalPages,
            pages,
            fullText,
            pdfBase64: file.size < 18 * 1024 * 1024 ? base64 : undefined
          },
          { headers: corsHeaders }
        )
      } catch (err: any) {
        console.error('PDF extraction error:', err)
        return Response.json(
          { error: `PDF konnte nicht gelesen werden: ${err?.message || String(err)}` },
          { status: 500, headers: corsHeaders }
        )
      }
    }

    if (url.pathname === '/api/generate-questions' && req.method === 'POST') {
      try {
        const body = (await req.json()) as GenerateRequest
        const count = Math.min(Math.max(Number(body.questionCount) || 12, 3), 35)

        if (!body.text?.trim() && !body.pdfBase64) {
          return Response.json(
            { error: 'Kein Text oder PDF-Inhalt zur Fragengenerierung übergeben.' },
            { status: 400, headers: corsHeaders }
          )
        }

        let result: any
        switch (body.provider) {
          case 'gemini':
            result = await generateWithGemini(body, count)
            break
          case 'openai':
            result = await generateWithOpenAI(body, count)
            break
          case 'anthropic':
            result = await generateWithAnthropic(body, count)
            break
          case 'ollama':
            result = await generateWithOllama(body, count)
            break
          default:
            result = await generateWithGemini(body, count)
        }

        return Response.json(result, { headers: corsHeaders })
      } catch (err: any) {
        console.error('Question generation error:', err)
        return Response.json(
          { error: err?.message || 'Fehler bei der KI-Fragengenerierung.' },
          { status: 500, headers: corsHeaders }
        )
      }
    }

    return Response.json({ error: 'Endpoint nicht gefunden' }, { status: 404, headers: corsHeaders })
  }
})

console.log(`🚀 RadLearn Bun-Backend läuft auf http://localhost:${server.port}`)
