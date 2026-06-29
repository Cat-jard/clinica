'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FLUJO_PACIENTES } from '@/lib/admin';

export default function FlujoPacientesChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Flujo de Pacientes</h2>
        <p className="text-xs text-gray-400">Ingresos vs. Altas · Últimos 30 días</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={FLUJO_PACIENTES} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
          <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="altas" name="Altas" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
