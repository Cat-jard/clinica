'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { use } from 'react';
import VitalSignsForm from '@/components/triaje/VitalSignsForm';
import { PacienteEspera } from '@/lib/vitals';
import { getColaTriajeApi } from '@/lib/triaje';

export default function TriajePacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [paciente, setPaciente] = useState<PacienteEspera | null | undefined>(undefined);

  useEffect(() => {
    async function load() {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const cola = await getColaTriajeApi(today);
        const found = cola.find((c) => c.id === id);
        if (found) {
          setPaciente({
            id: found.id,
            ticket: found.ticket,
            nombre: found.pacienteNombre,
            dni: '',
            fechaNac: '',
            horaLlegada: found.horaLlegada,
            motivo: found.motivo || '',
          });
        } else {
          setPaciente(null);
        }
      } catch {
        setPaciente(null);
      }
    }
    load();
  }, [id]);

  if (paciente === undefined) return <div className="p-8 text-center text-gray-400">Cargando paciente...</div>;
  if (!paciente) notFound();

  return <VitalSignsForm paciente={paciente} />;
}
