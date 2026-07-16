'use client';

import { useState } from 'react';
import { Paperclip, Save } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import type { Ticket, PrioridadTicket } from '@/lib/soporte';
import { CATEGORIAS_TICKET, PRIORIDAD_TICKET_CONFIG, ESTADO_TICKET_CONFIG, TECNICOS } from '@/lib/soporte';

interface TicketModalProps {
  ticket: Ticket | null;          // null = creación
  onClose: () => void;
  onGuardar: (t: Ticket) => void;
}

export default function TicketModal({ ticket, onClose, onGuardar }: TicketModalProps) {
  const esDetalle = !!ticket;

  const [titulo, setTitulo]       = useState(ticket?.titulo ?? '');
  const [descripcion, setDesc]    = useState(ticket?.descripcion ?? '');
  const [prioridad, setPrioridad] = useState<PrioridadTicket>(ticket?.prioridad ?? 'Media');
  const [modulo, setModulo]       = useState(ticket?.modulo ?? CATEGORIAS_TICKET[0]);
  const [asignado, setAsignado]   = useState(ticket?.asignadoA ?? 'Sin asignar');

  const canGuardar = titulo.trim() && descripcion.trim();

  function handleGuardar() {
    if (!canGuardar) return;
    onGuardar({
      id: ticket?.id ?? `t-${Date.now()}`,
      nroTicket: ticket?.nroTicket ?? `TK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      titulo, descripcion, prioridad, modulo,
      reportadoPor: ticket?.reportadoPor ?? 'Carlos Yupanqui',
      rolReporta: ticket?.rolReporta ?? 'Soporte',
      fechaReporte: ticket?.fechaReporte ?? new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).replace(',', ' -'),
      estado: ticket?.estado ?? 'Abierto',
      asignadoA: asignado === 'Sin asignar' ? undefined : asignado,
    });
  }

  return (
    <ModalBase title={esDetalle ? `${ticket.nroTicket} — Detalle` : 'Nuevo Ticket de Soporte'} onClose={onClose} width="max-w-2xl">
      <div className="p-6 space-y-5">
        {esDetalle && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${PRIORIDAD_TICKET_CONFIG[ticket.prioridad].className}`}>{ticket.prioridad}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ESTADO_TICKET_CONFIG[ticket.estado].className}`}>{ticket.estado}</span>
            <span className="text-xs text-gray-400 ml-auto">Reportado por {ticket.reportadoPor} ({ticket.rolReporta}) · {ticket.fechaReporte}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título <span className="text-red-500">*</span></label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Resumen breve del problema"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción <span className="text-red-500">*</span></label>
          <textarea value={descripcion} onChange={e => setDesc(e.target.value)} rows={4}
            placeholder="Descripción detallada y pasos para reproducir el problema…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Prioridad <span className="text-red-500">*</span></label>
            <select value={prioridad} onChange={e => setPrioridad(e.target.value as PrioridadTicket)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {(['Baja', 'Media', 'Alta', 'Crítica'] as PrioridadTicket[]).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Categoría <span className="text-red-500">*</span></label>
            <select value={modulo} onChange={e => setModulo(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIAS_TICKET.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Asignado a</label>
            <select value={asignado} onChange={e => setAsignado(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {TECNICOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 border-dashed rounded-xl py-2.5 px-3 hover:bg-gray-50 transition-colors w-full justify-center">
          <Paperclip size={13} /> Adjuntar captura de pantalla (opcional)
        </button>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={!canGuardar}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Save size={13} /> {esDetalle ? 'Guardar Cambios' : 'Crear Ticket'}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
