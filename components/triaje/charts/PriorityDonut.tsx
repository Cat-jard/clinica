'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLOR_MAP: Record<string, string> = {
  'I-ROJO': '#dc2626',
  'II-NARANJA': '#f97316',
  'III-AMARILLO': '#facc15',
  'IV-VERDE': '#22c55e',
  'V-AZUL': '#3b82f6',
};

const LABEL_MAP: Record<string, string> = {
  'I-ROJO': 'Rojo',
  'II-NARANJA': 'Naranja',
  'III-AMARILLO': 'Amarillo',
  'IV-VERDE': 'Verde',
  'V-AZUL': 'Azul',
};

interface Props {
  data?: { prioridad: string; cantidad: number }[];
}

export default function PriorityDonut({ data = [] }: Props) {
  const chartData = data.length > 0
    ? data.map((d) => ({
        name: LABEL_MAP[d.prioridad] || d.prioridad,
        value: d.cantidad,
        color: COLOR_MAP[d.prioridad] || '#9ca3af',
      }))
    : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Distribución de Prioridades</h2>
        <span className="text-xs text-gray-400">Hoy</span>
      </div>
      {chartData.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">Sin datos</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
              {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }}
              formatter={(v, name) => [`${v} pacientes`, name]}
            />
            <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '11px', color: '#6b7280' }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
