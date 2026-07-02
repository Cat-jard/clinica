"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Laura García",
    role: "Paciente de Cardiología",
    text: "La atención fue excepcional. El equipo médico me hizo sentir segura y confiada durante todo el proceso. Las instalaciones son modernas y limpias.",
    rating: 5,
    image: "/images/patient-1.jpg",
  },
  {
    name: "Miguel Hernández",
    role: "Paciente de Traumatología",
    text: "Después de mi cirugía, la recuperación fue más rápida de lo esperado gracias al seguimiento continuo del equipo. Totalmente recomendado.",
    rating: 5,
    image: "/images/patient-2.jpg",
  },
  {
    name: "Patricia López",
    role: "Paciente de Pediatría",
    text: "Mi hijo siempre se siente cómodo con la Dra. Torres. Es una profesional increíble que sabe cómo tratar a los niños con paciencia y cariño.",
    rating: 5,
    image: "/images/patient-3.jpg",
  },
];

const AUTO_ADVANCE_MS = 6000;

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Carrusel automático (se pausa al pasar el mouse)
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused]);

  const t = testimonials[index];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-beige-50/50 to-white dark:from-[#0b1220] dark:via-amber-950/10 dark:to-[#0b1220] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 text-xs font-semibold mb-4 border border-amber-100 dark:border-amber-800">Testimonios</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-poppins)] text-gray-900 dark:text-white mb-4">
            Lo que dicen nuestros <span className="gradient-text">pacientes</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Miles de pacientes confían en nosotros para el cuidado de su salud.</p>
        </motion.div>

        {/* Carrusel con transición de "latido" */}
        <div
          className="relative max-w-2xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: [0.94, 1.025, 1] }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card rounded-2xl p-8 sm:p-10 text-center"
            >
              {/* Estrellas */}
              <div className="flex justify-center gap-1 mb-5" aria-label={`${t.rating} de 5 estrellas`}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-7 italic">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              <figcaption className="flex items-center justify-center gap-4">
                <img
                  src={t.image}
                  alt={`Foto de ${t.name}`}
                  loading="lazy"
                  decoding="async"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-800"
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          {/* Controles: flechas */}
          <button
            onClick={() => setIndex((index - 1 + testimonials.length) % testimonials.length)}
            aria-label="Testimonio anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-12 w-10 h-10 rounded-full glass flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => setIndex((index + 1) % testimonials.length)}
            aria-label="Siguiente testimonio"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-12 w-10 h-10 rounded-full glass flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Indicadores tipo monitor cardiaco */}
          <div className="flex justify-center gap-2.5 mt-8">
            {testimonials.map((item, i) => (
              <button
                key={item.name}
                onClick={() => setIndex(i)}
                aria-label={`Ver testimonio de ${item.name}`}
                className={`h-2 rounded-full transition-all duration-400 ${
                  i === index
                    ? "w-8 bg-gradient-to-r from-blue-500 to-green-400 animate-pulse"
                    : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-blue-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
