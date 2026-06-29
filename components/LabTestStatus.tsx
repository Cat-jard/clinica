import { MoreHorizontal } from 'lucide-react';

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  colorClass: string;
}

function ProgressBar({ label, value, total, colorClass }: ProgressBarProps) {
  const pct = Math.round((value / total) * 100);
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-semibold text-gray-700">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function LabTestStatus() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-sm font-semibold text-gray-800">Lab Test Status Overview</h3>
        <button className="text-gray-300 hover:text-gray-500 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-5xl font-bold text-gray-900 tracking-tight">86%</span>
      </div>
      <div className="flex items-center gap-1.5 mb-5">
        <span className="text-xs text-gray-400">• +15% vs last period</span>
      </div>

      <p className="text-sm font-semibold text-gray-700 mb-5">Total Tests Initiated: 754</p>

      <div>
        <ProgressBar label="Completed Tests"       value={652} total={754} colorClass="bg-blue-500" />
        <ProgressBar label="Pending Tests"         value={78}  total={754} colorClass="bg-yellow-400" />
        <ProgressBar label="Critical / Abnormal Tests" value={24}  total={754} colorClass="bg-red-500" />
      </div>
    </div>
  );
}
