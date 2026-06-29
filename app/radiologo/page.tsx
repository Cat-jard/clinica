'use client';

import KpiCards from '@/components/radiologo/KpiCards';
import UrgenciasTable from '@/components/radiologo/UrgenciasTable';
import ColaLecturaTable from '@/components/radiologo/ColaLecturaTable';
import { MOCK_ESTUDIOS } from '@/lib/radiologia';

export default function RadiologoDashboard() {
  const estudios = MOCK_ESTUDIOS;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Panel de Diagnóstico por Imágenes</h1>
        <p className="text-xs text-gray-500 mt-0.5">Dr. Ricardo Mendoza — Médico Radiólogo · Servicio de Imágenes</p>
      </div>

      <KpiCards estudios={estudios} />

      <UrgenciasTable estudios={estudios} />

      <ColaLecturaTable estudios={estudios} />
    </div>
  );
}
