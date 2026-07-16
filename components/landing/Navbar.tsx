"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Especialidades", href: "#especialidades" },
  { label: "Doctores", href: "#doctores" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    setDark(document.documentElement.classList.contains("dark"));
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass shadow-lg shadow-blue-100/20 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="#inicio" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center shadow-md shadow-blue-200/50 group-hover:shadow-blue-300/60 transition-all duration-300 group-hover:scale-105">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold font-[family-name:var(--font-poppins)] gradient-text">VitalCare</span>
              <span className="hidden sm:block text-[10px] text-gray-400 dark:text-gray-500 tracking-wider uppercase -mt-1">Clínica Médica</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 rounded-lg hover:bg-blue-50/60 dark:hover:bg-blue-900/40 group">
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-300 group-hover:w-3/4" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle modo oscuro */}
            <button
              onClick={toggleTheme}
              aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
              className="p-2.5 rounded-xl hover:bg-blue-50/60 dark:hover:bg-blue-900/40 text-gray-500 dark:text-gray-300 transition-colors"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link href="/login" className="hidden md:inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 transition-all duration-300">
              Iniciar sesión
            </Link>
            <Link href="#contacto" className="hidden sm:inline-flex btn-primary items-center gap-2 text-sm !py-2.5 !px-5">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Reservar cita
              </span>
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-blue-50/60 transition-colors" aria-label="Abrir menú">
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-300 origin-left ${mobileOpen ? "rotate-45 translate-x-px" : ""}`} />
                <span className={`w-full h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 scale-0" : ""}`} />
                <span className={`w-full h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-300 origin-left ${mobileOpen ? "-rotate-45 translate-x-px" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="lg:hidden overflow-hidden glass mt-2 mx-4 rounded-2xl">
            <div className="p-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={link.href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-900/40 rounded-xl transition-all duration-200">{link.label}</Link>
                </motion.div>
              ))}
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-center text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl py-3 hover:bg-blue-50/60 dark:hover:bg-blue-900/40 transition-all">Iniciar sesión</Link>
                <Link href="#contacto" onClick={() => setMobileOpen(false)} className="btn-primary block text-center text-sm !py-3"><span>Reservar cita</span></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
