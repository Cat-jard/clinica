'use client';

import { useState } from 'react';
import { Pill, FlaskConical, Users, Monitor, Info } from 'lucide-react';

interface PlanTratamientoProps {
  indicaciones: string;
  procedimientos: string;
  recetasCount: number;
  examenesCount: number;
  interconsultasCount: number;
  onIndicacionesChange: (val: string) => void;
  onProcedimientosChange: (val: string) => void;
  onOpenReceta: () => void;
  onOpenExamenes: () => void;
  onOpenInterconsulta: () => void;
}

export default function PlanTratamiento({
  indicaciones,
  procedimientos,
  recetasCount,
  examenesCount,
  interconsultasCount,
  onIndicacionesChange,
  onProcedimientosChange,
  onOpenReceta,
  onOpenExamenes,
  onOpenInterconsulta,
}: PlanTratamientoProps) {
  const [telemedicina, setTelemedicina] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);

  return (
    <div className="space-y-6">

      {/* Indicaciones generales */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Indicaciones Generales</label>
        <textarea
          rows={3}
          value={indicaciones}
          onChange={e => onIndicacionesChange(e.target.value)}
          placeholder="Reposo, dieta, cuidados, actividades prohibidas, fecha de control…"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Procedimientos */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Procedimientos Realizados</label>
        <textarea
          rows={2}
          value={procedimientos}
          onChange={e => onProcedimientosChange(e.target.value)}
          placeholder="Sutura, curación, drenaje, nebulización… (dejar en blanco si no aplica)"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Acciones clínicas */}
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-3">Acciones Clínicas</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={onOpenReceta}
            className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors text-left relative"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Pill size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-800">Receta Electrónica</p>
              <p className="text-[10px] text-blue-500 mt-0.5">Prescribir medicamentos</p>
            </div>
            {recetasCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">{recetasCount}</span>
            )}
          </button>

          <button
            onClick={onOpenExamenes}
            className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-2xl hover:bg-purple-100 transition-colors text-left relative"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
              <FlaskConical size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-800">Solicitar Exámenes</p>
              <p className="text-[10px] text-purple-500 mt-0.5">Lab · Imágenes · Otros</p>
            </div>
            {examenesCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">{examenesCount}</span>
            )}
          </button>

          <button
            onClick={onOpenInterconsulta}
            className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 rounded-2xl hover:bg-teal-100 transition-colors text-left relative"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-teal-800">Interconsulta</p>
              <p className="text-[10px] text-teal-500 mt-0.5">Derivar a especialista</p>
            </div>
            {interconsultasCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">{interconsultasCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Telemedicina */}
      <div className="border border-gray-200 rounded-2xl p-4">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={telemedicina}
            onChange={e => setTelemedicina(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600"
          />
          <div className="flex items-center gap-2">
            <Monitor size={15} className="text-blue-500" />
            <span className="text-xs font-semibold text-gray-700">Esta es una consulta por Telemedicina</span>
          </div>
        </label>

        {telemedicina && (
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-700">
                <b>Ley N°30421 — Ley Marco de Telesalud:</b> El consentimiento informado es obligatorio para teleconsultas.
                La atención tiene la misma validez legal que la presencial si se cumple con todos los requisitos.
              </p>
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentimiento}
                onChange={e => setConsentimiento(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-xs text-gray-600">
                <b>Consentimiento informado de telemedicina verificado.</b> El paciente fue informado sobre la naturaleza
                de la teleconsulta, sus derechos y limitaciones, y otorgó su consentimiento verbal/digital.
              </span>
            </label>
            {!consentimiento && (
              <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                ⚠ El consentimiento de telemedicina es obligatorio para guardar esta atención (Ley 30421).
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
