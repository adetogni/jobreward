import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function HrJobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [caricamento, setCaricamento] = useState(true)

  useEffect(() => {
    async function caricaJobs() {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*, referrals(count)')
        .order('created_at', { ascending: false })

      if (!error) setJobs(data)
      setCaricamento(false)
    }
    caricaJobs()
  }, [])

  async function chiudiJob(id, motivo) {
    await supabase
      .from('job_postings')
      .update({ stato: motivo })
      .eq('id', id)

    setJobs(jobs.map(j => j.id === id ? { ...j, stato: motivo } : j))
  }

  const statoColori = {
    aperta: 'bg-green-50 text-green-700',
    chiusa_trovato: 'bg-blue-50 text-blue-700',
    chiusa_aziendale: 'bg-gray-100 text-gray-600'
  }

  const statoLabel = {
    aperta: 'Aperta',
    chiusa_trovato: 'Chiusa - Candidato trovato',
    chiusa_aziendale: 'Chiusa - Motivi aziendali'
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
          <h1 className="text-2xl font-bold text-gray-900">Gestione posizioni</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} posizioni totali</p>
        </div>
        <button
          onClick={() => navigate('/hr/jobs/new')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nuova posizione
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-400 text-lg">Nessuna posizione creata</p>
          <button
            onClick={() => navigate('/hr/jobs/new')}
            className="mt-4 text-indigo-600 text-sm font-medium hover:underline"
          >
            Crea la prima posizione →
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">{job.titolo}</h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statoColori[job.stato]}`}>
                      {statoLabel[job.stato]}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2">{job.descrizione}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-gray-400">
                      {job.referrals?.[0]?.count || 0} candidature ricevute
                    </span>
                    {job.scadenza && (
                      <span className="text-xs text-gray-400">
                        Scade il {new Date(job.scadenza).toLocaleDateString('it-IT')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-6 flex flex-col items-end gap-2 shrink-0">
                  <span className="text-lg font-bold text-indigo-600">€{job.referral_fee}</span>
                  {job.stato === 'aperta' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => chiudiJob(job.id, 'chiusa_trovato')}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Candidato trovato
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => chiudiJob(job.id, 'chiusa_aziendale')}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Chiudi
                      </button>
                    </div>
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

export default HrJobs