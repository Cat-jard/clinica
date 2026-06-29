'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

function getColor(spo2: number) {
  if (spo2 < 90) return '#dc2626';
  if (spo2 < 95) return '#f59e0b';
  return '#22c55e';
}

function getLabel(spo2: number) {
  if (spo2 < 90) return { text: 'Crítico',  color: 'text-red-600'    };
  if (spo2 < 95) return { text: 'Bajo',     color: 'text-yellow-500' };
  return               { text: 'Normal',   color: 'text-green-600'   };
}

export default function SpO2Gauge({ spo2 = 96.4 }: { spo2?: number }) {
  const color             = getColor(spo2);
  const { text, color: labelColor } = getLabel(spo2);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-800">SpO₂ Promedio</h2>
        <span className="text-xs text-gray-400">Pacientes activos</span>
      </div>
      <div className="relative flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={180}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={210} endAngle={-30} data={[{ name: 'SpO₂', value: spo2, fill: color }]} barSize={14}>
            <RadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={8} max={100} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-3xl font-black text-gray-800">{spo2}%</p>
          <p className={`text-xs font-semibold ${labelColor}`}>{text}</p>
          <p className="text-[10px] text-gray-400">Saturación O₂</p>
        </div>
      </div>
    </div>
  );
}
