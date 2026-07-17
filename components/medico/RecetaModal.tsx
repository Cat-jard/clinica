'use client';

import { useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import FirmaDigitalModal from './FirmaDigitalModal';
import type { ItemReceta } from '@/lib/medico';
import { MEDICAMENTOS_CATALOG } from '@/lib/medico';

const VIAS: ItemReceta['via'][] = ['Oral', 'IV', 'IM', 'SC', 'Tópica', 'Inhalatoria'];
const FRECUENCIAS = ['Cada 6 horas', 'Cada 8 horas', 'Cada 12 horas', 'Una vez al día', 'Dos veces al día', 'Tres veces al día', 'Según necesidad'];
const DURACIONES = ['3 días', '5 días', '7 días', '10 días', '14 días', '1 mes', '3 meses', 'Indefinido'];

interface RecetaModalProps {
  onClose: () => void;
  onSave: (items: ItemReceta[], estado: string) => void;
  medicacionActual: string;
  pacienteNombre: string;
}

const emptyItem = (): ItemReceta => ({
  id: Date.now().toString(),
  medicamento: '', concentracion: '', presentacion: '',
  dosis: '', via: 'Oral', frecuencia: '', duracion: '', cantidad: 1, indicacionesEspeciales: '',
});

export default function RecetaModal({ onClose, onSave, medicacionActual, pacienteNombre }: RecetaModalProps) {
  const [items, setItems]       = useState<ItemReceta[]>([emptyItem()]);
  const [showFirma, setShowFirma] = useState(false);
  const [firmada, setFirmada]   = useState(false);
  const [toast, setToast]       = useState('');

  function updateItem(id: string, key: keyof ItemReceta, val: string | number) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [key]: val } : it));

    // Alerta de interacción medicamentosa
    if (key === 'medicamento' && typeof val === 'string' && val.length > 2) {
      const medActivos = medicacionActual.toLowerCase();
      if (medActivos && medActivos.includes(val.toLowerCase().slice(0, 5))) {
        setToast(`⚠ Posible interacción: ${val} puede interactuar con la medicación actual del paciente.`);
        setTimeout(() => setToast(''), 5000);
      }
    }
  }

  function selectMedicamento(id: string, med: typeof MEDICAMENTOS_CATALOG[0]) {
    setItems(prev => prev.map(it => it.id === id
      ? { ...it, medicamento: med.nombre, concentracion: med.concentracion, presentacion: med.presentacion }
      : it
    ));
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(it => it.id !== id));
  }

  const canFirmar = items.length > 0 && items.every(it => it.medicamento && it.dosis && it.frecuencia && it.duracion);

  return (
    <>
      <ModalBase title="Receta Electrónica" onClose={onClose} width="max-w-3xl">
        <div className="p-6 space-y-5">

          {toast && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2.5 rounded-xl text-xs font-medium">
              <AlertTriangle size={14} /> {toast}
            </div>
          )}

          {/* Cabecera */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <div>
              <p className="text-xs text-gray-500">Paciente</p>
              <p className="text-sm font-semibold text-gray-800">{pacienteNombre}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-500">Médico</p>
              <p className="text-sm font-semibold text-gray-800">Dr. Luis Torres</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {items.map((it, idx) => (
              <div key={it.id} className="border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600">Medicamento #{idx + 1}</p>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(it.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Buscador medicamento */}
                <div>
                  <label className="text-[11px] font-medium text-gray-500 block mb-1">Medicamento *</label>
                  <select
                    value={it.medicamento}
                    onChange={e => {
                      const med = MEDICAMENTOS_CATALOG.find(m => m.nombre === e.target.value);
                      if (med) selectMedicamento(it.id, med);
                      else updateItem(it.id, 'medicamento', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar medicamento…</option>
                    {MEDICAMENTOS_CATALOG.map(m => (
                      <option key={m.nombre} value={m.nombre}>{m.nombre} — {m.concentracion} ({m.presentacion})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 block mb-1">Dosis *</label>
                    <input value={it.dosis} onChange={e => updateItem(it.id, 'dosis', e.target.value)}
                      placeholder="1 tableta" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 block mb-1">Vía *</label>
                    <select value={it.via} onChange={e => updateItem(it.id, 'via', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {VIAS.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 block mb-1">Frecuencia *</label>
                    <select value={it.frecuencia} onChange={e => updateItem(it.id, 'frecuencia', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Seleccionar…</option>
                      {FRECUENCIAS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 block mb-1">Duración *</label>
                    <select value={it.duracion} onChange={e => updateItem(it.id, 'duracion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Seleccionar…</option>
                      {DURACIONES.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 block mb-1">Cantidad (unidades)</label>
                    <input type="number" min={1} value={it.cantidad} onChange={e => updateItem(it.id, 'cantidad', +e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 block mb-1">Indicaciones especiales</label>
                    <input value={it.indicacionesEspeciales} onChange={e => updateItem(it.id, 'indicacionesEspeciales', e.target.value)}
                      placeholder="Tomar con alimentos…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add */}
          <button onClick={() => setItems(p => [...p, emptyItem()])}
            className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors">
            <Plus size={14} /> Añadir otro medicamento
          </button>

          {/* Botones */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button onClick={() => { onSave(items, 'BORRADOR'); onClose(); }} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Guardar Borrador
            </button>
            <button
              onClick={() => canFirmar && setShowFirma(true)}
              disabled={!canFirmar || firmada}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {firmada ? 'Receta Firmada ✓' : 'Firmar Receta'}
            </button>
          </div>
        </div>
      </ModalBase>

      {showFirma && (
        <FirmaDigitalModal
          titulo="Firmar Receta Electrónica"
          descripcion={`Se firmará la receta con ${items.length} medicamento(s) para ${pacienteNombre}.`}
          onConfirm={() => { setFirmada(true); onSave(items, 'FIRMADA'); setShowFirma(false); }}
          onClose={() => setShowFirma(false)}
        />
      )}
    </>
  );
}
