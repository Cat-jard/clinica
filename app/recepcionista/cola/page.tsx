'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClipboardCheck, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { obtenerColaTriaje, actualizarEstadoCola, type ColaItem } from '@/lib/recepcion';

type Estado = 'En Espera' | 'En Atención' | 'Completado';

const STATUS_STYLE: Record<Estado, string> = {
  'En Espera':   'bg-yellow-50 text-yellow-600 border-yellow-100',
  'En Atención': 'bg-blue-50 text-blue-600 border-blue-100',
  'Completado':  'bg-green-50 text-green-600 border-green-100',
};

const STATUS_ICON: Record<Estado, React.ReactNode> = {
  'En Espera':   <Clock size={12} />,
  'En Atención': <AlertCircle size={12} />,
  'Completado':  <CheckCircle2 size={12} />,
};

/** Traduce el estado del backend (EN_ESPERA, EN_ATENCION, ATENDIDO…) al rótulo de la UI. */
function displayEstado(e: string): Estado {
  const u = (e || '').toUpperCase();
  if (u.includes('ESPERA')) return 'En Espera';
  if (u.includes('ATENC') || u.includes('TRIAJE') || u.includes('PROCESO')) return 'En Atención';
  return 'Completado';
}

/** Siguiente estado del backend al hacer "avanzar", o null si ya está completado. */
function nextEstado(e: string): string | null {
  const d = displayEstado(e);
  if (d === 'En Espera') return 'EN_ATENCION';
  if (d === 'En Atención') return 'ATENDIDO';
  return null;
}

export default function ColaPage() {
  const [items, setItems] = useState<ColaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { success, error: toastError } = useToast();

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setItems(await obtenerColaTriaje());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar la cola');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const enEspera   = items.filter((p) => displayEstado(p.estado) === 'En Espera');
  const enAtencion = items.filter((p) => displayEstado(p.estado) === 'En Atención');
  const completado = items.filter((p) => displayEstado(p.estado) === 'Completado');

  async function advance(item: ColaItem) {
    const siguiente = nextEstado(item.estado);
    if (!siguiente) return;
    try {
      await actualizarEstadoCola(item.id, siguiente);
      success(`${item.pacienteNombre} pasó a "${displayEstado(siguiente)}".`);
      await cargar();
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'No se pudo actualizar el estado.');
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cola de Espera</h1>
        <p className="text-sm text-gray-400">Gestión en tiempo real de la sala de espera</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'En Espera',   count: enEspera.length,   color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
          { label: 'En Atención', count: enAtencion.length, color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100'     },
          { label: 'Completados', count: completado.length, color: 'text-green-600',  bg: 'bg-green-50 border-green-100'   },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl px-5 py-4 border ${s.bg}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-4xl font-bold ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Queue table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Pacientes en sala</h2>
          <span className="text-xs text-gray-400">{items.length} total</span>
        </div>
        {error && (
          <div className="flex items-center gap-2 px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-600">
            <AlertCircle size={15} /> {error}
            <button onClick={cargar} className="ml-auto text-xs font-medium underline">Reintentar</button>
          </div>
        )}
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50">
            <tr>
              {['#', 'Ticket', 'Paciente', 'DNI', 'Llegó', 'Médico', 'Especialidad', 'Estado', 'Acción'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((p, i) => {
              const estado = displayEstado(p.estado);
              return (
                <tr key={p.id} className={`transition-colors ${estado === 'Completado' ? 'opacity-50' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-5 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{p.ticket}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{p.pacienteNombre}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">{p.pacienteDni}</td>
                  <td className="px-5 py-3 text-gray-500">{p.horaLlegada}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{p.medicoNombre ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{p.especialidad ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-full border text-xs font-semibold ${STATUS_STYLE[estado]}`}>
                      {STATUS_ICON[estado]} {estado}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {estado !== 'Completado' && (
                      <button
                        onClick={() => advance(p)}
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        <ClipboardCheck size={11} />
                        {estado === 'En Espera' ? 'Llamar' : 'Completar'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {cargando && (
          <div className="py-12 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" /> Cargando cola…
          </div>
        )}
        {!cargando && !error && items.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No hay pacientes en la cola de hoy.</div>
        )}
      </div>
    </div>
  );
}
