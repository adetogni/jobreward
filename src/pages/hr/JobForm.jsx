import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function JobForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    titolo: '',
    descrizione: '',
    link_esterno: '',
    referral_fee: '',
    scadenza: '',
    modalita_pagamento: ''
  })
  const [errore, setErrore] = useState('')
  const [caricamento, setCaricamento] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setCaricamento(true)
    setErrore('')

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('job_postings').insert({
      titolo: form.titolo,
      descrizione: form.descrizione,
      link_esterno: form.link_esterno || null,
      referral_fee: parseFloat(form.referral_fee) || 0,
      scadenza: form.scadenza || null,
      modalita_pagamento: form.modalita_pagamento
        ? { note: form.modalita_pagamento }
        : {},
      created_by: user.id
    })

    if (error) {
      setErrore(error.message)
      setCaricamento(false)
    } else {
      navigate('/hr/jobs')
    }
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate('/hr/jobs')}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
      >
        ← Torna alle posizioni
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuova posizione</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo posizione</label>
            <input
              name="titolo" value={form.titolo} onChange={handleChange} required
              placeholder="Es. Frontend Developer Senior"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job description</label>
            <textarea
              name="descrizione" value={form.descrizione} onChange={handleChange} required
              rows={6}
              placeholder="Descrivi il ruolo, le responsabilità e i requisiti..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link annuncio esterno <span className="text-gray-400">(opzionale)</span>
            </label>
            <input
              name="link_esterno" value={form.link_esterno} onChange={handleChange}
              placeholder="https://linkedin.com/jobs/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referral fee (€)</label>
              <input
                name="referral_fee" type="number" value={form.referral_fee} onChange={handleChange} required
                placeholder="1500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scadenza</label>
              <input
                name="scadenza" type="date" value={form.scadenza} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modalità di pagamento <span className="text-gray-400">(opzionale)</span>
            </label>
            <input
              name="modalita_pagamento" value={form.modalita_pagamento} onChange={handleChange}
              placeholder="Es. 50% all'assunzione, 50% dopo il periodo di prova"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {errore && <p className="text-red-500 text-sm">{errore}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={() => navigate('/hr/jobs')}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit" disabled={caricamento}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {caricamento ? 'Salvataggio...' : 'Pubblica posizione'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JobForm