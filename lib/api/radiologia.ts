import { apiFetch } from './client';
import { mapEstudioImagen, type EstudioImagenDto } from './mappers';
import type { EstudioImagen, InformeRadiologico } from '@/lib/radiologia';

export async function listarEstudiosRad(): Promise<EstudioImagen[]> {
  const dtos = await apiFetch<EstudioImagenDto[]>('/api/radiologia/estudios');
  return dtos.map(mapEstudioImagen);
}

export async function obtenerEstudioRad(id: string): Promise<EstudioImagen> {
  const dto = await apiFetch<EstudioImagenDto>(`/api/radiologia/estudios/${id}`);
  return mapEstudioImagen(dto);
}

export async function iniciarLecturaRad(id: string): Promise<EstudioImagen> {
  const dto = await apiFetch<EstudioImagenDto>(`/api/radiologia/estudios/${id}/iniciar`, {
    method: 'PATCH',
  });
  return mapEstudioImagen(dto);
}

export async function guardarBorradorRad(
  id: string,
  informe: InformeRadiologico,
): Promise<EstudioImagen> {
  const dto = await apiFetch<EstudioImagenDto>(`/api/radiologia/estudios/${id}/borrador`, {
    method: 'PATCH',
    body: JSON.stringify({
      hallazgos: informe.hallazgos,
      impresionDiagnostica: informe.impresionDiagnostica,
      recomendaciones: informe.recomendaciones,
      codigoCIE10: informe.codigoCIE10 ?? null,
      dosisRadiacion: informe.dosisRadiacion ?? null,
    }),
  });
  return mapEstudioImagen(dto);
}

export async function firmarInformeRad(
  id: string,
  informe: InformeRadiologico,
  urgente: boolean,
): Promise<EstudioImagen> {
  const dto = await apiFetch<EstudioImagenDto>(`/api/radiologia/estudios/${id}/firmar`, {
    method: 'PATCH',
    body: JSON.stringify({
      informe: {
        hallazgos: informe.hallazgos,
        impresionDiagnostica: informe.impresionDiagnostica,
        recomendaciones: informe.recomendaciones,
        codigoCIE10: informe.codigoCIE10 ?? null,
        dosisRadiacion: informe.dosisRadiacion ?? null,
      },
      urgente,
    }),
  });
  return mapEstudioImagen(dto);
}
