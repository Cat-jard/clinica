"use client";

import { motion } from "framer-motion";

const specialties = [
  { name: "Cardiología", icon: "🫀", patients: "5,200+", desc: "Cuidado cardiovascular integral" },
  { name: "Pediatría", icon: "👶", patients: "8,100+", desc: "Salud infantil especializada" },
  { name: "Dermatología", icon: "🧴", patients: "3,800+", desc: "Cuidado de piel y estética" },
  { name: "Oftalmología", icon: "👁️", patients: "4,500+", desc: "Salud visual avanzada" },
  { name: "Ginecología", icon: "🩷", patients: "6,300+", desc: "Salud femenina integral" },
  { name: "Neurología", icon: "🧠", patients: "2,900+", desc: "Sistema nervioso y cerebral" },
  { name: "Ortopedia", icon: "🦴", patients: "4,100+", desc: "Huesos, articulaciones y músculos" },
  { name: "Urología", icon: "🏥", patients: "3,200+", desc: "Sistema urinario y reproductivo" },
  { name: "Endocrinología", icon: "⚕️", patients: "2,400+", desc: "Hormonas y metabolismo" },
  { name: "Neumología", icon: "🫁", patients: "3,600+", desc: "Sistema respiratorio" },
  { name: "Gastroenterología", icon: "🔬", patients: "3,900+", desc: "Sistema digestivo" },
  { name: "Oncología", icon: "🎗️", patients: "1,800+", desc: "Detección y tratamiento del cáncer" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Specialties() {
  return (
    <section id="especialidades" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-lavender-50/40 to-white dark:from-[#0b1220] dark:via-purple-950/20 dark:to-[#0b1220] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-xs font-semibold mb-4 border border-purple-100 dark:border-purple-800">Especialidades</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-poppins)] text-gray-900 dark:text-white mb-4">
            Más de <span className="gradient-text">15 especialidades</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Un equipo multidisciplinario listo para atender todas tus necesidades de salud.</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {specialties.map((s) => (
            <motion.div key={s.name} variants={item} className="glass-card rounded-2xl p-5 cursor-default group hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/30 dark:hover:shadow-blue-950/40 hover:-translate-y-1">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{s.name}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{s.desc}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.patients} pacientes</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
