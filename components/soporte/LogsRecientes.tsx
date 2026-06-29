import { ScrollText } from 'lucide-react';
import { MOCK_LOGS, NIVEL_LOG_CONFIG } from '@/lib/soporte';

export default function LogsRecientes() {
  const logs = MOCK_LOGS.slice(0, 6);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <ScrollText size={16} className="text-blue-600" />
        <p className="text-sm font-semibold text-gray-800">Logs Recientes del Sistema</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-50 text-gray-400 font-medium">
              <th className="px-5 py-3 text-left">Fecha / Hora</th>
              <th className="px-5 py-3 text-left">Servicio</th>
              <th className="px-5 py-3 text-left">Nivel</th>
              <th className="px-5 py-3 text-left">Mensaje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map(l => {
              const cfg = NIVEL_LOG_CONFIG[l.nivel];
              return (
                <tr key={l.id} className={`hover:bg-gray-50/50 transition-colors ${l.nivel === 'ERROR' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap tabular-nums">{l.fechaHora}</td>
                  <td className="px-5 py-3 text-gray-600">{l.servicio}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {l.nivel}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 max-w-[420px] truncate font-mono text-[11px]">{l.mensaje}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
