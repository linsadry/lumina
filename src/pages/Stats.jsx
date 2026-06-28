import { useState, useEffect } from 'react'
import { BookOpen, Star, Layers, Clock } from 'lucide-react'
import { getStats } from '../lib/db.js'

const FORMAT_LABELS = {
  fisico: 'Físico', kindle: 'Kindle', pdf: 'PDF', epub: 'EPUB',
  audiobook: 'Audiobook', artigo: 'Artigo', apostila: 'Apostila',
}

export default function Stats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getStats().then(setStats)
  }, [])

  if (!stats) return <div className="loader"><div className="loader-ring" /></div>

  const formats = Object.entries(stats.por_formato || {}).sort((a, b) => b[1] - a[1])

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="t-display-lg">Estatísticas</h1>
        <p className="t-muted" style={{ marginTop: 4 }}>Sua jornada de leitura</p>
      </div>

      <div className="page-content">

        {/* Cards principais */}
        <div className="stat-grid">
          <div className="stat-card">
            <Star size={16} color="var(--clr-gold)" strokeWidth={1.5} />
            <div className="stat-value">{stats.concluidos}</div>
            <div className="stat-label">concluídos</div>
          </div>
          <div className="stat-card">
            <BookOpen size={16} color="var(--clr-sage)" strokeWidth={1.5} />
            <div className="stat-value">{stats.lendo}</div>
            <div className="stat-label">em leitura</div>
          </div>
          <div className="stat-card">
            <Layers size={16} color="var(--clr-text-3)" strokeWidth={1.5} />
            <div className="stat-value">{stats.quero_ler}</div>
            <div className="stat-label">na fila</div>
          </div>
        </div>

        {/* Este ano */}
        <div className="section-gap">
          <p className="section-title">Este ano</p>
          <div className="card-inset">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div className="stat-value" style={{ fontSize: 36 }}>{stats.lidos_ano}</div>
                <div className="stat-label">livros lidos em {new Date().getFullYear()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="stat-value" style={{ fontSize: 36, color: 'var(--clr-gold)' }}>
                  {Math.round((stats.lidos_ano / 24) * 100)}%
                </div>
                <div className="stat-label">da meta (24)</div>
              </div>
            </div>
            <div className="progress-track" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${Math.min(100, (stats.lidos_ano / 24) * 100)}%`, background: 'var(--clr-gold)', height: '100%' }} />
            </div>
          </div>
        </div>

        {/* Por formato */}
        {formats.length > 0 && (
          <div className="section-gap">
            <p className="section-title">Por formato</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {formats.map(([fmt, count]) => (
                <div key={fmt} className="card-inset" style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--clr-text)' }}>
                      {FORMAT_LABELS[fmt] || fmt}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--clr-forest)' }}>{count}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${(count / stats.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="section-gap">
          <div className="card-inset" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ fontSize: 42, color: 'var(--clr-forest)' }}>{stats.total}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--clr-text-2)', marginTop: 4 }}>
              livros na biblioteca
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
