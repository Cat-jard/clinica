'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ATENCIONES_ESPECIALIDAD } from '@/lib/admin';

export default function AtencionesEspecialidadChart() {
  const total = ATENCIONES_ESPECIALIDAD.reduce((s, d) => s + d.atenciones, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Atenciones por Especialidad</h2>
          <p className="text-xs text-gray-400">Últimos 7 días · {total.toLocaleString('es-PE')} atenciones</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={ATENCIONES_ESPECIALIDAD} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="especialidad" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
            cursor={{ fill: '#f9fafb' }}
          />
          <Bar dataKey="atenciones" radius={[6, 6, 0, 0]} fill="#2563eb">
            {ATENCIONES_ESPECIALIDAD.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? '#2563eb' : '#60a5fa'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
