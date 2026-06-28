import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const PIN_HASH_KEY = 'lumina_pin_hash'

async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin + 'lumina-salt'))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(false)
  const [hasPin, setHasPin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(PIN_HASH_KEY)
    setHasPin(!!stored)
    setLoading(false)
  }, [])

  async function setPin(pin) {
    const h = await hashPin(pin)
    localStorage.setItem(PIN_HASH_KEY, h)
    setHasPin(true)
    setAuthed(true)
  }

  async function checkPin(pin) {
    const stored = localStorage.getItem(PIN_HASH_KEY)
    if (!stored) return false
    const h = await hashPin(pin)
    const ok = h === stored
    if (ok) setAuthed(true)
    return ok
  }

  function logout() { setAuthed(false) }

  return (
    <AuthContext.Provider value={{ authed, hasPin, loading, setPin, checkPin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
