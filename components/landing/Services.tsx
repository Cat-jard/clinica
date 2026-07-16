"use client";

import { motion } from "framer-motion";

const services = [
  { icon: "🩺", name: "Medicina General", desc: "Atención primaria integral con diagnóstico preventivo y seguimiento personalizado.", color: "from-blue-50 to-blue-100", border: "border-blue-100" },
  { icon: "🫀", name: "Cardiología", desc: "Evaluación cardiovascular con tecnología avanzada y especialistas certificados.", color: "from-red-50 to-pink-50", border: "border-red-100" },
  { icon: "🧠", name: "Neurología", desc: "Diagnóstico y tratamiento de enfermedades del sistema nervioso.", color: "from-purple-50 to-lavender-100", border: "border-purple-100" },
  { icon: "🦴", name: "Traumatología", desc: "Tratamiento especializado en lesiones óseas, articulares y musculares.", color: "from-amber-50 to-orange-50", border: "border-amber-100" },
  { icon: "🔬", name: "Laboratorio Clínico", desc: "Análisis clínicos con resultados precisos y entrega rápida.", color: "from-green-50 to-emerald-50", border: "border-green-100" },
  { icon: "📡", name: "Radiología", desc: "Rayos X, ecografías, tomografías y resonancias magnéticas.", color: "from-cyan-50 to-sky-50", border: "border-cyan-100" },
  { icon: "🚑", name: "Emergencias 24/7", desc: "Atención inmediata las 24 horas con equipo especializado.", color: "from-rose-50 to-red-50", border: "border-rose-100" },
  { icon: "💊", name: "Farmacia", desc: "Amplio inventario de medicamentos con asesoría farmacéutica.", color: "from-teal-50 to-green-50", border: "border-teal-100" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } } };

export default function Services() {
  return (
    <section id="servicios" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-[#0b1220] dark:via-blue-950/30 dark:to-[#0b1220] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-semibold mb-4 border border-blue-100 dark:border-blue-800">Nuestros Servicios</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-poppins)] text-gray-900 dark:text-white mb-4">
            Atención médica <span className="gradient-text">integral</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Contamos con todas las especialidades y servicios que necesitas para cuidar tu salud y la de tu familia.</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <motion.div key={s.name} variants={item} className={`glass-card floating-card rounded-2xl p-6 cursor-default border ${s.border} group`}>
              <div className={`heartbeat-hover w-14 h-14 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-4 transition-transform duration-300`}>
                {s.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{s.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
