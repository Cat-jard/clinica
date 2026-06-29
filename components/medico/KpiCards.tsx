import { CalendarDays, Clock, FlaskConical, CheckCircle } from 'lucide-react';

interface KpiCardsProps {
  citasHoy: number;
  enEspera: number;
  resultadosPendientes: number;
  atendidosHoy: number;
}

const cards = [
  { key: 'citasHoy',              label: 'Citas de Hoy',           Icon: CalendarDays, color: 'text-blue-600',   bg: 'bg-blue-50'   },
  { key: 'enEspera',              label: 'Pacientes en Espera',     Icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 'resultadosPendientes',  label: 'Resultados Pendientes',   Icon: FlaskConical, color: 'text-red-600',    bg: 'bg-red-50'    },
  { key: 'atendidosHoy',          label: 'Atendidos Hoy',           Icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-50'  },
] as const;

export default function KpiCards({ citasHoy, enEspera, resultadosPendientes, atendidosHoy }: KpiCardsProps) {
  const values: Record<string, number> = { citasHoy, enEspera, resultadosPendientes, atendidosHoy };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, Icon, color, bg }) => (
        <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{values[key]}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={20} className={color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
