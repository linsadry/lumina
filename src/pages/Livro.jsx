import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Heart, BookOpen, FileText, Info, Trash2, Plus, X, Check } from 'lucide-react'
import { getBook, updateBook, toggleFavorite, getNotes, addNote, deleteNote, deleteBook } from '../lib/db.js'
import { CoverPlaceholder } from '../components/BookCard.jsx'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STATUS_OPTS = [
  { value: 'lendo', label: 'Lendo' },
  { value: 'quero_ler', label: 'Quero ler' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'reler', label: 'Reler' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'abandonado', label: 'Abandonado' },
]

const NOTE_TYPES = [
  { value: 'note', label: 'Nota', color: '#72866F' },
  { value: 'insight', label: 'Insight', color: '#B9955A' },
  { value: 'application', label: 'Aplicação', color: '#3E5444' },
  { value: 'highlight', label: 'Destaque', color: '#7A5A46' },
  { value: 'reflection', label: 'Reflexão', color: '#8FA48C' },
  { value: 'question', label: 'Questão', color: '#9EAD9A' },
  { value: 'summary', label: 'Resumo', color: '#33443B' },
]

function NoteTypeTag({ type }) {
  const t = NOTE_TYPES.find(n => n.value === type) || NOTE_TYPES[0]
  return (
    <span className="note-type-tag" style={{ background: t.color + '20', color: t.color }}>
      {t.label}
    </span>
  )
}

function AddNoteSheet({ bookId, onClose, onAdded }) {
  const [type, setType] = useState('note')
  const [content, setContent] = useState('')
  const [chapter, setChapter] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!content.trim()) return
    setSaving(true)
    try {
      const note = await addNote({ book_id: bookId, type, content: content.trim(), chapter: chapter.trim() || null })
      onAdded(note)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="sheet-title" style={{ margin: 0 }}>Nova nota</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Tipo */}
        <div style={{ marginBottom: 16 }}>
          <p className="field-label" style={{ marginBottom: 8 }}>Tipo</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {NOTE_TYPES.map(t => (
              <button key={t.value}
                onClick={() => setType(t.value)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${type === t.value ? t.color : 'var(--clr-border)'}`,
                  background: type === t.value ? t.color + '18' : 'transparent',
                  color: type === t.value ? t.color : 'var(--clr-text-2)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 150ms',
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field" style={{ marginBottom: 12 }}>
          <label className="field-label">Conteúdo *</label>
          <textarea className="input" rows={5} autoFocus placeholder="Escreva sua nota…"
            value={content} onChange={e => setContent(e.target.value)} />
        </div>

        <div className="field" style={{ marginBottom: 20 }}>
          <label className="field-label">Capítulo / localização</label>
          <input className="input" placeholder="Ex: Cap. 3 / p. 87" value={chapter}
            onChange={e => setChapter(e.target.value)} />
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }}
          onClick={save} disabled={saving || !content.trim()}>
          {saving ? 'Salvando…' : 'Salvar nota'}
        </button>
      </div>
    </div>
  )
}

export default function Livro() {
  const { id } = useParams()
  const nav = useNavigate()
  const [book, setBook] = useState(null)
  const [notes, setNotes] = useState([])
  const [tab, setTab] = useState('notas')
  const [showAddNote, setShowAddNote] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editPage, setEditPage] = useState(false)
  const [pageInput, setPageInput] = useState('')

  async function load() {
    const [b, n] = await Promise.all([getBook(id), getNotes(id)])
    setBook(b)
    setNotes(n)
    setPageInput(b?.current_page?.toString() || '')
  }

  useEffect(() => { load() }, [id])

  async function handleFavorite() {
    const updated = await toggleFavorite(book.id, book.is_favorite)
    setBook(updated)
  }

  async function handleStatus(e) {
    const updated = await updateBook(book.id, { status: e.target.value })
    setBook(updated)
  }

  async function handleRating(r) {
    const updated = await updateBook(book.id, { rating: r === book.rating ? null : r })
    setBook(updated)
  }

  async function handleSavePage() {
    const p = parseInt(pageInput)
    if (isNaN(p)) return setEditPage(false)
    const updated = await updateBook(book.id, { current_page: p })
    setBook(updated)
    setEditPage(false)
  }

  async function handleDelete() {
    await deleteBook(book.id)
    nav('/biblioteca', { replace: true })
  }

  async function handleDeleteNote(nid) {
    await deleteNote(nid)
    setNotes(n => n.filter(x => x.id !== nid))
  }

  if (!book) return <div className="loader"><div className="loader-ring" /></div>

  const pct = book.pages_total && book.current_page
    ? Math.min(100, Math.round((book.current_page / book.pages_total) * 100))
    : 0

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 'calc(var(--nav-h) + 24px)' }}>

      {/* Hero / capa */}
      <div className="book-hero">
        {book.cover_url
          ? <img src={book.cover_url} alt={book.title} />
          : <CoverPlaceholder title={book.title} author={book.author} />
        }
        <div className="book-hero-gradient" />
        <div className="book-hero-info">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4, lineHeight: 1.2 }}>
            {book.title}
          </h1>
          {book.author && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{book.author}</p>}
        </div>
        {/* Botão voltar */}
        <button className="btn-icon" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 12px)', left: 12, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', color: 'white' }}
          onClick={() => nav(-1)}>
          <ArrowLeft size={20} />
        </button>
        {/* Favorito */}
        <button className="btn-icon" style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 12px)', right: 12, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
          onClick={handleFavorite}>
          <Heart size={20} fill={book.is_favorite ? '#B9955A' : 'none'} color={book.is_favorite ? '#B9955A' : 'white'} />
        </button>
      </div>

      <div style={{ padding: '20px 20px 0' }}>

        {/* Status + rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <select className="select" value={book.status} onChange={handleStatus}
            style={{ flex: 1, padding: '8px 36px 8px 12px', fontSize: 14 }}>
            {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="stars">
            {[1,2,3,4,5].map(i => (
              <button key={i} className="star btn-icon" onClick={() => handleRating(i)} style={{ padding: 2 }}>
                <Star size={20} fill={i <= (book.rating || 0) ? '#B9955A' : 'none'} color={i <= (book.rating || 0) ? '#B9955A' : 'var(--clr-border)'} />
              </button>
            ))}
          </div>
        </div>

        {/* Progresso */}
        {book.status === 'lendo' && book.pages_total && (
          <div className="card-inset" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--clr-text-2)' }}>Progresso</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--clr-sage)' }}>{pct}%</span>
            </div>
            <div className="progress-track" style={{ marginBottom: 10 }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            {editPage ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="input" type="number" value={pageInput} onChange={e => setPageInput(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', fontSize: 14 }} autoFocus />
                <span style={{ color: 'var(--clr-text-3)', fontSize: 13 }}>/ {book.pages_total}</span>
                <button className="btn-icon" onClick={handleSavePage} style={{ background: 'var(--clr-sage-faint)', color: 'var(--clr-sage)' }}>
                  <Check size={16} />
                </button>
                <button className="btn-icon" onClick={() => setEditPage(false)}><X size={16} /></button>
              </div>
            ) : (
              <button onClick={() => setEditPage(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <span style={{ fontSize: 13, color: 'var(--clr-text-2)' }}>
                  Página <strong style={{ color: 'var(--clr-forest)' }}>{book.current_page || 0}</strong> de {book.pages_total}
                  <span style={{ color: 'var(--clr-sage)', marginLeft: 8, fontSize: 12 }}>Editar</span>
                </span>
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          {[
            { key: 'notas', icon: FileText, label: 'Notas' },
            { key: 'info', icon: Info, label: 'Informações' },
          ].map(t => (
            <button key={t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Notas */}
        {tab === 'notas' && (
          <div style={{ paddingBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p className="t-muted" style={{ fontSize: 12 }}>{notes.length} {notes.length === 1 ? 'nota' : 'notas'}</p>
              <button className="btn btn-sage" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 20 }}
                onClick={() => setShowAddNote(true)}>
                <Plus size={14} /> Nova nota
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <BookOpen size={36} strokeWidth={1} color="var(--clr-border)" />
                <p style={{ fontSize: 14, color: 'var(--clr-text-3)' }}>Nenhuma nota ainda.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notes.map(n => (
                  <div key={n.id} className="note-card fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <NoteTypeTag type={n.type} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {n.chapter && <span style={{ fontSize: 11, color: 'var(--clr-text-3)' }}>{n.chapter}</span>}
                        <button className="btn-icon" style={{ width: 28, height: 28, color: 'var(--clr-text-3)' }}
                          onClick={() => handleDeleteNote(n.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--clr-text)', whiteSpace: 'pre-wrap' }}>{n.content}</p>
                    <p style={{ fontSize: 11, color: 'var(--clr-text-3)' }}>
                      {format(new Date(n.created_at), "d MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Info */}
        {tab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 32 }}>
            {[
              { label: 'Editora', value: book.publisher },
              { label: 'Ano', value: book.year_published },
              { label: 'Páginas', value: book.pages_total },
              { label: 'ISBN', value: book.isbn },
              { label: 'Idioma', value: book.language },
              { label: 'Formato', value: book.format },
            ].filter(r => r.value).map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--clr-border-light)' }}>
                <span style={{ fontSize: 14, color: 'var(--clr-text-2)' }}>{r.label}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--clr-text)' }}>{r.value}</span>
              </div>
            ))}

            {book.synopsis && (
              <div style={{ marginTop: 8 }}>
                <p className="field-label" style={{ marginBottom: 8 }}>Sinopse</p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--clr-text-2)' }}>{book.synopsis}</p>
              </div>
            )}

            {book.personal_note && (
              <div style={{ marginTop: 8 }}>
                <p className="field-label" style={{ marginBottom: 8 }}>Nota pessoal</p>
                <div className="card-inset">
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--clr-text)', fontStyle: 'italic' }}>{book.personal_note}</p>
                </div>
              </div>
            )}

            {book.tags?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p className="field-label" style={{ marginBottom: 8 }}>Tags</p>
                <div className="tags-wrap">
                  {book.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
                </div>
              </div>
            )}

            {book.started_at && (
              <p style={{ fontSize: 13, color: 'var(--clr-text-3)', marginTop: 8 }}>
                Iniciado em {format(new Date(book.started_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}
            {book.finished_at && (
              <p style={{ fontSize: 13, color: 'var(--clr-text-3)' }}>
                Concluído em {format(new Date(book.finished_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}

            {/* Deletar livro */}
            <div style={{ marginTop: 24 }}>
              {showDelete ? (
                <div className="card-inset" style={{ display: 'flex', flexDirection: 'column', gap: 10, borderColor: '#E8806A' }}>
                  <p style={{ fontSize: 14, color: 'var(--clr-text)' }}>Remover este livro e todas as suas notas permanentemente?</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowDelete(false)}>Cancelar</button>
                    <button className="btn" style={{ flex: 1, background: '#E8806A', color: 'white', borderRadius: 20 }}
                      onClick={handleDelete}>Remover</button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-ghost" style={{ color: '#C0604A', fontSize: 14 }}
                  onClick={() => setShowDelete(true)}>
                  <Trash2 size={15} /> Remover livro
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddNote && (
        <AddNoteSheet
          bookId={book.id}
          onClose={() => setShowAddNote(false)}
          onAdded={note => setNotes(n => [note, ...n])}
        />
      )}
    </div>
  )
}
