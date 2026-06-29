import { Server } from 'lucide-react';
import { MOCK_SERVICIOS, ESTADO_SERVICIO_CONFIG } from '@/lib/soporte';

export default function EstadoServicios() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Server size={16} className="text-blue-600" />
        <h2 className="text-sm font-semibold text-gray-800">Estado de Servicios Críticos</h2>
      </div>
      <div className="space-y-2">
        {MOCK_SERVICIOS.map(s => {
          const cfg = ESTADO_SERVICIO_CONFIG[s.estado];
          return (
            <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${s.estado === 'Caído' ? 'animate-pulse' : ''} flex-shrink-0`} />
              <p className="flex-1 text-xs font-medium text-gray-700 truncate">{s.nombre}</p>
              <span className="text-[10px] text-gray-400 tabular-nums">{s.latencia}</span>
              <span className={`text-[10px] font-semibold ${cfg.text} w-20 text-right`}>{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
