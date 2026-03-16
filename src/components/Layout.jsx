import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

    // Dentro la funzione Layout, prima del return:
const [ruolo, setRuolo] = useState('')

useEffect(() => {
  async function caricaRuolo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('ruolo').eq('id', user.id).single()
    setRuolo(data?.ruolo || '')
  }
  caricaRuolo()
}, [])

  const navItems = [
    { path: '/jobs', label: 'Posizioni aperte' },
    { path: '/referrals', label: 'I miei referral' },
    { path: '/leaderboard', label: 'Classifica' },
    ...(ruolo === 'hr' || ruolo === 'admin' ? [{ path: '/hr/jobs', label: '⚙️ HR' }] : []),
    ...(ruolo === 'hr' || ruolo === 'admin' ? [
    { path: '/hr/jobs', label: '⚙️ Posizioni HR' },
    { path: '/hr/referrals', label: '⚙️ Candidature HR' }
    ] : [])
  ]



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/jobs" className="text-xl font-bold text-indigo-600 tracking-tight">
            JobReward
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium"
          >
            Esci
          </button>
        </div>
      </nav>

      {/* Contenuto pagina */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout