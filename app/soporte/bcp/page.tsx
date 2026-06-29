'use client';

import { useState } from 'react';
import { ShieldAlert, FileText, Phone, CheckCircle2, FileDown, ClipboardCheck } from 'lucide-react';
import { BCP_CHECKLIST, BCP_CONTACTOS } from '@/lib/soporte';

export default function BcpPage() {
  const [checked, setChecked] = useState<boolean[]>(BCP_CHECKLIST.map(() => false));
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function toggle(i: number) {
    setChecked(prev => prev.map((c, idx) => idx === i ? !c : c));
  }

  const completados = checked.filter(Boolean).length;
  const progreso = Math.round((completados / BCP_CHECKLIST.length) * 100);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <ShieldAlert size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Plan de Continuidad del Negocio (BCP)</h1>
            <p className="text-xs text-gray-500">Recuperación ante desastres (DRP)</p>
          </div>
        </div>
        <button onClick={() => showToast('✓ BCP exportado a PDF')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <FileDown size={14} /> Exportar BCP
        </button>
      </div>

      {/* Estado del BCP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Estado del BCP</p>
          <p className="text-base font-bold text-green-600 mt-1">Actualizado</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Última Prueba</p>
          <p className="text-base font-bold text-gray-800 mt-1 tabular-nums">15/05/2026</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Resultado</p>
          <p className="text-base font-bold text-green-600 mt-1">Exitosa</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">RTO Objetivo</p>
          <p className="text-base font-bold text-gray-800 mt-1 tabular-nums">4 horas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Documentación */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">Procedimientos de Recuperación</h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            Documento maestro con los pasos a seguir ante una caída del sistema: aislamiento del incidente,
            restauración de base de datos, validación de integridad y reactivación de servicios clínicos.
          </p>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
            <FileText size={16} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-700">BCP_SIHCE_v3.pdf</p>
              <p className="text-[10px] text-gray-400">Actualizado 15/05/2026 · 2.4 MB</p>
            </div>
            <button onClick={() => showToast('✓ Editando documento BCP')}
              className="text-[11px] font-semibold text-blue-600">Editar</button>
          </div>
        </div>

        {/* Contactos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Phone size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">Contactos de Emergencia</h2>
          </div>
          <div className="space-y-2">
            {BCP_CONTACTOS.map(c => (
              <div key={c.nombre} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Phone size={13} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{c.nombre}</p>
                  <p className="text-[10px] text-gray-400">{c.cargo}</p>
                </div>
                <span className="text-xs font-mono text-gray-600 tabular-nums">{c.telefono}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulación / Checklist */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">Simulación de Recuperación</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progreso}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-600 tabular-nums">{completados}/{BCP_CHECKLIST.length}</span>
          </div>
        </div>

        <div className="space-y-2">
          {BCP_CHECKLIST.map((paso, i) => (
            <label key={i} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${checked[i] ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} className="accent-green-600 w-4 h-4" />
              <span className={`text-xs ${checked[i] ? 'text-green-700 line-through' : 'text-gray-700'}`}>{paso}</span>
              {checked[i] && <CheckCircle2 size={14} className="text-green-600 ml-auto" />}
            </label>
          ))}
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
          <button onClick={() => showToast('✓ Simulación registrada en la bitácora')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <CheckCircle2 size={13} /> Registrar Simulación
          </button>
        </div>
      </div>
    </div>
  );
}
