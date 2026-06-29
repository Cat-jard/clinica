'use client';

import { useState } from 'react';
import { BedDouble } from 'lucide-react';
import CamaDetalleModal from '@/components/admin/CamaDetalleModal';
import type { Cama } from '@/lib/admin';
import { MOCK_CAMAS, SERVICIOS, ESTADO_CAMA_CONFIG, ocupacionPorServicio } from '@/lib/admin';

export default function CamasPage() {
  const [servicio, setServicio] = useState(SERVICIOS[0]);
  const [camaSel, setCamaSel]   = useState<Cama | null>(null);

  const camasServicio = MOCK_CAMAS.filter(c => c.servicio === servicio);
  const ocupacion = ocupacionPorServicio(MOCK_CAMAS);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <BedDouble size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Gestión de Camas y Ocupación</h1>
          <p className="text-xs text-gray-500">Capacidad hospitalaria en tiempo real</p>
        </div>
      </div>

      {/* Mapa de camas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <select value={servicio} onChange={e => setServicio(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {SERVICIOS.filter(s => MOCK_CAMAS.some(c => c.servicio === s)).map(s => <option key={s}>{s}</option>)}
          </select>
          {/* Leyenda */}
          <div className="flex gap-3 flex-wrap">
            {Object.entries(ESTADO_CAMA_CONFIG).map(([estado, cfg]) => (
              <div key={estado} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {camasServicio.map(cama => {
            const cfg = ESTADO_CAMA_CONFIG[cama.estado];
            return (
              <button
                key={cama.id}
                onClick={() => setCamaSel(cama)}
                className={`aspect-square rounded-xl border-2 ${cfg.card} flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform`}
              >
                <BedDouble size={18} className="text-gray-500" />
                <span className="text-[10px] font-bold text-gray-700">{cama.numero}</span>
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Estadísticas de ocupación */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-sm font-semibold text-gray-800">Estadísticas de Ocupación por Servicio</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 font-medium">
                <th className="px-5 py-3 text-left">Servicio</th>
                <th className="px-5 py-3 text-center">Total</th>
                <th className="px-5 py-3 text-center">Ocupadas</th>
                <th className="px-5 py-3 text-center">Disponibles</th>
                <th className="px-5 py-3 text-left">% Ocupación</th>
                <th className="px-5 py-3 text-center hidden md:table-cell">En Espera</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ocupacion.map(o => {
                const pct = Math.round((o.ocupadas / o.total) * 100);
                const disponibles = o.total - o.ocupadas;
                return (
                  <tr key={o.servicio} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{o.servicio}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{o.total}</td>
                    <td className="px-5 py-3 text-center font-semibold text-red-600">{o.ocupadas}</td>
                    <td className="px-5 py-3 text-center font-semibold text-green-600">{disponibles}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                          <div className={`h-full rounded-full ${pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-gray-600 font-medium w-9">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center hidden md:table-cell">
                      {o.enEspera > 0 ? <span className="text-amber-600 font-semibold">{o.enEspera}</span> : <span className="text-gray-400">0</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {camaSel && <CamaDetalleModal cama={camaSel} onClose={() => setCamaSel(null)} />}
    </div>
  );
}
