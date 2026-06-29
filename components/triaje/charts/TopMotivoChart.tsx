'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DATA = [
  { motivo: 'Dolor abdominal',   count: 14, color: '#3b82f6' },
  { motivo: 'Dif. respiratoria', count: 11, color: '#6366f1' },
  { motivo: 'Cefalea intensa',   count: 9,  color: '#8b5cf6' },
  { motivo: 'Dolor torácico',    count: 7,  color: '#a78bfa' },
  { motivo: 'Fiebre alta',       count: 7,  color: '#c4b5fd' },
];

export default function TopMotivoChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Top Motivos de Consulta</h2>
        <span className="text-xs text-gray-400">Hoy</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={DATA} layout="vertical" barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis dataKey="motivo" type="category" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={115} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} formatter={(v) => [`${v} casos`, 'Pacientes']} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {DATA.map((_, i) => <Cell key={i} fill={DATA[i].color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
