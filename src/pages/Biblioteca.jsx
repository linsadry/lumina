import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, SlidersHorizontal } from 'lucide-react'
import { getBooks } from '../lib/db.js'
import BookCard from '../components/BookCard.jsx'
import AddBookModal from '../components/AddBookModal.jsx'

const STATUS_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'lendo', label: 'Lendo' },
  { value: 'quero_ler', label: 'Quero ler' },
  { value: 'concluido', label: 'Concluídos' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'reler', label: 'Reler' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'abandonado', label: 'Abandonado' },
]

const FORMAT_FILTERS = [
  { value: 'todos', label: 'Todos os formatos' },
  { value: 'fisico', label: 'Físico' },
  { value: 'kindle', label: 'Kindle' },
  { value: 'pdf', label: 'PDF' },
  { value: 'epub', label: 'EPUB' },
  { value: 'artigo', label: 'Artigos' },
  { value: 'apostila', label: 'Apostilas' },
  { value: 'audiobook', label: 'Audiobook' },
]

export default function Biblioteca() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('todos')
  const [format, setFormat] = useState('todos')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showFormat, setShowFormat] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getBooks({ status, format, search })
      setBooks(data)
    } finally {
      setLoading(false)
    }
  }, [status, format, search])

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1 className="t-display-lg">Biblioteca</h1>
          <button className="btn-icon" onClick={() => setShowFormat(f => !f)} style={{ background: showFormat ? 'var(--clr-sage-faint)' : undefined }}>
            <SlidersHorizontal size={18} color={showFormat ? 'var(--clr-sage)' : undefined} />
          </button>
        </div>

        {/* Search */}
        <div className="search-wrap">
          <Search size={16} />
          <input className="search-input" placeholder="Buscar por título ou autor…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Status chips */}
        <div className="chips-scroll" style={{ marginBottom: showFormat ? 10 : 0 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f.value} className={`chip${status === f.value ? ' active' : ''}`}
              onClick={() => setStatus(f.value)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Format filter (collapsible) */}
        {showFormat && (
          <div className="chips-scroll" style={{ marginTop: 6 }}>
            {FORMAT_FILTERS.map(f => (
              <button key={f.value} className={`chip${format === f.value ? ' active' : ''}`}
                onClick={() => setFormat(f.value)} style={{ fontSize: 12 }}>
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loader"><div className="loader-ring" /></div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="var(--clr-border)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="var(--clr-border)" strokeWidth="1.5"/>
            </svg>
            <h3>{search ? 'Nenhum resultado' : 'Nada aqui ainda'}</h3>
            <p>{search ? `Nenhum livro encontrado para "${search}"` : 'Adicione seu primeiro livro.'}</p>
          </div>
        ) : (
          <>
            <p className="t-muted" style={{ marginBottom: 14, fontSize: 12 }}>
              {books.length} {books.length === 1 ? 'livro' : 'livros'}
            </p>
            <div className="books-grid fade-in">
              {books.map(b => <BookCard key={b.id} book={b} />)}
            </div>
          </>
        )}
      </div>

      <button className="fab" onClick={() => setShowAdd(true)}>
        <Plus size={22} color="white" />
      </button>

      {showAdd && (
        <AddBookModal onClose={() => setShowAdd(false)} onAdded={() => load()} />
      )}
    </div>
  )
}
