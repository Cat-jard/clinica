'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DISTRIBUCION_ASEGURADORA } from '@/lib/admin';

export default function AseguradoraPieChart() {
  const total = DISTRIBUCION_ASEGURADORA.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Distribución por Aseguradora</h2>
      <p className="text-xs text-gray-400 mb-2">{total.toLocaleString('es-PE')} pacientes</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={DISTRIBUCION_ASEGURADORA}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {DISTRIBUCION_ASEGURADORA.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(v) => [`${v} pacientes`, '']}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
