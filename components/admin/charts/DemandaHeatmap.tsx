'use client';

import { HORAS_DEMANDA } from '@/lib/admin';

// Devuelve un color azul cuya intensidad depende del valor (0-100)
function colorFor(v: number): string {
  if (v >= 85) return '#1e3a8a';
  if (v >= 70) return '#2563eb';
  if (v >= 55) return '#3b82f6';
  if (v >= 40) return '#93c5fd';
  if (v >= 25) return '#bfdbfe';
  return '#dbeafe';
}

export default function DemandaHeatmap() {
  const { dias, franjas, matriz } = HORAS_DEMANDA;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Horas de Mayor Demanda</h2>
      <p className="text-xs text-gray-400 mb-4">Para optimizar turnos y recursos</p>

      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-10"></th>
              {franjas.map(f => (
                <th key={f} className="text-[9px] font-medium text-gray-400 px-1 pb-1 text-center min-w-[42px]">{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dias.map((dia, di) => (
              <tr key={dia}>
                <td className="text-[10px] font-medium text-gray-500 pr-2 text-right">{dia}</td>
                {franjas.map((_, fi) => {
                  const v = matriz[di][fi];
                  return (
                    <td key={fi}>
                      <div
                        className="h-7 rounded-md flex items-center justify-center text-[9px] font-semibold transition-transform hover:scale-110 cursor-default"
                        style={{ backgroundColor: colorFor(v), color: v >= 55 ? '#fff' : '#1e40af' }}
                        title={`${dia} ${franjas[fi]}: ${v}% demanda`}
                      >
                        {v}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-1.5 mt-4 text-[10px] text-gray-400">
        <span>Menor</span>
        {['#dbeafe', '#bfdbfe', '#93c5fd', '#3b82f6', '#2563eb', '#1e3a8a'].map(c => (
          <div key={c} className="w-4 h-3 rounded" style={{ backgroundColor: c }} />
        ))}
        <span>Mayor</span>
      </div>
    </div>
  );
}
