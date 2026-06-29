'use client';

import { useState } from 'react';
import { Shield, Filter } from 'lucide-react';
import { MOCK_AUDITORIA } from '@/lib/medico';

const ACCIONES = ['Todas', 'Apertura de historia clínica', 'Registro de anamnesis', 'Diagnóstico CIE-10 registrado', 'Diagnóstico CIE-10 modificado', 'Receta firmada digitalmente', 'Orden de exámenes enviada', 'Solicitud de exámenes firmada', 'Interconsulta enviada', 'Atención cerrada y firmada'];

export default function AuditoriaPage() {
  const [filtroAccion, setFiltroAccion] = useState('Todas');
  const [filtroFecha, setFiltroFecha]   = useState('');

  const entries = MOCK_AUDITORIA.filter(e => {
    const matchAccion = filtroAccion === 'Todas' || e.accion === filtroAccion;
    const matchFecha  = !filtroFecha || e.fechaHora.startsWith(filtroFecha.split('-').reverse().join('/'));
    return matchAccion && matchFecha;
  });

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Shield size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Bitácora de Auditoría</h1>
          <p className="text-xs text-gray-500">Dr. Luis Torres · Cumplimiento Ley 30024 (RENHICE)</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-gray-400" />
          <p className="text-xs font-semibold text-gray-600">Filtros</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Tipo de Acción</label>
            <select value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[220px]">
              {ACCIONES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Fecha</label>
            <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
          {(filtroAccion !== 'Todas' || filtroFecha) && (
            <div className="flex items-end">
              <button onClick={() => { setFiltroAccion('Todas'); setFiltroFecha(''); }}
                className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 underline">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">Registro de Actividad</p>
          <span className="text-xs text-gray-400">{entries.length} registro(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 font-medium">
                <th className="px-5 py-3 text-left">Fecha / Hora</th>
                <th className="px-5 py-3 text-left">Acción</th>
                <th className="px-5 py-3 text-left">Paciente</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">IP de Origen</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">{e.fechaHora}</td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-gray-700">{e.accion}</span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{e.pacienteNombre}</p>
                    <p className="text-gray-400 font-mono">{e.pacienteDni}</p>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-400 hidden md:table-cell">{e.ip}</td>
                  <td className="px-5 py-3 text-gray-500 hidden lg:table-cell max-w-[200px] truncate">{e.detalle}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                    No se encontraron registros con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota normativa */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Shield size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <b>Ley 30024 — RENHICE:</b> Este registro de auditoría es inalterable y se conservará por un mínimo de 20 años.
          Cada acceso y modificación a la historia clínica queda registrado con fecha, hora, usuario e IP de origen.
        </p>
      </div>
    </div>
  );
}
