import type { StudyDeck, Question, QuestionProgress } from '../types'

export interface SupabaseConfig {
  url: string
  anonKey: string
  syncId: string // z.B. "standard" oder Name, damit alle Geräte denselben Lernstand teilen
}

export const SUPABASE_SQL_SCHEMA = `-- Im Supabase Dashboard unter "SQL Editor" einfügen und auf "Run" klicken:

create table if not exists public.radlearn_decks (
  id text primary key,
  deck_data jsonb not null,
  questions_data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.radlearn_progress (
  sync_id text primary key,
  progress_data jsonb not null,
  updated_at timestamptz default now()
);

-- RLS aktivieren & öffentlichen Zugriff für die App erlauben:
alter table public.radlearn_decks enable row level security;
alter table public.radlearn_progress enable row level security;

create policy "Allow all access to radlearn_decks"
  on public.radlearn_decks for all
  using (true) with check (true);

create policy "Allow all access to radlearn_progress"
  on public.radlearn_progress for all
  using (true) with check (true);`

function getHeaders(anonKey: string, prefer?: string): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json'
  }
  if (prefer) headers['Prefer'] = prefer
  return headers
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

export async function fetchCloudDecks(config: SupabaseConfig): Promise<{
  decks: StudyDeck[]
  questions: Question[]
}> {
  const baseUrl = normalizeUrl(config.url)
  const res = await fetch(`${baseUrl}/rest/v1/radlearn_decks?select=*&order=created_at.desc`, {
    method: 'GET',
    headers: getHeaders(config.anonKey)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase Fehler (${res.status}): ${text}`)
  }

  const rows = (await res.json()) as Array<{
    id: string
    deck_data: StudyDeck
    questions_data: Question[]
  }>

  const decks: StudyDeck[] = []
  const questions: Question[] = []

  for (const row of rows) {
    if (row.deck_data) decks.push(row.deck_data)
    if (Array.isArray(row.questions_data)) questions.push(...row.questions_data)
  }

  return { decks, questions }
}

export async function upsertCloudDeck(
  config: SupabaseConfig,
  deck: StudyDeck,
  questions: Question[]
): Promise<void> {
  const baseUrl = normalizeUrl(config.url)
  const res = await fetch(`${baseUrl}/rest/v1/radlearn_decks`, {
    method: 'POST',
    headers: getHeaders(config.anonKey, 'resolution=merge-duplicates,return=minimal'),
    body: JSON.stringify({
      id: deck.id,
      deck_data: deck,
      questions_data: questions
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Fehler beim Speichern des Decks in Supabase (${res.status}): ${text}`)
  }
}

export async function removeCloudDeck(config: SupabaseConfig, deckId: string): Promise<void> {
  const baseUrl = normalizeUrl(config.url)
  const res = await fetch(`${baseUrl}/rest/v1/radlearn_decks?id=eq.${encodeURIComponent(deckId)}`, {
    method: 'DELETE',
    headers: getHeaders(config.anonKey)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Fehler beim Löschen in Supabase (${res.status}): ${text}`)
  }
}

export async function fetchCloudProgress(
  config: SupabaseConfig
): Promise<Record<string, QuestionProgress> | null> {
  const baseUrl = normalizeUrl(config.url)
  const syncId = config.syncId || 'default'
  const res = await fetch(
    `${baseUrl}/rest/v1/radlearn_progress?sync_id=eq.${encodeURIComponent(syncId)}&select=progress_data`,
    {
      method: 'GET',
      headers: getHeaders(config.anonKey)
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Fehler beim Laden des Lernfortschritts (${res.status}): ${text}`)
  }

  const rows = (await res.json()) as Array<{ progress_data: Record<string, QuestionProgress> }>
  return rows[0]?.progress_data || null
}

export async function saveCloudProgress(
  config: SupabaseConfig,
  progress: Record<string, QuestionProgress>
): Promise<void> {
  const baseUrl = normalizeUrl(config.url)
  const syncId = config.syncId || 'default'
  const res = await fetch(`${baseUrl}/rest/v1/radlearn_progress`, {
    method: 'POST',
    headers: getHeaders(config.anonKey, 'resolution=merge-duplicates,return=minimal'),
    body: JSON.stringify({
      sync_id: syncId,
      progress_data: progress,
      updated_at: new Date().toISOString()
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Fehler beim Synchronisieren des Lernstands (${res.status}): ${text}`)
  }
}
