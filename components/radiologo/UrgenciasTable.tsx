'use client';

import Link from 'next/link';
import { AlertTriangle, Clock, Eye } from 'lucide-react';
import type { EstudioImagen } from '@/lib/radiologia';
import { minutosEspera, formatoEspera } from '@/lib/radiologia';

interface UrgenciasTableProps {
  estudios: EstudioImagen[];
}

export default function UrgenciasTable({ estudios }: UrgenciasTableProps) {
  const urgentes = estudios
    .filter(e => e.prioridad === 'Urgente' && e.estado !== 'Firmado' && e.estado !== 'Revisado')
    .sort((a, b) => minutosEspera(b.fechaSolicitud) - minutosEspera(a.fechaSolicitud));

  if (urgentes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
      <div className="px-5 py-3.5 bg-red-50 border-b border-red-100 flex items-center gap-2">
        <AlertTriangle size={16} className="text-red-600" />
        <p className="text-sm font-bold text-red-700">Estudios Urgentes — Lectura Prioritaria</p>
        <span className="ml-auto px-2.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
          {urgentes.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-red-50 text-gray-400 font-medium">
              <th className="px-5 py-3 text-left">Nº Orden</th>
              <th className="px-5 py-3 text-left">Paciente</th>
              <th className="px-5 py-3 text-left">Estudio</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Médico</th>
              <th className="px-5 py-3 text-left">Tiempo de Espera</th>
              <th className="px-5 py-3 text-left">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-50">
            {urgentes.map(e => {
              const espera = minutosEspera(e.fechaSolicitud);
              const critico = espera > 120;
              return (
                <tr key={e.id} className="bg-red-50/40 hover:bg-red-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-semibold text-blue-700">{e.nroOrden}</td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{e.paciente.nombre} {e.paciente.apellidos}</p>
                    <p className="text-gray-400 font-mono">{e.paciente.dni}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-700">{e.tipoEstudio}</p>
                    <p className="text-gray-400">{e.modalidad}</p>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-gray-600">{e.medicoSolicitante}</td>
                  <td className="px-5 py-3">
                    <span className={`flex items-center gap-1 font-bold ${critico ? 'text-red-600' : 'text-amber-600'}`}>
                      <Clock size={12} /> {formatoEspera(espera)}
                      {critico && <AlertTriangle size={12} className="ml-0.5" />}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/radiologo/lectura/${e.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                    >
                      <Eye size={11} /> Iniciar Lectura
                    </Link>
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
