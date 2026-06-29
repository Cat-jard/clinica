'use client';

import { useState } from 'react';
import { Shield, Filter, FileSpreadsheet } from 'lucide-react';
import { MOCK_AUDITORIA_ADMIN, ROL_CONFIG, ROLES } from '@/lib/admin';

const ACCIONES = [
  'Todas', 'Apertura de historia', 'Firma de receta', 'Firma de informe',
  'Cierre de atención', 'Validación de resultados', 'Creación de usuario',
  'Modificación de rol', 'Cambio de configuración',
];

export default function AuditoriaAdminPage() {
  const [filtroAccion, setFiltroAccion] = useState('Todas');
  const [filtroRol,    setFiltroRol]    = useState('Todos');
  const [filtroFecha,  setFiltroFecha]  = useState('');
  const [busca,        setBusca]        = useState('');
  const [toast,        setToast]        = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const entries = MOCK_AUDITORIA_ADMIN.filter(e => {
    const matchAccion = filtroAccion === 'Todas' || e.accion === filtroAccion;
    const matchRol    = filtroRol === 'Todos' || e.rol === filtroRol;
    const matchFecha  = !filtroFecha || e.fechaHora.startsWith(filtroFecha.split('-').reverse().join('/'));
    const q = busca.toLowerCase();
    const matchBusca  = !q || `${e.usuario} ${e.paciente ?? ''}`.toLowerCase().includes(q);
    return matchAccion && matchRol && matchFecha && matchBusca;
  });

  const filtrosActivos = filtroAccion !== 'Todas' || filtroRol !== 'Todos' || filtroFecha || busca;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Shield size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Bitácora de Auditoría Global</h1>
            <p className="text-xs text-gray-500">Todos los roles · Ley 30024 (RENHICE)</p>
          </div>
        </div>
        <button
          onClick={() => showToast('✓ Log exportado a Excel')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <FileSpreadsheet size={14} /> Exportar Log
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-gray-400" />
          <p className="text-xs font-semibold text-gray-600">Filtros</p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] text-gray-500 mb-1">Buscar usuario / paciente</label>
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Nombre…"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Acción</label>
            <select value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]">
              {ACCIONES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Rol</label>
            <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todos</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Fecha</label>
            <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {filtrosActivos && (
            <button onClick={() => { setFiltroAccion('Todas'); setFiltroRol('Todos'); setFiltroFecha(''); setBusca(''); }}
              className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 underline">
              Limpiar
            </button>
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
                <th className="px-5 py-3 text-left">Usuario</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Rol</th>
                <th className="px-5 py-3 text-left">Acción</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Paciente</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">IP</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map(e => (
                <tr key={e.id} className={`hover:bg-gray-50/50 transition-colors ${e.rol === 'Admin' ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-5 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">{e.fechaHora}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{e.usuario}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ROL_CONFIG[e.rol].className}`}>{e.rol}</span>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-700">{e.accion}</td>
                  <td className="px-5 py-3 hidden lg:table-cell text-gray-600">{e.paciente ?? <span className="text-gray-400 italic">—</span>}</td>
                  <td className="px-5 py-3 font-mono text-gray-400 hidden md:table-cell">{e.ip}</td>
                  <td className="px-5 py-3 text-gray-500 hidden lg:table-cell max-w-[220px] truncate">{e.detalle}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No se encontraron registros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Shield size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <b>Ley 30024 — RENHICE:</b> La bitácora global es inalterable y se conserva por un mínimo de 20 años.
          Las acciones administrativas (resaltadas) tienen trazabilidad reforzada.
        </p>
      </div>
    </div>
  );
}
