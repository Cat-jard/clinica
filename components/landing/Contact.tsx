"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "El nombre es requerido";
    if (!form.email.trim()) errs.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email inválido";
    if (!form.message.trim()) errs.message = "El mensaje es requerido";
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section id="contacto" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/40 to-white dark:from-[#0b1220] dark:via-blue-950/30 dark:to-[#0b1220] pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-2" style={{ opacity: 0.15 }} />
        <div className="blob blob-3" style={{ opacity: 0.1, left: "60%", top: "20%" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-semibold mb-4 border border-blue-100 dark:border-blue-800">Contacto</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-poppins)] text-gray-900 dark:text-white mb-4">
            ¿Listo para <span className="gradient-text">agendar tu cita</span>?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Completa el formulario y nos pondremos en contacto contigo lo antes posible.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            {submitted ? (
              <div className="glass-card rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">¡Mensaje enviado!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Nos pondremos en contacto contigo pronto.</p>
                <button onClick={() => setSubmitted(false)} className="btn-secondary text-sm">Enviar otro mensaje</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombre completo</label>
                  <input id="contact-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre" className={`input-modern ${errors.name ? "!border-red-300 !shadow-red-100" : ""}`} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Correo electrónico</label>
                  <input id="contact-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" className={`input-modern ${errors.email ? "!border-red-300 !shadow-red-100" : ""}`} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mensaje</label>
                  <textarea id="contact-message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Cuéntanos cómo podemos ayudarte..." className={`input-modern resize-none ${errors.message ? "!border-red-300 !shadow-red-100" : ""}`} />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                </div>
                <button type="submit" disabled={sending} className="btn-primary w-full !py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
                  <span className="flex items-center justify-center gap-2">
                    {sending ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>) : "Enviar mensaje"}
                  </span>
                </button>
              </form>
            )}
          </motion.div>

          {/* Info cards */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="space-y-5">
            {[
              { icon: "📍", title: "Dirección", info: "Av. Principal #1234, Centro Médico, Ciudad", color: "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/50" },
              { icon: "📞", title: "Teléfono", info: "+1 (555) 123-4567", color: "bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800/50" },
              { icon: "✉️", title: "Email", info: "contacto@vitalcare.com", color: "bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800/50" },
              { icon: "🕐", title: "Horarios", info: "Lun-Vie: 7:00 - 20:00 | Sáb: 8:00 - 14:00", color: "bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50" },
            ].map((c) => (
              <div key={c.title} className={`glass-card rounded-2xl p-5 flex items-start gap-4 border ${c.color} hover:shadow-md transition-shadow duration-300`}>
                <div className="text-2xl">{c.icon}</div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{c.info}</p>
                </div>
              </div>
            ))}

            {/* Google Maps (ubicación genérica por ahora — cambiar el query
                cuando se tenga la dirección real de la clínica) */}
            <div className="glass-card rounded-2xl overflow-hidden h-56">
              <iframe
                src="https://maps.google.com/maps?q=Lima%2C%20Per%C3%BA&z=12&hl=es&output=embed"
                title="Mapa de ubicación de la clínica"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
