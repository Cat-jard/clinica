'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import FirmaDigitalModal from './FirmaDigitalModal';
import type { PacienteMedico } from '@/lib/medico';
import { formatoFechaHoraPeru } from '@/lib/vitals';

interface EpicrisModalProps {
  paciente: PacienteMedico;
  onClose: () => void;
}

export default function EpicrisModal({ paciente, onClose }: EpicrisModalProps) {
  const [showFirma, setShowFirma] = useState(false);
  const [firmada, setFirmada]     = useState(false);

  const hoy = formatoFechaHoraPeru(new Date());

  const [form, setForm] = useState({
    fechaIngreso: '20/06/2026',
    fechaAlta: hoy.split(' —')[0],
    motivoIngreso: paciente.motivoConsulta,
    dxIngreso: '',
    dxFinal: '',
    evolucion: '',
    procedimientos: '',
    complicaciones: '',
    tratamiento: '',
    recomendaciones: '',
    proximaCita: '',
  });

  function set(key: keyof typeof form, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  const canFirmar = form.dxFinal && form.evolucion && form.tratamiento && form.recomendaciones && form.proximaCita;

  return (
    <>
      <ModalBase title="Epicrisis — Informe de Alta" onClose={onClose} width="max-w-3xl">
        <div className="p-6 space-y-4">

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2">
            <FileText size={14} className="text-blue-500" />
            <p className="text-xs text-blue-700 font-medium">
              Documento obligatorio según NTS N°139-MINSA. Debe ser firmado digitalmente para ser válido.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fecha de Ingreso</label>
              <input value={form.fechaIngreso} onChange={e => set('fechaIngreso', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fecha de Alta</label>
              <input value={form.fechaAlta} readOnly
                className="w-full px-3 py-2 border border-gray-100 bg-gray-50 rounded-xl text-xs text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Motivo de Ingreso *</label>
            <textarea rows={2} value={form.motivoIngreso} onChange={e => set('motivoIngreso', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Diagnóstico de Ingreso (CIE-10) *</label>
              <input value={form.dxIngreso} onChange={e => set('dxIngreso', e.target.value)}
                placeholder="Ej: I10 — Hipertensión esencial"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Diagnóstico Final de Alta (CIE-10) *</label>
              <input value={form.dxFinal} onChange={e => set('dxFinal', e.target.value)}
                placeholder="Ej: I11.9 — Cardiopatía hipertensiva"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Evolución durante la Estancia *</label>
            <textarea rows={3} value={form.evolucion} onChange={e => set('evolucion', e.target.value)}
              placeholder="Resumen de la evolución clínica del paciente durante su hospitalización…"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-y focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Procedimientos Realizados *</label>
              <textarea rows={2} value={form.procedimientos} onChange={e => set('procedimientos', e.target.value)}
                placeholder="Cirugías, intervenciones, procedimientos diagnósticos…"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Complicaciones</label>
              <textarea rows={2} value={form.complicaciones} onChange={e => set('complicaciones', e.target.value)}
                placeholder="Si las hubo (dejar en blanco si no aplica)…"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tratamiento Recibido *</label>
            <textarea rows={2} value={form.tratamiento} onChange={e => set('tratamiento', e.target.value)}
              placeholder="Medicamentos y dosis principales administrados durante la hospitalización…"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Recomendaciones al Alta *</label>
            <textarea rows={2} value={form.recomendaciones} onChange={e => set('recomendaciones', e.target.value)}
              placeholder="Cuidados, medicación, dieta, actividad física, signos de alarma…"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Próxima Cita de Control *</label>
            <input type="date" value={form.proximaCita} onChange={e => set('proximaCita', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancelar</button>
            <button className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">Imprimir Borrador</button>
            <button onClick={() => canFirmar && setShowFirma(true)} disabled={!canFirmar || firmada}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
              {firmada ? 'Epicrisis Firmada ✓' : 'Firmar Epicrisis'}
            </button>
          </div>
        </div>
      </ModalBase>

      {showFirma && (
        <FirmaDigitalModal
          titulo="Firmar Epicrisis"
          descripcion={`Se firmará el Informe de Alta de ${paciente.nombre} ${paciente.apellidos}. Este documento es inalterable una vez firmado.`}
          onConfirm={() => { setFirmada(true); setShowFirma(false); }}
          onClose={() => setShowFirma(false)}
        />
      )}
    </>
  );
}
