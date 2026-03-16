import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function ReferralForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [caricamento, setCaricamento] = useState(true)
  const [invio, setInvio] = useState(false)
  const [errore, setErrore] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [form, setForm] = useState({
    nome_candidato: '',
    cognome_candidato: '',
    tipo: 'profilo_linkedin',
    linkedin_url: '',
    relazione: ''
  })

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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setInvio(true)
    setErrore('')

    const { data: { user } } = await supabase.auth.getUser()
    const oggi = new Date().toISOString().split('T')[0]

    // Controllo 1 — max 5 referral al giorno
    const { count: countOggi } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('inviato_da', user.id)
      .gte('created_at', `${oggi}T00:00:00`)
      .lte('created_at', `${oggi}T23:59:59`)

    if (countOggi >= 5) {
      setErrore('Hai raggiunto il limite di 5 segnalazioni al giorno. Riprova domani!')
      setInvio(false)
      return
    }

    // Controllo 2 — max 3 "trovato online"
    if (form.relazione === 'trovato_online') {
      const { count: countOnline } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('inviato_da', user.id)
        .eq('relazione', 'trovato_online')

      if (countOnline >= 3) {
        setErrore('Puoi segnalare al massimo 3 profili trovati online.')
        setInvio(false)
        return
      }
    }

    // Controllo 3 — duplicato
    const { count: countDuplicato } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('inviato_da', user.id)
      .eq('job_posting_id', id)
      .eq('nome_candidato', form.nome_candidato)
      .eq('cognome_candidato', form.cognome_candidato)

    if (countDuplicato > 0) {
      setErrore('Hai già segnalato questo candidato per questa posizione.')
      setInvio(false)
      return
    }

    // Upload CV se presente
    let cv_url = null
    if (form.tipo === 'cv_caricato' && cvFile) {
      const estensione = cvFile.name.split('.').pop()
      const nomeFile = `${user.id}/${Date.now()}.${estensione}`

      const { error: uploadError } = await supabase.storage
        .from('cv')
        .upload(nomeFile, cvFile)

      if (uploadError) {
        setErrore('Errore nel caricamento del CV: ' + uploadError.message)
        setInvio(false)
        return
      }

      cv_url = nomeFile
    }

    // Inserisci referral
    const { error } = await supabase.from('referrals').insert({
      job_posting_id: id,
      inviato_da: user.id,
      nome_candidato: form.nome_candidato,
      cognome_candidato: form.cognome_candidato,
      tipo: form.tipo,
      linkedin_url: form.tipo === 'profilo_linkedin' ? form.linkedin_url : null,
      cv_url,
      relazione: form.relazione,
      privacy_confermata: false
    })

    if (error) {
      setErrore(error.message)
      setInvio(false)
    } else {
      navigate('/referrals')
    }
  }

  const relazioneOptions = [
    {
      value: 'lavorato_insieme',
      label: 'Ho lavorato con questa persona',
      descrizione: 'Abbiamo collaborato direttamente in passato'
    },
    {
      value: 'conosco',
      label: 'La conosco ma non abbiamo mai lavorato insieme',
      descrizione: 'La conosco personalmente ma non in ambito lavorativo'
    },
    {
      value: 'trovato_online',
      label: 'Trovato il profilo online',
      descrizione: 'Profilo trovato su LinkedIn o altrove — max 3 segnalazioni di questo tipo'
    }
  ]

  if (caricamento) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400">Caricamento...</p>
    </div>
  )

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate(`/jobs/${id}`)}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
      >
        ← Torna alla posizione
      </button>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-indigo-400 font-medium mb-0.5">Stai segnalando per</p>
          <p className="font-semibold text-indigo-900">{job.titolo}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-indigo-400 mb-0.5">Referral fee</p>
          <p className="font-bold text-indigo-600">€{job.referral_fee}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Segnala un candidato</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nome e cognome */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                name="nome_candidato" value={form.nome_candidato}
                onChange={handleChange} required
                placeholder="Mario"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
              <input
                name="cognome_candidato" value={form.cognome_candidato}
                onChange={handleChange} required
                placeholder="Rossi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tipo segnalazione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo di segnalazione</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                form.tipo === 'profilo_linkedin'
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio" name="tipo" value="profilo_linkedin"
                  checked={form.tipo === 'profilo_linkedin'}
                  onChange={handleChange}
                  className="accent-indigo-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Profilo LinkedIn</p>
                  <p className="text-xs text-gray-400">Condividi il link</p>
                </div>
              </label>
              <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                form.tipo === 'cv_caricato'
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio" name="tipo" value="cv_caricato"
                  checked={form.tipo === 'cv_caricato'}
                  onChange={handleChange}
                  className="accent-indigo-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Carica CV</p>
                  <p className="text-xs text-gray-400">PDF o Word</p>
                </div>
              </label>
            </div>
          </div>

          {/* LinkedIn URL o Upload CV */}
          {form.tipo === 'profilo_linkedin' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profilo LinkedIn</label>
              <input
                name="linkedin_url" value={form.linkedin_url}
                onChange={handleChange} required
                placeholder="https://linkedin.com/in/mario-rossi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CV del candidato</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={e => setCvFile(e.target.files[0])}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Formati accettati: PDF, DOC, DOCX — max 5MB
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-2">
                <p className="text-xs text-amber-700">
                  <span className="font-semibold">Privacy:</span> Il candidato riceverà una mail per
                  confermare il trattamento dei suoi dati.
                </p>
              </div>
            </div>
          )}

          {/* Tipo relazione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Che relazione hai con questo candidato?
            </label>
            <div className="space-y-2">
              {relazioneOptions.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    form.relazione === opt.value
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio" name="relazione" value={opt.value}
                    checked={form.relazione === opt.value}
                    onChange={handleChange}
                    className="mt-0.5 accent-indigo-600"
                    required
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.descrizione}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {errore && <p className="text-red-500 text-sm">{errore}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={() => navigate(`/jobs/${id}`)}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit" disabled={invio}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {invio ? 'Invio in corso...' : 'Invia segnalazione'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReferralForm