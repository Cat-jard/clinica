'use client';

import { useState } from 'react';
import { PackageCheck, RefreshCw, Download, RotateCcw, Save } from 'lucide-react';
import { MOCK_VERSIONES, ESTADO_VERSION_CONFIG } from '@/lib/soporte';

export default function ActualizacionesPage() {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  const instalada = MOCK_VERSIONES.find(v => v.estado === 'Instalada');

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <PackageCheck size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Actualizaciones y Parches</h1>
            <p className="text-xs text-gray-500">Versión actual: <b className="text-gray-700">{instalada?.version}</b></p>
          </div>
        </div>
        <button onClick={() => showToast('✓ Buscando actualizaciones disponibles…')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <RefreshCw size={14} /> Buscar Actualizaciones
        </button>
      </div>

      {/* Configuración */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-sm font-semibold text-gray-800 mb-4">Configuración de Actualizaciones</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Actualizaciones automáticas de seguridad</p>
              <p className="text-[10px] text-gray-400">Instala parches críticos automáticamente</p>
            </div>
            <button onClick={() => setAutoUpdate(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${autoUpdate ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${autoUpdate ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-gray-100">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Programar Mantenimiento (fuera de hora pico)</label>
              <input type="datetime-local" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-blue-600" />
                Notificar a administradores antes y después
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={() => showToast('✓ Configuración guardada')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <Save size={13} /> Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de versiones */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-sm font-semibold text-gray-800">Versiones del Sistema</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 font-medium">
                <th className="px-5 py-3 text-left">Versión</th>
                <th className="px-5 py-3 text-left">Lanzamiento</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Descripción</th>
                <th className="px-5 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_VERSIONES.map(v => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono font-semibold text-blue-700">{v.version}</td>
                  <td className="px-5 py-3 text-gray-500 tabular-nums">{v.fechaLanzamiento}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ESTADO_VERSION_CONFIG[v.estado].className}`}>{v.estado}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 hidden md:table-cell max-w-[360px]">{v.descripcion}</td>
                  <td className="px-5 py-3">
                    {v.estado === 'Pendiente de Instalación' && (
                      <button onClick={() => showToast('⚠ Instalación programada — causará downtime')}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download size={11} /> Instalar
                      </button>
                    )}
                    {v.estado === 'En Pruebas' && (
                      <button onClick={() => showToast('✓ Promoviendo a producción tras pruebas')}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                        <Download size={11} /> Promover
                      </button>
                    )}
                    {v.estado === 'Instalada' && v.id === 'v1' && (
                      <button onClick={() => showToast('⚠ Revertir a versión anterior')}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <RotateCcw size={11} /> Revertir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
