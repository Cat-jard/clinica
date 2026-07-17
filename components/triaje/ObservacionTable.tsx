'use client';

import { useState, useEffect } from 'react';
import { FileText, AlertCircle, LogOut } from 'lucide-react';
import KardexForm from './KardexForm';
import ModalBase from '@/components/modals/ModalBase';
import { useToast } from '@/context/ToastContext';
import { PacienteObservacion, PRIORIDAD_CONFIG, elapsedHHMM } from '@/lib/vitals';
import { altaObservacionApi } from '@/lib/triaje';

type AltaTipo = 'Alta domiciliaria' | 'Hospitalización' | 'Traslado';

interface Props {
  pacientes: PacienteObservacion[];
  onUpdate: (pacientes: PacienteObservacion[]) => void;
}

export default function ObservacionTable({ pacientes, onUpdate }: Props) {
  const { success, warning } = useToast();
  const [, tick]          = useState(0);
  const [kardex, setKardex] = useState<PacienteObservacion | null>(null);
  const [alta, setAlta]     = useState<PacienteObservacion | null>(null);
  const [altaTipo, setAltaTipo] = useState<AltaTipo>('Alta domiciliaria');
  const [altaLoading, setAltaLoading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  function hasUnsigned(p: PacienteObservacion) { return p.kardex.some((k) => !k.firmado); }
  function hasSigned(p: PacienteObservacion)   { return p.kardex.some((k) =>  k.firmado); }

  function handleKardexSaved(pacienteId: string, firmado: boolean, canvas?: string) {
    onUpdate(pacientes.map((p) => {
      if (p.id !== pacienteId) return p;
      return {
        ...p,
        kardex: [...p.kardex, {
          id: Date.now().toString(),
          pacienteId,
          fechaHora: new Date().toISOString(),
          ingresosHidricos: 0,
          egresosHidricos: 0,
          medicamentos: [],
          evolucion: '',
          firmado,
          firmaCanvas: canvas,
        }],
      };
    }));
    setKardex(null);
  }

  async function confirmarAlta() {
    if (!alta) return;
    setAltaLoading(true);
    try {
      await altaObservacionApi(alta.id, altaTipo);
      onUpdate(pacientes.filter((p) => p.id !== alta.id));
      success(`${alta.nombre} — Alta: ${altaTipo}`);
      setAlta(null);
    } catch (err: any) {
      warning(err.message || 'No se pudo dar el alta');
    } finally {
      setAltaLoading(false);
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Pacientes en Observación</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50">
            <tr>
              {['Paciente', 'Ingreso', 'Prioridad', 'Motivo', 'Tiempo', 'Kardex', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pacientes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">No hay pacientes en observación.</td>
              </tr>
            )}
            {pacientes.map((p) => {
              const cfg     = PRIORIDAD_CONFIG[p.prioridad];
              const canAlta = hasSigned(p);
              const pending = hasUnsigned(p);

              return (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{p.nombre}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {p.horaIngreso.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500 max-w-[140px] truncate">{p.motivo}</td>
                  <td className="px-5 py-3 font-mono text-sm font-bold text-gray-700 tabular-nums">{elapsedHHMM(p.horaIngreso)}</td>
                  <td className="px-5 py-3">
                    {pending
                      ? <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">⚠ Pend. Firma</span>
                      : p.kardex.length > 0
                        ? <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">Firmado</span>
                        : <span className="text-[10px] text-gray-400">Sin registros</span>
                    }
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setKardex(p)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                        <FileText size={11} /> Evolución
                      </button>
                      <button onClick={() => warning(`Reevaluación solicitada para ${p.nombre}. Notificando al médico…`)} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium">
                        <AlertCircle size={11} /> Reevaluar
                      </button>
                      <button
                        onClick={() => canAlta ? setAlta(p) : warning('Firme al menos un Kardex antes de dar el alta.')}
                        className={`flex items-center gap-1 text-xs font-medium ${canAlta ? 'text-green-600 hover:text-green-700' : 'text-gray-300 cursor-not-allowed'}`}
                      >
                        <LogOut size={11} /> Alta
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {kardex && (
        <KardexForm
          pacienteNombre={kardex.nombre}
          pacienteId={kardex.id}
          onClose={() => setKardex(null)}
          onSaved={(firmado, canvas) => handleKardexSaved(kardex.id, firmado, canvas)}
        />
      )}

      {alta && (
        <ModalBase title={`Alta — ${alta.nombre}`} onClose={() => setAlta(null)} width="max-w-md">
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">Tipo de alta para <strong>{alta.nombre}</strong>:</p>
            <div className="space-y-2">
              {(['Alta domiciliaria', 'Hospitalización', 'Traslado'] as AltaTipo[]).map((tipo) => (
                <label key={tipo} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${altaTipo === tipo ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="alta" value={tipo} checked={altaTipo === tipo} onChange={() => setAltaTipo(tipo)} className="accent-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{tipo}</span>
                </label>
              ))}
            </div>
            <button onClick={confirmarAlta} disabled={altaLoading}
              className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
              {altaLoading ? 'Procesando…' : 'Confirmar Alta'}
            </button>
          </div>
        </ModalBase>
      )}
    </>
  );
}
