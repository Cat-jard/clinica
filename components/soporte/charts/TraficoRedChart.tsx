'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TRAFICO_RED } from '@/lib/soporte';

export default function TraficoRedChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Tráfico de Red por Servidor</h2>
      <p className="text-xs text-gray-400 mb-4">MB/s actuales</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={TRAFICO_RED} margin={{ top: 5, right: 10, left: -12, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="servidor" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit=" MB" />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} cursor={{ fill: '#f9fafb' }} formatter={(v) => [`${v} MB/s`, 'Tráfico']} />
          <Bar dataKey="trafico" radius={[6, 6, 0, 0]}>
            {TRAFICO_RED.map((d, i) => (
              <Cell key={i} fill={d.trafico > 90 ? '#dc2626' : d.trafico > 60 ? '#f59e0b' : '#2563eb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
