'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DATA = [
  { hora: '8am',  minutos: 4.2 },
  { hora: '9am',  minutos: 6.1 },
  { hora: '10am', minutos: 8.5 },
  { hora: '11am', minutos: 7.3 },
  { hora: '12pm', minutos: 5.8 },
  { hora: '1pm',  minutos: 4.5 },
  { hora: '2pm',  minutos: 5.2 },
  { hora: '3pm',  minutos: 7.8 },
  { hora: '4pm',  minutos: 6.4 },
  { hora: '5pm',  minutos: 3.9 },
];

export default function TriageTimeChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-800">Tiempo Promedio de Triaje</h2>
        <span className="text-xs text-gray-400">Meta: &lt; 7 min</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">Minutos por paciente / hora</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={DATA}>
          <defs>
            <linearGradient id="triageGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} unit="m" />
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} formatter={(v) => [`${v} min`, 'Tiempo prom.']} />
          <Area type="monotone" dataKey="minutos" stroke="#3b82f6" strokeWidth={2} fill="url(#triageGrad)" dot={{ fill: '#3b82f6', r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
