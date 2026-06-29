'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import { dniRegistrado } from '@/lib/paciente-portal';

export default function PortalLanding() {
  const router = useRouter();
  const [showPass, setShowPass]   = useState(false);
  const [showRegistro, setShowRegistro] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          {/* Logo + eslogan */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-4">
              <HeartPulse size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Mi Portal de Salud</h1>
            <p className="text-sm text-blue-100 mt-1">Tu salud, a un clic de distancia</p>
          </div>

          {/* Card de login */}
          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Iniciar Sesión</h2>
            <p className="text-xs text-gray-400 mb-5">Ingresa a tu portal de paciente</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">DNI o Correo Electrónico</label>
                <input type="text" placeholder="72341567 o correo@ejemplo.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contraseña</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 pr-11" />
                  <button onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input type="checkbox" className="accent-blue-600" /> Recordar sesión
                </label>
                <button className="text-blue-600 font-medium">¿Olvidaste tu contraseña?</button>
              </div>

              <button
                onClick={() => router.push('/portal/dashboard')}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors text-base"
              >
                Iniciar Sesión
              </button>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">o</span></div>
            </div>

            <button
              onClick={() => setShowRegistro(true)}
              className="w-full border border-blue-600 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors text-base"
            >
              Crear cuenta nueva
            </button>
          </div>

          {/* Seguridad */}
          <div className="flex items-center justify-center gap-1.5 mt-5 text-blue-100 text-[11px]">
            <ShieldCheck size={13} />
            <span>Conexión segura HTTPS · Ley 29733 de Protección de Datos</span>
          </div>
        </div>
      </div>

      {showRegistro && <RegistroModal onClose={() => setShowRegistro(false)} onSuccess={() => router.push('/portal/dashboard')} />}
    </div>
  );
}

function RegistroModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [dni, setDni]       = useState('');
  const [nombre, setNombre] = useState('');
  const [verificado, setVerificado] = useState<null | boolean>(null);
  const [acepta, setAcepta] = useState(false);

  // Regla de oro #1: verificación de identidad contra registros del hospital
  function verificarDni() {
    if (dni.length !== 8) return;
    const existe = dniRegistrado(dni);
    setVerificado(existe);
    setNombre(existe ? 'Ana Fernández Llanos' : '');
  }

  const canRegistrar = verificado === true && acepta;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-base font-bold text-gray-900">Crear Cuenta</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* DNI con verificación */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">DNI <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                value={dni}
                onChange={e => { setDni(e.target.value.replace(/\D/g, '').slice(0, 8)); setVerificado(null); }}
                placeholder="8 dígitos"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={verificarDni} disabled={dni.length !== 8}
                className="px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50">
                Verificar
              </button>
            </div>
            {verificado === false && (
              <p className="text-red-600 text-[11px] mt-1.5 bg-red-50 rounded-lg p-2">
                No encontramos su DNI en nuestros registros. Por favor, contacte a la oficina de admisión.
              </p>
            )}
            {verificado === true && (
              <p className="text-green-600 text-[11px] mt-1.5 bg-green-50 rounded-lg p-2 flex items-center gap-1">
                <ShieldCheck size={12} /> Identidad verificada
              </p>
            )}
          </div>

          {/* Nombre autocompletado */}
          {verificado === true && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombres y Apellidos</label>
                <input value={nombre} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-3 text-base text-gray-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Correo Electrónico <span className="text-red-500">*</span></label>
                <input type="email" placeholder="correo@ejemplo.com" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Teléfono Celular <span className="text-red-500">*</span></label>
                <input type="tel" placeholder="9 dígitos" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contraseña <span className="text-red-500">*</span></label>
                <input type="password" placeholder="Mín. 8 caracteres, mayúsculas, números y símbolos" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} className="accent-blue-600 mt-0.5" />
                <span>Acepto los <b className="text-blue-600">Términos y Condiciones</b> y la Política de Privacidad (Ley 29733).</span>
              </label>
            </>
          )}

          <button
            onClick={onSuccess}
            disabled={!canRegistrar}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}
