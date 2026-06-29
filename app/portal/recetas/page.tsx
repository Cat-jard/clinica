'use client';

import { useState } from 'react';
import { Pill, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react';
import PortalShell from '@/components/portal/PortalShell';
import type { RecetaPaciente } from '@/lib/paciente-portal';
import { MOCK_RECETAS_PACIENTE, ESTADO_RECETA_CONFIG } from '@/lib/paciente-portal';

export default function RecetasPaciente() {
  const [expandida, setExpandida]   = useState<string | null>(null);
  const [renovar, setRenovar]       = useState<RecetaPaciente | null>(null);
  const [toast, setToast]           = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  return (
    <PortalShell>
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl max-w-[90vw] text-center">
          {toast}
        </div>
      )}

      <h1 className="text-xl font-bold text-gray-900 mb-1">Mis Recetas</h1>
      <p className="text-xs text-gray-500 mb-5">Recetas electrónicas firmadas por tu médico</p>

      <div className="space-y-3">
        {MOCK_RECETAS_PACIENTE.map(rx => {
          const abierta = expandida === rx.id;
          return (
            <div key={rx.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button onClick={() => setExpandida(abierta ? null : rx.id)}
                className="w-full p-4 flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Pill size={18} className="text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {rx.items.map(i => i.medicamento.split(' ')[0]).join(', ')}
                  </p>
                  <p className="text-[10px] text-gray-400">{rx.fechaEmision} · {rx.medico}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ESTADO_RECETA_CONFIG[rx.estado].className} flex-shrink-0`}>
                  {rx.estado}
                </span>
                {abierta ? <ChevronUp size={16} className="text-gray-300" /> : <ChevronDown size={16} className="text-gray-300" />}
              </button>

              {abierta && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2">
                  {rx.items.map((it, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm font-semibold text-gray-800">{it.medicamento}</p>
                      <div className="grid grid-cols-3 gap-2 mt-1 text-[11px] text-gray-500">
                        <span>Dosis: <b className="text-gray-700">{it.dosis}</b></span>
                        <span>Frec: <b className="text-gray-700">{it.frecuencia}</b></span>
                        <span>Dur: <b className="text-gray-700">{it.duracion}</b></span>
                      </div>
                    </div>
                  ))}
                  {rx.estado === 'Vigente' && (
                    <button onClick={() => setRenovar(rx)}
                      className="w-full flex items-center justify-center gap-1.5 mt-2 text-xs font-semibold text-blue-600 border border-blue-200 rounded-xl py-2.5 hover:bg-blue-50 transition-colors">
                      <RefreshCw size={13} /> Solicitar Renovación
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {renovar && (
        <RenovacionModal receta={renovar} onClose={() => setRenovar(null)}
          onEnviar={() => { setRenovar(null); showToast('✓ Solicitud enviada a tu médico'); }} />
      )}
    </PortalShell>
  );
}

function RenovacionModal({ receta, onClose, onEnviar }: { receta: RecetaPaciente; onClose: () => void; onEnviar: () => void }) {
  const [motivo, setMotivo] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Solicitar Renovación</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Receta seleccionada</p>
            <p className="text-sm font-semibold text-gray-800">{receta.items.map(i => i.medicamento).join(', ')}</p>
            <p className="text-[11px] text-gray-500">{receta.fechaEmision} · {receta.medico}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Motivo de la renovación</label>
            <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
              placeholder="Ej. Tratamiento crónico, continúo con la medicación…"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <button onClick={onEnviar}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors text-base">
            Enviar Solicitud
          </button>
        </div>
      </div>
    </div>
  );
}
