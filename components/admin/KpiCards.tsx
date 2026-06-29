'use client';

import { useState, useEffect } from 'react';
import { Users, BedDouble, Clock, Wallet, Star } from 'lucide-react';
import { formatSoles } from '@/lib/admin';

// Datos base; se "actualizan" cada 30s para simular tiempo real (regla de oro #1)
const BASE = {
  pacientes: 1245,
  ocupacion: 78,
  espera: 35,
  ingresos: 345800,
  satisfaccion: 4.5,
};

export default function KpiCards() {
  const [data, setData] = useState(BASE);

  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => ({
        pacientes: prev.pacientes + Math.floor(Math.random() * 3),
        ocupacion: Math.min(99, Math.max(60, prev.ocupacion + (Math.random() > 0.5 ? 1 : -1))),
        espera: Math.max(20, prev.espera + (Math.random() > 0.5 ? 1 : -1)),
        ingresos: prev.ingresos + Math.floor(Math.random() * 500),
        satisfaccion: prev.satisfaccion,
      }));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const cards = [
    { label: 'Pacientes Atendidos', value: data.pacientes.toLocaleString('es-PE'), Icon: Users,     color: 'text-blue-600',  bg: 'bg-blue-50',  sub: 'Período seleccionado' },
    { label: 'Ocupación de Camas',  value: `${data.ocupacion}%`,                   Icon: BedDouble, color: 'text-amber-600', bg: 'bg-amber-50', progress: data.ocupacion },
    { label: 'Tiempo Espera Prom.', value: `${data.espera} min`,                   Icon: Clock,     color: data.espera > 30 ? 'text-red-600' : 'text-green-600', bg: data.espera > 30 ? 'bg-red-50' : 'bg-green-50', sub: data.espera > 30 ? '⚠ Sobre la meta (30 min)' : 'Dentro de meta' },
    { label: 'Ingresos / Facturación', value: formatSoles(data.ingresos),          Icon: Wallet,    color: 'text-green-600', bg: 'bg-green-50', sub: 'Total facturado' },
    { label: 'Satisfacción',        value: `${data.satisfaccion} / 5`,             Icon: Star,      color: 'text-purple-600',bg: 'bg-purple-50',sub: 'Promedio encuestas' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(({ label, value, Icon, color, bg, sub, progress }) => (
        <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={16} className={color} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {progress !== undefined ? (
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${progress > 85 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${progress}%` }} />
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">{sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
