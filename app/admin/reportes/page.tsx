'use client';

import { useState } from 'react';
import { BarChart3, FileText, FileSpreadsheet, CalendarClock, Play } from 'lucide-react';
import { ESPECIALIDADES, MOCK_USUARIOS } from '@/lib/admin';

const TIPOS_REPORTE = [
  { id: 'produccion',  label: 'Producción',       desc: 'Atenciones por día/mes, especialidad, médico' },
  { id: 'financiero',  label: 'Financiero',       desc: 'Ingresos, desglose por aseguradora, por cobrar' },
  { id: 'ocupacion',   label: 'Ocupación',        desc: '% ocupación de camas, estancia, rotación' },
  { id: 'tiempos',     label: 'Tiempos de Espera',desc: 'Admisión → triaje → consulta → alta' },
  { id: 'telemedicina',label: 'Telemedicina',     desc: 'Teleconsultas, especialidades, tiempo promedio' },
  { id: 'farmacia',    label: 'Farmacia',         desc: 'Más dispensados, stock crítico, vencimientos' },
  { id: 'laboratorio', label: 'Laboratorio',      desc: 'Más solicitados, tiempos, resultados críticos' },
];

const TIPO_ATENCION = ['Consulta Externa', 'Emergencia', 'Hospitalización', 'Telemedicina'];
const ASEGURADORAS  = ['SIS', 'EsSalud', 'EPS', 'Particular'];

export default function ReportesPage() {
  const [tab, setTab]       = useState('produccion');
  const [generado, setGenerado] = useState(false);
  const [toast, setToast]   = useState('');

  const medicos = MOCK_USUARIOS.filter(u => u.rol === 'Médico');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>
      )}

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <BarChart3 size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-xs text-gray-500">Análisis avanzado · Ley 27806 (Transparencia)</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-600 mb-3">Filtros de Reporte</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-500 mb-1">Desde</label>
            <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-500 mb-1">Hasta</label>
            <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-500 mb-1">Especialidad</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todas</option>
              {ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 mb-1">Médico</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todos</option>
              {medicos.map(m => <option key={m.id}>{m.nombre} {m.apellidos}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 mb-1">Aseguradora</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todas</option>
              {ASEGURADORAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 mb-1">Tipo de Atención</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todas</option>
              {TIPO_ATENCION.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Pestañas de tipo de reporte */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TIPOS_REPORTE.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setGenerado(false); }}
              className={`px-4 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                tab === t.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {(() => {
            const rep = TIPOS_REPORTE.find(t => t.id === tab)!;
            return (
              <>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Reporte de {rep.label}</h2>
                    <p className="text-xs text-gray-400">{rep.desc}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setGenerado(true); showToast('✓ Reporte generado'); }}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Play size={13} /> Generar Reporte
                    </button>
                    <button onClick={() => showToast('✓ Exportado a PDF')}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <FileText size={13} /> PDF
                    </button>
                    <button onClick={() => showToast('✓ Exportado a Excel')}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <FileSpreadsheet size={13} /> Excel
                    </button>
                    <button onClick={() => showToast('✓ Reporte programado')}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <CalendarClock size={13} /> Programar
                    </button>
                  </div>
                </div>

                {generado ? (
                  <div className="border border-gray-100 rounded-xl p-8 text-center bg-gray-50">
                    <BarChart3 size={32} className="text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Reporte de {rep.label} generado</p>
                    <p className="text-xs text-gray-400 mt-1">Resultados mostrados según los filtros seleccionados. Use los botones de exportación para descargar.</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                    <p className="text-sm text-gray-400">Configure los filtros y presione <b>"Generar Reporte"</b></p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
