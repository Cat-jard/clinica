'use client';

import { useState } from 'react';
import { Search, UserPlus, User } from 'lucide-react';
import ModalBase from './ModalBase';

const MOCK_PATIENTS = [
  { dni: '12345678', name: 'Juan Pérez García',    dob: '1985-03-12', phone: '987654321' },
  { dni: '23456789', name: 'María López Ruiz',     dob: '1990-07-25', phone: '912345678' },
  { dni: '34567890', name: 'Carlos Rodríguez Silva', dob: '1978-11-08', phone: '965432198' },
  { dni: '45678901', name: 'Ana Fernández Díaz',   dob: '1995-01-30', phone: '934567890' },
];

interface Props {
  onClose: () => void;
  onNewPatient: () => void;
}

export default function SearchPatientModal({ onClose, onNewPatient }: Props) {
  const [query, setQuery] = useState('');

  const results = query.trim().length >= 2
    ? MOCK_PATIENTS.filter(
        (p) =>
          p.dni.includes(query.trim()) ||
          p.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : [];

  const noResults = query.trim().length >= 2 && results.length === 0;

  return (
    <ModalBase title="Buscar Paciente" onClose={onClose}>
      <div className="p-6 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Ingrese DNI (8 dígitos) o nombre del paciente…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="space-y-2">
            {results.map((p) => (
              <li
                key={p.dni}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">DNI: {p.dni} · Tel: {p.phone}</p>
                </div>
                <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver ficha →
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* No results */}
        {noResults && (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-gray-500">
              No se encontraron resultados para{' '}
              <span className="font-semibold text-gray-700">"{query}"</span>.
            </p>
            <p className="text-xs text-gray-400">¿Desea registrar un nuevo paciente?</p>
            <button
              onClick={() => { onClose(); onNewPatient(); }}
              className="flex items-center gap-2 mx-auto bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={14} />
              Registrar nuevo paciente
            </button>
          </div>
        )}

        {/* Empty state */}
        {query.trim().length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">
            Escriba al menos 2 caracteres para buscar.
          </p>
        )}

        {query.trim().length === 1 && (
          <p className="text-xs text-gray-400 text-center py-2">
            Escriba al menos 2 caracteres para buscar.
          </p>
        )}
      </div>
    </ModalBase>
  );
}
