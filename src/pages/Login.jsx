import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
      navigate('/jobs')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bentornato</h1>
          <p className="text-gray-500 mt-1 text-sm">Accedi al tuo account JobReward</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="tu@esempio.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
          {errore && <p className="text-red-500 text-sm">{errore}</p>}
          <button
            type="submit" disabled={caricamento}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {caricamento ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Non hai un account?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login