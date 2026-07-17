'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { PacienteMedicoEspera } from '@/lib/medico';
import { PRIORIDAD_CONFIG, elapsedHHMM, isOverTime } from '@/lib/vitals';

interface ColaEsperaProps {
  pacientes: PacienteMedicoEspera[];
}

export default function ColaEspera({ pacientes }: ColaEsperaProps) {
  const router = useRouter();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Cola de Espera — Triaje</h2>
        <span className="text-xs text-gray-400">{pacientes.length} pacientes</span>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-50">
              <th className="pb-2 text-left font-medium">Ticket</th>
              <th className="pb-2 text-left font-medium">Paciente</th>
              <th className="pb-2 text-left font-medium">Prioridad</th>
              <th className="pb-2 text-left font-medium">Espera</th>
              <th className="pb-2 text-right font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pacientes.map(p => {
              const cfg  = PRIORIDAD_CONFIG[p.prioridad];
              const over = isOverTime(p.prioridad, p.tiempoEspera);
              return (
                <tr key={`${p.id}-${p.ticket}`} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 font-mono text-xs font-bold text-gray-500">{p.ticket}</td>
                  <td className="py-3">
                    <p className="font-medium text-gray-800 text-xs">{p.nombre}</p>
                    <p className="text-[10px] text-gray-400">{p.dni} · {p.edad} años</p>
                  </td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-mono font-semibold flex items-center gap-1 ${over ? 'text-red-600' : 'text-gray-600'}`}>
                      {over && <span className="animate-pulse">⚠</span>}
                      {elapsedHHMM(p.tiempoEspera)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => router.push(`/medico/atencion/${p.id}`)}
                      className="text-[11px] font-semibold bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Atender
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
