"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, HeartPulse, Stethoscope, FlaskConical, ScanLine,
  Building2, ServerCog, UserRound, ArrowRight, ArrowLeft,
  Mail, Lock, Eye, EyeOff, Loader2,
} from "lucide-react";

/* Roles del sistema SIHCE — cada uno abre su módulo (demo sin backend) */
const ROLES = [
  { nombre: "Recepción / Admisión", href: "/recepcionista", Icon: ClipboardList, desc: "Registro de pacientes, citas y cola de espera.", color: "text-gray-700 dark:text-gray-300", bg: "bg-gray-100 dark:bg-gray-800" },
  { nombre: "Enfermería / Triaje", href: "/triaje", Icon: HeartPulse, desc: "Signos vitales y clasificación de prioridad.", color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-900/30" },
  { nombre: "Médico", href: "/medico", Icon: Stethoscope, desc: "Historia clínica, diagnósticos CIE-10 y recetas.", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
  { nombre: "Laboratorio Clínico", href: "/laboratorio", Icon: FlaskConical, desc: "Muestras, resultados y control de calidad.", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/30" },
  { nombre: "Médico Radiólogo", href: "/radiologo", Icon: ScanLine, desc: "Visor DICOM e informes radiológicos.", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
  { nombre: "Administración", href: "/admin", Icon: Building2, desc: "Dashboard ejecutivo, usuarios, camas y finanzas.", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30" },
  { nombre: "Soporte Técnico / TI", href: "/soporte", Icon: ServerCog, desc: "Monitoreo, incidencias, backups y logs.", color: "text-slate-600 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-800" },
  { nombre: "Portal del Paciente", href: "/portal", Icon: UserRound, desc: "Vista del paciente: citas, resultados y mensajes.", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-900/30" },
];

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "roles">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Ingresa tu correo";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Correo inválido";
    if (!password.trim()) errs.password = "Ingresa tu contraseña";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    // Demo: sin backend aún — simula la validación y pasa a elegir rol
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setStep("roles");
  };

  return (
    <main className="min-h-screen flex bg-white dark:bg-[#0b1220] text-gray-800 dark:text-gray-100 font-[family-name:var(--font-inter)]">
      {/* ===== Columna izquierda: formulario ===== */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Blobs decorativos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob blob-1" style={{ opacity: 0.2 }} />
          <div className="blob blob-2" style={{ opacity: 0.15 }} />
        </div>

        {/* Barra superior */}
        <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center shadow-md shadow-blue-200/50 dark:shadow-blue-900/40 group-hover:scale-105 transition-transform duration-300">
              <HeartPulse size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-[family-name:var(--font-poppins)] gradient-text">VitalCare</span>
              <span className="hidden sm:block text-[10px] text-gray-400 dark:text-gray-500 tracking-wider uppercase -mt-1">Clínica Médica</span>
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
        </div>

        {/* Contenido central */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-10 pb-10">
          <AnimatePresence mode="wait">
            {step === "credentials" ? (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-semibold mb-4 border border-blue-100 dark:border-blue-800">
                  Acceso al sistema
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-poppins)] text-gray-900 dark:text-white mb-2">
                  Bienvenido de <span className="gradient-text">nuevo</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                  Inicia sesión para acceder a tu módulo del sistema clínico.
                </p>

                <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-7 sm:p-8 space-y-5">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@vitalcare.com"
                        className={`input-modern !pl-11 ${errors.email ? "!border-red-300 !shadow-red-100" : ""}`}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`input-modern !pl-11 !pr-12 ${errors.password ? "!border-red-300 !shadow-red-100" : ""}`}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-blue-500" />
                      Recordarme
                    </label>
                    <a href="#" className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
                    <span className="flex items-center justify-center gap-2">
                      {loading ? (
                        <><Loader2 size={17} className="animate-spin" /> Verificando...</>
                      ) : (
                        "Iniciar sesión"
                      )}
                    </span>
                  </button>

                  <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                    Demo de presentación — cualquier credencial válida te llevará a la selección de rol.
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="roles"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-3xl"
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-300 text-xs font-semibold mb-3 border border-green-100 dark:border-green-800">
                      Sesión verificada
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-poppins)] text-gray-900 dark:text-white">
                      Selecciona tu <span className="gradient-text">rol</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Cada rol abre su propio módulo del sistema SIHCE.
                    </p>
                  </div>
                  <button
                    onClick={() => setStep("credentials")}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0 mt-1"
                  >
                    <ArrowLeft size={15} /> Regresar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
                  {ROLES.map(({ nombre, href, Icon, desc, color, bg }, i) => (
                    <motion.button
                      key={href}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => router.push(href)}
                      className="group glass-card rounded-2xl p-4 flex items-center gap-4 text-left hover:border-blue-200 dark:hover:border-blue-800 transition-all hover:-translate-y-0.5"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={22} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{nombre}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                      <ArrowRight size={17} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
                    </motion.button>
                  ))}
                </div>

                <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-5">
                  SIHCE · Cumplimiento NTS N°139-MINSA · Ley 30024 (RENHICE) · Ley 29733 · Demo de frontend
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== Columna derecha: imagen de la clínica (solo escritorio) ===== */}
      <div className="hidden lg:block relative w-[42%] overflow-hidden">
        <img
          src="/images/clinic-reception.jpg"
          alt="Recepción de la clínica VitalCare"
          className="absolute inset-0 w-full h-full object-cover kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <div className="glass rounded-2xl p-6 border border-white/30">
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed mb-3 italic">
              &ldquo;Un solo sistema para toda la clínica: desde la recepción hasta el laboratorio.
              Tu equipo trabaja conectado y tus pacientes lo notan.&rdquo;
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Sistema de Historia Clínica Electrónica · SIHCE</p>
          </div>
        </div>
      </div>
    </main>
  );
}
