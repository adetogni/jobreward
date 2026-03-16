import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function HrRoute({ children }) {
  const [stato, setStato] = useState('caricamento')

  useEffect(() => {
    async function verificaRuolo() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setStato('non_autorizzato'); return }

      const { data } = await supabase
        .from('profiles')
        .select('ruolo')
        .eq('id', user.id)
        .single()

      setStato(data?.ruolo === 'hr' || data?.ruolo === 'admin' ? 'autorizzato' : 'non_autorizzato')
    }
    verificaRuolo()
  }, [])

  if (stato === 'caricamento') return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400">Verifica permessi...</p>
    </div>
  )

  if (stato === 'non_autorizzato') return <Navigate to="/jobs" />

  return children
}

export default HrRoute