'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import VisorDICOM from '@/components/radiologo/VisorDICOM';
import InformeRadiologico from '@/components/radiologo/InformeRadiologico';
import type { EstudioImagen, InformeRadiologico as TInforme } from '@/lib/radiologia';
import {
  obtenerEstudio, iniciarEstudio, guardarBorradorEstudio, firmarEstudio,
} from '@/lib/radiologia';

export default function LecturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [estudio, setEstudio] = useState<EstudioImagen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        let e = await obtenerEstudio(id);
        // Al abrir un estudio pendiente, se marca el inicio de la lectura.
        if (e.estado === 'Pendiente') {
          try { e = await iniciarEstudio(id); } catch { /* no bloquea la lectura */ }
        }
        if (vivo) setEstudio(e);
      } catch (err) {
        if (vivo) setError(err instanceof Error ? err.message : 'No se pudo cargar el estudio');
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => { vivo = false; };
  }, [id]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function handleGuardarBorrador(informe: TInforme) {
    try {
      setEstudio(await guardarBorradorEstudio(id, informe));
      showToast('✓ Borrador guardado correctamente');
    } catch (e) {
      showToast(e instanceof Error ? `✗ ${e.message}` : '✗ Error al guardar el borrador');
    }
  }

  async function handleFirmar(informe: TInforme, urgente: boolean) {
    try {
      setEstudio(await firmarEstudio(id, informe, urgente));
      showToast(urgente
        ? '✓ Informe firmado y alerta URGENTE enviada al médico tratante'
        : '✓ Informe firmado y enviado a la Historia Clínica');
    } catch (e) {
      showToast(e instanceof Error ? `✗ ${e.message}` : '✗ Error al firmar el informe');
    }
  }

  if (cargando) {
    return (
      <div className="px-4 py-16 flex items-center justify-center gap-2 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin" /> Cargando estudio…
      </div>
    );
  }

  if (error || !estudio) {
    return (
      <div className="px-4 py-16 flex flex-col items-center gap-3 text-center">
        <AlertCircle size={28} className="text-red-500" />
        <p className="text-sm text-gray-600">{error || 'Estudio no encontrado.'}</p>
        <Link href="/radiologo" className="text-sm text-blue-600 hover:underline">← Volver al panel</Link>
      </div>
    );
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
