'use client';

import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import KpiCards from '@/components/medico/KpiCards';
import ColaCitas from '@/components/medico/ColaCitas';
import ColaEspera from '@/components/medico/ColaEspera';
import { MOCK_CITAS, MOCK_COLA_ESPERA } from '@/lib/medico';
import { PRIORIDAD_CONFIG as PC } from '@/lib/vitals';

// Re-export para el import limpio
const PRIORIDAD_ORDER: Record<string, number> = {
  'I-ROJO': 1, 'II-NARANJA': 2, 'III-AMARILLO': 3, 'IV-VERDE': 4, 'V-AZUL': 5,
};

export default function MedicoDashboard() {
  const router = useRouter();

  const atendidos  = MOCK_CITAS.filter(c => c.estado === 'Atendida').length;
  const siguiente  = [...MOCK_COLA_ESPERA].sort(
    (a, b) => PRIORIDAD_ORDER[a.prioridad] - PRIORIDAD_ORDER[b.prioridad]
  )[0];

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Panel del Médico</h1>
        <p className="text-sm text-gray-500 mt-0.5">Dr. Luis Torres — Medicina General · Consultorio 3</p>
      </div>

      {/* KPIs */}
      <KpiCards
        citasHoy={MOCK_CITAS.length}
        enEspera={MOCK_COLA_ESPERA.length}
        resultadosPendientes={2}
        atendidosHoy={atendidos}
      />

      {/* Tablas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ColaCitas citas={MOCK_CITAS} />
        <ColaEspera pacientes={MOCK_COLA_ESPERA} />
      </div>

      {/* Botón flotante — Atender Siguiente */}
      {siguiente && (
        <button
          onClick={() => router.push(`/medico/atencion/${siguiente.id}`)}
          className="fixed bottom-6 right-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg transition-colors z-30"
        >
          <Users size={16} />
          Atender Siguiente — {siguiente.nombre.split(' ')[0]}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${PC[siguiente.prioridad].bg} ${PC[siguiente.prioridad].color}`}>
            {siguiente.ticket}
          </span>
        </button>
      )}
    </div>
  );
}
