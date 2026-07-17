'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { MoreHorizontal } from 'lucide-react';
import { listarCitas } from '@/lib/citas';

const HOURS = ['8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm'];

function hourLabel(h: number): string {
  if (h < 12) return `${h}am`;
  if (h === 12) return '12pm';
  return `${h - 12}pm`;
}

export default function AppointmentTimeline() {
  const [data, setData] = useState<{ hour: string; citas: number }[]>(
    HOURS.map((h) => ({ hour: h, citas: 0 }))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const today = new Date().toLocaleDateString('en-CA');
        const citas = await listarCitas(undefined, 200, today, today);
        const bucket: Record<number, number> = {};
        for (const c of citas) {
          const h = parseInt((c.horaInicio || '00').slice(0, 2), 10);
          bucket[h] = (bucket[h] || 0) + 1;
        }
        setData(HOURS.map((h) => {
          const [raw] = h.split(/(?=am|pm)/);
          const isPm = h.includes('pm');
          let num = parseInt(raw, 10);
          if (isPm && num !== 12) num += 12;
          if (!isPm && num === 12) num = 0;
          return { hour: h, citas: bucket[num] || 0 };
        }));
      } catch {
        // fallback silencioso
      } finally {
        setLoading(false);
      }
    }
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-sm font-semibold text-gray-800">Citas por Hora — Hoy</h3>
        <button className="text-gray-300 hover:text-gray-500 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        {loading ? 'Cargando…' : `Hora pico: ${peakHour.citas > 0 ? `${peakHour.hour} con ${peakHour.citas} citas` : 'Sin datos aún'}`}
      </p>

      <div className="flex mb-2 pl-10 gap-1">
        {data.map((d) => (
          <div key={d.hour} className="flex-1 text-center">
            <div className="text-[9px] text-gray-400 leading-tight">Citas</div>
            <div className={`text-xs font-bold leading-tight ${d.hour === peakHour.hour && peakHour.citas > 0 ? 'text-blue-600' : 'text-gray-700'}`}>
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
