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
import {
  getTriajeKPIsApi, getDistribucionPrioridadesApi,
  getLlegadasPorHoraApi, getTopMotivosApi, getSpo2PromedioApi,
  type DistribucionPrioridad, type LlegadaPorHora,
  type TopMotivo,
} from '@/lib/triaje';

export default function TriajeDashboard() {
  const [cola, setCola]                 = useState<PacienteEspera[]>([]);
  const [clasificados, setClasificados] = useState<PacienteClasificado[]>([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState('');

  const [kpi, setKpi]                   = useState({ totalTriajes: 0, rojo: 0, naranja: 0, amarillo: 0, verde: 0, azul: 0 });
  const [distPrioridad, setDistPrioridad] = useState<DistribucionPrioridad[]>([]);
  const [llegadas, setLlegadas]         = useState<LlegadaPorHora[]>([]);
  const [topMotivos, setTopMotivos]     = useState<TopMotivo[]>([]);
  const [spo2, setSpo2]                 = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;
    const hoy = new Date().toLocaleDateString('en-CA');

    Promise.all([
      obtenerColaTriajeAPI(),
      listarClasificados(),
      getTriajeKPIsApi(hoy),
      getDistribucionPrioridadesApi(hoy),
      getLlegadasPorHoraApi(hoy),
      getTopMotivosApi(hoy),
      getSpo2PromedioApi(hoy),
      import('@/lib/recepcion').then(m => m.listarPacientes('', 500)).catch(() => []),
    ])
      .then(([c, cl, kpiData, dist, lleg, top, spo2Data, pacientesList]) => {
        if (!vivo) return;
        const mappedCola = c.map(colaAPacienteEspera).map((item) => {
          const patient = (pacientesList || []).find((p) => p.id === item.id);
          if (patient) {
            item.fechaNac = patient.fechaNacimiento;
          }
          return item;
        });
        setCola(mappedCola);
        setClasificados(cl);
        setKpi(kpiData);
        setDistPrioridad(dist);
        setLlegadas(lleg);
        setTopMotivos(top);
        setSpo2(spo2Data.spo2Promedio);
      })
      .catch((e) => { if (vivo) setError(e instanceof Error ? e.message : 'Error al cargar triaje'); })
      .finally(() => { if (vivo) setCargando(false); });

    const interval = setInterval(() => {
      const ahora = new Date().toLocaleDateString('en-CA');
      getTriajeKPIsApi(ahora).then((d) => { if (vivo) setKpi(d); });
    }, 30000);

    return () => { vivo = false; clearInterval(interval); };
  }, []);

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

      <KpiCards
        enEspera={cola.length}
        rojo={kpi.rojo}
        naranja={kpi.naranja}
        tiempoPromedio={kpi.totalTriajes > 0 ? Math.round(kpi.totalTriajes / (kpi.rojo + kpi.naranja + kpi.amarillo + kpi.verde + kpi.azul || 1)) : 0}
      />

      {/* Gráficas fila 1 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
        <PriorityDonut data={distPrioridad} />
        <SpO2Gauge spo2={spo2 ?? 0} />
        <TopMotivoChart data={topMotivos} />
      </div>

      {/* Gráficas fila 2 */}
      <div className="grid grid-cols-2 gap-4">
        <HourlyArrivalsChart data={llegadas} />
        <TriageTimeChart />
      </div>

      <ColaTriaje pacientes={cola} />
      <ClasificadosTable pacientes={clasificados} />
    </div>
  );
}
