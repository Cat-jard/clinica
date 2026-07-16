// ============================================================
// Integración con citas-service (agenda de citas).
// Vía API Gateway (:8080) → /api/citas/** → citas-service (:8002).
// ============================================================
import { authFetch, errorMensaje } from '@/lib/auth';

export type EstadoCita = 'PROGRAMADA' | 'ATENDIDA' | 'CANCELADA';

export interface Cita {
  id: string;
  pacienteId: string;
  medicoId: number;
  fechaCita: string;      // yyyy-MM-dd
  horaInicio: string;     // HH:mm:ss
  horaFin: string;
  estado: EstadoCita;
  motivo: string;
  observaciones?: string | null;
  tipoSeguro?: string | null;
  numeroHistoria?: string | null;
  pacienteNombre?: string | null;
  medicoNombre?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrearCitaInput {
  pacienteId: string;
  medicoId: number;
  fechaCita: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  observaciones?: string;
  tipoSeguro?: string;
  numeroHistoria?: string;
  pacienteNombre?: string;
  medicoNombre?: string;
}

export interface ResumenCitas { programadas: number; atendidas: number; canceladas: number; }

interface ApiResponse<T> { data: T; message: string; timestamp: string; }
interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; }

/** Lista citas (paginado). Opcionalmente filtra por estado. */
export async function listarCitas(estado?: EstadoCita, size = 100): Promise<Cita[]> {
  const params = new URLSearchParams({ page: '0', size: String(size) });
  if (estado) params.set('estado', estado);
  const res = await authFetch(`/api/citas/all?${params}`);
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudieron cargar las citas'));
  const json = (await res.json()) as ApiResponse<Page<Cita>>;
  return json.data?.content ?? [];
}

/** Contadores del día (programadas / atendidas / canceladas). */
export async function resumenCitas(): Promise<ResumenCitas> {
  const res = await authFetch('/api/citas/resumen');
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cargar el resumen'));
  return ((await res.json()) as ApiResponse<ResumenCitas>).data;
}

/** Agenda una nueva cita. */
export async function crearCita(input: CrearCitaInput): Promise<Cita> {
  const res = await authFetch('/api/citas/crear', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo agendar la cita'));
  return ((await res.json()) as ApiResponse<Cita>).data;
}

/** Cancela una cita. */
export async function cancelarCita(id: string, motivo: string, canceladoPor: string): Promise<void> {
  const res = await authFetch(`/api/citas/${id}/cancelar`, {
    method: 'POST',
    body: JSON.stringify({ motivo, canceladoPor }),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cancelar la cita'));
}

/** HH:mm:ss → HH:mm para mostrar. */
export function horaCorta(h: string): string {
  return (h || '').slice(0, 5);
}
