import { ClipboardList, FlaskConical, CheckSquare, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { OrdenLab, ResultadoCritico, ControlCalidad } from '@/lib/laboratorio';

interface KpiCardsProps {
  ordenes: OrdenLab[];
  criticos: ResultadoCritico[];
  controles: ControlCalidad[];
}

export default function KpiCards({ ordenes, criticos, controles }: KpiCardsProps) {
  const pendientes        = ordenes.filter(o => o.estado === 'Pendiente').length;
  const enProceso         = ordenes.filter(o => o.estado === 'En Proceso' || o.estado === 'Muestra Registrada').length;
  const porValidar        = ordenes.filter(o => o.estado === 'Resultados Pendientes').length;
  const criticos_count    = criticos.length;
  const controlOk         = controles.filter(c => c.estado === 'Aceptado').length;
  const controlTotal      = controles.length;

  const cards = [
    {
      label: 'Órdenes Pendientes',
      value: pendientes,
      Icon: ClipboardList,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      sub: 'Recibidas y sin procesar',
    },
    {
      label: 'Muestras en Proceso',
      value: enProceso,
      Icon: FlaskConical,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      sub: 'En análisis activo',
    },
    {
      label: 'Por Validar',
      value: porValidar,
      Icon: CheckSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      sub: 'Pendientes de firma',
    },
    {
      label: 'Resultados Críticos',
      value: criticos_count,
      Icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      sub: criticos_count > 0 ? '⚠ Requieren atención inmediata' : 'Sin alertas activas',
    },
    {
      label: 'Controles de Calidad',
      value: `${controlOk}/${controlTotal}`,
      Icon: ShieldCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
      sub: 'Aceptados hoy',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(({ label, value, Icon, color, bg, sub }) => (
        <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={16} className={color} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-[11px] text-gray-400">{sub}</p>
        </div>
      ))}
    </div>
  );
}
