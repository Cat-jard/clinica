'use client';

import { useCallback, useEffect, useState } from 'react';
import KpiCards from '@/components/radiologo/KpiCards';
import UrgenciasTable from '@/components/radiologo/UrgenciasTable';
import ColaLecturaTable from '@/components/radiologo/ColaLecturaTable';
import type { EstudioImagen } from '@/lib/radiologia';
import { listarEstudiosRad } from '@/lib/api/radiologia';

export default function RadiologoDashboard() {
  const [estudios, setEstudios] = useState<EstudioImagen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarEstudios = useCallback(async () => {
    try {
      setError('');
      const data = await listarEstudiosRad();
      setEstudios(data);
    } catch {
      setError('No se pudo conectar con el servicio de radiología');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEstudios();
  }, [cargarEstudios]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Panel de Diagnóstico por Imágenes</h1>
        <p className="text-xs text-gray-500 mt-0.5">Dr. Ricardo Mendoza — Médico Radiólogo · Servicio de Imágenes</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error} — verifique que el api-gateway (8080) y radiologia-service (8085) estén activos.
        </div>
      )}

      {cargando ? (
        <p className="text-sm text-gray-400 text-center py-12">Cargando cola de lectura…</p>
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
