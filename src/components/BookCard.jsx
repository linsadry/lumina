import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'

const STATUS_LABELS = {
  lendo: 'Lendo',
  concluido: 'Concluído',
  quero_ler: 'Quero ler',
  pausado: 'Pausado',
  consulta: 'Consulta',
  abandonado: 'Abandonado',
  reler: 'Reler',
}

export default function BookCard({ book, size = 'grid' }) {
  const nav = useNavigate()
  const pct = book.pages_total && book.current_page
    ? Math.min(100, Math.round((book.current_page / book.pages_total) * 100))
    : 0

  if (size === 'scroll') {
    return (
      <div
        onClick={() => nav(`/livro/${book.id}`)}
        style={{ width: 110, flexShrink: 0, cursor: 'pointer' }}
      >
        <div style={{ width: 110, height: 160, borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 16px rgba(30,46,36,0.18)', marginBottom: 8 }}>
          {book.cover_url
            ? <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <CoverPlaceholder title={book.title} author={book.author} />
          }
        </div>
        {book.status === 'lendo' && pct > 0 && (
          <div className="progress-track" style={{ marginBottom: 5 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        )}
        <p className="t-display-sm" style={{ fontSize: 12, lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {book.title}
        </p>
        <p className="t-muted" style={{ fontSize: 11 }}>{book.author}</p>
      </div>
    )
  }

  return (
    <div onClick={() => nav(`/livro/${book.id}`)} style={{ cursor: 'pointer' }}>
      <div style={{ aspectRatio: '2/3', borderRadius: 10, overflow: 'hidden', boxShadow: '0 3px 12px rgba(30,46,36,0.14)', marginBottom: 8, position: 'relative' }}>
        {book.cover_url
          ? <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <CoverPlaceholder title={book.title} author={book.author} />
        }
        {book.is_favorite && (
          <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(20,30,24,0.7)', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={11} fill="#B9955A" color="#B9955A" />
          </div>
        )}
      </div>
      {book.status === 'lendo' && pct > 0 && (
        <div className="progress-track" style={{ marginBottom: 6 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--clr-forest)', lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {book.title}
      </p>
      <p style={{ fontSize: 11, color: 'var(--clr-text-3)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {book.author}
      </p>
      <div style={{ marginTop: 5 }}>
        <span className={`status-badge status-${book.status}`} style={{ fontSize: 9, padding: '2px 7px' }}>
          {STATUS_LABELS[book.status] || book.status}
        </span>
      </div>
    </div>
  )
}

export function CoverPlaceholder({ title, author }) {
  return (
    <div className="cover-placeholder" style={{ width: '100%', height: '100%' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.35, flexShrink: 0 }}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" strokeWidth="1.5"/>
      </svg>
      <p className="cover-placeholder-title">{title}</p>
      {author && <p className="cover-placeholder-author">{author}</p>}
    </div>
  )
}
