'use client';

import { useCallback, useEffect, useState } from 'react';
import KpiCards from '@/components/laboratorio/KpiCards';
import OrdenesPendientesTable from '@/components/laboratorio/OrdenesPendientesTable';
import ResultadosCriticosTable from '@/components/laboratorio/ResultadosCriticosTable';
import RegistroMuestraModal from '@/components/laboratorio/RegistroMuestraModal';
import IngresoResultadosModal from '@/components/laboratorio/IngresoResultadosModal';
import type { OrdenLab, ResultadoCritico, ValorResultado } from '@/lib/laboratorio';
import { MOCK_CONTROLES } from '@/lib/laboratorio';
import {
  listarOrdenesLab,
  registrarMuestraLab,
  ingresarResultadosLab,
  validarOrdenLab,
} from '@/lib/api/laboratorio';

export default function LaboratorioDashboard() {
  const [ordenes,   setOrdenes]   = useState<OrdenLab[]>([]);
  const [criticos,  setCriticos]  = useState<ResultadoCritico[]>([]);
  const [ordenMuestra,    setOrdenMuestra]    = useState<OrdenLab | null>(null);
  const [ordenResultados, setOrdenResultados] = useState<OrdenLab | null>(null);
  const [toast, setToast] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  const cargarOrdenes = useCallback(async () => {
    try {
      setError('');
      const data = await listarOrdenesLab();
      setOrdenes(data);
    } catch {
      setError('No se pudo conectar con el servicio de laboratorio');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarOrdenes();
  }, [cargarOrdenes]);

  async function handleRegistrarMuestra(
    ordenId: string,
    data: { origenMuestra: string; condicion: string; observaciones: string },
  ) {
    try {
      await registrarMuestraLab(ordenId, data);
      await cargarOrdenes();
      setOrdenMuestra(null);
      showToast('✓ Muestra registrada correctamente');
    } catch {
      showToast('✗ Error al registrar la muestra');
    }
  }

  async function handleValidarResultados(ordenId: string, resultados: ValorResultado[]) {
    try {
      await ingresarResultadosLab(ordenId, resultados);
      await validarOrdenLab(ordenId);
      await cargarOrdenes();
      setOrdenResultados(null);
      showToast('✓ Resultados validados y enviados a la Historia Clínica');
    } catch {
      showToast('✗ Error al validar los resultados');
    }
  }

  function handleNotificarMedico(criticoId: string) {
    setCriticos(prev => prev.map(c =>
      c.id === criticoId ? { ...c, notificado: true } : c
    ));
    showToast('✓ Médico notificado del resultado crítico');
  }

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Panel del Laboratorio</h1>
        <p className="text-xs text-gray-500 mt-0.5">María Torres — Tecnóloga Médica · Lab. de Patología Clínica</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error} — verifique que el api-gateway (8080) y laboratorio-service (8084) estén activos.
        </div>
      )}

      {cargando ? (
        <p className="text-sm text-gray-400 text-center py-12">Cargando cola de órdenes…</p>
      ) : (
        <>
          {/* KPIs */}
          <KpiCards ordenes={ordenes} criticos={criticos} controles={MOCK_CONTROLES} />

          {/* Alertas de resultados críticos */}
          <ResultadosCriticosTable criticos={criticos} onNotificar={handleNotificarMedico} />

          {/* Cola de órdenes */}
          <OrdenesPendientesTable
            ordenes={ordenes}
            onRegistrarMuestra={setOrdenMuestra}
            onIngresarResultados={setOrdenResultados}
          />
        </>
      )}

      {/* Modales */}
      {ordenMuestra && (
        <RegistroMuestraModal
          orden={ordenMuestra}
          onClose={() => setOrdenMuestra(null)}
          onRegistrar={handleRegistrarMuestra}
        />
      )}
      {ordenResultados && (
        <IngresoResultadosModal
          orden={ordenResultados}
          onClose={() => setOrdenResultados(null)}
          onValidar={handleValidarResultados}
        />
      )}
    </div>
  );
}
