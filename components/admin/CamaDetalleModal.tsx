'use client';

import { BedDouble, ArrowRightLeft, LogOut, User, Calendar, Stethoscope, Clock } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import type { Cama } from '@/lib/admin';

interface CamaDetalleModalProps {
  cama: Cama;
  onClose: () => void;
}

export default function CamaDetalleModal({ cama, onClose }: CamaDetalleModalProps) {
  return (
    <ModalBase title={`Cama ${cama.numero} — ${cama.servicio}`} onClose={onClose} width="max-w-md">
      <div className="p-6 space-y-4">
        {cama.estado === 'Ocupada' ? (
          <>
            <div className="space-y-3 text-sm">
              <Row Icon={User}        label="Paciente"        value={cama.paciente} />
              <Row Icon={Calendar}    label="Fecha de Ingreso" value={cama.fechaIngreso} />
              <Row Icon={Stethoscope} label="Diagnóstico"     value={cama.diagnostico} />
              <Row Icon={User}        label="Médico Tratante" value={cama.medicoTratante} />
              <Row Icon={Clock}       label="Días de Estancia" value={`${cama.diasEstancia} día(s)`} />
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
                <ArrowRightLeft size={14} /> Trasladar
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors">
                <LogOut size={14} /> Dar de Alta
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <BedDouble size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">Cama {cama.estado}</p>
            <p className="text-xs text-gray-400 mt-1">No hay paciente asignado a esta cama.</p>
          </div>
        )}
      </div>
    </ModalBase>
  );
}

function Row({ Icon, label, value }: { Icon: typeof User; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-gray-400" />
      </div>
      <div>
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value ?? '—'}</p>
      </div>
    </div>
  );
}
