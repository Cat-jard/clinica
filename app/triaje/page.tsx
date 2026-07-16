'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import KpiCards          from '@/components/triaje/KpiCards';
import ColaTriaje        from '@/components/triaje/ColaTriaje';
import ClasificadosTable from '@/components/triaje/ClasificadosTable';
import PriorityDonut     from '@/components/triaje/charts/PriorityDonut';
import HourlyArrivalsChart from '@/components/triaje/charts/HourlyArrivalsChart';
import TriageTimeChart   from '@/components/triaje/charts/TriageTimeChart';
import SpO2Gauge         from '@/components/triaje/charts/SpO2Gauge';
import TopMotivoChart    from '@/components/triaje/charts/TopMotivoChart';
import {
  type PacienteEspera, type PacienteClasificado,
  obtenerColaTriajeAPI, colaAPacienteEspera, listarClasificados,
} from '@/lib/vitals';

export default function TriajeDashboard() {
  const [cola, setCola]                 = useState<PacienteEspera[]>([]);
  const [clasificados, setClasificados] = useState<PacienteClasificado[]>([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    let vivo = true;
    Promise.all([obtenerColaTriajeAPI(), listarClasificados()])
      .then(([c, cl]) => { if (vivo) { setCola(c.map(colaAPacienteEspera)); setClasificados(cl); } })
      .catch((e) => { if (vivo) setError(e instanceof Error ? e.message : 'Error al cargar triaje'); })
      .finally(() => { if (vivo) setCargando(false); });
    return () => { vivo = false; };
  }, []);

  const rojo    = clasificados.filter((p) => p.prioridad === 'I-ROJO').length;
  const naranja = clasificados.filter((p) => p.prioridad === 'II-NARANJA').length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Triaje</h1>
        <p className="text-sm text-gray-400">Gestión de prioridades — Enfermería</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-5 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {cargando && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" /> Cargando datos de triaje…
        </div>
      )}

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
