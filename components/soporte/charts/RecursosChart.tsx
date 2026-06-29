'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generarSerieRecursos } from '@/lib/soporte';

export default function RecursosChart() {
  const [data, setData] = useState(generarSerieRecursos);

  // Polling en tiempo real (cada 5s): desplaza la serie y agrega un punto nuevo
  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1];
        const nextHora = `${String((parseInt(last.hora) + 1) % 24).padStart(2, '0')}:00`;
        const next = {
          hora: nextHora,
          cpu: Math.min(99, Math.max(10, last.cpu + Math.round((Math.random() - 0.5) * 20))),
          ram: Math.min(99, Math.max(20, last.ram + Math.round((Math.random() - 0.5) * 14))),
        };
        return [...prev.slice(1), next];
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const cpuActual = data[data.length - 1].cpu;
  const ramActual = data[data.length - 1].ram;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Uso de Recursos — Tiempo Real</h2>
          <p className="text-xs text-gray-400">Últimas 24 horas · actualiza cada 5s</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            CPU <b className="tabular-nums text-gray-800">{cpuActual}%</b>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            RAM <b className="tabular-nums text-gray-800">{ramActual}%</b>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -12, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="hora" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v) => [`${v}%`, '']} />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="plainline" />
          <Line type="monotone" dataKey="cpu" name="CPU" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="ram" name="RAM" stroke="#14b8a6" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
