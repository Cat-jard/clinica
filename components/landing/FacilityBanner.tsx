"use client";

import { motion } from "framer-motion";

const highlights = [
  { icon: "🏥", label: "6 áreas especializadas" },
  { icon: "🕐", label: "Atención 24/7" },
  { icon: "🩻", label: "Equipos de última generación" },
];

export default function FacilityBanner() {
  return (
    <section id="instalaciones" className="relative overflow-hidden">
      <div className="relative h-[440px] sm:h-[500px]">
        {/* Foto de la recepción con zoom lento (Ken Burns) */}
        <img
          src="/images/clinic-reception.jpg"
          alt="Recepción de la clínica VitalCare"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover kenburns"
        />
        {/* Degradado para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-white/10 dark:from-[#0b1220]/95 dark:via-[#0b1220]/75 dark:to-[#0b1220]/20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-xs font-semibold mb-4 border border-blue-100 dark:border-blue-800">
              Nuestras Instalaciones
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-poppins)] text-gray-900 dark:text-white mb-4">
              Tecnología y confort <span className="gradient-text">en cada área</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Recepción moderna, consultorios totalmente equipados y áreas de diagnóstico
              con estándares internacionales, para que tu única preocupación sea tu recuperación.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {highlights.map((h) => (
                <div key={h.label} className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <span>{h.icon}</span> {h.label}
                </div>
              ))}
            </div>
            <a href="#contacto" className="btn-primary inline-block">
              <span>Conoce la clínica</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
