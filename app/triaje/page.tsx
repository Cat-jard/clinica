'use client';

import { useState } from 'react';
import KpiCards          from '@/components/triaje/KpiCards';
import ColaTriaje        from '@/components/triaje/ColaTriaje';
import ClasificadosTable from '@/components/triaje/ClasificadosTable';
import PriorityDonut     from '@/components/triaje/charts/PriorityDonut';
import HourlyArrivalsChart from '@/components/triaje/charts/HourlyArrivalsChart';
import TriageTimeChart   from '@/components/triaje/charts/TriageTimeChart';
import SpO2Gauge         from '@/components/triaje/charts/SpO2Gauge';
import TopMotivoChart    from '@/components/triaje/charts/TopMotivoChart';
import { PacienteEspera, PacienteClasificado } from '@/lib/vitals';

const MOCK_COLA: PacienteEspera[] = [
  { id: '1', ticket: 'T-001', nombre: 'Carlos Rodríguez',   dni: '34567890', fechaNac: '1978-11-08', horaLlegada: '08:05', motivo: 'Dolor abdominal agudo'     },
  { id: '2', ticket: 'T-002', nombre: 'Ana Fernández Díaz', dni: '45678901', fechaNac: '1995-01-30', horaLlegada: '08:42', motivo: 'Dificultad para respirar'  },
  { id: '3', ticket: 'T-003', nombre: 'Pedro Martínez',     dni: '56789012', fechaNac: '1982-06-14', horaLlegada: '09:10', motivo: 'Cefalea intensa'            },
];

const now = new Date();
const MOCK_CLASIFICADOS: PacienteClasificado[] = [
  { id: '4', ticket: 'T-004', nombre: 'Lucía Torres Salas', prioridad: 'II-NARANJA',   destino: 'Emergencias',             horaClasificado: new Date(now.getTime() - 8  * 60000), estado: 'Esperando' },
  { id: '5', ticket: 'T-005', nombre: 'Roberto Saenz',      prioridad: 'III-AMARILLO', destino: 'Consultorio prioritario', horaClasificado: new Date(now.getTime() - 35 * 60000), estado: 'Esperando' },
  { id: '6', ticket: 'T-006', nombre: 'Carmen Villanueva',  prioridad: 'IV-VERDE',     destino: 'Consultorio normal',      horaClasificado: new Date(now.getTime() - 90 * 60000), estado: 'Esperando' },
];

export default function TriajeDashboard() {
  const [cola]         = useState<PacienteEspera[]>(MOCK_COLA);
  const [clasificados] = useState<PacienteClasificado[]>(MOCK_CLASIFICADOS);

  const rojo    = clasificados.filter((p) => p.prioridad === 'I-ROJO').length;
  const naranja = clasificados.filter((p) => p.prioridad === 'II-NARANJA').length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Triaje</h1>
        <p className="text-sm text-gray-400">Gestión de prioridades — Enfermería</p>
      </div>

      <KpiCards enEspera={cola.length} rojo={rojo} naranja={naranja} tiempoPromedio={6} />

      {/* Gráficas fila 1 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
        <PriorityDonut />
        <SpO2Gauge />
        <TopMotivoChart />
      </div>

      {/* Gráficas fila 2 */}
      <div className="grid grid-cols-2 gap-4">
        <HourlyArrivalsChart />
        <TriageTimeChart />
      </div>

      <ColaTriaje pacientes={cola} />
      <ClasificadosTable pacientes={clasificados} />
    </div>
  );
}
