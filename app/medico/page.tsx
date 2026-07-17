'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import KpiCards from '@/components/medico/KpiCards';
import ColaCitas from '@/components/medico/ColaCitas';
import ColaEspera from '@/components/medico/ColaEspera';
import { listCitasMedicoApi, listColaEsperaMedicoApi, contarResultadosPendientesApi, type CitaDia, type PacienteMedicoEspera } from '@/lib/medico';
import { getUsuario } from '@/lib/auth';
import { PRIORIDAD_CONFIG as PC } from '@/lib/vitals';

const PRIORIDAD_ORDER: Record<string, number> = {
  'I-ROJO': 1, 'II-NARANJA': 2, 'III-AMARILLO': 3, 'IV-VERDE': 4, 'V-AZUL': 5,
};

export default function MedicoDashboard() {
  const router = useRouter();
  const [citas, setCitas] = useState<CitaDia[]>([]);
  const [colaEspera, setColaEspera] = useState<PacienteMedicoEspera[]>([]);
  const [resultadosPendientes, setResultadosPendientes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [doctorLabel, setDoctorLabel] = useState('Médico');

  useEffect(() => {
    const user = getUsuario();
    setDoctorLabel(user
      ? `Dr. ${user.nombre} ${user.apellidos} — ${user.especialidad || 'Medicina General'}`
      : 'Dr. Luis Torres — Medicina General');
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [citasData, colaData, pendientes, pacientesList] = await Promise.all([
          listCitasMedicoApi(),
          listColaEsperaMedicoApi(),
          contarResultadosPendientesApi(),
          import('@/lib/recepcion').then(m => m.listarPacientes('', 500)).catch(() => []),
        ]);
        const { calcAge } = await import('@/lib/format');
        const mappedCola = (colaData || []).map((item) => {
          const patient = (pacientesList || []).find((p) => p.id === item.id);
          if (patient) {
            item.edad = calcAge(patient.fechaNacimiento);
            item.sexo = patient.sexo as any;
          }
          return item;
        });
        setCitas(citasData);
        setColaEspera(mappedCola);
        setResultadosPendientes(pendientes);
      } catch (err) {
        console.error('Error loading medico data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const atendidos  = citas.filter(c => c.estado === 'Atendida').length;
  const siguiente  = [...colaEspera].sort(
    (a, b) => PRIORIDAD_ORDER[a.prioridad] - PRIORIDAD_ORDER[b.prioridad]
  )[0];

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Panel del Médico</h1>
        <p className="text-sm text-gray-500 mt-0.5">{doctorLabel}</p>
      </div>

      {/* KPIs */}
      <KpiCards
        citasHoy={citas.length}
        enEspera={colaEspera.length}
        resultadosPendientes={resultadosPendientes}
        atendidosHoy={atendidos}
      />

      {/* Tablas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ColaCitas citas={citas} />
        <ColaEspera pacientes={colaEspera} />
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
