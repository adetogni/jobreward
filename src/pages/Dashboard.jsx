import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Dashboard() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Gestionale Clienti</h1>
        <button onClick={handleLogout}
          style={{ padding: '0.5rem 1rem', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      <p>Bentornato! Qui vedremo la lista clienti.</p>
    </div>
  )
}

export default Dashboard