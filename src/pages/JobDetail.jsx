import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [caricamento, setCaricamento] = useState(true)

  useEffect(() => {
    async function caricaJob() {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) navigate('/jobs')
      else setJob(data)
      setCaricamento(false)
    }
    caricaJob()
  }, [id])

  if (caricamento) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400">Caricamento...</p>
    </div>
  )

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/jobs')}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
      >
        ← Torna alle posizioni
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full mb-3">
              Posizione aperta
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{job.titolo}</h1>
          </div>
          <div className="text-right shrink-0 ml-6">
            <p className="text-2xl font-bold text-indigo-600">€{job.referral_fee}</p>
            <p className="text-xs text-gray-400">referral fee</p>
          </div>
        </div>

        {job.scadenza && (
          <p className="text-sm text-gray-400 mb-4">
            Scadenza: {new Date(job.scadenza).toLocaleDateString('it-IT')}
          </p>
        )}

        <div className="prose prose-sm text-gray-600 whitespace-pre-wrap">
          {job.descrizione}
        </div>

        {job.link_esterno && (
          <a
            href={job.link_esterno}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm text-indigo-600 hover:underline"
          >
            Vedi annuncio completo →
          </a>
        )}
      </div>

      {/* Modalità pagamento */}
      {job.modalita_pagamento && Object.keys(job.modalita_pagamento).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Modalità di pagamento</h3>
          <p className="text-sm text-gray-600">{JSON.stringify(job.modalita_pagamento)}</p>
        </div>
      )}

      {/* Bottone referral */}
      <button
        onClick={() => navigate(`/jobs/${id}/referral`)}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
      >
        Segnala un candidato
      </button>
    </div>
  )
}

export default JobDetail