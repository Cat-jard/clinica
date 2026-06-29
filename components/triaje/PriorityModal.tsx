'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import { useToast } from '@/context/ToastContext';
import { Prioridad, SignosVitales, PRIORIDAD_CONFIG, destinoPorPrioridad } from '@/lib/vitals';

interface Props {
  pacienteNombre: string;
  pacienteId: string;
  signos: SignosVitales;
  onClose: () => void;
}

const PRIORIDADES: Prioridad[] = ['I-ROJO', 'II-NARANJA', 'III-AMARILLO', 'IV-VERDE', 'V-AZUL'];

export default function PriorityModal({ pacienteNombre, pacienteId, signos, onClose }: Props) {
  const router = useRouter();
  const { success } = useToast();
  const [selected, setSelected]         = useState<Prioridad | null>(null);
  const [justificacion, setJustificacion] = useState('');
  const [loading, setLoading]           = useState(false);

  const hipoxemia     = signos.spo2 < 90;
  const sugerirNaranja = signos.pasSistolica > 180;

  const isBlocked = (p: Prioridad) => hipoxemia && (p === 'IV-VERDE' || p === 'V-AZUL');
  const canSubmit  = selected !== null && justificacion.trim().length >= 10 && !loading;

  async function handleSubmit() {
    if (!selected) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const destino = destinoPorPrioridad(selected);
    success(`${pacienteNombre} clasificado/a: ${PRIORIDAD_CONFIG[selected].label}. Destino: ${destino}`);
    router.push('/triaje');
  }

  return (
    <ModalBase title="Clasificación de Prioridad — N.T.S. 042-MINSA" onClose={onClose} width="max-w-4xl">
      <div className="p-6 space-y-6">
        <p className="text-sm text-gray-500">Paciente: <strong className="text-gray-900">{pacienteNombre}</strong></p>

        {/* Alerta hipoxemia */}
        {hipoxemia && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
            <p className="text-sm text-red-700 font-medium">
              ¡Hipoxemia detectada! SpO₂ = <strong>{signos.spo2}%</strong> — Prioridad mínima permitida: <strong>III — Urgente (Amarilla)</strong>
            </p>
          </div>
        )}

        {/* 5 botones */}
        <div className="grid grid-cols-5 gap-3 mt-2">
          {PRIORIDADES.map((p) => {
            const cfg      = PRIORIDAD_CONFIG[p];
            const blocked  = isBlocked(p);
            const isActive = selected === p;
            return (
              <div key={p} className="relative">
                {p === 'II-NARANJA' && sugerirNaranja && (
                  <div className="absolute -top-5 left-0 right-0 text-center">
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">⚠ Sugerido</span>
                  </div>
                )}
                <button
                  onClick={() => { if (!blocked) setSelected(p); }}
                  disabled={blocked}
                  className={`w-full py-5 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                    ${cfg.bg} ${cfg.border} ${cfg.color}
                    ${blocked  ? 'opacity-40 cursor-not-allowed'             : 'hover:scale-105 hover:shadow-md cursor-pointer'}
                    ${isActive ? 'ring-4 ring-offset-2 ring-gray-800 scale-105 shadow-lg' : ''}
                  `}
                >
                  <span className="text-xs font-black text-center leading-tight">{cfg.label}</span>
                  <span className="text-[10px] opacity-80 text-center">
                    {cfg.maxMinutes === 0 ? 'Inmediato' : `< ${cfg.maxMinutes} min`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Justificación */}
        {selected && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              Justificación clínica <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(mín. 10 caracteres)</span>
            </label>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={3}
              placeholder="Ej: Taquicardia 125 lpm + SpO₂ 92% + dificultad respiratoria marcada..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{justificacion.trim().length} / 10 mín.</p>
          </div>
        )}

        {/* Destino auto */}
        {selected && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-xs text-gray-500">Destino sugerido:</span>
            <span className="text-sm font-semibold text-gray-800">{destinoPorPrioridad(selected)}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            canSubmit ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> Asignando…</> : 'Asignar Prioridad y Enviar'}
        </button>
      </div>
    </ModalBase>
  );
}
