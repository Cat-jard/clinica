'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ModalBase from './ModalBase';
import { useToast } from '@/context/ToastContext';

const MOTIVOS = [
  'Paciente no se presentó',
  'Médico no disponible',
  'Reprogramación solicitada por el paciente',
  'Emergencia del médico',
  'Falla del sistema',
  'Otro motivo',
];

interface Appointment {
  time: string;
  patient: string;
  doctor: string;
}

interface Props {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelAppointmentModal({ appointment, onClose, onConfirm }: Props) {
  const [motivo, setMotivo] = useState('');
  const [detalle, setDetalle] = useState('');
  const { success, error } = useToast();

  function handleConfirm() {
    if (!motivo) { error('Debe seleccionar un motivo de cancelación (requerido por trazabilidad).'); return; }
    if (motivo === 'Otro motivo' && !detalle.trim()) {
      error('Debe describir el motivo de cancelación.');
      return;
    }
    success(`Cita de ${appointment.patient} cancelada. Motivo registrado.`);
    onConfirm();
  }

  return (
    <ModalBase title="Cancelar Cita" onClose={onClose} width="max-w-md">
      <div className="p-6 space-y-4">

        {/* Warning */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-3">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-700">
            <p className="font-semibold mb-0.5">Esta acción no se puede deshacer.</p>
            <p>Cita de <span className="font-semibold">{appointment.patient}</span> con <span className="font-semibold">{appointment.doctor}</span> a las <span className="font-semibold">{appointment.time}</span>.</p>
          </div>
        </div>

        {/* Motivo selector — obligatorio por trazabilidad */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Motivo de Cancelación <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal ml-1">(obligatorio · NTS N°139)</span>
          </label>
          <div className="space-y-1.5">
            {MOTIVOS.map((m) => (
              <label key={m} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="motivo"
                  value={m}
                  checked={motivo === m}
                  onChange={() => setMotivo(m)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700">{m}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Detalle libre si "Otro motivo" */}
        {motivo === 'Otro motivo' && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Describa el motivo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              rows={3}
              placeholder="Describa el motivo detalladamente…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Confirmar Cancelación
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
