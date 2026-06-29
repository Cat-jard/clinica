import { Activity } from 'lucide-react';
import { MOCK_ACTIVIDAD, ROL_CONFIG } from '@/lib/admin';

export default function ActividadReciente() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <Activity size={16} className="text-blue-600" />
        <p className="text-sm font-semibold text-gray-800">Actividad Reciente</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-50 text-gray-400 font-medium">
              <th className="px-5 py-3 text-left">Fecha / Hora</th>
              <th className="px-5 py-3 text-left">Usuario</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Rol</th>
              <th className="px-5 py-3 text-left">Acción</th>
              <th className="px-5 py-3 text-left hidden lg:table-cell">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_ACTIVIDAD.map(a => (
              <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">{a.fechaHora}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{a.usuario}</td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ROL_CONFIG[a.rol].className}`}>{a.rol}</span>
                </td>
                <td className="px-5 py-3 text-gray-700 font-medium">{a.accion}</td>
                <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">{a.detalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
