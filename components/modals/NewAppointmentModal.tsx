'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import ModalBase from './ModalBase';
import { useToast } from '@/context/ToastContext';
import { crearCita } from '@/lib/citas';
import { listarPacientes, nombreCompleto, type PacienteResumen } from '@/lib/recepcion';
import { listarMedicos, nombreMedico, type Medico } from '@/lib/medicos';

const HOURS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

const TIPOS = ['Consulta Externa', 'Teleconsulta', 'Control', 'Emergencia', 'Procedimiento'];

interface FormData {
  pacienteId: string;
  medicoId: string;
  fecha: string;
  hora: string;
  duracion: string;
  tipo: string;
  observaciones: string;
}

const INITIAL: FormData = {
  pacienteId: '', medicoId: '', fecha: '',
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

/** "HH:MM" + minutos → "HH:MM:SS". */
function sumarMinutos(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + mins;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}:00`;
}

interface Props { onClose: () => void; onCreated?: () => void }

export default function NewAppointmentModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [pacientes, setPacientes] = useState<PacienteResumen[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [guardando, setGuardando] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    listarPacientes().then(setPacientes).catch(() => toastError('No se pudieron cargar los pacientes.'));
    listarMedicos().then(setMedicos).catch(() => toastError('No se pudieron cargar los médicos.'));
  }, [toastError]);

  const set = (key: keyof FormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const localDate = new Date();
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  function validate() {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.pacienteId) e.pacienteId = 'Seleccione un paciente.';
    if (!form.medicoId)   e.medicoId = 'Seleccione un médico.';
    if (!form.fecha)      e.fecha = 'Campo obligatorio.';
    else if (form.fecha < today) e.fecha = 'La fecha no puede ser anterior a hoy.';
    if (!form.hora)       e.hora = 'Seleccione una hora.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const paciente = pacientes.find((p) => p.id === form.pacienteId);
    const medico = medicos.find((m) => m.id === form.medicoId);
    if (!paciente || !medico) return;

    setGuardando(true);
    try {
      await crearCita({
        pacienteId: paciente.id,
        medicoId: Number(medico.id),
        fechaCita: form.fecha,
        horaInicio: `${form.hora}:00`,
        horaFin: sumarMinutos(form.hora, Number(form.duracion)),
        motivo: form.tipo,
        observaciones: form.observaciones || undefined,
        tipoSeguro: paciente.aseguradora,
        numeroHistoria: paciente.nroHistoria,
        pacienteNombre: nombreCompleto(paciente),
        medicoNombre: nombreMedico(medico),
      });
      success(`Cita agendada para "${nombreCompleto(paciente)}" el ${form.fecha} a las ${form.hora}.`);
      onCreated?.();
      onClose();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'No se pudo agendar la cita.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ModalBase title="Agendar Nueva Cita" onClose={onClose} width="max-w-xl">
      <div className="p-6 space-y-4">

        {/* Paciente */}
        <Field label="Paciente" required>
          <select value={form.pacienteId} onChange={set('pacienteId')}
            className={`${inputCls} ${errors.pacienteId ? 'border-red-400' : ''}`}>
            <option value="">Seleccionar paciente…</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>{nombreCompleto(p)} — {p.nroDocumento}</option>
            ))}
          </select>
          {errors.pacienteId && <p className="text-xs text-red-500 mt-0.5">{errors.pacienteId}</p>}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          {/* Médico */}
          <div className="col-span-2">
            <Field label="Médico" required>
              <select value={form.medicoId} onChange={set('medicoId')}
                className={`${inputCls} ${errors.medicoId ? 'border-red-400' : ''}`}>
                <option value="">Seleccionar médico…</option>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {nombreMedico(m)}{m.especialidad ? ` — ${m.especialidad}` : ''}
                  </option>
                ))}
              </select>
              {errors.medicoId && <p className="text-xs text-red-500 mt-0.5">{errors.medicoId}</p>}
            </Field>
          </div>

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
          <button onClick={onClose} disabled={guardando}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={guardando}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            {guardando ? 'Agendando…' : 'Agendar Cita'}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
