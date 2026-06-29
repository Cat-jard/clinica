import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { MOCK_ALERTAS } from '@/lib/soporte';

export default function AlertasActivas() {
  if (MOCK_ALERTAS.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
      <div className="px-5 py-3.5 bg-red-50 border-b border-red-100 flex items-center gap-2">
        <AlertTriangle size={16} className="text-red-600" />
        <p className="text-sm font-bold text-red-700">Alertas Activas</p>
        <span className="ml-auto px-2.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">{MOCK_ALERTAS.length}</span>
      </div>
      <div className="divide-y divide-gray-50">
        {MOCK_ALERTAS.map(a => {
          const esError = a.nivel === 'ERROR';
          const Icon = esError ? AlertOctagon : AlertTriangle;
          return (
            <div key={a.id} className={`flex items-start gap-3 px-5 py-3 ${esError ? 'bg-red-50/40' : ''}`}>
              <Icon size={15} className={`flex-shrink-0 mt-0.5 ${esError ? 'text-red-500' : 'text-amber-500'}`} />
              <div className="flex-1">
                <p className="text-xs text-gray-700 font-medium">{a.texto}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 tabular-nums">{a.fechaHora}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${esError ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{a.nivel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
