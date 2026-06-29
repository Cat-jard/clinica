'use client';

import { useState } from 'react';
import KpiCards from '@/components/laboratorio/KpiCards';
import OrdenesPendientesTable from '@/components/laboratorio/OrdenesPendientesTable';
import ResultadosCriticosTable from '@/components/laboratorio/ResultadosCriticosTable';
import RegistroMuestraModal from '@/components/laboratorio/RegistroMuestraModal';
import IngresoResultadosModal from '@/components/laboratorio/IngresoResultadosModal';
import type { OrdenLab, ResultadoCritico } from '@/lib/laboratorio';
import { MOCK_ORDENES_LAB, MOCK_RESULTADOS_CRITICOS, MOCK_CONTROLES } from '@/lib/laboratorio';

export default function LaboratorioDashboard() {
  const [ordenes,   setOrdenes]   = useState<OrdenLab[]>(MOCK_ORDENES_LAB);
  const [criticos,  setCriticos]  = useState<ResultadoCritico[]>(MOCK_RESULTADOS_CRITICOS);
  const [ordenMuestra,    setOrdenMuestra]    = useState<OrdenLab | null>(null);
  const [ordenResultados, setOrdenResultados] = useState<OrdenLab | null>(null);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function handleRegistrarMuestra(ordenId: string) {
    setOrdenes(prev => prev.map(o =>
      o.id === ordenId ? { ...o, estado: 'Muestra Registrada' } : o
    ));
    setOrdenMuestra(null);
    showToast('✓ Muestra registrada correctamente');
  }

  function handleValidarResultados(ordenId: string) {
    setOrdenes(prev => prev.map(o =>
      o.id === ordenId ? { ...o, estado: 'Validado' } : o
    ));
    setOrdenResultados(null);
    showToast('✓ Resultados validados y enviados a la Historia Clínica');
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
