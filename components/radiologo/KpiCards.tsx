import { ScanLine, FileSignature, Loader, AlertTriangle } from 'lucide-react';
import type { EstudioImagen } from '@/lib/radiologia';

interface KpiCardsProps {
  estudios: EstudioImagen[];
}

export default function KpiCards({ estudios }: KpiCardsProps) {
  const pendientes = estudios.filter(e => e.estado === 'Pendiente').length;
  const porFirmar  = estudios.filter(e => e.estado === 'Borrador').length;
  const enProceso  = estudios.filter(e => e.estado === 'En Proceso').length;
  const urgencias  = estudios.filter(e => e.prioridad === 'Urgente' && e.estado !== 'Firmado' && e.estado !== 'Revisado').length;

  const cards = [
    { label: 'Estudios Pendientes', value: pendientes, Icon: ScanLine,      color: 'text-blue-600',   bg: 'bg-blue-50',   sub: 'Recibidos, sin leer'        },
    { label: 'Informes por Firmar', value: porFirmar,  Icon: FileSignature, color: 'text-purple-600', bg: 'bg-purple-50', sub: 'Borradores listos'          },
    { label: 'En Proceso',          value: enProceso,  Icon: Loader,        color: 'text-amber-600',  bg: 'bg-amber-50',  sub: 'Abiertos, sin terminar'     },
    { label: 'Urgencias',           value: urgencias,  Icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-50',    sub: urgencias > 0 ? '⚠ Atención prioritaria' : 'Sin urgencias activas' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
