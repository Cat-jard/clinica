'use client';

import { useState } from 'react';
import { AlertTriangle, User, Clock, ShieldCheck, FileText, X } from 'lucide-react';
import type { PacienteMedico, DiagnosticoCIE10 } from '@/lib/medico';
import { calcEdad, nombreCompleto } from '@/lib/medico';
import { PRIORIDAD_CONFIG, formatoFechaHoraPeru } from '@/lib/vitals';
import FirmaDigitalModal from './FirmaDigitalModal';
import ModalBase from '@/components/modals/ModalBase';

interface PacienteHeaderProps {
  paciente: PacienteMedico;
  diagnosticos: DiagnosticoCIE10[];
  alergias: string;
  onGuardarBorrador: () => void;
  onCerrarFirmar: () => void;
}

export default function PacienteHeader({ paciente, diagnosticos, alergias, onGuardarBorrador, onCerrarFirmar }: PacienteHeaderProps) {
  const [showResumen, setShowResumen] = useState(false);
  const [showFirma, setShowFirma] = useState(false);
  const [firmado, setFirmado] = useState(false);

  const cfg   = PRIORIDAD_CONFIG[paciente.prioridad];
  const edad  = calcEdad(paciente.fechaNac);
  const alergiasVigentes = alergias || paciente.alergias;
  const canFirmar = diagnosticos.length > 0;

  function handleCerrarFirmar() {
    if (!canFirmar) return;
    setShowFirma(true);
  }

  function handleFirmaConfirmada() {
    setFirmado(true);
    onCerrarFirmar();
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {/* Banner alergias */}
        {alergiasVigentes && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl">
            <AlertTriangle size={16} className="flex-shrink-0" />
            <p className="text-sm font-semibold">ALERGIAS CONOCIDAS: {alergiasVigentes}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Info paciente */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <User size={22} className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{nombreCompleto(paciente)}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                <span className="text-xs text-gray-500">DNI: <b className="text-gray-700">{paciente.dni}</b></span>
                <span className="text-xs text-gray-500">{edad} años · {paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                <span className="text-xs text-gray-500">HC: <b className="text-gray-700">{paciente.nroHistoria}</b></span>
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{paciente.aseguradora}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
                  {cfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Signos vitales rápidos */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {paciente.signos.pasSistolica && (
              <span className="bg-gray-50 px-2 py-1 rounded-lg">
                PA <b className="text-gray-800">{paciente.signos.pasSistolica}/{paciente.signos.pasDiastolica}</b>
              </span>
            )}
            {paciente.signos.frecCardiaca && (
              <span className="bg-gray-50 px-2 py-1 rounded-lg">
                FC <b className="text-gray-800">{paciente.signos.frecCardiaca}</b>
              </span>
            )}
            {paciente.signos.spo2 && (
              <span className={`px-2 py-1 rounded-lg ${paciente.signos.spo2 < 90 ? 'bg-red-50 text-red-700' : 'bg-gray-50'}`}>
                SpO₂ <b>{paciente.signos.spo2}%</b>
              </span>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResumen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <FileText size={13} /> Ver Resumen
            </button>
            <button
              onClick={onGuardarBorrador}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Clock size={13} /> Guardar Borrador
            </button>
            <button
              onClick={handleCerrarFirmar}
              disabled={!canFirmar || firmado}
              title={!canFirmar ? 'Debe agregar al menos un diagnóstico CIE-10' : ''}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShieldCheck size={13} />
              {firmado ? 'Atención Firmada ✓' : 'Cerrar y Firmar'}
            </button>
          </div>
        </div>

        {!canFirmar && (
          <p className="mt-3 text-[11px] text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
            ⚠ Debe agregar al menos un diagnóstico CIE-10 para poder cerrar y firmar la atención.
          </p>
        )}
      </div>

      {/* Modal Resumen */}
      {showResumen && (
        <ModalBase title="Resumen de Atenciones Previas" onClose={() => setShowResumen(false)} width="max-w-lg">
          <div className="p-6 space-y-3">
            {paciente.atencionesPrevias.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Sin atenciones previas registradas</p>
            ) : (
              paciente.atencionesPrevias.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{a.diagnostico}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{a.fecha} · {a.medico}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ModalBase>
      )}

      {/* Modal Firma */}
      {showFirma && (
        <FirmaDigitalModal
          titulo="Cerrar y Firmar Atención"
          descripcion={`Se firmará digitalmente la atención de ${nombreCompleto(paciente)}. Este documento será inalterable una vez firmado.`}
          onConfirm={handleFirmaConfirmada}
          onClose={() => setShowFirma(false)}
        />
      )}
    </>
  );
}
