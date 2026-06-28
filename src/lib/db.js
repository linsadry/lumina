import { supabase, USER_ID } from './supabase.js'

// ── BOOKS ─────────────────────────────────────

export async function getBooks(filters = {}) {
  let q = supabase
    .from('lumina_books')
    .select('*')
    .eq('user_id', USER_ID)
    .order('updated_at', { ascending: false })

  if (filters.status && filters.status !== 'todos') {
    q = q.eq('status', filters.status)
  }
  if (filters.format && filters.format !== 'todos') {
    q = q.eq('format', filters.format)
  }
  if (filters.search) {
    q = q.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`)
  }
  if (filters.collection) {
    q = q.contains('collections', [filters.collection])
  }

  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function getBook(id) {
  const { data, error } = await supabase
    .from('lumina_books')
    .select('*')
    .eq('id', id)
    .eq('user_id', USER_ID)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function addBook(book) {
  const { data, error } = await supabase
    .from('lumina_books')
    .insert({ ...book, user_id: USER_ID })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateBook(id, updates) {
  const { data, error } = await supabase
    .from('lumina_books')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', USER_ID)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

export async function deleteBook(id) {
  const { error } = await supabase
    .from('lumina_books')
    .delete()
    .eq('id', id)
    .eq('user_id', USER_ID)
  if (error) throw error
}

export async function toggleFavorite(id, current) {
  return updateBook(id, { is_favorite: !current })
}

// ── NOTES ─────────────────────────────────────

export async function getNotes(bookId) {
  const { data, error } = await supabase
    .from('lumina_notes')
    .select('*')
    .eq('book_id', bookId)
    .eq('user_id', USER_ID)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addNote(note) {
  const { data, error } = await supabase
    .from('lumina_notes')
    .insert({ ...note, user_id: USER_ID })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateNote(id, updates) {
  const { data, error } = await supabase
    .from('lumina_notes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', USER_ID)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

export async function deleteNote(id) {
  const { error } = await supabase
    .from('lumina_notes')
    .delete()
    .eq('id', id)
    .eq('user_id', USER_ID)
  if (error) throw error
}

// ── STATS ─────────────────────────────────────

export async function getStats() {
  const { data, error } = await supabase
    .from('lumina_books')
    .select('status, pages_total, current_page, finished_at, created_at, format')
    .eq('user_id', USER_ID)
  if (error) throw error

  const books = data || []
  const thisYear = new Date().getFullYear()

  return {
    total: books.length,
    lendo: books.filter(b => b.status === 'lendo').length,
    concluidos: books.filter(b => b.status === 'concluido').length,
    quero_ler: books.filter(b => b.status === 'quero_ler').length,
    lidos_ano: books.filter(b => b.status === 'concluido' && b.finished_at && new Date(b.finished_at).getFullYear() === thisYear).length,
    paginas_lidas: books.reduce((acc, b) => acc + (b.current_page || 0), 0),
    por_formato: books.reduce((acc, b) => {
      acc[b.format || 'fisico'] = (acc[b.format || 'fisico'] || 0) + 1
      return acc
    }, {}),
  }
}

// ── COLLECTIONS ────────────────────────────────

export async function getCollections() {
  const { data, error } = await supabase
    .from('lumina_collections')
    .select('*')
    .eq('user_id', USER_ID)
    .order('name')
  if (error) throw error
  return data || []
}

export async function addCollection(name, description = '') {
  const { data, error } = await supabase
    .from('lumina_collections')
    .insert({ name, description, user_id: USER_ID })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

// ── READING SESSIONS ────────────────────────────

export async function logSession(bookId, minutes, pages) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('lumina_sessions')
    .insert({ book_id: bookId, user_id: USER_ID, session_date: today, duration_minutes: minutes, pages_read: pages })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getStreak() {
  const { data, error } = await supabase
    .from('lumina_sessions')
    .select('session_date')
    .eq('user_id', USER_ID)
    .order('session_date', { ascending: false })
  if (error) return 0

  const dates = [...new Set((data || []).map(s => s.session_date))].sort().reverse()
  if (dates.length === 0) return 0

  let streak = 0
  const today = new Date().toISOString().split('T')[0]
  let cur = today

  for (const d of dates) {
    if (d === cur) {
      streak++
      const dt = new Date(cur)
      dt.setDate(dt.getDate() - 1)
      cur = dt.toISOString().split('T')[0]
    } else {
      break
    }
  }
  return streak
}

// ── OPEN LIBRARY ────────────────────────────────

export async function fetchBookByISBN(isbn) {
  try {
    const r = await fetch(`https://openlibrary.org/isbn/${isbn}.json`)
    if (!r.ok) return null
    const d = await r.json()
    let author = ''
    if (d.authors?.length) {
      const ar = await fetch(`https://openlibrary.org${d.authors[0].key}.json`)
      const ad = await ar.json()
      author = ad.name || ''
    }
    return {
      title: d.title,
      subtitle: d.subtitle,
      author,
      pages_total: d.number_of_pages,
      year_published: d.publish_date ? parseInt(d.publish_date) : null,
      publisher: d.publishers?.[0],
      isbn,
      cover_url: d.covers?.[0] ? `https://covers.openlibrary.org/b/id/${d.covers[0]}-L.jpg` : null,
    }
  } catch {
    return null
  }
}

export async function searchBookCover(title, author) {
  try {
    const q = encodeURIComponent(`${title} ${author || ''}`.trim())
    const r = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=1`)
    if (!r.ok) return null
    const d = await r.json()
    const book = d.docs?.[0]
    if (!book) return null
    return book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null
  } catch {
    return null
  }
}
