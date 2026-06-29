'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Trash2, Star } from 'lucide-react';
import type { DiagnosticoCIE10 } from '@/lib/medico';
import { CIE10_CATALOG } from '@/lib/medico';

interface DiagnosticoCIE10FormProps {
  diagnosticos: DiagnosticoCIE10[];
  onChange: (diagnosticos: DiagnosticoCIE10[]) => void;
}

export default function DiagnosticoCIE10Form({ diagnosticos, onChange }: DiagnosticoCIE10FormProps) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<typeof CIE10_CATALOG>([]);
  const [showDrop, setShowDrop] = useState(false);
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); setShowDrop(false); return; }
    debounceRef.current = setTimeout(() => {
      const q = query.toLowerCase();
      setResults(CIE10_CATALOG.filter(d =>
        d.codigo.toLowerCase().includes(q) || d.descripcion.toLowerCase().includes(q)
      ).slice(0, 8));
      setShowDrop(true);
    }, 300);
  }, [query]);

  function addDiagnostico(item: typeof CIE10_CATALOG[0]) {
    if (diagnosticos.some(d => d.codigo === item.codigo)) return;
    const tipo: DiagnosticoCIE10['tipo'] = diagnosticos.length === 0 ? 'Principal' : 'Secundario';
    onChange([...diagnosticos, { ...item, tipo }]);
    setQuery('');
    setResults([]);
    setShowDrop(false);
  }

  function remove(codigo: string) {
    const updated = diagnosticos.filter(d => d.codigo !== codigo);
    if (updated.length > 0 && !updated.some(d => d.tipo === 'Principal')) {
      updated[0].tipo = 'Principal';
    }
    onChange(updated);
  }

  function setTipo(codigo: string, tipo: DiagnosticoCIE10['tipo']) {
    onChange(diagnosticos.map(d => {
      if (tipo === 'Principal' && d.codigo !== codigo) return { ...d, tipo: 'Secundario' };
      if (d.codigo === codigo) return { ...d, tipo };
      return d;
    }));
  }

  return (
    <div className="space-y-5">

      {/* Buscador */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Buscar Diagnóstico CIE-10 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowDrop(true)}
            placeholder="Escriba diagnóstico o código (Ej: Diabetes, E11, Hipertensión…)"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {showDrop && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {results.map(r => (
                <button
                  key={r.codigo}
                  onClick={() => addDiagnostico(r)}
                  className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors"
                >
                  <span className="text-xs font-mono font-bold text-blue-600 mt-0.5 min-w-[48px]">{r.codigo}</span>
                  <span className="text-xs text-gray-700">{r.descripcion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Mínimo 2 caracteres · Busca por código o descripción</p>
      </div>

      {/* Lista de diagnósticos */}
      {diagnosticos.length === 0 ? (
        <div className="border-2 border-dashed border-amber-200 bg-amber-50 rounded-2xl p-8 text-center">
          <Star size={24} className="text-amber-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-amber-700">Sin diagnósticos agregados</p>
          <p className="text-xs text-amber-500 mt-1">Debe agregar al menos un diagnóstico CIE-10 para firmar la atención</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Diagnósticos asignados</p>
          {diagnosticos.map(d => (
            <div key={d.codigo} className={`flex items-center gap-3 p-3 rounded-xl border ${d.tipo === 'Principal' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
              <span className="text-xs font-mono font-bold text-blue-700 min-w-[52px]">{d.codigo}</span>
              <span className="flex-1 text-xs text-gray-800">{d.descripcion}</span>
              <select
                value={d.tipo}
                onChange={e => setTipo(d.codigo, e.target.value as DiagnosticoCIE10['tipo'])}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="Principal">Principal</option>
                <option value="Secundario">Secundario</option>
              </select>
              <button onClick={() => remove(d.codigo)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
