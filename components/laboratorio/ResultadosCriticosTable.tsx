'use client';

import { AlertTriangle, Phone } from 'lucide-react';
import type { ResultadoCritico } from '@/lib/laboratorio';

interface ResultadosCriticosTableProps {
  criticos: ResultadoCritico[];
  onNotificar: (id: string) => void;
}

export default function ResultadosCriticosTable({ criticos, onNotificar }: ResultadosCriticosTableProps) {
  if (criticos.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-red-50 border-b border-red-100 flex items-center gap-2">
        <AlertTriangle size={16} className="text-red-600" />
        <p className="text-sm font-bold text-red-700">Resultados Críticos — Requieren Atención Inmediata</p>
        <span className="ml-auto px-2.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
          {criticos.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-red-50 text-gray-400 font-medium">
              <th className="px-5 py-3 text-left">Paciente</th>
              <th className="px-5 py-3 text-left">Examen</th>
              <th className="px-5 py-3 text-left">Resultado</th>
              <th className="px-5 py-3 text-left">Valor Referencia</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Fecha Resultado</th>
              <th className="px-5 py-3 text-left">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-50">
            {criticos.map(r => (
              <tr key={r.id} className={`${r.notificado ? 'bg-white' : 'bg-red-50'} transition-colors`}>
                <td className="px-5 py-3">
                  <p className="font-semibold text-gray-800">{r.paciente}</p>
                  <p className="text-gray-400 font-mono">{r.dni}</p>
                </td>
                <td className="px-5 py-3 font-semibold text-gray-700">{r.examen}</td>
                <td className="px-5 py-3">
                  <span className={`font-bold text-sm ${r.notificado ? 'text-gray-700' : 'text-red-700'}`}>
                    {r.resultado}
                  </span>
                  {!r.notificado && <AlertTriangle size={12} className="inline ml-1 text-red-500" />}
                </td>
                <td className="px-5 py-3 text-gray-500">{r.valorRef}</td>
                <td className="px-5 py-3 text-gray-400 font-mono text-[11px] hidden md:table-cell">{r.fechaResultado}</td>
                <td className="px-5 py-3">
                  {r.notificado ? (
                    <span className="text-green-600 font-semibold text-[11px]">✓ Notificado</span>
                  ) : (
                    <button
                      onClick={() => onNotificar(r.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                    >
                      <Phone size={11} /> Notificar Médico
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
