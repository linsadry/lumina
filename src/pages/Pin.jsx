import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Delete } from 'lucide-react'

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del']

export default function Pin() {
  const { authed, hasPin, setPin, checkPin } = useAuth()
  const nav = useNavigate()
  const [pin, setEntry] = useState('')
  const [confirm, setConfirm] = useState('')
  const [stage, setStage] = useState('enter') // 'enter' | 'confirm'
  const [error, setError] = useState('')

  useEffect(() => {
    if (authed) nav('/', { replace: true })
  }, [authed])

  function press(k) {
    setError('')
    if (k === 'del') {
      if (stage === 'enter') setEntry(p => p.slice(0, -1))
      else setConfirm(p => p.slice(0, -1))
      return
    }
    if (!hasPin) {
      if (stage === 'enter') {
        const next = pin + k
        setEntry(next)
        if (next.length === 4) setStage('confirm')
      } else {
        const next = confirm + k
        setConfirm(next)
        if (next.length === 4) handleSetup(next)
      }
    } else {
      const next = pin + k
      setEntry(next)
      if (next.length === 4) handleCheck(next)
    }
  }

  async function handleSetup(c) {
    if (c !== pin) {
      setError('PINs não coincidem. Tente novamente.')
      setEntry('')
      setConfirm('')
      setStage('enter')
    } else {
      await setPin(pin)
    }
  }

  async function handleCheck(p) {
    const ok = await checkPin(p)
    if (!ok) {
      setError('PIN incorreto.')
      setEntry('')
    }
  }

  const current = stage === 'enter' ? pin : confirm

  return (
    <div className="pin-screen">
      <div className="pin-logo">
        <img src="/icon.png" alt="Lumina" />
      </div>
      <div className="pin-app-name">Lumina</div>
      <div className="pin-tagline">Onde cada leitura ilumina a próxima.</div>

      {!hasPin && (
        <div className="pin-subtitle" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
          {stage === 'enter' ? 'Crie um PIN de 4 dígitos' : 'Confirme seu PIN'}
        </div>
      )}
      {hasPin && (
        <div className="pin-subtitle">Digite seu PIN</div>
      )}

      <div className="pin-dots">
        {[0,1,2,3].map(i => (
          <div key={i} className={`pin-dot ${current.length > i ? 'filled' : ''}`} />
        ))}
      </div>

      <div className="pin-keypad">
        {KEYS.map((k, i) => (
          k === '' ? (
            <div key={i} />
          ) : k === 'del' ? (
            <button key={i} className="pin-key delete" onClick={() => press('del')}>
              <Delete size={20} color="rgba(255,255,255,0.7)" />
            </button>
          ) : (
            <button key={i} className="pin-key" onClick={() => press(k)}>{k}</button>
          )
        ))}
      </div>

      <div className="pin-error">{error}</div>
    </div>
  )
}
