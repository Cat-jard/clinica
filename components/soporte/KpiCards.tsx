import { Activity, Ticket, Timer, DatabaseBackup, HardDrive } from 'lucide-react';

export default function KpiCards() {
  const cards = [
    { label: 'Uptime del Sistema',    value: '99.98%',   Icon: Activity,       color: 'text-green-600', bg: 'bg-green-50', sub: 'Últimos 30 días' },
    { label: 'Incidencias Activas',   value: '3',        Icon: Ticket,         color: 'text-amber-600', bg: 'bg-amber-50', sub: '2 abiertas · 1 en progreso' },
    { label: 'Tiempo Prom. Resolución',value: '4h 12m',  Icon: Timer,          color: 'text-blue-600',  bg: 'bg-blue-50',  sub: 'Por incidencia' },
    { label: 'Última Copia',          value: 'Fallida',  Icon: DatabaseBackup, color: 'text-red-600',   bg: 'bg-red-50',   sub: '25/06 02:00 ⚠' },
    { label: 'Uso de Almacenamiento', value: '87%',      Icon: HardDrive,      color: 'text-amber-600', bg: 'bg-amber-50', progress: 87 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(({ label, value, Icon, color, bg, sub, progress }) => (
        <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={16} className={color} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${color} tabular-nums`}>{value}</p>
          {progress !== undefined ? (
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${progress > 85 ? 'bg-red-500' : progress > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }} />
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">{sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
