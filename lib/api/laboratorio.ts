import { apiFetch } from './client';
import { mapOrdenLab, type OrdenLabDto } from './mappers';
import type { OrdenLab } from '@/lib/laboratorio';
import type { ValorResultado } from '@/lib/laboratorio';

export async function listarOrdenesLab(): Promise<OrdenLab[]> {
  const dtos = await apiFetch<OrdenLabDto[]>('/api/laboratorio/ordenes');
  return dtos.map(mapOrdenLab);
}

export async function obtenerOrdenLab(id: string): Promise<OrdenLab> {
  const dto = await apiFetch<OrdenLabDto>(`/api/laboratorio/ordenes/${id}`);
  return mapOrdenLab(dto);
}

export async function registrarMuestraLab(
  id: string,
  data: { origenMuestra: string; condicion?: string; observaciones?: string },
): Promise<OrdenLab> {
  const dto = await apiFetch<OrdenLabDto>(`/api/laboratorio/ordenes/${id}/muestra`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return mapOrdenLab(dto);
}

export async function ingresarResultadosLab(
  id: string,
  resultados: ValorResultado[],
): Promise<OrdenLab> {
  const dto = await apiFetch<OrdenLabDto>(`/api/laboratorio/ordenes/${id}/resultados`, {
    method: 'PATCH',
    body: JSON.stringify({
      resultados: resultados.map(r => ({
        examenId: r.examenId,
        resultado: r.resultado,
        unidad: r.unidad,
        valorRef: r.valorRef,
        critico: r.critico,
        observaciones: r.observaciones ?? '',
      })),
    }),
  });
  return mapOrdenLab(dto);
}

export async function validarOrdenLab(id: string): Promise<OrdenLab> {
  const dto = await apiFetch<OrdenLabDto>(`/api/laboratorio/ordenes/${id}/validar`, {
    method: 'PATCH',
  });
  return mapOrdenLab(dto);
}
