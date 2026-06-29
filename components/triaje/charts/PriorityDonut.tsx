'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DATA = [
  { name: 'Rojo',     value: 3,  color: '#dc2626' },
  { name: 'Naranja',  value: 7,  color: '#f97316' },
  { name: 'Amarillo', value: 12, color: '#facc15' },
  { name: 'Verde',    value: 18, color: '#22c55e' },
  { name: 'Azul',     value: 8,  color: '#3b82f6' },
];

export default function PriorityDonut() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Distribución de Prioridades</h2>
        <span className="text-xs text-gray-400">Hoy</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
            {DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }}
            formatter={(v, name) => [`${v} pacientes`, name]}
          />
          <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '11px', color: '#6b7280' }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
