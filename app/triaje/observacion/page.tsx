'use client';

import { useState } from 'react';
import ObservacionTable from '@/components/triaje/ObservacionTable';
import { PacienteObservacion } from '@/lib/vitals';

const now = new Date();
const MOCK: PacienteObservacion[] = [
  {
    id: 'obs-1',
    nombre: 'Juan Pérez García',
    horaIngreso: new Date(now.getTime() - 45 * 60000),
    prioridad: 'III-AMARILLO',
    motivo: 'Dolor abdominal — pendiente resultado de laboratorio',
    kardex: [
      {
        id: 'k-1',
        pacienteId: 'obs-1',
        fechaHora: new Date(now.getTime() - 40 * 60000).toISOString(),
        ingresosHidricos: 500,
        egresosHidricos: 200,
        medicamentos: [{ nombre: 'Ketorolaco', dosis: '30mg', via: 'IV', hora: '09:15' }],
        evolucion: 'Paciente estable, dolor 6/10, tolera posición semisentada.',
        firmado: true,
        firmadoPor: 'Ana Ríos',
      },
    ],
  },
  {
    id: 'obs-2',
    nombre: 'María López Ruiz',
    horaIngreso: new Date(now.getTime() - 20 * 60000),
    prioridad: 'II-NARANJA',
    motivo: 'Dificultad respiratoria — SpO₂ 91% al ingreso',
    kardex: [],
  },
];

export default function ObservacionPage() {
  const [pacientes, setPacientes] = useState<PacienteObservacion[]>(MOCK);
  const pendingCount = pacientes.reduce(
    (acc, p) => acc + p.kardex.filter((k) => !k.firmado).length,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes en Observación</h1>
          <p className="text-sm text-gray-400">Monitoreo activo y registro de evolución</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2 rounded-xl">
            <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{pendingCount}</span>
            <span className="text-sm text-red-600 font-medium">Registros Kardex sin firmar</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'En Observación',        value: pacientes.length,                                                  color: 'text-blue-600'  },
          { label: 'Con Kardex Firmado',    value: pacientes.filter((p) => p.kardex.some((k) => k.firmado)).length,  color: 'text-green-600' },
          { label: 'Kardex Sin Firmar',     value: pendingCount,                                                      color: 'text-red-500'   },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <ObservacionTable pacientes={pacientes} onUpdate={setPacientes} />
    </div>
  );
}
