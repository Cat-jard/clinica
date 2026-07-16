'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import KpiCards from '@/components/laboratorio/KpiCards';
import OrdenesPendientesTable from '@/components/laboratorio/OrdenesPendientesTable';
import ResultadosCriticosTable from '@/components/laboratorio/ResultadosCriticosTable';
import RegistroMuestraModal from '@/components/laboratorio/RegistroMuestraModal';
import IngresoResultadosModal from '@/components/laboratorio/IngresoResultadosModal';
import type { OrdenLab, ResultadoCritico, ValorResultado } from '@/lib/laboratorio';
import {
  MOCK_RESULTADOS_CRITICOS, MOCK_CONTROLES,
  listarOrdenesLab, registrarMuestraLab, ingresarResultadosLab, validarOrdenLab,
} from '@/lib/laboratorio';

export default function LaboratorioDashboard() {
  const [ordenes,   setOrdenes]   = useState<OrdenLab[]>([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState('');
  // Los resultados críticos y controles de calidad aún no tienen backend → mock.
  const [criticos,  setCriticos]  = useState<ResultadoCritico[]>(MOCK_RESULTADOS_CRITICOS);
  const [ordenMuestra,    setOrdenMuestra]    = useState<OrdenLab | null>(null);
  const [ordenResultados, setOrdenResultados] = useState<OrdenLab | null>(null);
  const [toast, setToast] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setOrdenes(await listarOrdenesLab());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar órdenes');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function handleRegistrarMuestra(
    ordenId: string,
    payload: { origenMuestra: string; condicion: string; observaciones?: string },
  ) {
    try {
      await registrarMuestraLab(ordenId, payload);
      setOrdenMuestra(null);
      showToast('✓ Muestra registrada correctamente');
      await cargar();
    } catch (e) {
      showToast(e instanceof Error ? `✗ ${e.message}` : '✗ Error al registrar la muestra');
    }
  }

  async function handleValidarResultados(ordenId: string, resultados: ValorResultado[]) {
    try {
      await ingresarResultadosLab(ordenId, resultados);
      await validarOrdenLab(ordenId);
      setOrdenResultados(null);
      showToast('✓ Resultados validados y enviados a la Historia Clínica');
      await cargar();
    } catch (e) {
      showToast(e instanceof Error ? `✗ ${e.message}` : '✗ Error al validar');
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
        <div className="flex items-center gap-2 px-5 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
          <AlertCircle size={15} /> {error}
          <button onClick={cargar} className="ml-auto text-xs font-medium underline">Reintentar</button>
        </div>
      )}

      {/* KPIs */}
      <KpiCards ordenes={ordenes} criticos={criticos} controles={MOCK_CONTROLES} />

      {/* Alertas de resultados críticos */}
      <ResultadosCriticosTable criticos={criticos} onNotificar={handleNotificarMedico} />

      {/* Cola de órdenes */}
      {cargando ? (
        <div className="py-12 flex items-center justify-center gap-2 text-sm text-gray-400">
          <Loader2 size={16} className="animate-spin" /> Cargando órdenes…
        </div>
      ) : (
        <OrdenesPendientesTable
          ordenes={ordenes}
          onRegistrarMuestra={setOrdenMuestra}
          onIngresarResultados={setOrdenResultados}
        />
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
