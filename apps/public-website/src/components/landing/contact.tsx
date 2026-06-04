'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, Phone, Mail, Clock, Send,
  CheckCircle2, Loader2, MessageSquare
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

const infoContacto = [
  { icon: MapPin, label: 'Dirección', value: 'Av. Siempre Viva 742, Ciudad' },
  { icon: Phone, label: 'Teléfono', value: '+54 11 1234-5678' },
  { icon: Mail, label: 'Email', value: 'info@escuelamoderna.edu.ar' },
  { icon: Clock, label: 'Horario', value: 'Lun a Vie de 8:00 a 17:00 hs' },
]

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError('')

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message,
      })

    if (!error) {
      setEnviado(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
      setTimeout(() => setEnviado(false), 5000)
    } else {
      setError('Error al enviar. Intentá de nuevo.')
    }
    
    setEnviando(false)
  }

  return (
    <section id="contacto" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-amber-500 font-semibold font-poppins text-sm tracking-widest uppercase">
            Contacto
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 mt-3 mb-4">
            Estamos para
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ayudarte
            </span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            ¿Tenés dudas? Escribinos y te respondemos a la brevedad.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Info de contacto */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {infoContacto.map((info, index) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-amber-50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                  <info.icon className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold font-poppins text-gray-900 mb-1">
                    {info.label}
                  </p>
                  <p className="text-gray-500">
                    {info.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100">
              {/* Éxito */}
              {enviado && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">¡Mensaje enviado con éxito! Te responderemos pronto.</span>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-2xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium font-poppins text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-poppins text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium font-poppins text-gray-700 mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium font-poppins text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Escribí tu consulta..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold font-poppins text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {enviando ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {enviando ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}