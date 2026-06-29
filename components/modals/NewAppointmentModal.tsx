'use client';

import { useState, ChangeEvent } from 'react';
import ModalBase from './ModalBase';

const SPECIALTIES: Record<string, string[]> = {
  'Psicología':   ['Dr. Randy Gouse', 'Dr. Alex Pitols'],
  'Cardiología':  ['Dra. Ana Torres'],
  'Pediatría':    ['Dr. Luis Díaz'],
  'Medicina General': ['Dr. Roberto Sánchez'],
};

const HOURS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
               '12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30'];

const TIPOS = ['Consulta Externa', 'Teleconsulta', 'Control', 'Emergencia', 'Procedimiento'];

interface FormData {
  paciente: string;
  especialidad: string;
  medico: string;
  fecha: string;
  hora: string;
  duracion: string;
  tipo: string;
  observaciones: string;
}

const INITIAL: FormData = {
  paciente: '', especialidad: '', medico: '', fecha: '',
  hora: '', duracion: '30', tipo: 'Consulta Externa', observaciones: '',
};

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

interface FieldProps { label: string; required?: boolean; children: React.ReactNode }
function Field({ label, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

interface Props { onClose: () => void }

export default function NewAppointmentModal({ onClose }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (key: keyof FormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => {
        const next = { ...f, [key]: e.target.value };
        if (key === 'especialidad') next.medico = '';
        return next;
      });

  const doctors = form.especialidad ? (SPECIALTIES[form.especialidad] ?? []) : [];
  const today = new Date().toISOString().split('T')[0];

  function validate() {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.paciente.trim()) e.paciente = 'Campo obligatorio.';
    if (!form.especialidad)    e.especialidad = 'Seleccione una especialidad.';
    if (!form.medico)          e.medico = 'Seleccione un médico.';
    if (!form.fecha)           e.fecha = 'Campo obligatorio.';
    else if (form.fecha < today) e.fecha = 'La fecha no puede ser anterior a hoy.';
    if (!form.hora)            e.hora = 'Seleccione una hora.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    alert(`Cita agendada para "${form.paciente}" el ${form.fecha} a las ${form.hora} con ${form.medico}.`);
    onClose();
  }

  return (
    <ModalBase title="Agendar Nueva Cita" onClose={onClose} width="max-w-xl">
      <div className="p-6 space-y-4">

        {/* Paciente */}
        <Field label="Paciente" required>
          <input value={form.paciente} onChange={set('paciente')}
            placeholder="Buscar por nombre o DNI…"
            className={`${inputCls} ${errors.paciente ? 'border-red-400' : ''}`} />
          {errors.paciente && <p className="text-xs text-red-500 mt-0.5">{errors.paciente}</p>}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          {/* Especialidad */}
          <Field label="Especialidad" required>
            <select value={form.especialidad} onChange={set('especialidad')}
              className={`${inputCls} ${errors.especialidad ? 'border-red-400' : ''}`}>
              <option value="">Seleccionar…</option>
              {Object.keys(SPECIALTIES).map((s) => <option key={s}>{s}</option>)}
            </select>
            {errors.especialidad && <p className="text-xs text-red-500 mt-0.5">{errors.especialidad}</p>}
          </Field>

          {/* Médico */}
          <Field label="Médico" required>
            <select value={form.medico} onChange={set('medico')} disabled={!form.especialidad}
              className={`${inputCls} ${errors.medico ? 'border-red-400' : ''} disabled:bg-gray-50 disabled:text-gray-400`}>
              <option value="">Seleccionar…</option>
              {doctors.map((d) => <option key={d}>{d}</option>)}
            </select>
            {errors.medico && <p className="text-xs text-red-500 mt-0.5">{errors.medico}</p>}
          </Field>

          {/* Fecha */}
          <Field label="Fecha" required>
            <input type="date" value={form.fecha} onChange={set('fecha')} min={today}
              className={`${inputCls} ${errors.fecha ? 'border-red-400' : ''}`} />
            {errors.fecha && <p className="text-xs text-red-500 mt-0.5">{errors.fecha}</p>}
          </Field>

          {/* Hora */}
          <Field label="Hora" required>
            <select value={form.hora} onChange={set('hora')}
              className={`${inputCls} ${errors.hora ? 'border-red-400' : ''}`}>
              <option value="">Seleccionar…</option>
              {HOURS.map((h) => <option key={h}>{h}</option>)}
            </select>
            {errors.hora && <p className="text-xs text-red-500 mt-0.5">{errors.hora}</p>}
          </Field>

          {/* Duración */}
          <Field label="Duración">
            <select value={form.duracion} onChange={set('duracion')} className={inputCls}>
              {['15','20','30','45','60'].map((d) => (
                <option key={d} value={d}>{d} minutos</option>
              ))}
            </select>
          </Field>

          {/* Tipo */}
          <Field label="Tipo de Cita" required>
            <select value={form.tipo} onChange={set('tipo')} className={inputCls}>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        {/* Observaciones */}
        <Field label="Observaciones">
          <textarea value={form.observaciones} onChange={set('observaciones')}
            rows={3} placeholder="Notas adicionales para el médico…"
            className={`${inputCls} resize-none`} />
        </Field>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Agendar Cita
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
