'use client';

import { useState, useEffect } from 'react';
import { UserPlus, CalendarPlus, Search, X, Eye, ClipboardCheck } from 'lucide-react';
import SearchPatientModal from './modals/SearchPatientModal';
import NewPatientModal from './modals/NewPatientModal';
import NewAppointmentModal from './modals/NewAppointmentModal';
import CancelAppointmentModal from './modals/CancelAppointmentModal';
import CoverageModal from './modals/CoverageModal';
import { useToast } from '@/context/ToastContext';
import { listarCitas, cancelarCita } from '@/lib/citas';
import { ingresarCola, obtenerPaciente } from '@/lib/recepcion';

interface Appointment {
  id: string;
  time: string;
  patient: string;
  patientId: string;
  doctor: string;
  specialty: string;
  status: 'Confirmada' | 'Pendiente' | 'Cancelada';
  hasConsent: boolean;
  motivo?: string;
}

const STATUS_STYLE: Record<string, string> = {
  Confirmada: 'bg-green-50 text-green-600 border-green-100',
  Pendiente:  'bg-yellow-50 text-yellow-600 border-yellow-100',
  Cancelada:  'bg-red-50 text-red-500 border-red-100',
};

function mapStatus(estado: string): 'Confirmada' | 'Pendiente' | 'Cancelada' {
  switch (estado?.toUpperCase()) {
    case 'PROGRAMADA': return 'Confirmada';
    case 'ATENDIDA': return 'Confirmada';
    case 'CANCELADA': return 'Cancelada';
    default: return 'Pendiente';
  }
}

type ModalType = 'search' | 'newPatient' | 'newAppointment' | 'cancel' | 'coverage' | null;

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const { success, error: toastError } = useToast();

  const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  async function fetchAppointments() {
    try {
      const data = await listarCitas();
      const mapped = data.map((c: any) => ({
        id: c.id,
        time: (c.horaInicio || '').slice(0, 5),
        patient: c.pacienteNombre || 'Paciente Desconocido',
        patientId: c.pacienteId,
        doctor: c.medicoNombre || 'Médico Desconocido',
        specialty: c.motivo || 'Consulta General',
        status: mapStatus(c.estado),
        hasConsent: true,
        motivo: c.motivo,
      }));
      setAppointments(mapped);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  function openCancel(apt: Appointment) { setSelected(apt); setModal('cancel'); }
  function openCoverage(apt: Appointment) { setSelected(apt); setModal('coverage'); }

  async function confirmCancel() {
    if (!selected) return;
    try {
      await cancelarCita(selected.id, 'Cancelado por recepción', 'Recepcionista');
      success(`Cita de ${selected.patient} cancelada.`);
      await fetchAppointments();
    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'No se pudo cancelar la cita.');
    } finally {
      setModal(null);
      setSelected(null);
    }
  }

  async function registerArrival(apt: Appointment) {
    try {
      const paciente = await obtenerPaciente(apt.patientId);
      await ingresarCola({
        pacienteId: apt.patientId,
        pacienteNombre: apt.patient,
        pacienteDni: paciente.nroDocumento,
        medicoNombre: apt.doctor,
        especialidad: apt.specialty,
        motivo: apt.motivo || 'Consulta médica',
        citaId: apt.id,
      });
      success(`Llegada de ${apt.patient} registrada. Pasando a cola de Triaje.`);
    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'Error al registrar la llegada en la cola.');
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">

        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Próximas Citas</h3>
            <p className="text-xs text-gray-400">{today}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <button onClick={() => setModal('newPatient')}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors">
              <UserPlus size={11} /> Nuevo Paciente
            </button>
            <button onClick={() => setModal('newAppointment')}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors">
              <CalendarPlus size={11} /> Agendar Cita
            </button>
            <button onClick={() => setModal('search')}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full hover:bg-gray-100 transition-colors">
              <Search size={11} /> Buscar
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400">Cargando citas…</div>
          ) : appointments.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">No hay citas programadas para hoy.</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Hora', 'Paciente', 'Médico', 'Especialidad', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="text-left py-2 pr-2 text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt, i) => (
                  <tr key={i} className={`border-b border-gray-50 transition-colors ${apt.status === 'Cancelada' ? 'opacity-50' : 'hover:bg-gray-50'}`}>
                    <td className="py-2.5 pr-2 font-semibold text-gray-700">{apt.time}</td>
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-800 font-medium">{apt.patient}</span>
                        {!apt.hasConsent && apt.status !== 'Cancelada' && (
                          <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">
                            Falta Consentimiento
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 pr-2 text-gray-500">{apt.doctor}</td>
                    <td className="py-2.5 pr-2 text-gray-500">{apt.specialty}</td>
                    <td className="py-2.5 pr-2">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${STATUS_STYLE[apt.status]}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-2.5">
                      {apt.status !== 'Cancelada' && (
                        <div className="flex items-center gap-1">
                          {/* Registrar llegada */}
                          <button
                            onClick={() => registerArrival(apt)}
                            title="Registrar llegada → Triaje"
                            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          >
                            <ClipboardCheck size={12} />
                          </button>
                          {/* Cobertura */}
                          <button
                            onClick={() => openCoverage(apt)}
                            title="Verificar cobertura"
                            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye size={12} />
                          </button>
                          {/* Cancelar */}
                          <button
                            onClick={() => openCancel(apt)}
                            title="Cancelar cita"
                            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal === 'search'         && <SearchPatientModal onClose={() => setModal(null)} onNewPatient={() => setModal('newPatient')} />}
      {modal === 'newPatient'     && <NewPatientModal onClose={() => setModal(null)} />}
      {modal === 'newAppointment' && <NewAppointmentModal onClose={() => setModal(null)} onCreated={fetchAppointments} />}
      {modal === 'cancel'  && selected && (
        <CancelAppointmentModal appointment={selected} onClose={() => setModal(null)} onConfirm={confirmCancel} />
      )}
      {modal === 'coverage' && selected && (
        <CoverageModal patientName={selected.patient} onClose={() => setModal(null)} />
      )}
    </>
  );
}
