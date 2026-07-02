import { apiFetch } from './client';
import type { ItemExamen } from '@/lib/medico';
import type { PacienteMedico } from '@/lib/medico';
import { calcEdad, MEDICO_ACTUAL } from './mappers';

interface ItemExamenPayload {
  id: string;
  tipo: string;
  nombre: string;
  origenMuestra?: string;
  ayuno?: string;
  urgente: boolean;
  indicaciones: string;
}

interface SolicitudExamenesPayload {
  atencionId: string;
  paciente: {
    id: string;
    nombre: string;
    apellidos: string;
    dni: string;
    edad: number;
    sexo: 'M' | 'F';
    nroHistoria: string;
  };
  medicoSolicitante: string;
  especialidadMedico: string;
  items: ItemExamenPayload[];
}

export interface SolicitudExamenesResponse {
  mensaje: string;
  ordenesLaboratorio: unknown[];
  estudiosRadiologia: unknown[];
}

function mapItem(item: ItemExamen): ItemExamenPayload | null {
  if (item.tipo === 'Otros') return null;
  return {
    id: item.id,
    tipo: item.tipo === 'Imágenes' ? 'Imagenes' : item.tipo,
    nombre: item.nombre,
    origenMuestra: item.origenMuestra,
    ayuno: item.ayuno,
    urgente: item.urgente,
    indicaciones: item.indicaciones,
  };
}

export function buildSolicitudPayload(
  paciente: PacienteMedico,
  items: ItemExamen[],
): SolicitudExamenesPayload {
  const itemsValidos = items.map(mapItem).filter((i): i is ItemExamenPayload => i !== null);
  if (itemsValidos.length === 0) {
    throw new Error('No hay exámenes válidos para enviar (Laboratorio o Imágenes)');
  }

  return {
    atencionId: paciente.atencionActual.id,
    paciente: {
      id: paciente.id,
      nombre: paciente.nombre,
      apellidos: paciente.apellidos,
      dni: paciente.dni,
      edad: calcEdad(paciente.fechaNac),
      sexo: paciente.sexo,
      nroHistoria: paciente.nroHistoria,
    },
    medicoSolicitante: MEDICO_ACTUAL.nombre,
    especialidadMedico: MEDICO_ACTUAL.especialidad,
    items: itemsValidos,
  };
}

export async function enviarSolicitudExamenes(
  paciente: PacienteMedico,
  items: ItemExamen[],
): Promise<SolicitudExamenesResponse> {
  const payload = buildSolicitudPayload(paciente, items);
  return apiFetch<SolicitudExamenesResponse>('/api/solicitudes-examenes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
