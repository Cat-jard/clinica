'use client';

import { useState } from 'react';
import { FlaskConical, ClipboardList, CheckCircle } from 'lucide-react';
import type { OrdenLab, EstadoOrden } from '@/lib/laboratorio';

const ESTADO_CONFIG: Record<EstadoOrden, { label: string; className: string }> = {
  'Pendiente':            { label: 'Pendiente',           className: 'bg-gray-100 text-gray-600'    },
  'Muestra Registrada':   { label: 'Muestra Registrada',  className: 'bg-blue-100 text-blue-700'    },
  'En Proceso':           { label: 'En Proceso',          className: 'bg-amber-100 text-amber-700'  },
  'Resultados Pendientes':{ label: 'Por Validar',         className: 'bg-purple-100 text-purple-700'},
  'Validado':             { label: 'Validado',            className: 'bg-green-100 text-green-700'  },
  'Rechazado':            { label: 'Rechazado',           className: 'bg-red-100 text-red-700'      },
};

const FILTROS: { label: string; estados: EstadoOrden[] | 'all' }[] = [
  { label: 'Todas',         estados: 'all'                                                    },
  { label: 'Pendientes',    estados: ['Pendiente']                                            },
  { label: 'En Proceso',    estados: ['Muestra Registrada', 'En Proceso']                    },
  { label: 'Por Validar',   estados: ['Resultados Pendientes']                               },
  { label: 'Validados',     estados: ['Validado']                                             },
];

interface OrdenesPendientesTableProps {
  ordenes: OrdenLab[];
  onRegistrarMuestra: (orden: OrdenLab) => void;
  onIngresarResultados: (orden: OrdenLab) => void;
}

export default function OrdenesPendientesTable({
  ordenes, onRegistrarMuestra, onIngresarResultados,
}: OrdenesPendientesTableProps) {
  const [filtro, setFiltro] = useState<string>('Todas');

  const filtered = ordenes.filter(o => {
    const f = FILTROS.find(f => f.label === filtro);
    if (!f || f.estados === 'all') return true;
    return (f.estados as EstadoOrden[]).includes(o.estado);
  });

  const urgentes = filtered.filter(o => o.prioridad === 'Urgente').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Cola de Órdenes</p>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} orden(es) · {urgentes} urgente(s)</p>
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
              <th className="px-5 py-3 text-left hidden lg:table-cell">Exámenes</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Fecha Solicitud</th>
              <th className="px-5 py-3 text-left">Prioridad</th>
              <th className="px-5 py-3 text-left">Estado</th>
              <th className="px-5 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(o => {
              const estadoCfg = ESTADO_CONFIG[o.estado];
              return (
                <tr key={o.id} className={`hover:bg-gray-50/50 transition-colors ${o.prioridad === 'Urgente' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3">
                    <p className="font-mono font-semibold text-blue-700">{o.nroOrden}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{o.paciente.nombre} {o.paciente.apellidos}</p>
                    <p className="text-gray-400 font-mono">{o.paciente.dni}</p>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <p className="text-gray-700">{o.medicoSolicitante}</p>
                    <p className="text-gray-400">{o.especialidadMedico}</p>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {o.examenes.slice(0, 3).map(e => (
                        <span key={e.id} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]">{e.nombre}</span>
                      ))}
                      {o.examenes.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">+{o.examenes.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-gray-500 font-mono text-[11px]">{o.fechaSolicitud}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      o.prioridad === 'Urgente' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {o.prioridad}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${estadoCfg.className}`}>
                      {estadoCfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      {o.estado === 'Pendiente' && (
                        <button
                          onClick={() => onRegistrarMuestra(o)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          <FlaskConical size={11} /> Registrar Muestra
                        </button>
                      )}
                      {(o.estado === 'Muestra Registrada' || o.estado === 'En Proceso') && (
                        <button
                          onClick={() => onIngresarResultados(o)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors whitespace-nowrap"
                        >
                          <ClipboardList size={11} /> Ingresar Resultados
                        </button>
                      )}
                      {o.estado === 'Resultados Pendientes' && (
                        <button
                          onClick={() => onIngresarResultados(o)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                        >
                          <CheckCircle size={11} /> Validar y Firmar
                        </button>
                      )}
                      {o.estado === 'Validado' && (
                        <span className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-green-700">
                          <CheckCircle size={11} /> Completado
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-gray-400">
                  No hay órdenes con el filtro seleccionado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
