import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, BookOpen, Target } from 'lucide-react'
import { getBooks, getStats, getStreak } from '../lib/db.js'
import BookCard from '../components/BookCard.jsx'
import AddBookModal from '../components/AddBookModal.jsx'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia, Adriana.'
  if (h < 18) return 'Boa tarde, Adriana.'
  return 'Boa noite, Adriana.'
}

export default function Home() {
  const nav = useNavigate()
  const [lendo, setLendo] = useState([])
  const [recentes, setRecentes] = useState([])
  const [stats, setStats] = useState(null)
  const [streak, setStreak] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const [lendoRes, recentesRes, statsRes, streakRes] = await Promise.all([
        getBooks({ status: 'lendo' }),
        getBooks({}),
        getStats(),
        getStreak(),
      ])
      setLendo(lendoRes)
      setRecentes(recentesRes.slice(0, 6))
      setStats(statsRes)
      setStreak(streakRes)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{ background: 'linear-gradient(to bottom, var(--clr-bg) 80%, transparent)' }}>
        <p className="t-muted" style={{ marginBottom: 2, fontSize: 12, textTransform: 'capitalize' }}>{todayCap}</p>
        <h1 className="t-display-lg">{greeting()}</h1>
      </div>

      <div className="page-content">

        {/* Stats rápidas */}
        {stats && (
          <div className="section-gap">
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--clr-gold)' }}>
                  {streak > 0 ? streak : '—'}
                </div>
                <div className="stat-label">dias de{'\n'}sequência</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.lidos_ano}</div>
                <div className="stat-label">livros{'\n'}este ano</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">na{'\n'}biblioteca</div>
              </div>
            </div>
          </div>
        )}

        {/* Lendo agora */}
        {lendo.length > 0 && (
          <div className="section-gap">
            <p className="section-title">Lendo agora</p>
            <div className="books-scroll">
              {lendo.map(b => (
                <BookCard key={b.id} book={b} size="scroll" />
              ))}
            </div>
          </div>
        )}

        {/* Biblioteca recente */}
        {recentes.length > 0 ? (
          <div className="section-gap">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p className="section-title" style={{ margin: 0 }}>Recentes</p>
              <button className="btn btn-ghost" style={{ fontSize: 13, padding: '4px 10px' }}
                onClick={() => nav('/biblioteca')}>
                Ver tudo
              </button>
            </div>
            <div className="books-grid">
              {recentes.map(b => <BookCard key={b.id} book={b} />)}
            </div>
          </div>
        ) : !loading && (
          <div className="section-gap">
            <div className="empty-state" style={{ padding: '40px 24px' }}>
              <BookOpen size={48} strokeWidth={1} color="var(--clr-border)" />
              <h3>Sua biblioteca está vazia</h3>
              <p>Comece adicionando o primeiro livro da sua jornada.</p>
              <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setShowAdd(true)}>
                <Sparkles size={15} /> Adicionar livro
              </button>
            </div>
          </div>
        )}

        {/* Meta anual (visual simples) */}
        {stats && stats.lidos_ano > 0 && (
          <div className="section-gap" style={{ marginBottom: 8 }}>
            <div className="card-inset">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Target size={15} color="var(--clr-gold)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--clr-forest)' }}>Meta anual</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span className="stat-value" style={{ fontSize: 20 }}>{stats.lidos_ano}</span>
                <span className="t-muted">/ 24 livros</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(100, (stats.lidos_ano / 24) * 100)}%`, background: 'var(--clr-gold)' }} />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAdd(true)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {showAdd && (
        <AddBookModal onClose={() => setShowAdd(false)} onAdded={() => load()} />
      )}
    </div>
  )
}
