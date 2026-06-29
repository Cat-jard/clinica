'use client';

import { useState, ChangeEvent } from 'react';
import ModalBase from './ModalBase';
import ConsentModal from './ConsentModal';
import { useToast } from '@/context/ToastContext';
import { calcAge } from '@/lib/format';

interface FormData {
  tipoDocumento: string;
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  email: string;
  direccion: string;
}

const INITIAL: FormData = {
  tipoDocumento: 'DNI', dni: '', nombres: '', apellidoPaterno: '',
  apellidoMaterno: '', fechaNacimiento: '', sexo: '', telefono: '', email: '', direccion: '',
};

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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

export default function NewPatientModal({ onClose }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showConsent, setShowConsent] = useState(false);
  const { success, error: toastError } = useToast();

  const set = (key: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const fullName = `${form.nombres} ${form.apellidoPaterno} ${form.apellidoMaterno}`.trim();

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (form.tipoDocumento === 'DNI' && !/^\d{8}$/.test(form.dni))
      e.dni = 'El DNI debe tener exactamente 8 dígitos.';
    if (!form.nombres.trim())         e.nombres = 'Campo obligatorio.';
    if (!form.apellidoPaterno.trim()) e.apellidoPaterno = 'Campo obligatorio.';
    if (!form.apellidoMaterno.trim()) e.apellidoMaterno = 'Campo obligatorio.';
    if (!form.fechaNacimiento)        e.fechaNacimiento = 'Campo obligatorio.';
    else if (new Date(form.fechaNacimiento) > new Date())
      e.fechaNacimiento = 'La fecha no puede ser futura.';
    if (!form.sexo)                   e.sexo = 'Seleccione una opción.';
    if (!/^\d{9}$/.test(form.telefono)) e.telefono = 'El teléfono debe tener 9 dígitos.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) { toastError('Corrija los errores antes de guardar.'); return; }
    success(`Paciente "${fullName}" registrado correctamente.`);
    onClose();
  }

  function handleSaveAndConsent() {
    if (!validate()) { toastError('Corrija los errores antes de continuar.'); return; }
    setShowConsent(true);
  }

  if (showConsent) {
    return (
      <ConsentModal
        patientName={fullName}
        onClose={() => setShowConsent(false)}
        onAccepted={() => { onClose(); }}
      />
    );
  }

  return (
    <ModalBase title="Registrar Nuevo Paciente" onClose={onClose} width="max-w-2xl">
      <div className="p-6 space-y-5">

        {/* Identificación */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
            Datos de Identificación
          </h3>
          <div className="grid grid-cols-2 gap-3">

            <Field label="Tipo de Documento" required>
              <select value={form.tipoDocumento} onChange={set('tipoDocumento')} className={inputCls}>
                <option>DNI</option>
                <option>Carné de Extranjería</option>
                <option>Pasaporte</option>
              </select>
            </Field>

            <Field label="N° de Documento" required>
              <input value={form.dni} onChange={set('dni')} placeholder="Ej: 12345678"
                maxLength={form.tipoDocumento === 'DNI' ? 8 : 20}
                aria-label="Número de documento"
                className={`${inputCls} ${errors.dni ? 'border-red-400' : ''}`} />
              {errors.dni && <p className="text-xs text-red-500 mt-0.5">{errors.dni}</p>}
            </Field>

            <Field label="Nombres" required>
              <input value={form.nombres} onChange={set('nombres')} placeholder="Ej: Juan Carlos"
                aria-label="Nombres del paciente"
                className={`${inputCls} ${errors.nombres ? 'border-red-400' : ''}`} />
              {errors.nombres && <p className="text-xs text-red-500 mt-0.5">{errors.nombres}</p>}
            </Field>

            <Field label="Apellido Paterno" required>
              <input value={form.apellidoPaterno} onChange={set('apellidoPaterno')} placeholder="Ej: Pérez"
                aria-label="Apellido paterno"
                className={`${inputCls} ${errors.apellidoPaterno ? 'border-red-400' : ''}`} />
              {errors.apellidoPaterno && <p className="text-xs text-red-500 mt-0.5">{errors.apellidoPaterno}</p>}
            </Field>

            <Field label="Apellido Materno" required>
              <input value={form.apellidoMaterno} onChange={set('apellidoMaterno')} placeholder="Ej: García"
                aria-label="Apellido materno"
                className={`${inputCls} ${errors.apellidoMaterno ? 'border-red-400' : ''}`} />
              {errors.apellidoMaterno && <p className="text-xs text-red-500 mt-0.5">{errors.apellidoMaterno}</p>}
            </Field>

            <Field label="Fecha de Nacimiento" required>
              <div className="relative">
                <input type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')}
                  max={new Date().toISOString().split('T')[0]}
                  aria-label="Fecha de nacimiento"
                  className={`${inputCls} ${errors.fechaNacimiento ? 'border-red-400' : ''}`} />
                {form.fechaNacimiento && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-medium pointer-events-none">
                    {calcAge(form.fechaNacimiento)} años
                  </span>
                )}
              </div>
              {errors.fechaNacimiento && <p className="text-xs text-red-500 mt-0.5">{errors.fechaNacimiento}</p>}
            </Field>

            <div className="col-span-2">
              <Field label="Sexo" required>
                <div className="flex gap-4 mt-1">
                  {['Masculino', 'Femenino'].map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sexo" value={s}
                        checked={form.sexo === s} onChange={set('sexo')} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{s}</span>
                    </label>
                  ))}
                </div>
                {errors.sexo && <p className="text-xs text-red-500 mt-0.5">{errors.sexo}</p>}
              </Field>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
            Datos de Contacto
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono Celular" required>
              <input value={form.telefono} onChange={set('telefono')} placeholder="Ej: 987654321"
                maxLength={9} aria-label="Teléfono celular"
                className={`${inputCls} ${errors.telefono ? 'border-red-400' : ''}`} />
              {errors.telefono && <p className="text-xs text-red-500 mt-0.5">{errors.telefono}</p>}
            </Field>
            <Field label="Correo Electrónico">
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="correo@gmail.com" aria-label="Correo electrónico" className={inputCls} />
            </Field>
            <div className="col-span-2">
              <Field label="Dirección">
                <input value={form.direccion} onChange={set('direccion')}
                  placeholder="Av. Principal 123, Lima" aria-label="Dirección" className={inputCls} />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Guardar
          </button>
          <button onClick={handleSaveAndConsent}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Guardar y Solicitar Consentimiento
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
