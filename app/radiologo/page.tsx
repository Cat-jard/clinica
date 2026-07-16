'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import KpiCards from '@/components/radiologo/KpiCards';
import UrgenciasTable from '@/components/radiologo/UrgenciasTable';
import ColaLecturaTable from '@/components/radiologo/ColaLecturaTable';
import { listarEstudios, type EstudioImagen } from '@/lib/radiologia';

export default function RadiologoDashboard() {
  const [estudios, setEstudios] = useState<EstudioImagen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;
    listarEstudios()
      .then((e) => { if (vivo) setEstudios(e); })
      .catch((e) => { if (vivo) setError(e instanceof Error ? e.message : 'Error al cargar estudios'); })
      .finally(() => { if (vivo) setCargando(false); });
    return () => { vivo = false; };
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Panel de Diagnóstico por Imágenes</h1>
        <p className="text-xs text-gray-500 mt-0.5">Dr. Ricardo Mendoza — Médico Radiólogo · Servicio de Imágenes</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-5 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {cargando ? (
        <div className="py-12 flex items-center justify-center gap-2 text-sm text-gray-400">
          <Loader2 size={16} className="animate-spin" /> Cargando estudios…
        </div>
      ) : (
        <>
          <KpiCards estudios={estudios} />
          <UrgenciasTable estudios={estudios} />
          <ColaLecturaTable estudios={estudios} />
        </>
      )}
    </div>
  );
}
