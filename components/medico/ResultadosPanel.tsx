import { AlertTriangle, CheckCircle, Clock, FlaskConical } from 'lucide-react';
import type { ResultadoLab } from '@/lib/medico';
import { MOCK_RESULTADOS } from '@/lib/medico';

const ESTADO_ICON: Record<ResultadoLab['estado'], React.ReactNode> = {
  'Pendiente':   <Clock size={13} className="text-yellow-500" />,
  'En Proceso':  <Clock size={13} className="text-blue-500 animate-spin" />,
  'Validado':    <CheckCircle size={13} className="text-green-500" />,
};

export default function ResultadosPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FlaskConical size={16} className="text-purple-500" />
        <h3 className="text-sm font-semibold text-gray-700">Resultados de Laboratorio</h3>
      </div>

      <div className="space-y-2">
        {MOCK_RESULTADOS.map(r => (
          <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border ${r.critico ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex-shrink-0">{ESTADO_ICON[r.estado]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{r.nombre}</p>
              <p className="text-[10px] text-gray-400">{r.fechaResultado}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-bold ${r.critico ? 'text-red-700' : 'text-gray-800'}`}>
                {r.resultado} {r.unidad}
              </p>
              <p className="text-[10px] text-gray-400">Ref: {r.valorRef}</p>
            </div>
            {r.critico && (
              <div className="flex-shrink-0">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
            )}
          </div>
        ))}
      </div>

      {MOCK_RESULTADOS.some(r => r.critico) && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700 font-medium">
            Hay {MOCK_RESULTADOS.filter(r => r.critico).length} resultado(s) con valores críticos que requieren atención inmediata.
          </p>
        </div>
      )}
    </div>
  );
}
