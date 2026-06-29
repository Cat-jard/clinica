'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DATA = [
  { hora: '8am',  pacientes: 6  },
  { hora: '9am',  pacientes: 12 },
  { hora: '10am', pacientes: 18 },
  { hora: '11am', pacientes: 14 },
  { hora: '12pm', pacientes: 9  },
  { hora: '1pm',  pacientes: 5  },
  { hora: '2pm',  pacientes: 8  },
  { hora: '3pm',  pacientes: 11 },
  { hora: '4pm',  pacientes: 7  },
  { hora: '5pm',  pacientes: 4  },
];

const HatchBar = (props: any) => {
  const { x, y, width, height, index } = props;
  const pid = `hatch-arr-${index}`;
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

export default function HourlyArrivalsChart() {
  const peak = DATA.reduce((a, b) => b.pacientes > a.pacientes ? b : a, DATA[0]);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-800">Llegadas por Hora</h2>
        <span className="text-xs text-gray-400">Pico: <strong className="text-blue-600">{peak.hora}</strong></span>
      </div>
      <p className="text-xs text-gray-400 mb-4">Flujo de pacientes a triaje</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={DATA} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} formatter={(v) => [`${v} pacientes`, 'Llegadas']} />
          <Bar dataKey="pacientes" shape={<HatchBar />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
