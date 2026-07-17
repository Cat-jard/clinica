'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { use } from 'react';
import VitalSignsForm from '@/components/triaje/VitalSignsForm';
import { PacienteEspera } from '@/lib/vitals';
import { getColaTriajeApi } from '@/lib/triaje';
import { obtenerPaciente } from '@/lib/recepcion';

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
        const today = new Date().toLocaleDateString('en-CA');

        let base: Partial<PacienteEspera> = {};
        const cola = await getColaTriajeApi(today);
        let found = cola.find((c) => c.pacienteId === id);
        if (found) {
          base = { id: found.pacienteId, colaId: found.id, ticket: found.ticket, nombre: found.pacienteNombre, horaLlegada: found.horaLlegada, motivo: found.motivo || '' };
        } else {
          const { listRegistrosTriajeApi } = await import('@/lib/triaje');
          const registros = await listRegistrosTriajeApi(today);
          const reg = registros.find((r) => r.pacienteId === id);
          if (reg) {
            base = { id: reg.pacienteId, ticket: reg.ticket, nombre: reg.pacienteNombre, horaLlegada: reg.horaLlegada, motivo: reg.motivoConsulta };
          }
        }
        if (!base.id) { setPaciente(null); return; }

        const pacienteData = await obtenerPaciente(id);
        setPaciente({
          id: base.id,
          colaId: (base as any).colaId,
          ticket: base.ticket || '',
          nombre: base.nombre || pacienteData.nombres + ' ' + (pacienteData.apellidoPaterno || ''),
          dni: pacienteData.nroDocumento || '',
          fechaNac: pacienteData.fechaNacimiento || '',
          horaLlegada: base.horaLlegada || '',
          motivo: base.motivo || '',
        });
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
