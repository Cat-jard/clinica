'use client';

import { useState } from 'react';
import { CalendarPlus, X, Eye } from 'lucide-react';
import NewAppointmentModal from '@/components/modals/NewAppointmentModal';
import CancelAppointmentModal from '@/components/modals/CancelAppointmentModal';

const APPOINTMENTS = [
  { time: '08:30', patient: 'Juan Pérez García',   doctor: 'Dr. Randy Gouse', specialty: 'Psicología',  status: 'Confirmada' as const },
  { time: '09:00', patient: 'María López Ruiz',    doctor: 'Dr. Alex Pitols', specialty: 'Psicología',  status: 'Pendiente'  as const },
  { time: '09:30', patient: 'Carlos Rodríguez',    doctor: 'Dra. Ana Torres', specialty: 'Cardiología', status: 'Confirmada' as const },
  { time: '10:00', patient: 'Ana Fernández Díaz',  doctor: 'Dr. Luis Díaz',   specialty: 'Pediatría',   status: 'Pendiente'  as const },
  { time: '10:30', patient: 'Pedro Martínez',      doctor: 'Dr. Randy Gouse', specialty: 'Psicología',  status: 'Confirmada' as const },
  { time: '11:00', patient: 'Lucía Torres Salas',  doctor: 'Dra. Ana Torres', specialty: 'Cardiología', status: 'Confirmada' as const },
  { time: '11:30', patient: 'Roberto Saenz',       doctor: 'Dr. Luis Díaz',   specialty: 'Pediatría',   status: 'Pendiente'  as const },
  { time: '12:00', patient: 'Carmen Villanueva',   doctor: 'Dr. Alex Pitols', specialty: 'Psicología',  status: 'Confirmada' as const },
];

const STATUS_STYLE: Record<string, string> = {
  Confirmada: 'bg-green-50 text-green-600 border-green-100',
  Pendiente:  'bg-yellow-50 text-yellow-600 border-yellow-100',
  Cancelada:  'bg-red-50 text-red-500 border-red-100',
};

type Apt = typeof APPOINTMENTS[0];
type Modal = 'new' | 'cancel' | null;

export default function CitasPage() {
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [modal, setModal] = useState<Modal>(null);
  const [selected, setSelected] = useState<Apt | null>(null);
  const [filter, setFilter] = useState<'Todas' | 'Confirmada' | 'Pendiente'>('Todas');

  const today = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const filtered = appointments.filter((a) => filter === 'Todas' || a.status === filter);

  function cancelConfirm() {
    if (!selected) return;
    setAppointments((prev) =>
      prev.map((a) => a.time === selected.time && a.patient === selected.patient
        ? { ...a, status: 'Cancelada' as const } : a)
    );
    setModal(null);
    setSelected(null);
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
            <p className="text-sm text-gray-400 capitalize">{today}</p>
          </div>
          <button
            onClick={() => setModal('new')}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <CalendarPlus size={15} /> Agendar Cita
          </button>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total del día', value: appointments.length, color: 'text-gray-900' },
            { label: 'Confirmadas',   value: appointments.filter((a) => a.status === 'Confirmada').length, color: 'text-green-600' },
            { label: 'Pendientes',    value: appointments.filter((a) => a.status === 'Pendiente').length,  color: 'text-yellow-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs + table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-1 px-5 pt-4 pb-0 border-b border-gray-100">
            {(['Todas', 'Confirmada', 'Pendiente'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === f
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                {['Hora', 'Paciente', 'Médico', 'Especialidad', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((apt, i) => (
                <tr key={i} className={`transition-colors ${apt.status === 'Cancelada' ? 'opacity-50' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-5 py-3 font-semibold text-gray-700">{apt.time}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{apt.patient}</td>
                  <td className="px-5 py-3 text-gray-500">{apt.doctor}</td>
                  <td className="px-5 py-3 text-gray-500">{apt.specialty}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${STATUS_STYLE[apt.status]}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {apt.status !== 'Cancelada' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelected(apt); setModal('cancel'); }}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                          <X size={12} /> Cancelar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal === 'new'    && <NewAppointmentModal onClose={() => setModal(null)} />}
      {modal === 'cancel' && selected && (
        <CancelAppointmentModal appointment={selected} onClose={() => setModal(null)} onConfirm={cancelConfirm} />
      )}
    </>
  );
}
