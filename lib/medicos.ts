// ============================================================
// Médicos (rol MEDICO) desde usuario-service.
// GET /api/public/medicos devuelve el arreglo directo (sin envoltura ApiResponse).
// ============================================================
import { authFetch, errorMensaje } from '@/lib/auth';

export interface Medico {
  id: string;
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: string;
  especialidad?: string | null;
  estado: string;
}

/** Lista los médicos activos e inactivos registrados. */
export async function listarMedicos(): Promise<Medico[]> {
  const res = await authFetch('/api/public/medicos');
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudieron cargar los médicos'));
  return (await res.json()) as Medico[];
}

/** "Nombre Apellidos" del médico. */
export function nombreMedico(m: Medico): string {
  return `${m.nombre} ${m.apellidos}`.trim();
}
