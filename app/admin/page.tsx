'use client';

import { Download } from 'lucide-react';
import KpiCards from '@/components/admin/KpiCards';
import AtencionesEspecialidadChart from '@/components/admin/charts/AtencionesEspecialidadChart';
import AseguradoraPieChart from '@/components/admin/charts/AseguradoraPieChart';
import FlujoPacientesChart from '@/components/admin/charts/FlujoPacientesChart';
import DemandaHeatmap from '@/components/admin/charts/DemandaHeatmap';
import ActividadReciente from '@/components/admin/ActividadReciente';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard Ejecutivo</h1>
          <p className="text-xs text-gray-500 mt-0.5">Dra. Patricia Núñez — Directora Médica · Visión panorámica del hospital</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <Download size={14} /> Exportar Dashboard (PDF)
        </button>
      </div>

      {/* KPIs */}
      <KpiCards />

      {/* Fila: barras + pastel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AtencionesEspecialidadChart />
        </div>
        <AseguradoraPieChart />
      </div>

      {/* Fila: líneas + heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FlujoPacientesChart />
        <DemandaHeatmap />
      </div>

      {/* Actividad reciente */}
      <ActividadReciente />
    </div>
  );
}
