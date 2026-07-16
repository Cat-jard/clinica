'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, User, Loader2 } from 'lucide-react';
import ModalBase from './ModalBase';
import { listPacientesApi, type Paciente } from '@/lib/recepcion';

interface Props {
  onClose: () => void;
  onNewPatient: () => void;
}

export default function SearchPatientModal({ onClose, onNewPatient }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    let cancelled = false;
    setLoading(true);
    listPacientesApi(query.trim()).then((data) => {
      if (!cancelled) setResults(data);
    }).catch(() => {
      if (!cancelled) setResults([]);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [query]);

  const noResults = query.trim().length >= 2 && !loading && results.length === 0;

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
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <ul className="space-y-2">
            {results.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{p.nombres} {p.apellidoPaterno} {p.apellidoMaterno}</p>
                  <p className="text-xs text-gray-400">DNI: {p.nroDocumento} · Tel: {p.telefono}</p>
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
