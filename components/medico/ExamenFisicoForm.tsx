'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';
import type { ExamenFisico, PacienteMedico } from '@/lib/medico';

const SISTEMAS: { key: keyof ExamenFisico; label: string; placeholder: string }[] = [
  { key: 'examenGeneral',  label: 'Examen General',      placeholder: 'Estado general, conciencia, orientación, hidratación…' },
  { key: 'cabezaCuello',   label: 'Cabeza y Cuello',     placeholder: 'Pupilas, mucosas, cuello, ganglios linfáticos…' },
  { key: 'toraxPulmones',  label: 'Tórax / Pulmones',    placeholder: 'Auscultación, ruidos respiratorios, sonidos agregados…' },
  { key: 'corazon',        label: 'Corazón',              placeholder: 'Ruidos cardíacos, soplos, ritmo…' },
  { key: 'abdomen',        label: 'Abdomen',              placeholder: 'Ruidos hidroaéreos, dolor a la palpación, masas…' },
  { key: 'extremidades',   label: 'Extremidades',         placeholder: 'Pulsos, edemas, movilidad, signos de trombosis…' },
  { key: 'neurologico',    label: 'Neurológico',          placeholder: 'Conciencia, fuerza, reflejos, pares craneales…' },
  { key: 'otros',          label: 'Otros Hallazgos',      placeholder: 'Órganos genitales, recto u otros según especialidad…' },
];

interface ExamenFisicoFormProps {
  data: ExamenFisico;
  paciente: PacienteMedico;
  onChange: (data: ExamenFisico) => void;
  onGuardar: () => void;
}

export default function ExamenFisicoForm({ data, paciente, onChange, onGuardar }: ExamenFisicoFormProps) {
  const [guardado, setGuardado] = useState(false);
  const s = paciente.signos;

  function set<K extends keyof ExamenFisico>(key: K, val: string) {
    onChange({ ...data, [key]: val });
    setGuardado(false);
  }

  function handleGuardar() {
    setGuardado(true);
    onGuardar();
    setTimeout(() => setGuardado(false), 3000);
  }

  return (
    <div className="space-y-5">

      {/* Signos vitales de triaje */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-blue-800">Signos Vitales — Registrados por Enfermería</p>
          <button className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium">
            <RefreshCw size={11} /> Actualizar
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'PA',    val: s.pasSistolica ? `${s.pasSistolica}/${s.pasDiastolica} mmHg` : '---' },
            { label: 'FC',    val: s.frecCardiaca  ? `${s.frecCardiaca} lpm`   : '---' },
            { label: 'FR',    val: s.frecRespiratoria ? `${s.frecRespiratoria} rpm` : '---' },
            { label: 'Temp',  val: s.temperatura   ? `${s.temperatura} °C`    : '---' },
            { label: 'SpO₂',  val: s.spo2          ? `${s.spo2}%`             : '---' },
            { label: 'Peso',  val: s.peso          ? `${s.peso} kg`           : '---' },
            { label: 'Talla', val: s.talla         ? `${s.talla} cm`          : '---' },
            { label: 'IMC',   val: (s.peso && s.talla) ? `${(s.peso / ((s.talla / 100) ** 2)).toFixed(1)}` : '---' },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white rounded-xl px-3 py-2">
              <p className="text-[10px] text-gray-400 font-medium">{label}</p>
              <p className="text-sm font-bold text-gray-800">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sistemas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SISTEMAS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
            <textarea
              rows={2}
              value={data[key] || ''}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        ))}
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleGuardar}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
            guardado ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {guardado ? <><CheckCircle size={15} /> Examen Guardado</> : 'Guardar Examen Físico'}
        </button>
      </div>
    </div>
  );
}
