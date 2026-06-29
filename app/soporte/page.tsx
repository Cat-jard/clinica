import KpiCards from '@/components/soporte/KpiCards';
import RecursosChart from '@/components/soporte/charts/RecursosChart';
import TraficoRedChart from '@/components/soporte/charts/TraficoRedChart';
import EstadoServicios from '@/components/soporte/EstadoServicios';
import LogsRecientes from '@/components/soporte/LogsRecientes';
import AlertasActivas from '@/components/soporte/AlertasActivas';

export default function SoporteDashboard() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Monitoreo Técnico</h1>
        <p className="text-xs text-gray-500 mt-0.5">Carlos Yupanqui — Jefe de Soporte TI · Centro de comando del sistema</p>
      </div>

      {/* KPIs técnicos */}
      <KpiCards />

      {/* Alertas activas (persistente — backup fallido > 24h) */}
      <AlertasActivas />

      {/* Recursos en tiempo real */}
      <RecursosChart />

      {/* Tráfico + servicios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TraficoRedChart />
        <EstadoServicios />
      </div>

      {/* Logs recientes */}
      <LogsRecientes />
    </div>
  );
}
