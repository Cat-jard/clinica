'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { MoreHorizontal } from 'lucide-react';

const data = [
  { month: 'Jan', patients: 9532, label: '9,532' },
  { month: 'Feb', patients: 7520, label: '7,520' },
  { month: 'Mar', patients: 5532, label: '5,532', note: '/ Avg. 250' },
  { month: 'Apr', patients: 3450, label: '3450' },
  { month: 'May', patients: 2513, label: '2513' },
];

// Custom bar shape with diagonal stripe pattern
const HatchBar = (props: any) => {
  const { x, y, width, height, index } = props;
  if (!width || !height || height <= 0) return null;

  const patternId = `hatch-${index}`;
  const indicatorW = Math.min(width * 0.5, 44);

  return (
    <g>
      <defs>
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
          patternTransform="rotate(45 0 0)"
        >
          <rect width="6"  height="10" fill="#93c5fd" />
          <rect x="6" width="4" height="10" fill="#bfdbfe" />
        </pattern>
      </defs>

      {/* Main bar */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${patternId})`}
        rx={5}
        ry={5}
      />

      {/* Small indicator pill on top */}
      <rect
        x={x + (width - indicatorW) / 2}
        y={y - 10}
        width={indicatorW}
        height={5}
        fill="#cbd5e1"
        rx={2.5}
      />
    </g>
  );
};

export default function PatientVisitsChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Patient Visits Overview</h3>
        <button className="text-gray-300 hover:text-gray-500 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Column totals row */}
      <div className="flex mb-2 pl-10">
        {data.map((d) => (
          <div key={d.month} className="flex-1 text-center">
            <div className="text-[10px] text-gray-400 leading-tight">Total Patients</div>
            <div className="text-sm font-bold text-gray-900 leading-tight">
              {d.label}
              {d.note && (
                <span className="text-[10px] font-normal text-gray-400 ml-1">{d.note}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%" margin={{ top: 16, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={(v) => `${v / 1000}k`}
              width={36}
            />
            <Bar dataKey="patients" shape={HatchBar} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
