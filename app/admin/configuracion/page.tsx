'use client';

import { useState } from 'react';
import { Settings, Save, RotateCcw, Plus, Pencil, Ban, Building2 } from 'lucide-react';
import { ESPECIALIDADES, SERVICIOS } from '@/lib/admin';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const CATALOGOS = [
  { id: 'especialidades', label: 'Especialidades Médicas',       items: ESPECIALIDADES.slice(0, 6) },
  { id: 'servicios',      label: 'Servicios Hospitalarios',      items: SERVICIOS },
  { id: 'examenes',       label: 'Exámenes de Laboratorio',      items: ['Hemograma', 'Glucosa', 'Perfil Hepático', 'Creatinina', 'TSH'] },
  { id: 'imagenes',       label: 'Tipos de Estudio de Imagen',   items: ['Rx Tórax', 'TAC Abdominal', 'RMN Rodilla', 'Ecografía', 'Mamografía'] },
  { id: 'medicamentos',   label: 'Catálogo de Medicamentos',     items: ['Paracetamol 500mg', 'Amoxicilina 500mg', 'Metformina 850mg', 'Enalapril 10mg'] },
];

export default function ConfiguracionPage() {
  const [diasActivos, setDiasActivos] = useState<string[]>(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']);
  const [catalogo, setCatalogo]       = useState('especialidades');
  const [toast, setToast]             = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function toggleDia(d: string) {
    setDiasActivos(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  const catActual = CATALOGOS.find(c => c.id === catalogo)!;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>
      )}

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Settings size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-xs text-gray-500">Parámetros globales y catálogos maestros</p>
        </div>
      </div>

      {/* Configuración General */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 size={16} className="text-blue-600" />
          <p className="text-sm font-semibold text-gray-800">Configuración General</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Nombre del Hospital / Clínica</label>
            <input defaultValue="Hospital Regional SIHCE" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Teléfono de Contacto</label>
            <input defaultValue="(01) 555-1234" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-600 font-medium mb-1">Dirección</label>
            <input defaultValue="Av. Salud 123, Lima, Perú" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Hora de Apertura</label>
            <input type="time" defaultValue="07:00" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Hora de Cierre</label>
            <input type="time" defaultValue="20:00" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Tiempo Máximo de Espera (meta, min)</label>
            <input type="number" defaultValue={30} className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">URL del Logo</label>
            <input defaultValue="/logo.png" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-600 font-medium mb-2">Días de Atención</label>
            <div className="flex gap-2 flex-wrap">
              {DIAS.map(d => (
                <button key={d} onClick={() => toggleDia(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    diasActivos.includes(d) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
          <button onClick={() => showToast('Configuración restaurada a valores por defecto')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <RotateCcw size={13} /> Restaurar Valores
          </button>
          <button onClick={() => showToast('✓ Configuración guardada')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <Save size={13} /> Guardar Configuración
          </button>
        </div>
      </div>

      {/* Gestión de Catálogos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-semibold text-gray-800">Gestión de Catálogos (Mantenedores)</p>
          <button onClick={() => showToast('Formulario de nuevo ítem')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={12} /> Agregar
          </button>
        </div>

        <div className="flex border-b border-gray-100 overflow-x-auto">
          {CATALOGOS.map(c => (
            <button key={c.id} onClick={() => setCatalogo(c.id)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                catalogo === c.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          <div className="space-y-2">
            {catActual.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-700">{item}</span>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                    <Pencil size={11} /> Editar
                  </button>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                    <Ban size={11} /> Desactivar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
