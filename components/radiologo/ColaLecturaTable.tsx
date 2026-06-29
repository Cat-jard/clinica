'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, FileText } from 'lucide-react';
import type { EstudioImagen, EstadoEstudio } from '@/lib/radiologia';
import { ESTADO_CONFIG, PRIORIDAD_ORDER, minutosEspera } from '@/lib/radiologia';

const FILTROS: { label: string; estados: EstadoEstudio[] | 'all' }[] = [
  { label: 'Todos',       estados: 'all'                          },
  { label: 'Pendientes',  estados: ['Pendiente']                  },
  { label: 'En Proceso',  estados: ['En Proceso']                 },
  { label: 'Por Firmar',  estados: ['Borrador']                   },
  { label: 'Firmados',    estados: ['Firmado', 'Revisado']        },
];

interface ColaLecturaTableProps {
  estudios: EstudioImagen[];
}

export default function ColaLecturaTable({ estudios }: ColaLecturaTableProps) {
  const [filtro, setFiltro] = useState('Todos');

  const filtered = estudios
    .filter(e => {
      const f = FILTROS.find(f => f.label === filtro);
      if (!f || f.estados === 'all') return true;
      return (f.estados as EstadoEstudio[]).includes(e.estado);
    })
    // Regla de negocio: ordenar por prioridad y luego por antigüedad (más antiguos primero)
    .sort((a, b) => {
      const p = PRIORIDAD_ORDER[a.prioridad] - PRIORIDAD_ORDER[b.prioridad];
      if (p !== 0) return p;
      return minutosEspera(b.fechaSolicitud) - minutosEspera(a.fechaSolicitud);
    });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Cola de Lectura</p>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} estudio(s)</p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {FILTROS.map(f => (
            <button
              key={f.label}
              onClick={() => setFiltro(f.label)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filtro === f.label ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-50 text-gray-400 font-medium">
              <th className="px-5 py-3 text-left">Nº Orden</th>
              <th className="px-5 py-3 text-left">Paciente</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Médico</th>
              <th className="px-5 py-3 text-left">Estudio</th>
              <th className="px-5 py-3 text-left hidden lg:table-cell">Fecha Solicitud</th>
              <th className="px-5 py-3 text-left">Prioridad</th>
              <th className="px-5 py-3 text-left">Estado</th>
              <th className="px-5 py-3 text-left">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(e => {
              const cfg = ESTADO_CONFIG[e.estado];
              const firmado = e.estado === 'Firmado' || e.estado === 'Revisado';
              return (
                <tr key={e.id} className={`hover:bg-gray-50/50 transition-colors ${e.prioridad === 'Urgente' && !firmado ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3 font-mono font-semibold text-blue-700">{e.nroOrden}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{e.paciente.nombre} {e.paciente.apellidos}</p>
                    <p className="text-gray-400 font-mono">{e.paciente.dni}</p>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <p className="text-gray-700">{e.medicoSolicitante}</p>
                    <p className="text-gray-400">{e.especialidadMedico}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-700">{e.tipoEstudio}</p>
                    <p className="text-gray-400">{e.modalidad}</p>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell text-gray-500 font-mono text-[11px]">{e.fechaSolicitud}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      e.prioridad === 'Urgente' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {e.prioridad}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`}>{cfg.label}</span>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/radiologo/lectura/${e.id}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                        firmado
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {firmado ? <><FileText size={11} /> Ver Informe</> : <><Eye size={11} /> Iniciar Lectura</>}
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-gray-400">
                  No hay estudios con el filtro seleccionado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
