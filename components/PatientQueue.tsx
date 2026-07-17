'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { obtenerColaTriaje } from '@/lib/recepcion';

interface QueueBarProps {
  label: string;
  value: number;
  total: number;
  colorClass: string;
}

function QueueBar({ label, value, total, colorClass }: QueueBarProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-semibold text-gray-700">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function PatientQueue() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ esperando: 0, atencion: 0, completados: 0, total: 0 });

  async function fetchQueue() {
    try {
      const items = await obtenerColaTriaje();
      // count states
      const esperando = items.filter(i => i.estado === 'EN_ESPERA' || i.estado === 'PENDIENTE').length;
      const atencion = items.filter(i => i.estado === 'EN_TRIAJE' || i.estado === 'ATENCION' || i.estado === 'TRIADO').length;
      const completados = items.filter(i => i.estado === 'COMPLETADO' || i.estado === 'ATENDIDO').length;
      const total = items.length;
      
      setStats({ esperando, atencion, completados, total });
    } catch (err) {
      console.error('Error fetching queue stats:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQueue();
    // Refresh queue every 15s to keep dashboard updated in real-time
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex items-center justify-center text-xs text-gray-400">
        Cargando cola…
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-sm font-semibold text-gray-800">Cola de Pacientes</h3>
        <button onClick={fetchQueue} className="text-gray-300 hover:text-gray-500 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-5xl font-bold text-gray-900 tracking-tight">{stats.total}</span>
      </div>
      <p className="text-xs text-gray-400 mb-5">• Pacientes hoy</p>

      <p className="text-sm font-semibold text-gray-700 mb-5">Total en espera activa: {stats.esperando}</p>

      <div>
        <QueueBar label="En Espera"   value={stats.esperando} total={stats.total} colorClass="bg-yellow-400" />
        <QueueBar label="En Atención" value={stats.atencion} total={stats.total} colorClass="bg-blue-500"   />
        <QueueBar label="Completados" value={stats.completados} total={stats.total} colorClass="bg-green-500"  />
      </div>
    </div>
  );
}
