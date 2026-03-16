import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: '', cognome: '', email: '', password: '', azienda: ''
  })
  const [errore, setErrore] = useState('')
  const [caricamento, setCaricamento] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleRegister(e) {
    e.preventDefault()
    setCaricamento(true)
    setErrore('')

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nome: form.nome,
          cognome: form.cognome,
          azienda: form.azienda
        }
      }
    })

    if (error) {
      setErrore(error.message)
      setCaricamento(false)
    } else {
      navigate('/jobs')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Crea account</h1>
          <p className="text-gray-500 mt-1 text-sm">Inizia a guadagnare con i tuoi referral</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                name="nome" value={form.nome} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Mario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
              <input
                name="cognome" value={form.cognome} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Rossi"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Azienda <span className="text-gray-400">(opzionale)</span></label>
            <input
              name="azienda" value={form.azienda} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Acme Srl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="mario@esempio.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password" type="password" value={form.password} onChange={handleChange} required minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
          {errore && <p className="text-red-500 text-sm">{errore}</p>}
          <button
            type="submit" disabled={caricamento}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {caricamento ? 'Registrazione in corso...' : 'Crea account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Hai già un account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register