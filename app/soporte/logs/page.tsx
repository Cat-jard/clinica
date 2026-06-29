'use client';

import { useState, Fragment } from 'react';
import { ScrollText, Search, FileDown, ChevronDown, ChevronUp } from 'lucide-react';
import type { NivelLog } from '@/lib/soporte';
import { MOCK_LOGS, NIVEL_LOG_CONFIG } from '@/lib/soporte';

const SERVICIOS = ['Todos', 'API', 'BD', 'Web', 'PACS', 'Backups'];
const NIVELES: (NivelLog | 'Todos')[] = ['Todos', 'INFO', 'WARNING', 'ERROR', 'DEBUG'];

export default function LogsPage() {
  const [servicio, setServicio] = useState('Todos');
  const [nivel, setNivel]       = useState<string>('Todos');
  const [busca, setBusca]       = useState('');
  const [expandido, setExpandido] = useState<string | null>(null);
  const [toast, setToast]       = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const filtered = MOCK_LOGS.filter(l => {
    const ms = servicio === 'Todos' || l.servicio === servicio;
    const mn = nivel === 'Todos' || l.nivel === nivel;
    const q = busca.toLowerCase();
    const mb = !q || l.mensaje.toLowerCase().includes(q);
    return ms && mn && mb;
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <ScrollText size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Logs del Sistema</h1>
            <p className="text-xs text-gray-500">Capa técnica de auditoría · Ley 30024 (RENHICE)</p>
          </div>
        </div>
        <button onClick={() => showToast('✓ Logs exportados a CSV')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <FileDown size={14} /> Exportar Logs
        </button>
      </div>

      {/* Nota de confidencialidad (regla de oro #2) */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex items-start gap-2">
        <ScrollText size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700">
          <b>Confidencialidad:</b> Los logs pueden contener datos sensibles de pacientes. Tu acceso a este módulo queda registrado en una auditoría separada.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] text-gray-500 mb-1">Buscar en mensajes</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Patrón de texto…"
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">Servicio</label>
          <select value={servicio} onChange={e => setServicio(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {SERVICIOS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">Nivel</label>
          <select value={nivel} onChange={e => setNivel(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {NIVELES.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla de logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">Registro Técnico</p>
          <span className="text-xs text-gray-400">{filtered.length} entradas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 font-medium">
                <th className="px-5 py-3 text-left">Fecha / Hora</th>
                <th className="px-5 py-3 text-left">Servicio</th>
                <th className="px-5 py-3 text-left">Nivel</th>
                <th className="px-5 py-3 text-left">Mensaje</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">IP</th>
                <th className="px-5 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(l => {
                const cfg = NIVEL_LOG_CONFIG[l.nivel];
                const abierto = expandido === l.id;
                return (
                  <Fragment key={l.id}>
                    <tr onClick={() => setExpandido(abierto ? null : l.id)}
                      className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${l.nivel === 'ERROR' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap tabular-nums">{l.fechaHora}</td>
                      <td className="px-5 py-3 text-gray-600">{l.servicio}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {l.nivel}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 max-w-[360px] truncate font-mono text-[11px]">{l.mensaje}</td>
                      <td className="px-5 py-3 font-mono text-gray-400 hidden md:table-cell">{l.ip ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-300">{abierto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
                    </tr>
                    {abierto && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-[11px] leading-relaxed overflow-x-auto">
                            <p className="text-gray-400"># {l.fechaHora} [{l.servicio}] {l.nivel}</p>
                            <p className="mt-1">{l.mensaje}</p>
                            {l.nivel === 'ERROR' && (
                              <p className="mt-2 text-red-300">  at Module.firmar (/srv/api/recetas.js:142:18)<br />  at processTicksAndRejections (node:internal/process/task_queues:95:5)</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No hay logs con esos filtros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
