'use client';

import { useState } from 'react';
import { X, CalendarPlus } from 'lucide-react';
import { ESPECIALIDADES_PORTAL, MEDICOS_POR_ESPECIALIDAD, HORARIOS_DISPONIBLES } from '@/lib/paciente-portal';

interface AgendarCitaModalProps {
  onClose: () => void;
  onAgendar: () => void;
}

export default function AgendarCitaModal({ onClose, onAgendar }: AgendarCitaModalProps) {
  const [especialidad, setEspecialidad] = useState('');
  const [medico, setMedico]   = useState('');
  const [fecha, setFecha]     = useState('');
  const [hora, setHora]       = useState('');
  const [motivo, setMotivo]   = useState('');

  const medicos = especialidad ? (MEDICOS_POR_ESPECIALIDAD[especialidad] ?? []) : [];
  const canAgendar = especialidad && medico && fecha && hora;

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-base font-bold text-gray-900">Agendar Nueva Cita</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Especialidad <span className="text-red-500">*</span></label>
            <select value={especialidad} onChange={e => { setEspecialidad(e.target.value); setMedico(''); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Selecciona una especialidad</option>
              {ESPECIALIDADES_PORTAL.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Médico <span className="text-red-500">*</span></label>
            <select value={medico} onChange={e => setMedico(e.target.value)} disabled={!especialidad}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
              <option value="">{especialidad ? 'Selecciona un médico' : 'Primero elige especialidad'}</option>
              {medicos.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha <span className="text-red-500">*</span></label>
            <input type="date" value={fecha} min={hoy} onChange={e => setFecha(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Horarios disponibles (solo bloques verdes) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Hora disponible <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-4 gap-2">
              {HORARIOS_DISPONIBLES.map(h => (
                <button key={h} onClick={() => setHora(h)}
                  className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                    hora === h ? 'bg-blue-600 text-white border-blue-600' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  }`}>
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Motivo de la consulta</label>
            <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
              placeholder="Describe brevemente el motivo…"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <button onClick={onAgendar} disabled={!canAgendar}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base">
            <CalendarPlus size={16} /> Agendar Cita
          </button>
        </div>
      </div>
    </div>
  );
}
