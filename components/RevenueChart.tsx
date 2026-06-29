'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, ReferenceDot, ReferenceLine, Tooltip,
} from 'recharts';
import { ChevronDown } from 'lucide-react';

const data = [
  { month: 'Jan', revenue: 3200 },
  { month: 'Feb', revenue: 5800 },
  { month: 'Mar', revenue: 4100 },
  { month: 'Apr', revenue: 6500 },
  { month: 'May', revenue: 13876 },
  { month: 'Jun', revenue: 9200 },
  { month: 'Jul', revenue: 6400 },
  { month: 'Aug', revenue: 7100 },
  { month: 'Sep', revenue: 5300 },
];

// Tooltip pill above May's peak
const PeakLabel = (props: any) => {
  const { viewBox } = props;
  if (!viewBox) return null;
  const { x, y } = viewBox;
  const W = 82;
  const H = 38;
  const ARROW = 6;

  return (
    <g>
      {/* Pill */}
      <rect x={x - W / 2} y={y - H - ARROW - 4} width={W} height={H} rx={10} fill="#1d4ed8" />
      <text x={x} y={y - H - ARROW - 4 + 14} textAnchor="middle" fill="white" fontSize={10} fontWeight="600">
        May
      </text>
      <text x={x} y={y - H - ARROW - 4 + 28} textAnchor="middle" fill="white" fontSize={11} fontWeight="700">
        $13,876
      </text>
      {/* Arrow */}
      <polygon
        points={`${x - ARROW},${y - ARROW - 4} ${x + ARROW},${y - ARROW - 4} ${x},${y - 2}`}
        fill="#1d4ed8"
      />
    </g>
  );
};

export default function RevenueChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Revenue</h3>
        <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors">
          Monthly
          <ChevronDown size={12} />
        </button>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 52, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={(v) => `$${v / 1000}k`}
              ticks={[0, 5000, 10000, 15000]}
              width={38}
            />
            <Tooltip
              contentStyle={{ display: 'none' }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#1d4ed8', stroke: 'white', strokeWidth: 2 }}
            />
            {/* Vertical dashed reference line at May */}
            <ReferenceLine
              x="May"
              stroke="#cbd5e1"
              strokeDasharray="4 3"
              strokeWidth={1.5}
            />
            {/* Peak dot + pill label */}
            <ReferenceDot
              x="May"
              y={13876}
              r={5}
              fill="#1d4ed8"
              stroke="white"
              strokeWidth={2}
              label={<PeakLabel />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
