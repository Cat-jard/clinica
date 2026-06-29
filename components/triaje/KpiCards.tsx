import { Clock, AlertCircle, AlertTriangle, Timer } from 'lucide-react';

interface Props {
  enEspera: number;
  rojo: number;
  naranja: number;
  tiempoPromedio: number;
}

export default function KpiCards({ enEspera, rojo, naranja, tiempoPromedio }: Props) {
  const cards = [
    { label: 'En Espera',           value: enEspera,       sub: 'Sin clasificar',      icon: <Clock size={18} />,         bg: 'bg-yellow-50 border-yellow-100', color: 'text-yellow-600', iconBg: 'bg-yellow-100 text-yellow-600' },
    { label: 'Prioridad Roja',      value: rojo,           sub: 'Críticos activos',    icon: <AlertCircle size={18} />,   bg: 'bg-red-50 border-red-100',       color: 'text-red-600',    iconBg: 'bg-red-100 text-red-600'       },
    { label: 'Prioridad Naranja',   value: naranja,        sub: 'Urgentes activos',    icon: <AlertTriangle size={18} />, bg: 'bg-orange-50 border-orange-100', color: 'text-orange-500', iconBg: 'bg-orange-100 text-orange-500' },
    { label: 'Tiempo Prom. Triaje', value: tiempoPromedio, sub: 'minutos por paciente',icon: <Timer size={18} />,         bg: 'bg-blue-50 border-blue-100',     color: 'text-blue-600',   iconBg: 'bg-blue-100 text-blue-600'     },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-2xl border px-5 py-4 ${c.bg}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">{c.label}</p>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.iconBg}`}>{c.icon}</div>
          </div>
          <p className={`text-4xl font-black ${c.color}`}>{c.value}</p>
          <p className="text-[11px] text-gray-400 mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
