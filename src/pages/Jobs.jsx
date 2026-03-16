import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Jobs() {
  const [jobs, setJobs] = useState([])
  const [caricamento, setCaricamento] = useState(true)

  useEffect(() => {
    async function caricaJobs() {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('stato', 'aperta')
        .order('created_at', { ascending: false })

      if (!error) setJobs(data)
      setCaricamento(false)
    }
    caricaJobs()
  }, [])

  if (caricamento) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400">Caricamento posizioni...</p>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posizioni aperte</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} posizioni disponibili</p>
        </div>
      </div>

      {/* Lista jobs */}
      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-400 text-lg">Nessuna posizione aperta al momento</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">{job.titolo}</h2>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{job.descrizione}</p>
                  <div className="flex items-center gap-4 mt-3">
                    {job.scadenza && (
                      <span className="text-xs text-gray-400">
                        Scade il {new Date(job.scadenza).toLocaleDateString('it-IT')}
                      </span>
                    )}
                    {job.link_esterno && (
                      <span className="text-xs text-indigo-500">Annuncio esterno disponibile</span>
                    )}
                  </div>
                </div>
                <div className="ml-6 text-right shrink-0">
                  <span className="inline-block bg-green-50 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                    €{job.referral_fee}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">referral fee</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Jobs