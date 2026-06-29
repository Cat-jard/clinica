'use client';

import { useState } from 'react';
import { AlertTriangle, Calculator, Save } from 'lucide-react';
import PriorityModal from './PriorityModal';
import { useToast } from '@/context/ToastContext';
import {
  PacienteEspera, SignosVitales, AlertLevel,
  alertaSpo2, alertaFC, alertaTemp, alertaPAS, alertaPAD, alertaFR,
  calcIMC, formatoFechaHoraPeru,
} from '@/lib/vitals';
import { calcAge } from '@/lib/format';

type Fields = keyof Omit<SignosVitales, 'imc'>;

const ALERT_BORDER: Record<AlertLevel, string> = {
  normal:   'border-gray-200',
  warning:  'border-yellow-400 bg-yellow-50',
  critical: 'border-red-400 bg-red-50',
};

interface Props { paciente: PacienteEspera; }

export default function VitalSignsForm({ paciente }: Props) {
  const { error: toastError, warning: toastWarning } = useToast();
  const [signos, setSignos]             = useState<Partial<SignosVitales>>({});
  const [alerts, setAlerts]             = useState<Partial<Record<Fields, AlertLevel>>>({});
  const [imc, setImc]                   = useState<number | null>(null);
  const [motivo, setMotivo]             = useState('');
  const [nivelConciencia, setNivel]     = useState('Alerta');
  const [dolor, setDolor]               = useState(0);
  const [showPriority, setShowPriority] = useState(false);

  function getAlert(field: Fields, v: number): AlertLevel {
    switch (field) {
      case 'spo2':             return alertaSpo2(v);
      case 'frecCardiaca':     return alertaFC(v);
      case 'temperatura':      return alertaTemp(v);
      case 'pasSistolica':     return alertaPAS(v);
      case 'pasDiastolica':    return alertaPAD(v);
      case 'frecRespiratoria': return alertaFR(v);
      default: return 'normal';
    }
  }

  function handleBlur(field: Fields, raw: string) {
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const level = getAlert(field, num);
    setAlerts((p) => ({ ...p, [field]: level }));
    if (field === 'spo2' && num < 90) toastError('¡Hipoxemia crítica! SpO₂ < 90% — Asigne mínimo prioridad Amarilla.');
    else if (level === 'critical')    toastWarning(`Valor crítico detectado en ${field}: ${num}`);
  }

  function handleChange(field: Fields, raw: string) {
    const num = parseFloat(raw);
    setSignos((p) => ({ ...p, [field]: isNaN(num) ? undefined : num }));
  }

  function handleGuardar() {
    if (!motivo.trim()) { toastError('El motivo de consulta es obligatorio.'); return; }
    const required: Fields[] = ['pasSistolica', 'pasDiastolica', 'frecCardiaca', 'frecRespiratoria', 'temperatura', 'spo2', 'peso', 'talla'];
    if (required.some((f) => signos[f] === undefined)) { toastError('Completa todos los signos vitales.'); return; }
    setShowPriority(true);
  }

  const completeSignos: SignosVitales = {
    pasSistolica:     signos.pasSistolica     ?? 0,
    pasDiastolica:    signos.pasDiastolica    ?? 0,
    frecCardiaca:     signos.frecCardiaca     ?? 0,
    frecRespiratoria: signos.frecRespiratoria ?? 0,
    temperatura:      signos.temperatura      ?? 0,
    spo2:             signos.spo2             ?? 0,
    peso:             signos.peso             ?? 0,
    talla:            signos.talla            ?? 0,
    imc:              imc ?? undefined,
  };

  const FIELDS: { field: Fields; label: string; unit: string; step: string; placeholder: string }[] = [
    { field: 'pasSistolica',      label: 'P.A. Sistólica',      unit: 'mmHg', step: '1',   placeholder: '120'  },
    { field: 'pasDiastolica',     label: 'P.A. Diastólica',     unit: 'mmHg', step: '1',   placeholder: '80'   },
    { field: 'frecCardiaca',      label: 'Frec. Cardíaca',      unit: 'lpm',  step: '1',   placeholder: '72'   },
    { field: 'frecRespiratoria',  label: 'Frec. Respiratoria',  unit: 'rpm',  step: '1',   placeholder: '16'   },
    { field: 'temperatura',       label: 'Temperatura',          unit: '°C',   step: '0.1', placeholder: '36.5' },
    { field: 'spo2',              label: 'Saturación O₂ (SpO₂)', unit: '%',   step: '1',   placeholder: '98'   },
    { field: 'peso',              label: 'Peso',                 unit: 'kg',   step: '0.1', placeholder: '70'   },
    { field: 'talla',             label: 'Talla',                unit: 'cm',   step: '0.1', placeholder: '170'  },
  ];

  return (
    <>
      <div className="space-y-4">

        {/* Header paciente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{paciente.nombre.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{paciente.nombre}</h1>
            <div className="flex items-center gap-4 mt-0.5">
              <span className="text-xs text-gray-500">DNI: <strong>{paciente.dni}</strong></span>
              <span className="text-xs text-gray-500">Edad: <strong>{calcAge(paciente.fechaNac)} años</strong></span>
              <span className="text-xs text-gray-500">Llegó: <strong>{paciente.horaLlegada}</strong></span>
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{paciente.ticket}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Motivo referido: {paciente.motivo}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-400">Inicio triaje</p>
            <p className="text-xs font-semibold text-gray-700">{formatoFechaHoraPeru(new Date())}</p>
          </div>
        </div>

        {/* Signos vitales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Signos Vitales</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {FIELDS.map(({ field, label, unit, step, placeholder }) => {
              const level = alerts[field] ?? 'normal';
              return (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                    {label} <span className="text-gray-300">({unit})</span>
                    {level === 'critical' && <AlertTriangle size={11} className="inline ml-1 text-red-500" />}
                    {level === 'warning'  && <AlertTriangle size={11} className="inline ml-1 text-yellow-500" />}
                  </label>
                  <input
                    type="number"
                    step={step}
                    placeholder={placeholder}
                    onChange={(e) => handleChange(field, e.target.value)}
                    onBlur={(e) => handleBlur(field, e.target.value)}
                    className={`w-full border-2 rounded-xl px-4 py-3 text-2xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${ALERT_BORDER[level]}`}
                  />
                  {level !== 'normal' && (
                    <span className={`text-[10px] font-semibold mt-0.5 block ${level === 'critical' ? 'text-red-500' : 'text-yellow-600'}`}>
                      {level === 'critical' ? 'CRÍTICO' : 'Fuera de rango'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* IMC */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => { if (signos.peso && signos.talla) setImc(calcIMC(signos.peso, signos.talla)); }}
              disabled={!signos.peso || !signos.talla}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Calculator size={14} /> Calcular IMC
            </button>
            {imc !== null && (
              <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-2 rounded-xl">IMC: {imc} kg/m²</span>
            )}
          </div>
        </div>

        {/* Evaluación clínica */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">Evaluación Clínica</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Motivo de Consulta / Síntoma Principal <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Describa el síntoma principal del paciente..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nivel de Conciencia</label>
              <select
                value={nivelConciencia}
                onChange={(e) => setNivel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Alerta</option>
                <option>Verbal</option>
                <option>Dolor</option>
                <option>Inconsciente</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Escala de Dolor: <strong className="text-gray-800">{dolor}/10</strong>
              </label>
              <input
                type="range" min={0} max={10} value={dolor}
                onChange={(e) => setDolor(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>Sin dolor</span><span>Insoportable</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleGuardar}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-2xl hover:bg-blue-700 transition-colors text-sm"
        >
          <Save size={16} /> Guardar Signos Vitales y Clasificar
        </button>
      </div>

      {showPriority && (
        <PriorityModal
          pacienteNombre={paciente.nombre}
          pacienteId={paciente.id}
          signos={completeSignos}
          onClose={() => setShowPriority(false)}
        />
      )}
    </>
  );
}
