import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  // Ancora in caricamento
  if (session === undefined) return <p>Caricamento...</p>

  // Non loggato → rimanda al login
  if (!session) return <Navigate to="/login" />

  // Loggato → mostra la pagina
  return children
}

export default ProtectedRoute