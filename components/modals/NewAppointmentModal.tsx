'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import ModalBase from './ModalBase';
import { listPacientesApi, listMedicosApi, Paciente, Medico } from '@/lib/recepcion';
import { createCitaApi } from '@/lib/citas';
import { useToast } from '@/context/ToastContext';

interface FormData {
  pacienteId: string;
  especialidad: string;
  medicoId: string;
  fecha: string;
  hora: string;
  duracion: string;
  tipo: string;
  observaciones: string;
}

const INITIAL: FormData = {
  pacienteId: '',
  especialidad: '',
  medicoId: '',
  fecha: '',
  hora: '',
  duracion: '30',
  tipo: 'Consulta Externa',
  observaciones: '',
};

const HOURS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
               '12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30'];

const TIPOS = ['Consulta Externa', 'Teleconsulta', 'Control', 'Emergencia', 'Procedimiento'];

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

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NewAppointmentModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  
  // Patient search states
  const [patientSearch, setPatientSearch] = useState('');
  const [patientSuggestions, setPatientSuggestions] = useState<Paciente[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    // Load doctors
    async function loadData() {
      try {
        const meds = await listMedicosApi();
        setMedicos(meds);
        
        // Extract unique specialties
        const specs = Array.from(new Set(meds.map(m => m.especialidad).filter(Boolean))) as string[];
        setEspecialidades(specs);
      } catch (err) {
        console.error('Error loading doctors:', err);
      }
    }
    loadData();
  }, []);

  // Fetch patient suggestions when typing
  useEffect(() => {
    if (patientSearch.length < 2 || selectedPatient) {
      setPatientSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const list = await listPacientesApi(patientSearch);
        setPatientSuggestions(list.slice(0, 5));
      } catch (e) {
        console.error(e);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [patientSearch, selectedPatient]);

  const set = (key: keyof FormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => {
        const next = { ...f, [key]: e.target.value };
        if (key === 'especialidad') next.medicoId = '';
        return next;
      });

  const filteredDoctors = medicos.filter(
    m => m.especialidad === form.especialidad && m.estado?.toUpperCase() === 'ACTIVO'
  );
  
  const today = new Date().toISOString().split('T')[0];

  function validate() {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.pacienteId)      e.pacienteId = 'Seleccione un paciente registrado.';
    if (!form.especialidad)    e.especialidad = 'Seleccione una especialidad.';
    if (!form.medicoId)        e.medicoId = 'Seleccione un médico.';
    if (!form.fecha)           e.fecha = 'Campo obligatorio.';
    else if (form.fecha < today) e.fecha = 'La fecha no puede ser anterior a hoy.';
    if (!form.hora)            e.hora = 'Seleccione una hora.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) { toastError('Corrija los errores antes de guardar.'); return; }
    setSubmitting(true);
    try {
      // Calculate horaFin based on horaInicio + 30 mins
      const [h, m] = form.hora.split(':').map(Number);
      const minutesTotal = h * 60 + m + parseInt(form.duracion);
      const endH = Math.floor(minutesTotal / 60).toString().padStart(2, '0');
      const endM = (minutesTotal % 60).toString().padStart(2, '0');
      const horaFin = `${endH}:${endM}`;

      const doc = medicos.find(med => med.id === Number(form.medicoId));

      await createCitaApi({
        pacienteId: form.pacienteId,
        medicoId: Number(form.medicoId),
        fechaCita: form.fecha,
        horaInicio: form.hora,
        horaFin,
        motivo: form.tipo,
        observaciones: form.observaciones || undefined,
        tipoSeguro: selectedPatient?.aseguradora || 'Particular'
      });

      success(`Cita agendada con éxito para ${selectedPatient?.nombres} ${selectedPatient?.apellidoPaterno} con el Dr. ${doc?.nombre} ${doc?.apellidos}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Error al agendar la cita.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalBase title="Agendar Nueva Cita" onClose={onClose} width="max-w-xl">
      <div className="p-6 space-y-4">

        {/* Paciente con Autocomplete */}
        <Field label="Paciente" required>
          {selectedPatient ? (
            <div className="flex items-center justify-between border border-blue-200 bg-blue-50/50 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-blue-800">
                {selectedPatient.nombres} {selectedPatient.apellidoPaterno} {selectedPatient.apellidoMaterno} ({selectedPatient.nroDocumento})
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedPatient(null);
                  setPatientSearch('');
                  setForm(f => ({ ...f, pacienteId: '' }));
                }}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Buscar paciente por nombre o DNI (escriba al menos 2 letras)…"
                className={`${inputCls} ${errors.pacienteId ? 'border-red-400' : ''}`}
              />
              {showSuggestions && patientSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {patientSuggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(p);
                        setForm(f => ({ ...f, pacienteId: p.id }));
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition-colors"
                    >
                      <div className="font-semibold text-gray-800">{p.nombres} {p.apellidoPaterno} {p.apellidoMaterno}</div>
                      <div className="text-xs text-gray-500">DNI: {p.nroDocumento} | Seguro: {p.aseguradora}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {errors.pacienteId && <p className="text-xs text-red-500 mt-0.5">{errors.pacienteId}</p>}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          {/* Especialidad */}
          <Field label="Especialidad" required>
            <select value={form.especialidad} onChange={set('especialidad')}
              className={`${inputCls} ${errors.especialidad ? 'border-red-400' : ''}`}>
              <option value="">Seleccionar…</option>
              {especialidades.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.especialidad && <p className="text-xs text-red-500 mt-0.5">{errors.especialidad}</p>}
          </Field>

          {/* Médico */}
          <Field label="Médico" required>
            <select value={form.medicoId} onChange={set('medicoId')} disabled={!form.especialidad}
              className={`${inputCls} ${errors.medicoId ? 'border-red-400' : ''} disabled:bg-gray-50 disabled:text-gray-400`}>
              <option value="">Seleccionar…</option>
              {filteredDoctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr(a). {d.nombre} {d.apellidos}
                </option>
              ))}
            </select>
            {errors.medicoId && <p className="text-xs text-red-500 mt-0.5">{errors.medicoId}</p>}
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
              {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
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
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
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
          <button onClick={onClose} disabled={submitting}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            {submitting ? 'Agendando…' : 'Agendar Cita'}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
