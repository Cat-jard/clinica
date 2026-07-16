'use client';

import { useState, useEffect } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import NewAppointmentModal from '@/components/modals/NewAppointmentModal';
import CancelAppointmentModal from '@/components/modals/CancelAppointmentModal';
import { listCitasApi, Cita } from '@/lib/citas';

const STATUS_STYLE: Record<string, string> = {
  Confirmada: 'bg-green-50 text-green-600 border-green-100',
  Pendiente:  'bg-yellow-50 text-yellow-600 border-yellow-100',
  Cancelada:  'bg-red-50 text-red-500 border-red-100',
};

type Modal = 'new' | 'cancel' | null;

export default function CitasPage() {
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Modal>(null);
  const [selected, setSelected] = useState<Cita | null>(null);
  const [filter, setFilter] = useState<'Todas' | 'Confirmada' | 'Pendiente' | 'Cancelada'>('Todas');

  const todayStr = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayIso = new Date().toISOString().split('T')[0];

  async function fetchAppointments() {
    setLoading(true);
    try {
      // List appointments for today (or all)
      const data = await listCitasApi(todayIso, todayIso);
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  function getFriendlyStatus(estado: string): 'Confirmada' | 'Pendiente' | 'Cancelada' {
    switch (estado?.toUpperCase()) {
      case 'CONFIRMADA':
      case 'PROGRAMADA': return 'Confirmada';
      case 'PENDIENTE': return 'Pendiente';
      case 'CANCELADA': return 'Cancelada';
      default: return 'Pendiente';
    }
  }

  const mappedAppointments = appointments.map(apt => ({
    ...apt,
    friendlyStatus: getFriendlyStatus(apt.estado)
  }));

  const filtered = mappedAppointments.filter(
    (a) => filter === 'Todas' || a.friendlyStatus === filter
  );

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
            <p className="text-sm text-gray-400 capitalize">{todayStr}</p>
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
            { label: 'Confirmadas/Programadas', value: mappedAppointments.filter((a) => a.friendlyStatus === 'Confirmada').length, color: 'text-green-600' },
            { label: 'Pendientes',    value: mappedAppointments.filter((a) => a.friendlyStatus === 'Pendiente').length,  color: 'text-yellow-600' },
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
            {(['Todas', 'Confirmada', 'Pendiente', 'Cancelada'] as const).map((f) => (
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

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Cargando citas del día…</div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50">
                  <tr>
                    {['Hora', 'Paciente', 'Médico', 'Motivo / Seguro', 'Estado', 'Acciones'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((apt) => (
                    <tr key={apt.id} className={`transition-colors ${apt.friendlyStatus === 'Cancelada' ? 'opacity-50' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-5 py-3 font-semibold text-gray-700">
                        {apt.horaInicio?.substring(0, 5)} - {apt.horaFin?.substring(0, 5)}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {apt.pacienteNombre || '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {apt.medicoNombre ? `Dr(a). ${apt.medicoNombre}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        <span className="font-medium text-gray-700">{apt.motivo}</span>
                        {apt.tipoSeguro && (
                          <span className="ml-2 text-xs text-gray-400">({apt.tipoSeguro})</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${STATUS_STYLE[apt.friendlyStatus]}`}>
                          {apt.friendlyStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {apt.friendlyStatus !== 'Cancelada' && (
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
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-400">
                  No se encontraron citas programadas para hoy.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modal === 'new' && (
        <NewAppointmentModal
          onClose={() => setModal(null)}
          onSuccess={fetchAppointments}
        />
      )}
      {modal === 'cancel' && selected && (
        <CancelAppointmentModal
          appointment={{
            id: selected.id,
            patient: selected.pacienteNombre || 'Paciente',
            doctor: selected.medicoNombre ? `Dr. ${selected.medicoNombre}` : 'Médico',
            time: selected.horaInicio?.substring(0, 5) || '—'
          }}
          onClose={() => setModal(null)}
          onConfirm={() => {
            setModal(null);
            fetchAppointments();
          }}
        />
      )}
    </>
  );
}
