'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, CheckCircle2 } from 'lucide-react';
import { PacienteClasificado, PRIORIDAD_CONFIG, elapsedHHMM, isOverTime } from '@/lib/vitals';

interface Props {
  pacientes: PacienteClasificado[];
}

export default function ClasificadosTable({ pacientes }: Props) {
  const router = useRouter();
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-500" />
          <h2 className="text-sm font-semibold text-gray-800">Clasificados — Esperando Médico</h2>
        </div>
        <span className="text-xs text-gray-400">{pacientes.length} pacientes</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50/50">
          <tr>
            {['Ticket', 'Paciente', 'Prioridad', 'Destino', 'Tiempo en Espera', 'Acción'].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {pacientes.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No hay pacientes clasificados aún.</td>
            </tr>
          )}
          {pacientes.map((p) => {
            const cfg  = PRIORIDAD_CONFIG[p.prioridad];
            const over = isOverTime(p.prioridad, p.horaClasificado);
            return (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p.ticket}</span>
                </td>
                <td className="px-5 py-3 font-medium text-gray-800">{p.nombre}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                    {cfg.label}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">{p.destino}</td>
                <td className="px-5 py-3">
                  <span className={`font-mono text-sm font-bold tabular-nums ${over ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                    {elapsedHHMM(p.horaClasificado)}
                  </span>
                  {over && <span className="ml-1 text-[10px] text-red-500 font-semibold">⚠ Excedido</span>}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => router.push(`/triaje/paciente/${p.id}`)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Eye size={12} /> Ver Ficha
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
