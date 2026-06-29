'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import FirmaDigitalModal from './FirmaDigitalModal';
import type { ItemExamen } from '@/lib/medico';
import { EXAMENES_CATALOG } from '@/lib/medico';

interface ExamenesModalProps {
  onClose: () => void;
  pacienteNombre: string;
}

const emptyItem = (): ItemExamen => ({
  id: Date.now().toString(), tipo: 'Laboratorio', nombre: '',
  origenMuestra: '', ayuno: 'No', urgente: false, indicaciones: '',
});

export default function ExamenesModal({ onClose, pacienteNombre }: ExamenesModalProps) {
  const [items, setItems]         = useState<ItemExamen[]>([emptyItem()]);
  const [showFirma, setShowFirma] = useState(false);
  const [firmada, setFirmada]     = useState(false);

  function updateItem(id: string, key: keyof ItemExamen, val: string | boolean) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [key]: val } : it));
  }

  function selectExamen(id: string, ex: typeof EXAMENES_CATALOG[0]) {
    setItems(prev => prev.map(it => it.id === id
      ? { ...it, tipo: ex.tipo, nombre: ex.nombre, origenMuestra: ex.muestra }
      : it
    ));
  }

  const canFirmar = items.length > 0 && items.every(it => it.nombre);

  return (
    <>
      <ModalBase title="Solicitud de Exámenes" onClose={onClose} width="max-w-2xl">
        <div className="p-6 space-y-5">

          {/* Cabecera */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Paciente: <b className="text-gray-800">{pacienteNombre}</b></p>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {items.map((it, idx) => (
              <div key={it.id} className="border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600">Examen #{idx + 1}</p>
                  {items.length > 1 && (
                    <button onClick={() => setItems(p => p.filter(x => x.id !== it.id))} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 block mb-1">Tipo *</label>
                    <select value={it.tipo} onChange={e => updateItem(it.id, 'tipo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Laboratorio</option>
                      <option>Imágenes</option>
                      <option>Otros</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 block mb-1">Examen *</label>
                    <select value={it.nombre} onChange={e => {
                      const ex = EXAMENES_CATALOG.find(x => x.nombre === e.target.value);
                      if (ex) selectExamen(it.id, ex); else updateItem(it.id, 'nombre', e.target.value);
                    }} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Seleccionar examen…</option>
                      {EXAMENES_CATALOG.filter(x => x.tipo === it.tipo).map(x => (
                        <option key={x.nombre} value={x.nombre}>{x.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {it.tipo === 'Laboratorio' && (
                    <>
                      <div>
                        <label className="text-[11px] font-medium text-gray-500 block mb-1">Origen de muestra</label>
                        <input value={it.origenMuestra ?? ''} onChange={e => updateItem(it.id, 'origenMuestra', e.target.value)}
                          placeholder="Sangre, Orina…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-gray-500 block mb-1">Ayuno</label>
                        <select value={it.ayuno ?? 'No'} onChange={e => updateItem(it.id, 'ayuno', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>No</option><option>8 horas</option><option>12 horas</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={it.urgente} onChange={e => updateItem(it.id, 'urgente', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-red-500" />
                      <span className="text-xs font-semibold text-red-600">Urgente</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-gray-500 block mb-1">Indicaciones especiales</label>
                  <input value={it.indicaciones} onChange={e => updateItem(it.id, 'indicaciones', e.target.value)}
                    placeholder="Con contraste, sin contraste, anexar HCE…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setItems(p => [...p, emptyItem()])}
            className="flex items-center gap-2 text-xs text-purple-600 hover:text-purple-800 font-semibold transition-colors">
            <Plus size={14} /> Añadir otro examen
          </button>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
            <button className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Guardar</button>
            <button onClick={() => canFirmar && setShowFirma(true)} disabled={!canFirmar || firmada}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {firmada ? 'Orden Enviada ✓' : 'Firmar y Enviar'}
            </button>
          </div>
        </div>
      </ModalBase>

      {showFirma && (
        <FirmaDigitalModal
          titulo="Firmar Orden de Exámenes"
          descripcion={`Se firmará la solicitud de ${items.length} examen(es) para ${pacienteNombre}.`}
          onConfirm={() => { setFirmada(true); setShowFirma(false); }}
          onClose={() => setShowFirma(false)}
        />
      )}
    </>
  );
}
