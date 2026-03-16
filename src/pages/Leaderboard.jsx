import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Leaderboard() {
  const [classifica, setClassifica] = useState([])
  const [caricamento, setCaricamento] = useState(true)
  const [utenteCorrente, setUtenteCorrente] = useState(null)

  useEffect(() => {
    async function carica() {
      const { data: { user } } = await supabase.auth.getUser()
      setUtenteCorrente(user)

      // Prendi tutti i referral con profilo utente
      const { data, error } = await supabase
        .from('referrals')
        .select('inviato_da, stato, job_postings(referral_fee), profiles(id, nome, cognome, azienda)')

      if (error || !data) { setCaricamento(false); return }

      // Calcola statistiche per utente
      const statsMap = {}
      data.forEach(r => {
        const uid = r.inviato_da
        if (!statsMap[uid]) {
          statsMap[uid] = {
            id: uid,
            nome: r.profiles?.nome,
            cognome: r.profiles?.cognome,
            azienda: r.profiles?.azienda,
            totale: 0,
            assunti: 0,
            in_valutazione: 0,
            guadagno: 0
          }
        }
        statsMap[uid].totale++
        if (r.stato === 'assunto') {
          statsMap[uid].assunti++
          statsMap[uid].guadagno += r.job_postings?.referral_fee || 0
        }
        if (r.stato === 'in_valutazione') {
          statsMap[uid].in_valutazione++
        }
      })

      // Ordina per assunti, poi per totale
      const classifica = Object.values(statsMap).sort((a, b) => {
        if (b.assunti !== a.assunti) return b.assunti - a.assunti
        return b.totale - a.totale
      })

      setClassifica(classifica)
      setCaricamento(false)
    }
    carica()
  }, [])

  const medaglie = ['🥇', '🥈', '🥉']

  if (caricamento) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400">Caricamento classifica...</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Classifica</h1>
        <p className="text-gray-500 text-sm mt-1">I migliori referral della community</p>
      </div>

      {classifica.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-400">Nessun referral ancora — sii il primo!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {classifica.map((utente, index) => {
            const isMe = utente.id === utenteCorrente?.id
            return (
              <div
                key={utente.id}
                className={`bg-white rounded-2xl border p-5 flex items-center gap-4 transition-all ${
                  isMe
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-gray-200'
                }`}
              >
                {/* Posizione */}
                <div className="text-2xl w-8 text-center shrink-0">
                  {index < 3 ? medaglie[index] : <span className="text-gray-400 text-base font-bold">#{index + 1}</span>}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-indigo-600 font-bold text-sm">
                    {utente.nome?.[0]}{utente.cognome?.[0]}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {utente.nome} {utente.cognome}
                    {isMe && <span className="ml-2 text-xs text-indigo-500 font-normal">tu</span>}
                  </p>
                  {utente.azienda && (
                    <p className="text-xs text-gray-400">{utente.azienda}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-6 shrink-0 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{utente.totale}</p>
                    <p className="text-xs text-gray-400">segnalazioni</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{utente.assunti}</p>
                    <p className="text-xs text-gray-400">assunti</p>
                  </div>
                  {utente.guadagno > 0 && (
                    <div>
                      <p className="text-lg font-bold text-indigo-600">€{utente.guadagno}</p>
                      <p className="text-xs text-gray-400">guadagnato</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Leaderboard