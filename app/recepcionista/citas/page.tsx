'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarPlus, X, AlertCircle, Loader2 } from 'lucide-react';
import NewAppointmentModal from '@/components/modals/NewAppointmentModal';
import CancelAppointmentModal from '@/components/modals/CancelAppointmentModal';
import { useToast } from '@/context/ToastContext';
import { getUsuario } from '@/lib/auth';
import {
  listarCitas, cancelarCita, horaCorta, type Cita, type EstadoCita,
} from '@/lib/citas';

const STATUS_STYLE: Record<EstadoCita, string> = {
  PROGRAMADA: 'bg-blue-50 text-blue-600 border-blue-100',
  ATENDIDA:   'bg-green-50 text-green-600 border-green-100',
  CANCELADA:  'bg-red-50 text-red-500 border-red-100',
};

const STATUS_LABEL: Record<EstadoCita, string> = {
  PROGRAMADA: 'Programada', ATENDIDA: 'Atendida', CANCELADA: 'Cancelada',
};

type Filtro = 'Todas' | 'PROGRAMADA' | 'ATENDIDA';

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'new' | 'cancel' | null>(null);
  const [selected, setSelected] = useState<Cita | null>(null);
  const [filter, setFilter] = useState<Filtro>('Todas');
  const { success, error: toastError } = useToast();

  const today = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setCitas(await listarCitas());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar citas');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtered = citas.filter((a) => filter === 'Todas' || a.estado === filter);
  const nProgramadas = citas.filter((a) => a.estado === 'PROGRAMADA').length;
  const nAtendidas = citas.filter((a) => a.estado === 'ATENDIDA').length;

  async function cancelConfirm(motivo: string) {
    if (!selected) return;
    const u = getUsuario();
    const canceladoPor = u ? `${u.nombre} ${u.apellidos} (${u.rol})` : 'Recepción';
    try {
      await cancelarCita(selected.id, motivo, canceladoPor);
      success(`Cita de ${selected.pacienteNombre ?? 'paciente'} cancelada.`);
      setModal(null);
      setSelected(null);
      await cargar();
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'No se pudo cancelar la cita.');
    }
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
            { label: 'Total', value: citas.length, color: 'text-gray-900' },
            { label: 'Programadas', value: nProgramadas, color: 'text-blue-600' },
            { label: 'Atendidas', value: nAtendidas, color: 'text-green-600' },
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
            {([['Todas', 'Todas'], ['PROGRAMADA', 'Programadas'], ['ATENDIDA', 'Atendidas']] as const).map(([f, label]) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === f ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-600">
              <AlertCircle size={15} /> {error}
              <button onClick={cargar} className="ml-auto text-xs font-medium underline">Reintentar</button>
            </div>
          )}

          <table className="w-full text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                {['Hora', 'Paciente', 'Médico', 'Motivo', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((apt) => (
                <tr key={apt.id} className={`transition-colors ${apt.estado === 'CANCELADA' ? 'opacity-50' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-5 py-3 font-semibold text-gray-700">{horaCorta(apt.horaInicio)}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{apt.pacienteNombre ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{apt.medicoNombre ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{apt.motivo}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${STATUS_STYLE[apt.estado]}`}>
                      {STATUS_LABEL[apt.estado]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {apt.estado === 'PROGRAMADA' && (
                      <button
                        onClick={() => { setSelected(apt); setModal('cancel'); }}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium"
                      >
                        <X size={12} /> Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cargando && (
            <div className="py-12 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin" /> Cargando citas…
            </div>
          )}
          {!cargando && !error && filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">No hay citas registradas.</div>
          )}
        </div>
      </div>

      {modal === 'new' && <NewAppointmentModal onClose={() => setModal(null)} onCreated={cargar} />}
      {modal === 'cancel' && selected && (
        <CancelAppointmentModal
          appointment={{ time: horaCorta(selected.horaInicio), patient: selected.pacienteNombre ?? '—', doctor: selected.medicoNombre ?? '—' }}
          onClose={() => setModal(null)}
          onConfirm={cancelConfirm}
        />
      )}
    </>
  );
}
