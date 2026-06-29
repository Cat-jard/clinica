'use client';

import { useState } from 'react';
import { MessageSquare, Plus, X, Paperclip, AlertOctagon, ArrowLeft } from 'lucide-react';
import PortalShell from '@/components/portal/PortalShell';
import type { MensajePaciente } from '@/lib/paciente-portal';
import { MOCK_MENSAJES_PACIENTE, MEDICOS_POR_ESPECIALIDAD } from '@/lib/paciente-portal';

const TODOS_MEDICOS = Array.from(new Set(Object.values(MEDICOS_POR_ESPECIALIDAD).flat()));

export default function MensajesPaciente() {
  const [mensajes, setMensajes] = useState<MensajePaciente[]>(MOCK_MENSAJES_PACIENTE);
  const [abierto, setAbierto]   = useState<MensajePaciente | null>(null);
  const [nuevo, setNuevo]       = useState(false);
  const [toast, setToast]       = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function abrir(m: MensajePaciente) {
    setMensajes(prev => prev.map(x => x.id === m.id ? { ...x, leido: true } : x));
    setAbierto({ ...m, leido: true });
  }

  // Vista de mensaje individual
  if (abierto) {
    return (
      <PortalShell>
        <button onClick={() => setAbierto(null)} className="flex items-center gap-1.5 text-sm text-blue-600 font-medium mb-4">
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h1 className="text-base font-bold text-gray-900">{abierto.asunto}</h1>
          <p className="text-xs text-gray-400 mt-0.5">De: {abierto.remitente} · {abierto.fecha}</p>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{abierto.cuerpo}</p>
          </div>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl max-w-[90vw] text-center">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-gray-900">Mensajes</h1>
        <button onClick={() => setNuevo(true)}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {/* Advertencia no-emergencias (regla de oro #5) */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2">
        <AlertOctagon size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-red-700">
          <b>Este canal no es para emergencias.</b> Si es una emergencia, llama al <b>116</b> o acude al servicio de emergencias más cercano.
        </p>
      </div>

      {/* Bandeja */}
      <div className="space-y-2">
        {mensajes.map(m => (
          <button key={m.id} onClick={() => abrir(m)}
            className={`w-full text-left rounded-2xl border shadow-sm p-4 flex items-start gap-3 transition-shadow hover:shadow-md ${
              m.leido ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100'
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.esSistema ? 'bg-gray-100' : 'bg-blue-50'}`}>
              <MessageSquare size={17} className={m.esSistema ? 'text-gray-500' : 'text-blue-600'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-800 truncate">{m.remitente}</p>
                {!m.leido && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-gray-600 truncate">{m.asunto}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{m.fecha}</p>
            </div>
          </button>
        ))}
      </div>

      {nuevo && (
        <NuevoMensajeModal onClose={() => setNuevo(false)}
          onEnviar={() => { setNuevo(false); showToast('✓ Mensaje enviado a tu médico'); }} />
      )}
    </PortalShell>
  );
}

function NuevoMensajeModal({ onClose, onEnviar }: { onClose: () => void; onEnviar: () => void }) {
  const [para, setPara]     = useState('');
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');

  const canEnviar = para && asunto.trim() && cuerpo.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-base font-bold text-gray-900">Nuevo Mensaje</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Para <span className="text-red-500">*</span></label>
            <select value={para} onChange={e => setPara(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Selecciona un médico</option>
              {TODOS_MEDICOS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Asunto <span className="text-red-500">*</span></label>
            <input value={asunto} onChange={e => setAsunto(e.target.value)} placeholder="Breve resumen"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mensaje <span className="text-red-500">*</span></label>
            <textarea value={cuerpo} onChange={e => setCuerpo(e.target.value)} rows={4}
              placeholder="Escribe tu mensaje…"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <button className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 border border-gray-200 border-dashed rounded-xl py-2.5 hover:bg-gray-50 transition-colors">
            <Paperclip size={13} /> Adjuntar archivo (opcional)
          </button>
          <button onClick={onEnviar} disabled={!canEnviar}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base">
            Enviar Mensaje
          </button>
        </div>
      </div>
    </div>
  );
}
