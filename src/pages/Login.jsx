import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errore, setErrore] = useState('')
  const [caricamento, setCaricamento] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setCaricamento(true)
    setErrore('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrore('Email o password errati')
      setCaricamento(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Accedi</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            required
          />
        </div>
        {errore && <p style={{ color: 'red' }}>{errore}</p>}
        <button type="submit" disabled={caricamento}
          style={{ width: '100%', padding: '0.75rem', background: '#3ecf8e', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {caricamento ? 'Accesso in corso...' : 'Accedi'}
        </button>
      </form>
    </div>
  )
}

export default Login