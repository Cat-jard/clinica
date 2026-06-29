'use client';

import type { Anamnesis } from '@/lib/medico';

const AP_OPTIONS = ['Diabetes Mellitus (DM2)', 'Hipertensión Arterial (HTA)', 'Asma Bronquial', 'Cardiopatía', 'Hepatitis', 'Tuberculosis', 'Cáncer', 'IRC'];
const HABITOS_OPTIONS = ['Fumador', 'Alcohol', 'Drogas', 'Sedentario', 'Actividad Física Regular'];

interface AnamnesisFormProps {
  data: Anamnesis;
  onChange: (data: Anamnesis) => void;
}

export default function AnamnesisForm({ data, onChange }: AnamnesisFormProps) {
  function set<K extends keyof Anamnesis>(key: K, val: Anamnesis[K]) {
    onChange({ ...data, [key]: val });
  }

  function toggleCheck(key: 'antecedentesPatologicos' | 'habitos', val: string) {
    const arr = data[key] as string[];
    set(key, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  }

  return (
    <div className="space-y-6">

      {/* Motivo y Enfermedad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="label-field">Motivo de Consulta <span className="text-red-500">*</span></label>
          <textarea
            rows={3}
            value={data.motivoConsulta}
            onChange={e => set('motivoConsulta', e.target.value)}
            placeholder="Frase textual del paciente…"
            className="textarea-field"
          />
        </div>
        <div>
          <label className="label-field">Enfermedad Actual <span className="text-red-500">*</span></label>
          <textarea
            rows={3}
            value={data.enfermedadActual}
            onChange={e => set('enfermedadActual', e.target.value)}
            placeholder="Inicio, evolución, características, factores asociados…"
            className="textarea-field"
          />
        </div>
      </div>

      {/* Antecedentes Patológicos */}
      <div>
        <label className="label-field">Antecedentes Patológicos Personales</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {AP_OPTIONS.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.antecedentesPatologicos.includes(opt)}
                onChange={() => toggleCheck('antecedentesPatologicos', opt)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-xs text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Antecedentes Quirúrgicos y Familiares */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="label-field">Antecedentes Quirúrgicos</label>
          <textarea
            rows={2}
            value={data.antecedentesQuirurgicos}
            onChange={e => set('antecedentesQuirurgicos', e.target.value)}
            placeholder="Cirugías previas, año y motivo…"
            className="textarea-field"
          />
        </div>
        <div>
          <label className="label-field">Antecedentes Familiares</label>
          <textarea
            rows={2}
            value={data.antecedentesFamiliares}
            onChange={e => set('antecedentesFamiliares', e.target.value)}
            placeholder="Enfermedades de familiares directos…"
            className="textarea-field"
          />
        </div>
      </div>

      {/* Alergias — CRÍTICO */}
      <div>
        <label className="label-field">
          Antecedentes Alérgicos <span className="text-red-500">*</span>
          <span className="ml-1 text-[10px] text-red-500 font-normal">(aparece en cabecera si se llena)</span>
        </label>
        <input
          type="text"
          value={data.antecedentesAlergicos}
          onChange={e => set('antecedentesAlergicos', e.target.value)}
          placeholder="Ej: Penicilina, AINEs, mariscos… (escribir NINGUNA si no aplica)"
          className={`input-field ${data.antecedentesAlergicos && data.antecedentesAlergicos.toLowerCase() !== 'ninguna' ? 'border-red-300 bg-red-50 focus:ring-red-400' : ''}`}
        />
      </div>

      {/* Hábitos */}
      <div>
        <label className="label-field">Hábitos de Vida</label>
        <div className="flex flex-wrap gap-3 mt-2">
          {HABITOS_OPTIONS.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.habitos.includes(opt)}
                onChange={() => toggleCheck('habitos', opt)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-xs text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Medicación Actual */}
      <div>
        <label className="label-field">Medicación Actual</label>
        <textarea
          rows={2}
          value={data.medicacionActual}
          onChange={e => set('medicacionActual', e.target.value)}
          placeholder="Medicamentos que toma actualmente (nombre, dosis, frecuencia)…"
          className="textarea-field"
        />
      </div>

      <style>{`
        .label-field { display: block; font-size: 0.75rem; font-weight: 600; color: #374151; margin-bottom: 0.375rem; }
        .textarea-field { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; font-size: 0.813rem; color: #374151; resize: vertical; outline: none; transition: all 0.15s; }
        .textarea-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px #bfdbfe; }
        .input-field { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; font-size: 0.813rem; color: #374151; outline: none; transition: all 0.15s; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px #bfdbfe; }
      `}</style>
    </div>
  );
}
