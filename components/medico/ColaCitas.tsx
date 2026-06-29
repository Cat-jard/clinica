'use client';

import { useRouter } from 'next/navigation';
import type { CitaDia } from '@/lib/medico';

const ESTADO_STYLE: Record<CitaDia['estado'], string> = {
  'Confirmada':  'bg-blue-50 text-blue-700',
  'Pendiente':   'bg-yellow-50 text-yellow-700',
  'En Atención': 'bg-orange-50 text-orange-700',
  'Atendida':    'bg-green-50 text-green-700',
};

const PACIENTE_ID: Record<string, string> = {
  'c1': '1', 'c2': '2', 'c3': '3', 'c4': '4',
};

interface ColaCitasProps {
  citas: CitaDia[];
}

export default function ColaCitas({ citas }: ColaCitasProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Citas del Día</h2>
        <span className="text-xs text-gray-400">{citas.length} programadas</span>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-50">
              <th className="pb-2 text-left font-medium">Hora</th>
              <th className="pb-2 text-left font-medium">Paciente</th>
              <th className="pb-2 text-left font-medium hidden md:table-cell">Motivo</th>
              <th className="pb-2 text-left font-medium">Estado</th>
              <th className="pb-2 text-right font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {citas.map(c => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 font-mono text-xs text-gray-600">{c.hora}</td>
                <td className="py-3">
                  <p className="font-medium text-gray-800 text-xs">{c.pacienteNombre}</p>
                  <p className="text-[10px] text-gray-400">{c.pacienteDni}</p>
                </td>
                <td className="py-3 text-xs text-gray-500 hidden md:table-cell max-w-[160px] truncate">{c.motivoResumen}</td>
                <td className="py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ESTADO_STYLE[c.estado]}`}>
                    {c.estado}
                  </span>
                </td>
                <td className="py-3 text-right">
                  {c.estado !== 'Atendida' && (
                    <button
                      onClick={() => router.push(`/medico/atencion/${PACIENTE_ID[c.id] ?? c.id}`)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      Iniciar Atención →
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
