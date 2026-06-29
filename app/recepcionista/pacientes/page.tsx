'use client';

import { useState } from 'react';
import { Search, UserPlus, Filter } from 'lucide-react';
import NewPatientModal from '@/components/modals/NewPatientModal';
import CoverageModal from '@/components/modals/CoverageModal';

const PATIENTS = [
  { dni: '12345678', name: 'Juan Pérez García',    dob: '12/03/1985', phone: '987 654 321', hasConsent: true,  insurance: 'EsSalud' },
  { dni: '23456789', name: 'María López Ruiz',     dob: '25/07/1990', phone: '912 345 678', hasConsent: false, insurance: 'SIS'     },
  { dni: '34567890', name: 'Carlos Rodríguez',     dob: '08/11/1978', phone: '965 432 198', hasConsent: true,  insurance: 'EPS'     },
  { dni: '45678901', name: 'Ana Fernández Díaz',   dob: '30/01/1995', phone: '934 567 890', hasConsent: false, insurance: 'Particular' },
  { dni: '56789012', name: 'Pedro Martínez Vega',  dob: '14/06/1982', phone: '956 789 012', hasConsent: true,  insurance: 'EsSalud' },
  { dni: '67890123', name: 'Lucía Torres Salas',   dob: '22/09/2000', phone: '945 678 901', hasConsent: true,  insurance: 'SIS'     },
];

type Modal = 'newPatient' | 'coverage' | null;

export default function PacientesPage() {
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [selected, setSelected] = useState<(typeof PATIENTS)[0] | null>(null);

  const filtered = PATIENTS.filter(
    (p) =>
      p.dni.includes(query) ||
      p.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-sm text-gray-400">Registro y gestión de pacientes</p>
          </div>
          <button
            onClick={() => setModal('newPatient')}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={15} /> Nuevo Paciente
          </button>
        </div>

        {/* Search + filter bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por DNI o nombre del paciente…"
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-1.5 border border-gray-200 text-gray-500 text-sm px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            <Filter size={14} /> Filtrar
          </button>
          <span className="text-xs text-gray-400">{filtered.length} pacientes</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                {['DNI', 'Paciente', 'Fecha Nac.', 'Teléfono', 'Seguro', 'Consentimiento', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{p.dni}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{p.name}</td>
                  <td className="px-5 py-3 text-gray-500">{p.dob}</td>
                  <td className="px-5 py-3 text-gray-500">{p.phone}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      {p.insurance}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {p.hasConsent
                      ? <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">Firmado</span>
                      : <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">Pendiente</span>
                    }
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => { setSelected(p); setModal('coverage'); }}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Ver cobertura
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">
              No se encontraron pacientes para "{query}".
            </div>
          )}
        </div>
      </div>

      {modal === 'newPatient' && <NewPatientModal onClose={() => setModal(null)} />}
      {modal === 'coverage' && selected && (
        <CoverageModal patientName={selected.name} onClose={() => setModal(null)} />
      )}
    </>
  );
}
