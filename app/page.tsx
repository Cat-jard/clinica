'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { login, logout } from '@/lib/auth';

// Cuentas de ejemplo (sembradas por el backend). Contraseña: Clinica123
const DEMO = [
  { rol: 'Administración',       email: 'patricia.nunez@clinica.pe' },
  { rol: 'Recepción / Admisión', email: 'rosa.garcia@clinica.pe'    },
  { rol: 'Enfermería / Triaje',  email: 'lucia.ramirez@clinica.pe'  },
  { rol: 'Médico',               email: 'luis.torres@clinica.pe'    },
  { rol: 'Laboratorio Clínico',  email: 'maria.torres@clinica.pe'   },
  { rol: 'Médico Radiólogo',     email: 'ricardo.mendoza@clinica.pe'},
  { rol: 'Soporte Técnico / TI', email: 'elena.castro@clinica.pe'   },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [cargando, setCargando] = useState(false);

  // La raíz es también el destino de "Cerrar Sesión": al llegar, limpiamos sesión.
  useEffect(() => { logout(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await login(email.trim(), password);
      router.push(res.ruta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f5] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">

        {/* Tarjeta de login */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-600">
              <HeartPulse size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">SIHCE</h1>
              <p className="text-xs text-gray-500">Historia Clínica Electrónica</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900">Iniciar sesión</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">Ingresa con tu cuenta institucional.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="usuario@clinica.pe"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl p-3">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button
              type="submit" disabled={cargando}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {cargando ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          <p className="text-[11px] text-gray-400 mt-auto pt-6">
            NTS N°139-MINSA · Ley 30024 (RENHICE) · Ley 29733
          </p>
        </div>

        {/* Accesos de demostración */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-sm font-bold text-gray-900">Cuentas de demostración</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Contraseña para todas: <span className="font-mono font-semibold text-gray-700">Clinica123</span>.
            Haz clic para autocompletar.
          </p>
          <div className="space-y-2">
            {DEMO.map(d => (
              <button
                key={d.email}
                onClick={() => { setEmail(d.email); setPassword('Clinica123'); setError(''); }}
                className="w-full text-left px-4 py-2.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
              >
                <p className="text-xs font-semibold text-gray-800">{d.rol}</p>
                <p className="text-[11px] text-gray-400 font-mono">{d.email}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
