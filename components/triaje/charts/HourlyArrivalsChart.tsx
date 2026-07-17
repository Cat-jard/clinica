'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function hourLabel(raw: string): string {
  const n = parseInt(raw, 10);
  if (isNaN(n)) return raw;
  if (n === 0) return '12am';
  if (n < 12) return `${n}am`;
  if (n === 12) return '12pm';
  return `${n - 12}pm`;
}

interface Props {
  data?: { hora: string; cantidad: number }[];
}

export default function HourlyArrivalsChart({ data = [] }: Props) {
  const chartData = data.map((d) => ({
    hora: hourLabel(d.hora),
    pacientes: d.cantidad,
  }));

  const peak = chartData.length > 0
    ? chartData.reduce((a, b) => (b.pacientes > a.pacientes ? b : a), chartData[0])
    : null;

  const HatchBar = (props: any) => {
    const { x, y, width, height, index } = props;
    const pid = `hatch-arr-${index}`;
    if (!width || !height || height <= 0) return null;
    return (
      <g>
        <defs>
          <pattern id={pid} patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45 0 0)">
            <rect width="6" height="10" fill="#93c5fd" />
            <rect x="6" width="4" height="10" fill="#bfdbfe" />
          </pattern>
        </defs>
        <rect x={x} y={y} width={width} height={height} fill={`url(#${pid})`} rx={4} />
      </g>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-800">Llegadas por Hora</h2>
        <span className="text-xs text-gray-400">
          {peak ? <>Pico: <strong className="text-blue-600">{peak.hora}</strong></> : 'Sin datos'}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-4">Flujo de pacientes a triaje</p>
      {chartData.length === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-xs text-gray-400">Sin datos</div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} formatter={(v) => [`${v} pacientes`, 'Llegadas']} />
            <Bar dataKey="pacientes" shape={<HatchBar />} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
