import { MoreHorizontal, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  badge: string;
  comparison: string;
  data: number[];
}

// Pixel-grid mini bar chart (matches the design's block style)
function MiniBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const ROWS = 6;

  return (
    <div className="flex items-end gap-1">
      {data.map((val, ci) => {
        const filled = Math.round((val / max) * ROWS);
        return (
          <div key={ci} className="flex flex-col-reverse gap-0.5">
            {Array.from({ length: ROWS }).map((_, ri) => (
              <div
                key={ri}
                className={`w-2.5 h-2.5 rounded-[3px] transition-colors ${
                  ri < filled ? 'bg-blue-500' : 'bg-blue-100'
                }`}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function StatCard({ title, value, badge, comparison, data }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-5">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <button className="text-gray-300 hover:text-gray-500 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex items-end justify-between gap-3">
        {/* Value + comparison */}
        <div>
          <div className="text-4xl font-bold text-gray-900 leading-none mb-2">{value}</div>
          <div className="text-xs text-gray-400">{comparison}</div>
        </div>

        {/* Badge + mini chart */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full text-xs font-semibold">
            <TrendingUp size={11} />
            {badge}
          </div>
          <MiniBarChart data={data} />
        </div>
      </div>
    </div>
  );
}
