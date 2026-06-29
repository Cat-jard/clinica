import { ArrowUpRight } from 'lucide-react';

const DOCTORS = [
  { name: 'Dr. Randy Gouse',  specialty: 'Psicología',  level: 'Senior', status: 'En consulta',  initials: 'RG', color: 'from-blue-400 to-blue-600',   statusColor: 'bg-orange-100 text-orange-600' },
  { name: 'Dr. Alex Pitols',  specialty: 'Psicología',  level: 'Senior', status: 'Disponible',   initials: 'AP', color: 'from-indigo-400 to-indigo-600', statusColor: 'bg-green-100 text-green-600'  },
  { name: 'Dra. Ana Torres',  specialty: 'Cardiología', level: 'Senior', status: 'Disponible',   initials: 'AT', color: 'from-violet-400 to-violet-600', statusColor: 'bg-green-100 text-green-600'  },
  { name: 'Dr. Luis Díaz',    specialty: 'Pediatría',   level: 'Junior', status: 'En descanso',  initials: 'LD', color: 'from-teal-400 to-teal-600',    statusColor: 'bg-gray-100 text-gray-500'    },
];

export default function OurSpecialist() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Médicos en Turno</h3>
        <button className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors">Ver todos</button>
      </div>

      <div className="space-y-1">
        {DOCTORS.map((doc, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${doc.color} flex items-center justify-center flex-shrink-0`}>
              <span className="text-xs font-bold text-white">{doc.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-gray-800 truncate">{doc.name}</span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 flex-shrink-0">
                  {doc.level}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-gray-400">{doc.specialty}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${doc.statusColor}`}>
                  {doc.status}
                </span>
              </div>
            </div>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors flex-shrink-0">
              <ArrowUpRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
