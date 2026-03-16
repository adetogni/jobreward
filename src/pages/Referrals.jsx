import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Referrals() {
  const navigate = useNavigate()
  const [referrals, setReferrals] = useState([])
  const [caricamento, setCaricamento] = useState(true)

  useEffect(() => {
    async function caricaReferrals() {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('referrals')
        .select('*, job_postings(titolo, referral_fee)')
        .eq('inviato_da', user.id)
        .order('created_at', { ascending: false })

      if (!error) setReferrals(data)
      setCaricamento(false)
    }
    caricaReferrals()
  }, [])

  async function rimuoviReferral(id) {
    if (!confirm('Sei sicuro di voler rimuovere questa segnalazione?')) return
    await supabase.from('referrals').delete().eq('id', id)
    setReferrals(referrals.filter(r => r.id !== id))
  }

  const statoColori = {
    nuovo: 'bg-gray-100 text-gray-600',
    in_valutazione: 'bg-yellow-50 text-yellow-700',
    negato: 'bg-red-50 text-red-600',
    assunto: 'bg-green-50 text-green-700'
  }

  const statoLabel = {
    nuovo: 'Nuovo',
    in_valutazione: 'In valutazione',
    negato: 'Non selezionato',
    assunto: 'Assunto 🎉'
  }

  if (caricamento) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400">Caricamento...</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">I miei referral</h1>
          <p className="text-gray-500 text-sm mt-1">{referrals.length} segnalazioni inviate</p>
        </div>
        <button
          onClick={() => navigate('/jobs')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nuova segnalazione
        </button>
      </div>

      {referrals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-400 text-lg">Nessuna segnalazione ancora</p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 text-indigo-600 text-sm font-medium hover:underline"
          >
            Vedi le posizioni aperte →
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {referrals.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-semibold text-gray-900">
                      {r.nome_candidato} {r.cognome_candidato}
                    </h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statoColori[r.stato]}`}>
                      {statoLabel[r.stato]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{r.job_postings?.titolo}</p>
                  {r.linkedin_url && (
                    <a
                      href={r.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:underline mt-1 inline-block"
                    >
                      Vedi profilo LinkedIn →
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Inviato il {new Date(r.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <div className="ml-6 flex flex-col items-end gap-2 shrink-0">
                  {r.stato === 'assunto' && (
                    <span className="text-lg font-bold text-green-600">
                      €{r.job_postings?.referral_fee}
                    </span>
                  )}
                  {r.stato === 'nuovo' && (
                    <button
                      onClick={() => rimuoviReferral(r.id)}
                      className="text-xs text-red-400 hover:text-red-600 hover:underline"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Referrals