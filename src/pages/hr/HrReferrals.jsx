import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function HrReferrals() {
  const [referrals, setReferrals] = useState([])
  const [caricamento, setCaricamento] = useState(true)
  const [filtroStato, setFiltroStato] = useState('tutti')
  const [filtroJob, setFiltroJob] = useState('tutti')
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    async function carica() {
      const { data: jobsData } = await supabase
        .from('job_postings')
        .select('id, titolo')
        .order('created_at', { ascending: false })

      const { data, error } = await supabase
        .from('referrals')
        .select('*, job_postings(titolo, referral_fee), profiles(nome, cognome, azienda)')
        .order('created_at', { ascending: false })

      if (!error) setReferrals(data)
      if (jobsData) setJobs(jobsData)
      setCaricamento(false)
    }
    carica()
  }, [])

  async function aggiornaStato(id, nuovoStato) {
    const { error } = await supabase
      .from('referrals')
      .update({ stato: nuovoStato })
      .eq('id', id)

    if (!error) {
      setReferrals(referrals.map(r =>
        r.id === id ? { ...r, stato: nuovoStato } : r
      ))
    }
  }

  async function aggiornaApprovazione(id, valore) {
    const { error } = await supabase
      .from('referrals')
      .update({ approvato_hr: valore })
      .eq('id', id)

    if (!error) {
      setReferrals(referrals.map(r =>
        r.id === id ? { ...r, approvato_hr: valore } : r
      ))
    }
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
    assunto: 'Assunto'
  }

  const referralsFiltrati = referrals
    .filter(r => filtroStato === 'tutti' || r.stato === filtroStato)
    .filter(r => filtroJob === 'tutti' || r.job_posting_id === filtroJob)

  if (caricamento) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400">Caricamento...</p>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestione candidature</h1>
        <p className="text-gray-500 text-sm mt-1">{referralsFiltrati.length} candidature</p>
      </div>

      {/* Filtri */}
      <div className="flex gap-3 mb-6">
        <select
          value={filtroStato}
          onChange={e => setFiltroStato(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="tutti">Tutti gli stati</option>
          <option value="nuovo">Nuovo</option>
          <option value="in_valutazione">In valutazione</option>
          <option value="negato">Non selezionato</option>
          <option value="assunto">Assunto</option>
        </select>

        <select
          value={filtroJob}
          onChange={e => setFiltroJob(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="tutti">Tutte le posizioni</option>
          {jobs.map(j => (
            <option key={j.id} value={j.id}>{j.titolo}</option>
          ))}
        </select>
      </div>

      {/* Lista candidature */}
      {referralsFiltrati.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-400">Nessuna candidatura trovata</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {referralsFiltrati.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  {/* Candidato */}
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-semibold text-gray-900">
                      {r.nome_candidato} {r.cognome_candidato}
                    </h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statoColori[r.stato]}`}>
                      {statoLabel[r.stato]}
                    </span>
                    {r.approvato_hr && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                        ✓ Approvato
                      </span>
                    )}
                  </div>

                  {/* Job */}
                  <p className="text-sm text-gray-500 mb-2">{r.job_postings?.titolo}</p>

                  {/* Segnalato da */}
                  <p className="text-xs text-gray-400">
                    Segnalato da <span className="font-medium text-gray-600">
                      {r.profiles?.nome} {r.profiles?.cognome}
                    </span>
                    {r.profiles?.azienda && ` · ${r.profiles.azienda}`}
                  </p>

                  {/* Relazione */}
                  <p className="text-xs text-gray-400 mt-0.5">
                    Relazione: {{
                      lavorato_insieme: 'Ha lavorato insieme',
                      conosco: 'Si conoscono',
                      trovato_online: 'Trovato online'
                    }[r.relazione]}
                  </p>

                  {/* LinkedIn */}
                  {r.tipo === 'profilo_linkedin' && r.linkedin_url && (
                        <a
                        href={r.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-500 hover:underline mt-1 inline-block"
                    >
                        Vedi profilo LinkedIn →
                    </a>
                    )}
                    {r.tipo === 'cv_caricato' && r.cv_url && (
                    <button
                        onClick={async () => {
                        const { data } = await supabase.storage.from('cv').createSignedUrl(r.cv_url, 60)
                        if (data?.signedUrl) window.open(data.signedUrl, '_blank')
                        }}
                        className="text-xs text-indigo-500 hover:underline mt-1 inline-block"
                    >
                        Scarica CV →
                    </button>
                    )}

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(r.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>

                {/* Azioni */}
                <div className="shrink-0 flex flex-col gap-2 min-w-40">
                  {/* Approvazione */}
                  {!r.approvato_hr ? (
                    <button
                      onClick={() => aggiornaApprovazione(r.id, true)}
                      className="text-xs px-3 py-1.5 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Approva candidatura
                    </button>
                  ) : (
                    <button
                      onClick={() => aggiornaApprovazione(r.id, false)}
                      className="text-xs px-3 py-1.5 border border-gray-200 text-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Revoca approvazione
                    </button>
                  )}

                  {/* Cambio stato */}
                  <select
                    value={r.stato}
                    onChange={e => aggiornaStato(r.id, e.target.value)}
                    className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="nuovo">Nuovo</option>
                    <option value="in_valutazione">In valutazione</option>
                    <option value="negato">Non selezionato</option>
                    <option value="assunto">Assunto</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HrReferrals