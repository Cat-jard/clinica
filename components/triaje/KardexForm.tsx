'use client';

import { useRef, useState, useEffect } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import { useToast } from '@/context/ToastContext';
import { Medicamento, formatoFechaHoraPeru } from '@/lib/vitals';

interface Props {
  pacienteNombre: string;
  pacienteId: string;
  onClose: () => void;
  onSaved: (firmado: boolean, canvas?: string) => void;
}

export default function KardexForm({ pacienteNombre, onClose, onSaved }: Props) {
  const { success, error } = useToast();
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const drawing     = useRef(false);
  const [hasSign, setHasSign]     = useState(false);
  const [evolucion, setEvolucion] = useState('');
  const [ingresos, setIngresos]   = useState('');
  const [egresos, setEgresos]     = useState('');
  const [meds, setMeds]           = useState<Medicamento[]>([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  }, []);

  function getPos(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath(); ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y); ctx.stroke();
    setHasSign(true);
  }

  function stopDraw() { drawing.current = false; }

  function clearCanvas() {
    canvasRef.current!.getContext('2d')!.clearRect(0, 0, 500, 110);
    setHasSign(false);
  }

  function addMed() { setMeds((p) => [...p, { nombre: '', dosis: '', via: '', hora: '' }]); }
  function removeMed(i: number) { setMeds((p) => p.filter((_, idx) => idx !== i)); }
  function updateMed(i: number, field: keyof Medicamento, val: string) {
    setMeds((p) => p.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  }

  async function handleGuardar(firmar: boolean) {
    if (!evolucion.trim()) { error('La evolución es obligatoria.'); return; }
    if (firmar && !hasSign) { error('Dibuje su firma para validar el registro.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const canvas64 = firmar ? canvasRef.current?.toDataURL() : undefined;
    success(firmar ? 'Kardex guardado y firmado.' : 'Kardex guardado. Pendiente de firma.');
    onSaved(firmar, canvas64);
    setLoading(false);
  }

  return (
    <ModalBase title={`Kardex de Enfermería — ${pacienteNombre}`} onClose={onClose} width="max-w-2xl">
      <div className="p-6 space-y-5">

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha y Hora</label>
          <input type="text" value={formatoFechaHoraPeru(new Date())} disabled
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500" />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Balance Hídrico</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ingresos (ml)</label>
              <input type="number" value={ingresos} onChange={(e) => setIngresos(e.target.value)} placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Egresos (ml)</label>
              <input type="number" value={egresos} onChange={(e) => setEgresos(e.target.value)} placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700">Medicamentos Administrados</p>
            <button onClick={addMed} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
              <Plus size={12} /> Agregar
            </button>
          </div>
          {meds.length === 0 && <p className="text-xs text-gray-400 italic">Sin medicamentos registrados.</p>}
          {meds.map((m, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-center">
              <input value={m.nombre} onChange={(e) => updateMed(i, 'nombre', e.target.value)} placeholder="Medicamento"
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 col-span-1" />
              <input value={m.dosis}  onChange={(e) => updateMed(i, 'dosis',  e.target.value)} placeholder="Dosis"
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input value={m.via}   onChange={(e) => updateMed(i, 'via',   e.target.value)} placeholder="Vía (IV/VO)"
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <div className="flex items-center gap-1">
                <input value={m.hora}  onChange={(e) => updateMed(i, 'hora',  e.target.value)} placeholder="HH:MM"
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button onClick={() => removeMed(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Evolución / Observaciones <span className="text-red-500">*</span>
          </label>
          <textarea value={evolucion} onChange={(e) => setEvolucion(e.target.value)} rows={4}
            placeholder="Estado actual, respuesta al tratamiento, plan de cuidados..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700">Firma Digital</p>
            {hasSign && (
              <button onClick={clearCanvas} className="text-xs text-gray-400 hover:text-gray-600">Limpiar</button>
            )}
          </div>
          <canvas ref={canvasRef} width={500} height={110}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-crosshair"
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
          <p className="text-[11px] text-gray-400 mt-1">Firma obligatoria para validez legal — NTS N°139-MINSA.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button onClick={() => handleGuardar(false)} disabled={loading}
            className="py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40">
            Guardar sin Firmar
          </button>
          <button onClick={() => handleGuardar(true)} disabled={loading || !hasSign}
            className="py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Firmando…</> : 'Firmar Registro'}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
