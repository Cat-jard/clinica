'use client';

import { AlertTriangle, FlaskConical, ScanLine, ShieldAlert, Eye, ChevronRight } from 'lucide-react';
import PortalShell from '@/components/portal/PortalShell';
import {
  MOCK_RESULTADOS_PACIENTE, MOCK_IMAGENES_PACIENTE, ESTADO_RESULTADO_CONFIG,
  MOCK_ALERGIAS, MOCK_ANTECEDENTES, MOCK_MEDICACION_ACTUAL,
} from '@/lib/paciente-portal';

export default function ResultadosPaciente() {
  return (
    <PortalShell>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Mi Historial Clínico</h1>
      <p className="text-xs text-gray-500 mb-5">Solo lectura · Tu derecho de acceso (Ley 26842 y 30024)</p>

      {/* Resumen del historial */}
      <div className="space-y-3 mb-6">
        {/* Alergias */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={16} className="text-red-600" />
            <p className="text-sm font-bold text-red-700">Alergias</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {MOCK_ALERGIAS.map(a => (
              <span key={a} className="px-2.5 py-1 bg-white text-red-700 text-xs font-medium rounded-lg border border-red-200">{a}</span>
            ))}
          </div>
        </div>

        {/* Antecedentes */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-bold text-gray-800 mb-2">Antecedentes</p>
          <ul className="space-y-1">
            {MOCK_ANTECEDENTES.map(a => (
              <li key={a} className="text-xs text-gray-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Medicación actual */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-bold text-gray-800 mb-2">Medicación Actual</p>
          <ul className="space-y-1">
            {MOCK_MEDICACION_ACTUAL.map(m => (
              <li key={m} className="text-xs text-gray-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Resultados de laboratorio */}
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical size={16} className="text-purple-600" />
        <h2 className="text-sm font-bold text-gray-800">Resultados de Laboratorio</h2>
      </div>
      <div className="space-y-2 mb-6">
        {MOCK_RESULTADOS_PACIENTE.map(r => (
          <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${r.critico ? 'border-red-200' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">{r.examen}</p>
                  {r.critico && <AlertTriangle size={13} className="text-red-500" />}
                </div>
                <p className="text-[10px] text-gray-400">{r.fecha}</p>
              </div>
              <div className="text-right">
                <p className={`text-base font-bold ${r.critico ? 'text-red-600' : 'text-gray-800'}`}>{r.resultado} <span className="text-xs font-normal text-gray-400">{r.unidad}</span></p>
                <p className="text-[10px] text-gray-400">Ref: {r.valorRef}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ESTADO_RESULTADO_CONFIG[r.estado].className}`}>{r.estado}</span>
              {r.estado === 'Validado' && (
                <button className="flex items-center gap-1 text-[11px] font-medium text-blue-600">
                  <Eye size={11} /> Ver detalle
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Imágenes médicas */}
      <div className="flex items-center gap-2 mb-3">
        <ScanLine size={16} className="text-indigo-600" />
        <h2 className="text-sm font-bold text-gray-800">Estudios de Imagen</h2>
      </div>
      <div className="space-y-2">
        {MOCK_IMAGENES_PACIENTE.map(i => (
          <button key={i.id} className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <ScanLine size={18} className="text-indigo-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-800">{i.tipo}</p>
              <p className="text-[10px] text-gray-400">{i.fecha} · {i.medicoSolicitante}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
      </div>

      {/* Nota de solo lectura */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-3 flex items-start gap-2">
        <ShieldAlert size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700">
          Tu información clínica es de <b>solo lectura</b>. Para cualquier corrección, ejerce tu derecho de rectificación desde tu Perfil.
        </p>
      </div>
    </PortalShell>
  );
}
