'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { MoreHorizontal } from 'lucide-react';

const data = [
  { hour: '8am',  citas: 8  },
  { hour: '9am',  citas: 15 },
  { hour: '10am', citas: 22 },
  { hour: '11am', citas: 18 },
  { hour: '12pm', citas: 12 },
  { hour: '1pm',  citas: 8  },
  { hour: '2pm',  citas: 16 },
  { hour: '3pm',  citas: 20 },
  { hour: '4pm',  citas: 14 },
  { hour: '5pm',  citas: 9  },
];

const peakHour = data.reduce((a, b) => (a.citas > b.citas ? a : b));

const HatchBar = (props: any) => {
  const { x, y, width, height, index } = props;
  if (!width || !height || height <= 0) return null;
  const patternId = `apt-hatch-${index}`;
  return (
    <g>
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45 0 0)">
          <rect width="6"  height="10" fill="#93c5fd" />
          <rect x="6" width="4" height="10" fill="#bfdbfe" />
        </pattern>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill={`url(#${patternId})`} rx={4} />
    </g>
  );
};

export default function AppointmentTimeline() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-sm font-semibold text-gray-800">Citas por Hora — Hoy</h3>
        <button className="text-gray-300 hover:text-gray-500 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Hora pico: <span className="font-semibold text-blue-600">{peakHour.hour}</span> con {peakHour.citas} citas
      </p>

      {/* Totals per slot */}
      <div className="flex mb-2 pl-10 gap-1">
        {data.map((d) => (
          <div key={d.hour} className="flex-1 text-center">
            <div className="text-[9px] text-gray-400 leading-tight">Citas</div>
            <div className={`text-xs font-bold leading-tight ${d.hour === peakHour.hour ? 'text-blue-600' : 'text-gray-700'}`}>
              {d.citas}
            </div>
          </div>
        ))}
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%" margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} width={28} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', fontSize: 12 }}
              formatter={(v: any) => [`${v} citas`, 'Total']}
            />
            <Bar dataKey="citas" shape={HatchBar} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
