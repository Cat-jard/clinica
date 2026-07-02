"use client";

import { motion } from "framer-motion";

const doctors = [
  { name: "Dra. María Rodríguez", specialty: "Cardiología", exp: "18 años", image: "/doctors/doctor-1.jpg", color: "from-blue-100 to-blue-200" },
  { name: "Dr. Carlos Méndez", specialty: "Neurología", exp: "15 años", image: "/doctors/doctor-2.jpg", color: "from-purple-100 to-purple-200" },
  { name: "Dra. Ana Torres", specialty: "Pediatría", exp: "12 años", image: "/doctors/doctor-3.jpg", color: "from-green-100 to-green-200" },
  { name: "Dr. Roberto Vargas", specialty: "Traumatología", exp: "20 años", image: "/doctors/doctor-4.jpg", color: "from-amber-100 to-amber-200" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } } };


export default function Doctors() {
  return (
    <section id="doctores" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50/30 to-white dark:from-[#0b1220] dark:via-green-950/20 dark:to-[#0b1220] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-300 text-xs font-semibold mb-4 border border-green-100 dark:border-green-800">Equipo Médico</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-poppins)] text-gray-900 dark:text-white mb-4">
            Doctores <span className="gradient-text">expertos</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Profesionales certificados con años de experiencia comprometidos con tu salud.</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((d) => (
            <motion.div key={d.name} variants={item} className="glass-card rounded-2xl overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-blue-100/30 transition-all duration-400">
              <div className="relative overflow-hidden">
                <div className="group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={d.image}
                    alt={`${d.name}, especialista en ${d.specialty}`}
                    className={`w-full aspect-[3/4] object-cover object-top bg-gradient-to-br ${d.color}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-6">
                  <button className="px-5 py-2 bg-white rounded-xl text-sm font-semibold text-blue-600 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    Ver perfil
                  </button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{d.name}</h3>
                <p className="text-sm text-blue-500 dark:text-blue-400 font-medium mt-0.5">{d.specialty}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/40 border border-green-100 dark:border-green-800">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="text-[11px] text-green-600 font-medium">Disponible</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{d.exp} exp.</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
