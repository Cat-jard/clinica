'use client';

import { useState } from 'react';
import { FlaskConical, Printer, Barcode, CheckCircle } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import type { OrdenLab, TipoMuestra, CondicionMuestra } from '@/lib/laboratorio';
import { TIPOS_MUESTRA, ORIGENES_MUESTRA, TUBOS, CONDICIONES, ANALIZADORES } from '@/lib/laboratorio';

interface RegistroMuestraModalProps {
  orden: OrdenLab;
  onClose: () => void;
  onRegistrar: (ordenId: string, data: { origenMuestra: string; condicion: string; observaciones: string }) => void;
}

export default function RegistroMuestraModal({ orden, onClose, onRegistrar }: RegistroMuestraModalProps) {
  const [tipo,      setTipo]      = useState<TipoMuestra>('Sangre Venosa');
  const [origen,    setOrigen]    = useState('Suero');
  const [tubo,      setTubo]      = useState('Tubo EDTA (morado)');
  const [fechaToma, setFechaToma] = useState('');
  const [condicion, setCondicion] = useState<CondicionMuestra>('En buen estado');
  const [obs,       setObs]       = useState('');
  const [saved,     setSaved]     = useState(false);

  const now = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).replace(',', ' -');
  const canSave = fechaToma.trim().length > 0;

  function handleRegistrar() {
    if (!canSave) return;
    onRegistrar(orden.id, { origenMuestra: origen, condicion, observaciones: obs });
    setSaved(true);
    setTimeout(onClose, 1200);
  }

  return (
    <ModalBase title={`Registrar Muestra — ${orden.nroOrden}`} onClose={onClose} width="max-w-2xl">
      <div className="p-6 space-y-6">

        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm font-semibold">
            <CheckCircle size={16} /> Muestra registrada correctamente
          </div>
        )}

        {/* ── Sección 1: Datos de la Orden (solo lectura) ── */}
        <section>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Datos de la Orden</p>
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400">Nº Orden</p>
              <p className="font-mono font-bold text-blue-700">{orden.nroOrden}</p>
            </div>
            <div>
              <p className="text-gray-400">Prioridad</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${orden.prioridad === 'Urgente' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                {orden.prioridad}
              </span>
            </div>
            <div>
              <p className="text-gray-400">Paciente</p>
              <p className="font-semibold text-gray-800">{orden.paciente.nombre} {orden.paciente.apellidos}</p>
              <p className="text-gray-500 font-mono">{orden.paciente.dni} · {orden.paciente.edad} años · {orden.paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</p>
            </div>
            <div>
              <p className="text-gray-400">Médico Solicitante</p>
              <p className="font-semibold text-gray-800">{orden.medicoSolicitante}</p>
              <p className="text-gray-500">{orden.especialidadMedico}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 mb-1">Exámenes Solicitados</p>
              <div className="flex flex-wrap gap-1">
                {orden.examenes.map(e => (
                  <span key={e.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">{e.nombre}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-400">Fecha de Solicitud</p>
              <p className="font-mono text-gray-700">{orden.fechaSolicitud}</p>
            </div>
          </div>
        </section>

        {/* ── Sección 2: Registro de Muestra ── */}
        <section>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Registro de Muestra <span className="text-red-500 normal-case font-normal">* campos obligatorios</span></p>
          <div className="grid grid-cols-2 gap-4 text-xs">

            <div>
              <label className="block text-gray-600 font-medium mb-1">Tipo de Muestra <span className="text-red-500">*</span></label>
              <select value={tipo} onChange={e => setTipo(e.target.value as TipoMuestra)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TIPOS_MUESTRA.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Origen de la Muestra <span className="text-red-500">*</span></label>
              <select value={origen} onChange={e => setOrigen(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {ORIGENES_MUESTRA.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Tubo / Contenedor <span className="text-red-500">*</span></label>
              <select value={tubo} onChange={e => setTubo(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TUBOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Condición de la Muestra <span className="text-red-500">*</span></label>
              <select value={condicion} onChange={e => setCondicion(e.target.value as CondicionMuestra)}
                className={`w-full border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  condicion !== 'En buen estado' ? 'border-amber-400 bg-amber-50' : 'border-gray-200'
                }`}>
                {CONDICIONES.map(c => <option key={c}>{c}</option>)}
              </select>
              {condicion !== 'En buen estado' && (
                <p className="text-amber-600 text-[10px] mt-1">⚠ Muestra comprometida — documentar en observaciones</p>
              )}
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Fecha de Toma de Muestra <span className="text-red-500">*</span></label>
              <input type="datetime-local" value={fechaToma} onChange={e => setFechaToma(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Fecha de Recepción en Laboratorio</label>
              <input type="text" readOnly value={now}
                className="w-full border border-gray-100 rounded-xl px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-600 font-medium mb-1">Observaciones</label>
              <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
                placeholder="Notas adicionales sobre la muestra (ej. escaso volumen, difícil extracción)…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        </section>

        {/* ── Sección 3: Asignación a Analizadores ── */}
        <section>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Asignación a Analizadores <span className="text-gray-400 normal-case font-normal">(opcional)</span></p>
          <div className="space-y-2">
            {orden.examenes.map(e => (
              <div key={e.id} className="flex items-center gap-3 text-xs">
                <span className="w-36 font-medium text-gray-700 flex-shrink-0">{e.nombre}</span>
                <select defaultValue={e.analizador ?? ''}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="">Sin asignar</option>
                  {ANALIZADORES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* ── Botones ── */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Barcode size={13} /> Escanear Código de Barras
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Printer size={13} /> Imprimir Etiqueta
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleRegistrar}
              disabled={!canSave || saved}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FlaskConical size={13} /> Registrar Muestra
            </button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
