import { MoreHorizontal } from 'lucide-react';

interface QueueBarProps {
  label: string;
  value: number;
  total: number;
  colorClass: string;
}

function QueueBar({ label, value, total, colorClass }: QueueBarProps) {
  const pct = Math.round((value / total) * 100);
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-semibold text-gray-700">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function PatientQueue() {
  const total = 47;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-sm font-semibold text-gray-800">Cola de Pacientes</h3>
        <button className="text-gray-300 hover:text-gray-500 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-5xl font-bold text-gray-900 tracking-tight">{total}</span>
      </div>
      <p className="text-xs text-gray-400 mb-5">• +8% vs ayer</p>

      <p className="text-sm font-semibold text-gray-700 mb-5">Total en espera activa: 24</p>

      <div>
        <QueueBar label="En Espera"   value={24} total={total} colorClass="bg-yellow-400" />
        <QueueBar label="En Atención" value={18} total={total} colorClass="bg-blue-500"   />
        <QueueBar label="Completados" value={5}  total={total} colorClass="bg-green-500"  />
      </div>
    </div>
  );
}
