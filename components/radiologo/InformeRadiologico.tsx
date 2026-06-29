'use client';

import { useState } from 'react';
import {
  FileSignature, Save, Sparkles, AlertTriangle, Printer,
  GitCompare, CheckCircle, Stethoscope,
} from 'lucide-react';
import FirmaDigitalModal from '@/components/medico/FirmaDigitalModal';
import type { EstudioImagen, InformeRadiologico as TInforme } from '@/lib/radiologia';
import { PLANTILLAS_HALLAZGOS } from '@/lib/radiologia';

interface InformeRadiologicoProps {
  estudio: EstudioImagen;
  onGuardarBorrador: (informe: TInforme) => void;
  onFirmar: (informe: TInforme, urgente: boolean) => void;
}

export default function InformeRadiologico({ estudio, onGuardarBorrador, onFirmar }: InformeRadiologicoProps) {
  const yaFirmado = estudio.estado === 'Firmado' || estudio.estado === 'Revisado';

  const [hallazgos,    setHallazgos]    = useState(estudio.informe?.hallazgos ?? '');
  const [impresion,    setImpresion]    = useState(estudio.informe?.impresionDiagnostica ?? '');
  const [recom,        setRecom]        = useState(estudio.informe?.recomendaciones ?? '');
  const [cie10,        setCie10]        = useState(estudio.informe?.codigoCIE10 ?? '');
  const [dosis,        setDosis]        = useState(estudio.informe?.dosisRadiacion ?? '');
  const [marcarUrgente,setMarcarUrgente]= useState(false);

  const [showFirma, setShowFirma] = useState(false);

  // Regla de oro #1: Hallazgos + Impresión obligatorios para firmar
  const canFirmar = hallazgos.trim().length > 0 && impresion.trim().length > 0 && !yaFirmado;

  // Protección radiológica: solo Rx y TAC registran dosis
  const requiereDosis = estudio.modalidad === 'Radiografía' || estudio.modalidad === 'Tomografía (TAC)';

  function armarInforme(): TInforme {
    return {
      hallazgos, impresionDiagnostica: impresion, recomendaciones: recom,
      codigoCIE10: cie10 || undefined,
      dosisRadiacion: dosis || undefined,
    };
  }

  function aplicarPlantilla() {
    if (hallazgos.trim()) return;
    setHallazgos(PLANTILLAS_HALLAZGOS[estudio.modalidad] ?? '');
  }

  function handleFirmaConfirm() {
    onFirmar(armarInforme(), marcarUrgente);
    setShowFirma(false);
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Stethoscope size={16} className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">Informe Radiológico</h2>
            {yaFirmado && (
              <span className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                <CheckCircle size={10} /> Firmado
              </span>
            )}
          </div>
        </div>

        {/* Contenido desplazable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Datos del estudio (solo lectura) */}
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400">Nº Orden</p>
              <p className="font-mono font-bold text-blue-700">{estudio.nroOrden}</p>
            </div>
            <div>
              <p className="text-gray-400">Tipo de Estudio</p>
              <p className="font-semibold text-gray-800">{estudio.tipoEstudio}</p>
            </div>
            <div>
              <p className="text-gray-400">Paciente</p>
              <p className="font-semibold text-gray-800">{estudio.paciente.nombre} {estudio.paciente.apellidos}</p>
              <p className="text-gray-500 font-mono">{estudio.paciente.dni}</p>
            </div>
            <div>
              <p className="text-gray-400">Médico Solicitante</p>
              <p className="font-semibold text-gray-800">{estudio.medicoSolicitante}</p>
              <p className="text-gray-500">{estudio.especialidadMedico}</p>
            </div>
            <div>
              <p className="text-gray-400">Fecha del Estudio</p>
              <p className="font-mono text-gray-700">{estudio.fechaEstudio}</p>
            </div>
            <div>
              <p className="text-gray-400">Modalidad</p>
              <p className="text-gray-700">{estudio.modalidad}</p>
            </div>
          </div>

          {/* Hallazgos */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Hallazgos Radiológicos <span className="text-red-500">*</span>
              </label>
              {!yaFirmado && !hallazgos.trim() && (
                <button onClick={aplicarPlantilla}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium">
                  <Sparkles size={11} /> Usar plantilla {estudio.modalidad}
                </button>
              )}
            </div>
            <textarea
              value={hallazgos}
              onChange={e => setHallazgos(e.target.value)}
              readOnly={yaFirmado}
              rows={6}
              placeholder="Describa los hallazgos encontrados en las imágenes…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none read-only:bg-gray-50"
            />
          </div>

          {/* Impresión Diagnóstica */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Impresión Diagnóstica (Conclusión) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={impresion}
              onChange={e => setImpresion(e.target.value)}
              readOnly={yaFirmado}
              rows={3}
              placeholder="Diagnóstico final (ej. Neumonía basal derecha)…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none read-only:bg-gray-50"
            />
          </div>

          {/* Recomendaciones */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Recomendaciones</label>
            <textarea
              value={recom}
              onChange={e => setRecom(e.target.value)}
              readOnly={yaFirmado}
              rows={2}
              placeholder="Sugerencias al médico tratante…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none read-only:bg-gray-50"
            />
          </div>

          {/* Fila: CIE-10 + Dosis */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Código CIE-10 <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input
                type="text" value={cie10} onChange={e => setCie10(e.target.value)} readOnly={yaFirmado}
                placeholder="Ej. J18.9"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50"
              />
            </div>
            {requiereDosis && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Dosis Radiación <span className="text-gray-400 font-normal">(IPEN)</span></label>
                <input
                  type="text" value={dosis} onChange={e => setDosis(e.target.value)} readOnly={yaFirmado}
                  placeholder="Ej. 0.1 mSv"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50"
                />
              </div>
            )}
          </div>

          {/* Marcar urgente */}
          {!yaFirmado && (
            <label className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl cursor-pointer">
              <input type="checkbox" checked={marcarUrgente} onChange={e => setMarcarUrgente(e.target.checked)} className="accent-red-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                  <AlertTriangle size={12} /> Marcar como hallazgo crítico / urgente
                </p>
                <p className="text-[11px] text-red-500 mt-0.5">El médico tratante recibirá una alerta inmediata (ej. neumotórax, hemorragia).</p>
              </div>
            </label>
          )}

          {yaFirmado && estudio.firmadoEn && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-xs">
              <CheckCircle size={14} />
              <span>Informe firmado digitalmente el {estudio.firmadoEn} — Documento médico-legal enviado a la HCE.</span>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <GitCompare size={13} /> Comparar
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Printer size={13} /> Imprimir
            </button>
          </div>

          {!yaFirmado && (
            <div className="flex gap-2">
              <button
                onClick={() => onGuardarBorrador(armarInforme())}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Save size={14} /> Guardar Borrador
              </button>
              <button
                onClick={() => setShowFirma(true)}
                disabled={!canFirmar}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSignature size={14} /> Guardar y Firmar Informe
              </button>
            </div>
          )}

          {!canFirmar && !yaFirmado && (
            <p className="text-[11px] text-amber-600 text-center">
              * Complete Hallazgos e Impresión Diagnóstica para habilitar la firma
            </p>
          )}
        </div>
      </div>

      {showFirma && (
        <FirmaDigitalModal
          titulo="Firmar Informe Radiológico"
          descripcion={`Está a punto de firmar el informe del estudio ${estudio.nroOrden} (${estudio.tipoEstudio}) para ${estudio.paciente.nombre} ${estudio.paciente.apellidos}. Una vez firmado, se convierte en documento médico-legal y se envía a la HCE.`}
          onConfirm={handleFirmaConfirm}
          onClose={() => setShowFirma(false)}
        />
      )}
    </>
  );
}
