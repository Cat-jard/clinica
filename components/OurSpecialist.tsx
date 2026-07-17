'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { listarMedicos, Medico } from '@/lib/medicos';

const GRADIENTS = [
  'from-blue-400 to-blue-600',
  'from-indigo-400 to-indigo-600',
  'from-violet-400 to-violet-600',
  'from-teal-400 to-teal-600',
  'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-600',
];

function initials(m: Medico): string {
  return ((m.nombre?.[0] || '') + (m.apellidos?.[0] || '')).toUpperCase();
}

function statusInfo(estado: string): { label: string; className: string } {
  if (estado === 'Activo') return { label: 'Disponible', className: 'bg-green-100 text-green-600' };
  return { label: 'No disponible', className: 'bg-gray-100 text-gray-500' };
}

export default function OurSpecialist() {
  const [doctors, setDoctors] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarMedicos()
      .then(setDoctors)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Médicos Registrados</h3>
        <button className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors">Ver todos</button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-gray-400">Cargando médicos…</div>
      ) : doctors.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400">Sin médicos registrados</div>
      ) : (
        <div className="space-y-1">
          {doctors.map((doc, i) => {
            const st = statusInfo(doc.estado);
            return (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xs font-bold text-white">{initials(doc)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-gray-800 truncate">
                      {doc.nombre} {doc.apellidos}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 flex-shrink-0">
                      {doc.especialidad || 'General'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-gray-400">{doc.rol}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${st.className}`}>
                      {st.label}
                    </span>
                  </div>
                </div>
                <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors flex-shrink-0">
                  <ArrowUpRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
