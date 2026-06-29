'use client';

import { useState } from 'react';
import { ShieldCheck, Plus, CheckCircle } from 'lucide-react';
import FirmaDigitalModal from '@/components/medico/FirmaDigitalModal';
import type { ControlCalidad, EstadoControlCalidad } from '@/lib/laboratorio';
import { MOCK_CONTROLES, ANALIZADORES, TIPOS_CONTROL } from '@/lib/laboratorio';

const ESTADO_CONFIG: Record<EstadoControlCalidad, { label: string; className: string }> = {
  'Aceptado':    { label: 'Aceptado',    className: 'bg-green-100 text-green-700'  },
  'Rechazado':   { label: 'Rechazado',   className: 'bg-red-100 text-red-700'      },
  'En Revisión': { label: 'En Revisión', className: 'bg-amber-100 text-amber-700'  },
};

export default function ControlCalidadPage() {
  const [controles, setControles] = useState<ControlCalidad[]>(MOCK_CONTROLES);
  const [showFirma, setShowFirma] = useState(false);
  const [toast,     setToast]     = useState('');

  // Form state
  const [analizador,  setAnalizador]  = useState(ANALIZADORES[0]);
  const [tipoControl, setTipoControl] = useState(TIPOS_CONTROL[0]);
  const [lote,        setLote]        = useState('');
  const [fecha,       setFecha]       = useState('');
  const [estado,      setEstado]      = useState<EstadoControlCalidad>('Aceptado');
  const [obs,         setObs]         = useState('');

  const canRegistrar = lote.trim() && fecha.trim();

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function handleFirmaConfirm() {
    const now = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).replace(',', ' -');
    const nuevo: ControlCalidad = {
      id: `cc-${Date.now()}`,
      analizador,
      tipoControl,
      lote,
      fechaControl: fecha.replace('T', ' - ').slice(0, 19),
      estado,
      observaciones: obs || undefined,
      firmadoEn: now,
    };
    setControles(prev => [nuevo, ...prev]);
    setLote(''); setFecha(''); setObs(''); setEstado('Aceptado');
    setShowFirma(false);
    showToast('✓ Control de calidad registrado y firmado digitalmente');
  }

  return (
    <div className="space-y-6">

      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <ShieldCheck size={20} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Control de Calidad</h1>
          <p className="text-xs text-gray-500">Registro diario — NTP-ISO 15189 · María Torres</p>
        </div>
      </div>

      {/* Formulario de registro */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Plus size={16} className="text-blue-600" />
          <p className="text-sm font-semibold text-gray-800">Nuevo Registro de Control</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Analizador / Equipo <span className="text-red-500">*</span></label>
            <select value={analizador} onChange={e => setAnalizador(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {ANALIZADORES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Tipo de Control <span className="text-red-500">*</span></label>
            <select value={tipoControl} onChange={e => setTipoControl(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {TIPOS_CONTROL.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Lote del Control <span className="text-red-500">*</span></label>
            <input type="text" value={lote} onChange={e => setLote(e.target.value)}
              placeholder="LOT-2026-XXXX"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Fecha de Control <span className="text-red-500">*</span></label>
            <input type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Estado del Control <span className="text-red-500">*</span></label>
            <select value={estado} onChange={e => setEstado(e.target.value as EstadoControlCalidad)}
              className={`w-full border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                estado === 'Rechazado' ? 'border-red-400' : estado === 'En Revisión' ? 'border-amber-400' : 'border-gray-200'
              }`}>
              {(['Aceptado', 'Rechazado', 'En Revisión'] as EstadoControlCalidad[]).map(e => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-gray-600 font-medium mb-1">Observaciones</label>
            <input type="text" value={obs} onChange={e => setObs(e.target.value)}
              placeholder="Notas sobre el control…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowFirma(true)}
            disabled={!canRegistrar}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle size={15} /> Registrar y Firmar Control
          </button>
        </div>
      </div>

      {/* Historial de controles */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">Historial de Controles de Calidad</p>
          <span className="text-xs text-gray-400">{controles.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 font-medium">
                <th className="px-5 py-3 text-left">Fecha</th>
                <th className="px-5 py-3 text-left">Analizador</th>
                <th className="px-5 py-3 text-left">Tipo</th>
                <th className="px-5 py-3 text-left">Lote</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Firma Digital</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {controles.map(c => {
                const cfg = ESTADO_CONFIG[c.estado];
                return (
                  <tr key={c.id} className={`hover:bg-gray-50/50 transition-colors ${c.estado === 'Rechazado' ? 'bg-red-50/40' : ''}`}>
                    <td className="px-5 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">{c.fechaControl}</td>
                    <td className="px-5 py-3 text-gray-700">{c.analizador}</td>
                    <td className="px-5 py-3 text-gray-700">{c.tipoControl}</td>
                    <td className="px-5 py-3 font-mono text-gray-500">{c.lote}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`}>{cfg.label}</span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      {c.firmadoEn ? (
                        <span className="flex items-center gap-1 text-green-600 text-[11px]">
                          <CheckCircle size={11} /> {c.firmadoEn}
                        </span>
                      ) : (
                        <span className="text-gray-400">Sin firmar</span>
                      )}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-gray-400 max-w-[180px] truncate">{c.observaciones ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota normativa */}
      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-green-700">
          <b>NTP-ISO 15189:</b> Los controles de calidad internos deben realizarse al menos una vez al día antes de procesar muestras de pacientes.
          Cada registro debe ser firmado digitalmente por el tecnólogo responsable.
        </p>
      </div>

      {showFirma && (
        <FirmaDigitalModal
          titulo="Firmar Registro de Control de Calidad"
          descripcion={`Registrando control: ${tipoControl} — ${analizador}. Esta acción queda registrada en la bitácora de auditoría.`}
          onConfirm={handleFirmaConfirm}
          onClose={() => setShowFirma(false)}
        />
      )}
    </div>
  );
}
