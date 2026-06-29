'use client';

import { useState } from 'react';
import { DatabaseBackup, Play, RotateCcw, Trash2, AlertTriangle, Save } from 'lucide-react';
import { MOCK_BACKUPS, ESTADO_BACKUP_CONFIG } from '@/lib/soporte';

export default function BackupsPage() {
  const [toast, setToast] = useState('');
  const [autoNotif, setAutoNotif] = useState(true);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  const ultima = MOCK_BACKUPS[1]; // la fallida (más reciente)
  const backupVencido = ultima.estado === 'Fallida';

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <DatabaseBackup size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Copias de Seguridad</h1>
            <p className="text-xs text-gray-500">Directiva N°230-MINSA/2017/OGTI · Conservación mínima 20 años</p>
          </div>
        </div>
        <button onClick={() => showToast('✓ Backup manual iniciado')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <Play size={14} /> Ejecutar Backup Ahora
        </button>
      </div>

      {/* Alerta de backup fallido > 24h (regla de oro #3) */}
      {backupVencido && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            <b>Alerta crítica:</b> La última copia de seguridad ({ultima.fechaHora}) <b>falló</b>. No existe un respaldo válido en más de 24 horas.
            Ejecute una copia manual de inmediato para garantizar la continuidad del servicio.
          </p>
        </div>
      )}

      {/* Configuración */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-sm font-semibold text-gray-800 mb-4">Configuración de Copias Automáticas</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Frecuencia</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Diaria</option><option>Semanal</option><option>Mensual</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Hora de Ejecución</label>
            <input type="time" defaultValue="02:00" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Retención (días)</label>
            <input type="number" defaultValue={30} className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Ubicación</label>
            <input defaultValue="s3://sihce-backups/" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={autoNotif} onChange={e => setAutoNotif(e.target.checked)} className="accent-blue-600" />
            Notificar por correo sobre el estado de las copias
          </label>
          <button onClick={() => showToast('✓ Configuración guardada')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <Save size={13} /> Guardar
          </button>
        </div>
      </div>

      {/* Tabla de copias */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">Historial de Copias</p>
          <span className="text-xs text-gray-400">{MOCK_BACKUPS.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 font-medium">
                <th className="px-5 py-3 text-left">Fecha / Hora</th>
                <th className="px-5 py-3 text-left">Tipo</th>
                <th className="px-5 py-3 text-left">Tamaño</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Ubicación</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_BACKUPS.map(b => {
                const cfg = ESTADO_BACKUP_CONFIG[b.estado];
                return (
                  <tr key={b.id} className={`hover:bg-gray-50/50 transition-colors ${b.estado === 'Fallida' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap tabular-nums">{b.fechaHora}</td>
                    <td className="px-5 py-3 text-gray-700">{b.tipo}</td>
                    <td className="px-5 py-3 text-gray-600 tabular-nums">{b.tamano}</td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{b.ubicacion}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {b.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => showToast('⚠ Restauración: requiere confirmación y causa downtime')} title="Restaurar"
                          disabled={b.estado !== 'Exitosa'}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                          <RotateCcw size={13} />
                        </button>
                        <button onClick={() => showToast('⚠ Eliminación requiere confirmación')} title="Eliminar"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
