// ============================================================
// Integración con el microservicio auditoria-service (puerto 8082)
// Bitácora inalterable de eventos del sistema (Ley 30024 - RENHICE).
// ============================================================

import { authFetchAt, errorMensaje } from '@/lib/auth';

export const AUDITORIA_URL =
  process.env.NEXT_PUBLIC_AUDITORIA_URL ?? 'http://localhost:8082';

// ---- Forma que devuelve el backend (AuditoriaResponse) ----
interface AuditoriaApi {
  id: string;
  usuarioEmail: string;
  usuarioNombre: string;
  rol: string;            // nombre del enum: "ADMIN", "MEDICO", "SOPORTE"…
  accion: string;         // etiqueta: "Creación", "Consulta"…
  modulo: string;
  descripcion: string;
  entidad: string | null;
  ip: string;
  fecha: string;          // "dd/MM/yyyy - HH:mm"
}

// ---- Forma usada por la UI ----
export interface RegistroAuditoria {
  id: string;
  fechaHora: string;
  usuario: string;
  email: string;
  rol: string;            // etiqueta amigable: "Admin", "Médico", "Soporte"…
  accion: string;
  modulo: string;
  entidad: string | null;
  ip: string;
  detalle: string;
}

// Mapea el nombre del rol del backend a su etiqueta en español.
const ROL_ETIQUETA: Record<string, string> = {
  ADMIN: 'Admin',
  RECEPCION: 'Recepción',
  ENFERMERIA: 'Enfermería',
  MEDICO: 'Médico',
  LABORATORIO: 'Laboratorio',
  RADIOLOGO: 'Radiólogo',
  FARMACIA: 'Farmacia',
  SOPORTE: 'Soporte',
  PACIENTE: 'Paciente',
};

// Color del badge por rol (incluye un fallback gris para valores desconocidos).
export const ROL_AUDITORIA_CONFIG: Record<string, string> = {
  'Admin':       'bg-amber-100 text-amber-700',
  'Recepción':   'bg-gray-100 text-gray-700',
  'Enfermería':  'bg-pink-100 text-pink-700',
  'Médico':      'bg-blue-100 text-blue-700',
  'Radiólogo':   'bg-indigo-100 text-indigo-700',
  'Laboratorio': 'bg-purple-100 text-purple-700',
  'Farmacia':    'bg-teal-100 text-teal-700',
  'Soporte':     'bg-cyan-100 text-cyan-700',
  'Paciente':    'bg-green-100 text-green-700',
  'Sistema':     'bg-gray-100 text-gray-500',
};

export function rolBadge(rol: string): string {
  return ROL_AUDITORIA_CONFIG[rol] ?? 'bg-gray-100 text-gray-600';
}

// Catálogo de acciones (etiquetas que devuelve el backend) para los filtros.
export const ACCIONES_AUDITORIA = [
  'Inicio de sesión', 'Cierre de sesión', 'Creación', 'Actualización',
  'Eliminación', 'Consulta', 'Acceso denegado',
];

function mapToUi(a: AuditoriaApi): RegistroAuditoria {
  return {
    id: a.id,
    fechaHora: a.fecha,
    usuario: a.usuarioNombre || 'Sistema',
    email: a.usuarioEmail,
    rol: ROL_ETIQUETA[a.rol] ?? (a.rol === '—' ? 'Sistema' : a.rol),
    accion: a.accion,
    modulo: a.modulo,
    entidad: a.entidad,
    ip: a.ip,
    detalle: a.descripcion,
  };
}

export interface FiltrosAuditoria {
  accion?: string;   // etiqueta o nombre del enum
  modulo?: string;
  q?: string;
}

/** Lista la bitácora (requiere rol ADMIN o SOPORTE). */
export async function listarAuditoria(filtros: FiltrosAuditoria = {}): Promise<RegistroAuditoria[]> {
  const params = new URLSearchParams();
  if (filtros.accion && filtros.accion !== 'Todas') params.set('accion', filtros.accion);
  if (filtros.modulo && filtros.modulo !== 'Todos') params.set('modulo', filtros.modulo);
  if (filtros.q) params.set('q', filtros.q);
  const query = params.toString() ? `?${params.toString()}` : '';

  const res = await authFetchAt(AUDITORIA_URL, `/api/auditoria${query}`);
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cargar la auditoría'));
  const data = (await res.json()) as AuditoriaApi[];
  return data.map(mapToUi);
}

/** Conteo total y por tipo de acción (para tarjetas de resumen). */
export async function resumenAuditoria(): Promise<Record<string, number>> {
  const res = await authFetchAt(AUDITORIA_URL, '/api/auditoria/resumen');
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cargar el resumen'));
  return (await res.json()) as Record<string, number>;
}

/** Registra un evento en la bitácora (lo usan los demás módulos). */
export async function registrarEvento(evento: {
  accion: string; modulo: string; descripcion: string;
  usuarioEmail?: string; usuarioNombre?: string; rol?: string; entidad?: string;
}): Promise<void> {
  const res = await authFetchAt(AUDITORIA_URL, '/api/auditoria', {
    method: 'POST',
    body: JSON.stringify(evento),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo registrar el evento'));
}
