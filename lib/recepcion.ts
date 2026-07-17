// ============================================================
// Integración con recepcion-service (pacientes y cola de espera)
// Todo el tráfico pasa por el API Gateway (NEXT_PUBLIC_API_URL, :8080),
// que enruta /api/pacientes y /api/cola hacia recepcion-service (:8001).
// ============================================================
import { authFetch, errorMensaje } from '@/lib/auth';

// ===================== TIPOS =====================

/** Fila de la tabla de pacientes (GET /api/pacientes/all). */
export interface PacienteResumen {
  id: string;
  tipoDocumento: string;
  nroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  fechaNacimiento: string;   // ISO yyyy-MM-dd
  telefono: string;
  nroHistoria: string;
  aseguradora: string;
  consentimiento: string;    // "Firmado" | "Pendiente"
  createdAt: string;
}

/** Detalle completo del paciente (GET /api/pacientes/{id}). */
export interface Paciente extends PacienteResumen {
  sexo: string;
  email?: string | null;
  direccion?: string | null;
  alergias?: string | null;
  updatedAt: string;
}

/** Cuerpo para crear/actualizar un paciente. */
export interface PacienteInput {
  tipoDocumento: string;
  nroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  fechaNacimiento: string;   // yyyy-MM-dd
  sexo: string;
  telefono: string;
  email?: string;
  direccion?: string;
  aseguradora: string;
  alergias?: string;
}

/** Item de la cola de espera (GET /api/cola/triaje). */
export interface ColaItem {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteDni: string;
  ticket: string;
  horaLlegada: string;
  medicoNombre?: string | null;
  especialidad?: string | null;
  motivo?: string | null;
  estado: string;
  citaId?: string | null;
  fecha: string;
}

// El backend envuelve todo en { data, message, timestamp }.
interface ApiResponse<T> { data: T; message: string; timestamp: string; }
interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; }

// ===================== PACIENTES =====================

/** Lista pacientes (paginado). `q` filtra por documento o nombre. */
export async function listarPacientes(q = '', size = 100): Promise<PacienteResumen[]> {
  const params = new URLSearchParams({ page: '0', size: String(size) });
  if (q) params.set('q', q);
  const res = await authFetch(`/api/pacientes/all?${params}`);
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudieron cargar los pacientes'));
  const json = (await res.json()) as ApiResponse<Page<PacienteResumen>>;
  return json.data?.content ?? [];
}

/** Obtiene el detalle de un paciente. */
export async function obtenerPaciente(id: string): Promise<Paciente> {
  const res = await authFetch(`/api/pacientes/${id}`);
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cargar el paciente'));
  return ((await res.json()) as ApiResponse<Paciente>).data;
}

/** Registra un nuevo paciente. */
export async function crearPaciente(input: PacienteInput): Promise<Paciente> {
  const res = await authFetch('/api/pacientes/crear', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo registrar el paciente'));
  return ((await res.json()) as ApiResponse<Paciente>).data;
}

/** Actualiza los datos de un paciente. */
export async function actualizarPaciente(id: string, input: PacienteInput): Promise<Paciente> {
  const res = await authFetch(`/api/pacientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo actualizar el paciente'));
  return ((await res.json()) as ApiResponse<Paciente>).data;
}

// ===================== COLA =====================

/** Cola de espera para triaje (por defecto la del día de hoy). */
export async function obtenerColaTriaje(fecha?: string): Promise<ColaItem[]> {
  const query = fecha ? `?fecha=${fecha}` : '';
  const res = await authFetch(`/api/cola/triaje${query}`);
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cargar la cola'));
  return ((await res.json()) as ApiResponse<ColaItem[]>).data ?? [];
}

/** Cambia el estado de un elemento de la cola (EN_ESPERA, EN_TRIAJE, ...). */
export async function actualizarEstadoCola(id: string, estado: string): Promise<void> {
  const res = await authFetch(`/api/cola/${id}/estado?estado=${encodeURIComponent(estado)}`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo actualizar el estado'));
}

export interface IngresarColaInput {
  pacienteId: string;
  pacienteNombre: string;
  pacienteDni: string;
  medicoNombre?: string | null;
  especialidad?: string | null;
  motivo?: string | null;
  citaId?: string | null;
  horaLlegada?: string | null;
}

/** Agrega un paciente a la cola de triaje. */
export async function ingresarCola(input: IngresarColaInput): Promise<ColaItem> {
  const res = await authFetch('/api/cola/ingresar', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo ingresar a la cola'));
  return ((await res.json()) as ApiResponse<ColaItem>).data;
}

// ===================== CONSENTIMIENTO =====================

export interface CreateConsentimientoInput {
  tipo: string;
  textoLegal: string;
  versionTexto: string;
  firmaBase64?: string;
  aceptado: boolean;
  ipOrigen: string;
  userId: string;
}

/** Registra un consentimiento informado para un paciente. */
export async function registrarConsentimiento(pacienteId: string, input: CreateConsentimientoInput): Promise<void> {
  const res = await authFetch(`/api/pacientes/${pacienteId}/consentimiento`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo registrar el consentimiento'));
}

// ===================== HELPERS =====================

/** Nombre completo "Nombres Apellido Apellido". */
export function nombreCompleto(p: { nombres: string; apellidoPaterno: string; apellidoMaterno: string }): string {
  return `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`.trim();
}

/** Convierte una fecha ISO (yyyy-MM-dd) a dd/MM/yyyy para mostrar. */
export function fechaCorta(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
}
