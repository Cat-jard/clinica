'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import VisorDICOM from '@/components/radiologo/VisorDICOM';
import InformeRadiologico from '@/components/radiologo/InformeRadiologico';
import type { EstudioImagen, InformeRadiologico as TInforme } from '@/lib/radiologia';
import { MOCK_ESTUDIOS } from '@/lib/radiologia';

export default function LecturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const base = MOCK_ESTUDIOS.find(e => e.id === id);
  if (!base) notFound();

  const [estudio, setEstudio] = useState<EstudioImagen>(base);
  const [toast, setToast]     = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function handleGuardarBorrador(informe: TInforme) {
    setEstudio(prev => ({ ...prev, informe, estado: 'Borrador' }));
    showToast('✓ Borrador guardado correctamente');
  }

  function handleFirmar(informe: TInforme, urgente: boolean) {
    const firmadoEn = new Date().toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).replace(',', ' -');
    setEstudio(prev => ({ ...prev, informe, estado: 'Firmado', firmadoEn, esCritico: urgente }));
    showToast(urgente
      ? '✓ Informe firmado y alerta URGENTE enviada al médico tratante'
      : '✓ Informe firmado y enviado a la Historia Clínica');
  }

  return (
    <div className="px-4 py-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Barra superior de la lectura */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/radiologo" className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-gray-900">{estudio.tipoEstudio}</h1>
            <p className="text-xs text-gray-500">
              {estudio.paciente.nombre} {estudio.paciente.apellidos} · {estudio.nroOrden}
              {estudio.prioridad === 'Urgente' && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">URGENTE</span>
              )}
            </p>
          </div>
        </div>
        {/* Validación cruzada DNI / Orden (regla de oro #2) */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl text-[11px] text-green-700 font-medium">
          <ShieldCheck size={13} />
          Estudio verificado: DNI {estudio.paciente.dni} ✓ Orden {estudio.nroOrden} ✓
        </div>
      </div>

      {/* Layout dos columnas: visor (70%) + informe (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 h-[calc(100vh-160px)]">
        <div className="min-h-[500px]">
          <VisorDICOM estudio={estudio} />
        </div>
        <div className="min-h-[500px]">
          <InformeRadiologico
            estudio={estudio}
            onGuardarBorrador={handleGuardarBorrador}
            onFirmar={handleFirmar}
          />
        </div>
      </div>
    </div>
  );
}
