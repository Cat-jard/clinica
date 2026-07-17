'use client';

import { X, Calendar, User, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import type { EstudioImagen } from '@/lib/radiologia';
import { ESTADO_CONFIG } from '@/lib/radiologia';

interface VerResultadoRadModalProps {
  estudio: EstudioImagen;
  onClose: () => void;
}

export default function VerResultadoRadModal({ estudio, onClose }: VerResultadoRadModalProps) {
  const estadoCfg = ESTADO_CONFIG[estudio.estado];
  const ic = estudio.esCritico ? <AlertTriangle size={14} className="text-red-500" /> : null;

  return (
    <ModalBase title="Resultado de Imagenología" onClose={onClose} width="max-w-3xl">
      <div className="p-6 space-y-5">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FileText size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{estudio.tipoEstudio}</p>
              <p className="text-[11px] text-gray-500">{estudio.modalidad} · {estudio.regionAnatomica}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ic}
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${estadoCfg.className}`}>
              {estadoCfg.label}
            </span>
          </div>
        </div>

        {/* Paciente */}
        <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
          <User size={14} className="text-gray-400" />
          <p className="text-xs text-gray-700">
            <b>{estudio.paciente.nombre} {estudio.paciente.apellidos}</b> · DNI: {estudio.paciente.dni} · HC: {estudio.paciente.nroHistoria}
          </p>
        </div>

        {/* Metadatos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar size={12} className="text-gray-400" />
            Solicitado: {estudio.fechaSolicitud}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar size={12} className="text-gray-400" />
            Realizado: {estudio.fechaEstudio}
          </div>
        </div>

        {estudio.informe ? (
          <>
            {/* Hallazgos */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Hallazgos</h4>
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-xs text-gray-700 whitespace-pre-line">{estudio.informe.hallazgos || '—'}</p>
              </div>
            </div>

            {/* Impresión diagnóstica */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Impresión Diagnóstica</h4>
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-xs text-gray-700 whitespace-pre-line">{estudio.informe.impresionDiagnostica || '—'}</p>
              </div>
            </div>

            {/* Recomendaciones */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Recomendaciones</h4>
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-xs text-gray-700 whitespace-pre-line">{estudio.informe.recomendaciones || '—'}</p>
              </div>
            </div>

            {/* Código CIE-10 y Dosis */}
            <div className="grid grid-cols-2 gap-3">
              {estudio.informe.codigoCIE10 && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 mb-1">Código CIE-10</p>
                  <p className="text-xs font-semibold text-gray-800">{estudio.informe.codigoCIE10}</p>
                </div>
              )}
              {estudio.informe.dosisRadiacion && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 mb-1">Dosis de Radiación</p>
                  <p className="text-xs font-semibold text-gray-800">{estudio.informe.dosisRadiacion}</p>
                </div>
              )}
            </div>

            {estudio.firmadoEn && (
              <div className="flex items-center gap-2 text-[11px] text-green-700 bg-green-50 rounded-xl px-3 py-2">
                <CheckCircle size={13} />
                Informe firmado · {estudio.firmadoEn}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
            <Clock size={24} />
            <p className="text-xs">Estudio pendiente de informe radiológico</p>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
