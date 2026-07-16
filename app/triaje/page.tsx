'use client';

import { useState, useEffect } from 'react';
import KpiCards from '@/components/triaje/KpiCards';
import ColaTriaje from '@/components/triaje/ColaTriaje';
import ClasificadosTable from '@/components/triaje/ClasificadosTable';
import PriorityDonut from '@/components/triaje/charts/PriorityDonut';
import HourlyArrivalsChart from '@/components/triaje/charts/HourlyArrivalsChart';
import TriageTimeChart from '@/components/triaje/charts/TriageTimeChart';
import SpO2Gauge from '@/components/triaje/charts/SpO2Gauge';
import TopMotivoChart from '@/components/triaje/charts/TopMotivoChart';
import { PacienteEspera, PacienteClasificado } from '@/lib/vitals';
import { getColaTriajeApi, listRegistrosTriajeApi, getTriajeKPIsApi, type TriajeKPIs } from '@/lib/triaje';

export default function TriajeDashboard() {
  const [cola, setCola] = useState<PacienteEspera[]>([]);
  const [clasificados, setClasificados] = useState<PacienteClasificado[]>([]);
  const [registrosCount, setRegistrosCount] = useState(0);
  const [kpis, setKpis] = useState<TriajeKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const [colaData, registros, kpiData] = await Promise.all([
          getColaTriajeApi(today),
          listRegistrosTriajeApi(today),
          getTriajeKPIsApi(today),
        ]);

        setCola(colaData.map((c) => ({
          id: c.id,
          ticket: c.ticket,
          nombre: c.pacienteNombre,
          dni: '',
          fechaNac: '',
          horaLlegada: c.horaLlegada,
          motivo: c.motivo || '',
        })));

        setRegistrosCount(registros.length);
        setClasificados(registros.map((r) => ({
          id: r.id,
          ticket: r.ticket,
          nombre: r.pacienteNombre,
          prioridad: r.prioridad,
          destino: (r as any).destino || '',
          horaClasificado: new Date(r.timestamp || Date.now()),
          estado: 'Esperando',
        })));

        setKpis(kpiData);
      } catch (err) {
        console.error('Error loading triaje data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const rojo = kpis?.rojo ?? clasificados.filter((p) => p.prioridad === 'I-ROJO').length;
  const naranja = kpis?.naranja ?? clasificados.filter((p) => p.prioridad === 'II-NARANJA').length;
  const tiempoPromedio = kpis ? Math.round(kpis.totalTriajes / Math.max(1, registrosCount)) : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Triaje</h1>
        <p className="text-sm text-gray-400">Gestión de prioridades — Enfermería</p>
      </div>

      <KpiCards enEspera={cola.length} rojo={rojo} naranja={naranja} tiempoPromedio={tiempoPromedio} />

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
