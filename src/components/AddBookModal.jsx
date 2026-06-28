import { useState } from 'react'
import { X, Search, Loader } from 'lucide-react'
import { addBook, searchBookCover, fetchBookByISBN } from '../lib/db.js'

const FORMATS = [
  { value: 'fisico', label: 'Físico' },
  { value: 'kindle', label: 'Kindle' },
  { value: 'pdf', label: 'PDF' },
  { value: 'epub', label: 'EPUB' },
  { value: 'audiobook', label: 'Audiobook' },
  { value: 'artigo', label: 'Artigo' },
  { value: 'apostila', label: 'Apostila' },
]

const STATUSES = [
  { value: 'lendo', label: 'Lendo' },
  { value: 'quero_ler', label: 'Quero ler' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'reler', label: 'Reler' },
  { value: 'consulta', label: 'Consulta frequente' },
  { value: 'abandonado', label: 'Abandonado' },
]

const DEFAULT = {
  title: '', author: '', subtitle: '', cover_url: '',
  format: 'fisico', status: 'quero_ler', language: 'pt',
  pages_total: '', year_published: '', publisher: '', isbn: '',
  synopsis: '', personal_note: '', collections: [], tags: [],
}

export default function AddBookModal({ onClose, onAdded }) {
  const [form, setForm] = useState(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [coverPreview, setCoverPreview] = useState('')
  const [tagInput, setTagInput] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleFetchCover() {
    if (!form.title) return
    setFetching(true)
    const url = await searchBookCover(form.title, form.author)
    if (url) {
      set('cover_url', url)
      setCoverPreview(url)
    }
    setFetching(false)
  }

  async function handleISBN() {
    if (!form.isbn) return
    setFetching(true)
    const info = await fetchBookByISBN(form.isbn.replace(/[-\s]/g, ''))
    if (info) {
      setForm(f => ({ ...f, ...Object.fromEntries(Object.entries(info).filter(([, v]) => v)) }))
      if (info.cover_url) setCoverPreview(info.cover_url)
    }
    setFetching(false)
  }

  function addTag(e) {
    if (e.key === 'Enter' && tagInput.trim()) {
      set('tags', [...form.tags, tagInput.trim()])
      setTagInput('')
      e.preventDefault()
    }
  }
  function removeTag(t) { set('tags', form.tags.filter(x => x !== t)) }

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const book = await addBook({
        ...form,
        pages_total: form.pages_total ? parseInt(form.pages_total) : null,
        year_published: form.year_published ? parseInt(form.year_published) : null,
        cover_url: form.cover_url || null,
      })
      onAdded(book)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 className="sheet-title" style={{ margin: 0 }}>Adicionar livro</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Cover preview */}
        {coverPreview && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <img src={coverPreview} alt="Capa" onError={() => setCoverPreview('')}
              style={{ height: 140, borderRadius: 8, boxShadow: '0 4px 16px rgba(30,46,36,0.18)' }} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ISBN com busca automática */}
          <div className="field">
            <label className="field-label">ISBN (opcional)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Ex: 9788535914849" value={form.isbn}
                onChange={e => set('isbn', e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-sage" style={{ padding: '0 16px', borderRadius: 10, flexShrink: 0 }}
                onClick={handleISBN} disabled={fetching || !form.isbn}>
                {fetching ? <Loader size={16} className="spin" /> : <Search size={16} />}
              </button>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Título *</label>
            <input className="input" placeholder="Título do livro" value={form.title}
              onChange={e => set('title', e.target.value)} autoFocus />
          </div>

          <div className="field">
            <label className="field-label">Autor</label>
            <input className="input" placeholder="Nome do autor" value={form.author}
              onChange={e => set('author', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label className="field-label">Formato</label>
              <select className="select" value={form.format} onChange={e => set('format', e.target.value)}>
                {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Status</label>
              <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label className="field-label">Páginas</label>
              <input className="input" type="number" placeholder="Ex: 320" value={form.pages_total}
                onChange={e => set('pages_total', e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Ano</label>
              <input className="input" type="number" placeholder="Ex: 2023" value={form.year_published}
                onChange={e => set('year_published', e.target.value)} />
            </div>
          </div>

          {/* Capa URL + buscar */}
          <div className="field">
            <label className="field-label">URL da capa</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="https://..." value={form.cover_url}
                onChange={e => { set('cover_url', e.target.value); setCoverPreview(e.target.value) }}
                style={{ flex: 1 }} />
              <button className="btn btn-ghost" style={{ flexShrink: 0, background: 'var(--clr-bg-warm)', borderRadius: 10, padding: '0 12px', fontSize: 12 }}
                onClick={handleFetchCover} disabled={fetching || !form.title}>
                {fetching ? <Loader size={14} /> : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="field">
            <label className="field-label">Tags</label>
            <input className="input" placeholder="Digite e pressione Enter"
              value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />
            {form.tags.length > 0 && (
              <div className="tags-wrap" style={{ marginTop: 6 }}>
                {form.tags.map(t => (
                  <span key={t} className="tag-chip" style={{ cursor: 'pointer' }} onClick={() => removeTag(t)}>
                    {t} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Nota pessoal */}
          <div className="field">
            <label className="field-label">Nota pessoal</label>
            <textarea className="input" placeholder="Por que você quer ler este livro?" value={form.personal_note}
              onChange={e => set('personal_note', e.target.value)} rows={3} />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }}
            onClick={handleSave} disabled={saving || !form.title.trim()}>
            {saving ? 'Salvando…' : 'Adicionar à biblioteca'}
          </button>
        </div>
      </div>
    </div>
  )
}
