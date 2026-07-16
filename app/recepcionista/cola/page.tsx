'use client';

import { useState, useEffect } from 'react';
import { ClipboardCheck, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { getColaTriajeApi } from '@/lib/triaje';

type Estado = 'En Espera' | 'En Atención' | 'Completado';

interface Patient {
  id: string;
  name: string;
  dni: string;
  arrivalTime: string;
  doctor: string;
  specialty: string;
  status: Estado;
  priority: 'Normal' | 'Urgente';
}

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

export default function ColaPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { success } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const cola = await getColaTriajeApi(today);
        setPatients(cola.map((c, i) => ({
          id: c.id,
          name: c.pacienteNombre,
          dni: '',
          arrivalTime: c.horaLlegada,
          doctor: c.medicoNombre || '—',
          specialty: c.especialidad || '—',
          status: 'En Espera' as Estado,
          priority: 'Normal' as 'Normal' | 'Urgente',
        })));
      } catch (err) {
        console.error('Error loading queue:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const enEspera   = patients.filter((p) => p.status === 'En Espera');
  const enAtencion = patients.filter((p) => p.status === 'En Atención');
  const completado = patients.filter((p) => p.status === 'Completado');

  function advance(id: string) {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.status === 'En Espera') {
          success(`${p.name} pasó a "En Atención".`);
          return { ...p, status: 'En Atención' };
        }
        if (p.status === 'En Atención') {
          success(`${p.name} marcado como "Completado".`);
          return { ...p, status: 'Completado' };
        }
        return p;
      })
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cola de Espera</h1>
        <p className="text-sm text-gray-400">Gestión en tiempo real de la sala de espera</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : null}

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
          <span className="text-xs text-gray-400">{patients.length} total</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50">
            <tr>
              {['#', 'Paciente', 'DNI', 'Llegó', 'Médico', 'Especialidad', 'Estado', 'Acción'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {!loading && patients.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">No hay pacientes en la cola de espera.</td></tr>
            )}
            {patients.map((p, i) => (
              <tr key={p.id} className={`transition-colors ${p.status === 'Completado' ? 'opacity-50' : 'hover:bg-gray-50/50'}`}>
                <td className="px-5 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{p.name}</span>
                    {p.priority === 'Urgente' && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">
                        URGENTE
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-gray-400">{p.dni}</td>
                <td className="px-5 py-3 text-gray-500">{p.arrivalTime}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{p.doctor}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{p.specialty}</td>
                <td className="px-5 py-3">
                  <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-full border text-xs font-semibold ${STATUS_STYLE[p.status]}`}>
                    {STATUS_ICON[p.status]} {p.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {p.status !== 'Completado' && (
                    <button
                      onClick={() => advance(p.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <ClipboardCheck size={11} />
                      {p.status === 'En Espera' ? 'Llamar' : 'Completar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
