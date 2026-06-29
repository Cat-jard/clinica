import { ChevronDown } from 'lucide-react';
import StatCard from '@/components/StatCard';
import PatientQueue from '@/components/PatientQueue';
import AppointmentTimeline from '@/components/AppointmentTimeline';
import UpcomingAppointments from '@/components/UpcomingAppointments';
import OurSpecialist from '@/components/OurSpecialist';

const STAT_CARDS = [
  { title: 'Citas de Hoy',        value: '186', badge: '+12%', comparison: 'vs ayer', data: [4,3,5,3,4,5,4,6] },
  { title: 'Pacientes en Espera', value: '24',  badge: '+5%',  comparison: 'vs ayer', data: [2,3,2,4,3,3,4,5] },
  { title: 'Pacientes Atendidos', value: '148', badge: '+44%', comparison: 'vs ayer', data: [2,3,2,4,3,5,4,6] },
  { title: 'Nuevos Registros',    value: '18',  badge: '+22%', comparison: 'vs ayer', data: [1,2,1,3,2,3,3,4] },
];

export default function RecepcionistaDashboard() {
  return (
    <div className="space-y-4">

      {/* Row 1: Overview + 4 KPIs */}
      <div className="grid grid-cols-5 gap-4 items-start">
        <div className="flex flex-col justify-between h-full pt-1">
          <div>
            <h1 className="text-5xl font-black text-gray-900 leading-tight tracking-tight mb-1">Overview</h1>
            <p className="text-sm text-gray-400">Resumen del día — Recepción</p>
          </div>
          <div className="mt-6">
            <button className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              Hoy <ChevronDown size={14} />
            </button>
          </div>
        </div>
        {STAT_CARDS.map((card) => <StatCard key={card.title} {...card} />)}
      </div>

      {/* Row 2: Cola + Timeline de citas */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 5fr' }}>
        <PatientQueue />
        <AppointmentTimeline />
      </div>

      {/* Row 3: Próximas citas + Médicos en turno */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <UpcomingAppointments />
        <OurSpecialist />
      </div>

    </div>
  );
}
