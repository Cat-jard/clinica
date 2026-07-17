'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PALETTE = ['#3b82f6','#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#f472b6','#fb923c'];

interface Props {
  data?: { motivo: string; cantidad: number }[];
}

export default function TopMotivoChart({ data = [] }: Props) {
  const chartData = data.map((d, i) => ({
    motivo: d.motivo,
    count: d.cantidad,
    color: PALETTE[i % PALETTE.length],
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Top Motivos de Consulta</h2>
        <span className="text-xs text-gray-400">Hoy</span>
      </div>
      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">Sin datos</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical" barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis dataKey="motivo" type="category" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={115} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} formatter={(v) => [`${v} casos`, 'Pacientes']} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={chartData[i].color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
