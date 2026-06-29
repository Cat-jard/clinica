'use client';

import { useState } from 'react';
import { Ticket as TicketIcon, Plus, Eye, UserPlus, CheckCircle, XCircle, Search } from 'lucide-react';
import TicketModal from '@/components/soporte/TicketModal';
import type { Ticket, EstadoTicket } from '@/lib/soporte';
import { MOCK_TICKETS, PRIORIDAD_TICKET_CONFIG, ESTADO_TICKET_CONFIG } from '@/lib/soporte';

const ESTADOS: (EstadoTicket | 'Todos')[] = ['Todos', 'Abierto', 'En Progreso', 'Resuelto', 'Cerrado'];

export default function IncidenciasPage() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [modalTicket, setModalTicket] = useState<Ticket | null | undefined>(undefined); // undefined=cerrado, null=nuevo
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');
  const [busca, setBusca]   = useState('');
  const [toast, setToast]   = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function handleGuardar(t: Ticket) {
    setTickets(prev => {
      const existe = prev.some(x => x.id === t.id);
      return existe ? prev.map(x => x.id === t.id ? t : x) : [t, ...prev];
    });
    setModalTicket(undefined);
    showToast('✓ Ticket guardado correctamente');
  }

  function cambiarEstado(id: string, estado: EstadoTicket) {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, estado } : t));
    showToast(`✓ Ticket marcado como ${estado}`);
  }

  function asignar(id: string) {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, asignadoA: 'Carlos Yupanqui', estado: t.estado === 'Abierto' ? 'En Progreso' : t.estado } : t));
    showToast('✓ Ticket asignado a Carlos Yupanqui');
  }

  const filtered = tickets.filter(t => {
    const matchEstado = filtroEstado === 'Todos' || t.estado === filtroEstado;
    const q = busca.toLowerCase();
    const matchBusca = !q || `${t.nroTicket} ${t.titulo} ${t.reportadoPor}`.toLowerCase().includes(q);
    return matchEstado && matchBusca;
  });

  const activos = tickets.filter(t => t.estado === 'Abierto' || t.estado === 'En Progreso').length;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <TicketIcon size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Gestión de Incidencias</h1>
            <p className="text-xs text-gray-500">{activos} activas · {tickets.length} totales</p>
          </div>
        </div>
        <button onClick={() => setModalTicket(null)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Nuevo Ticket
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nº, título o usuario…"
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {ESTADOS.map(e => (
            <button key={e} onClick={() => setFiltroEstado(e)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filtroEstado === e ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 font-medium">
                <th className="px-5 py-3 text-left">Nº Ticket</th>
                <th className="px-5 py-3 text-left">Título</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Reportado por</th>
                <th className="px-5 py-3 text-left">Prioridad</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Asignado</th>
                <th className="px-5 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => (
                <tr key={t.id} className={`hover:bg-gray-50/50 transition-colors ${t.prioridad === 'Crítica' && t.estado !== 'Cerrado' && t.estado !== 'Resuelto' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3 font-mono font-semibold text-blue-700">{t.nroTicket}</td>
                  <td className="px-5 py-3 font-medium text-gray-800 max-w-[200px] truncate">{t.titulo}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <p className="text-gray-700">{t.reportadoPor}</p>
                    <p className="text-gray-400">{t.rolReporta}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${PRIORIDAD_TICKET_CONFIG[t.prioridad].className}`}>{t.prioridad}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ESTADO_TICKET_CONFIG[t.estado].className}`}>{t.estado}</span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell text-gray-500">{t.asignadoA ?? <span className="text-gray-300 italic">Sin asignar</span>}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setModalTicket(t)} title="Ver detalle"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Eye size={13} />
                      </button>
                      {!t.asignadoA && (
                        <button onClick={() => asignar(t.id)} title="Asignar"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors">
                          <UserPlus size={13} />
                        </button>
                      )}
                      {(t.estado === 'Abierto' || t.estado === 'En Progreso') && (
                        <button onClick={() => cambiarEstado(t.id, 'Resuelto')} title="Resolver"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-green-600 border border-green-200 hover:bg-green-50 transition-colors">
                          <CheckCircle size={13} />
                        </button>
                      )}
                      {t.estado === 'Resuelto' && (
                        <button onClick={() => cambiarEstado(t.id, 'Cerrado')} title="Cerrar"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">
                          <XCircle size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No se encontraron tickets</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalTicket !== undefined && (
        <TicketModal ticket={modalTicket} onClose={() => setModalTicket(undefined)} onGuardar={handleGuardar} />
      )}
    </div>
  );
}
