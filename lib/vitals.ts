// lib/vitals.ts
// Integración con triaje-service vía API Gateway (:8080 → /api/triaje/**).
import { authFetch, errorMensaje } from '@/lib/auth';

export type Prioridad = 'I-ROJO' | 'II-NARANJA' | 'III-AMARILLO' | 'IV-VERDE' | 'V-AZUL';
export type Destino   = 'Reanimación/UCI' | 'Emergencias' | 'Consultorio prioritario' | 'Consultorio normal' | 'Consulta externa';
export type NivelConciencia = 'Alerta' | 'Verbal' | 'Dolor' | 'Inconsciente';
export type AlertLevel = 'normal' | 'warning' | 'critical';

export interface PacienteEspera {
  id: string;
  colaId?: string;
  ticket: string;
  nombre: string;
  dni: string;
  fechaNac: string;
  horaLlegada: string;
  motivo: string;
}

export interface SignosVitales {
  pasSistolica: number;
  pasDiastolica: number;
  frecCardiaca: number;
  frecRespiratoria: number;
  temperatura: number;
  spo2: number;
  peso: number;
  talla: number;
  imc?: number;
}

export interface RegistroTriaje {
  pacienteId: string;
  signos: SignosVitales;
  motivoConsulta: string;
  nivelConciencia: NivelConciencia;
  dolor: number;
  prioridad: Prioridad;
  destino: Destino;
  justificacion: string;
  enfermera: string;
  timestamp: string;
}

export interface PacienteClasificado {
  id: string;
  ticket: string;
  nombre: string;
  prioridad: Prioridad;
  destino: Destino;
  horaClasificado: Date;
  estado: string;
}

export interface Medicamento {
  nombre: string;
  dosis: string;
  via: string;
  hora: string;
}

export interface EntradaKardex {
  id: string;
  pacienteId: string;
  fechaHora: string;
  signos?: Partial<SignosVitales>;
  ingresosHidricos: number;
  egresosHidricos: number;
  medicamentos: Medicamento[];
  evolucion: string;
  firmado: boolean;
  firmadoPor?: string;
  firmaCanvas?: string;
}

export interface PacienteObservacion {
  id: string;
  nombre: string;
  horaIngreso: Date;
  prioridad: Prioridad;
  motivo: string;
  kardex: EntradaKardex[];
}

export const PRIORIDAD_CONFIG: Record<Prioridad, {
  label: string;
  color: string;
  bg: string;
  border: string;
  maxMinutes: number;
  destino: Destino;
}> = {
  'I-ROJO':       { label: 'I — Resucitación',  color: 'text-white',    bg: 'bg-red-600',    border: 'border-red-700',    maxMinutes: 0,   destino: 'Reanimación/UCI'         },
  'II-NARANJA':   { label: 'II — Emergencia',    color: 'text-white',    bg: 'bg-orange-500', border: 'border-orange-600', maxMinutes: 15,  destino: 'Emergencias'             },
  'III-AMARILLO': { label: 'III — Urgente',       color: 'text-gray-900', bg: 'bg-yellow-400', border: 'border-yellow-500', maxMinutes: 60,  destino: 'Consultorio prioritario' },
  'IV-VERDE':     { label: 'IV — Menos Urgente', color: 'text-white',    bg: 'bg-green-500',  border: 'border-green-600',  maxMinutes: 120, destino: 'Consultorio normal'      },
  'V-AZUL':       { label: 'V — No Urgente',     color: 'text-white',    bg: 'bg-blue-500',   border: 'border-blue-600',   maxMinutes: 240, destino: 'Consulta externa'        },
};

export function calcIMC(peso: number, talla: number): number {
  const tallaMts = talla / 100;
  return Math.round((peso / (tallaMts * tallaMts)) * 10) / 10;
}

export function alertaSpo2(spo2: number): AlertLevel {
  if (spo2 < 90) return 'critical';
  if (spo2 < 95) return 'warning';
  return 'normal';
}

export function alertaFC(fc: number): AlertLevel {
  if (fc > 120 || fc < 50) return 'critical';
  if (fc > 100 || fc < 60) return 'warning';
  return 'normal';
}

export function alertaTemp(temp: number): AlertLevel {
  if (temp > 39)   return 'critical';
  if (temp > 38)   return 'warning';
  return 'normal';
}

export function alertaPAS(pas: number): AlertLevel {
  if (pas > 180 || pas < 80) return 'critical';
  if (pas > 140 || pas < 90) return 'warning';
  return 'normal';
}

export function alertaPAD(pad: number): AlertLevel {
  if (pad > 110 || pad < 50) return 'critical';
  if (pad > 90  || pad < 60) return 'warning';
  return 'normal';
}

export function alertaFR(fr: number): AlertLevel {
  if (fr > 30 || fr < 8)  return 'critical';
  if (fr > 20 || fr < 12) return 'warning';
  return 'normal';
}

export function destinoPorPrioridad(p: Prioridad): Destino {
  return PRIORIDAD_CONFIG[p].destino;
}

export function formatoFechaHoraPeru(date: Date): string {
  const d   = date.getDate().toString().padStart(2, '0');
  const m   = (date.getMonth() + 1).toString().padStart(2, '0');
  const y   = date.getFullYear();
  const h   = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${d}/${m}/${y} — ${h}:${min}`;
}

export function elapsedHHMM(from: Date): string {
  const diff = Math.floor((Date.now() - from.getTime()) / 60000);
  const h    = Math.floor(diff / 60).toString().padStart(2, '0');
  const min  = (diff % 60).toString().padStart(2, '0');
  return `${h}:${min}`;
}

export function isOverTime(prioridad: Prioridad, from: Date): boolean {
  const diffMin = (Date.now() - from.getTime()) / 60000;
  const max     = PRIORIDAD_CONFIG[prioridad].maxMinutes;
  return max === 0 ? diffMin > 2 : diffMin > max;
}

// ===================== API (triaje-service) =====================
// Respuestas envueltas en { data, message, timestamp }.
interface ApiResponse<T> { data: T; message: string; timestamp: string; }
interface Page<T> { content: T[]; }

/** Item de la cola de triaje (incluye colaId = id, necesario para registrar). */
export interface ColaTriajeItem {
  id: string;              // colaId
  pacienteId: string;
  pacienteNombre: string;
  pacienteDni: string;
  ticket: string;
  horaLlegada: string;
  medicoNombre?: string | null;
  especialidad?: string | null;
  motivo?: string | null;
  citaId?: string | null;
}

/** Cola de pacientes pendientes de triaje. */
export async function obtenerColaTriajeAPI(): Promise<ColaTriajeItem[]> {
  const hoy = new Date().toLocaleDateString('en-CA');
  const res = await authFetch(`/api/triaje/cola?fecha=${hoy}`);
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cargar la cola de triaje'));
  return ((await res.json()) as ApiResponse<ColaTriajeItem[]>).data ?? [];
}

/** Convierte un item de cola al tipo que usan las tablas del panel. */
export function colaAPacienteEspera(c: ColaTriajeItem): PacienteEspera {
  return {
    id: c.pacienteId,
    colaId: c.id,
    ticket: c.ticket,
    nombre: c.pacienteNombre,
    dni: c.pacienteDni,
    fechaNac: '',
    horaLlegada: c.horaLlegada,
    motivo: c.motivo ?? '',
  };
}

/** Registros de triaje ya clasificados (para la tabla de clasificados). */
export async function listarClasificados(): Promise<PacienteClasificado[]> {
  const res = await authFetch('/api/triaje/registros?page=0&size=50');
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudieron cargar los clasificados'));
  const page = ((await res.json()) as ApiResponse<Page<Record<string, unknown>>>).data;
  return (page?.content ?? []).map((r) => ({
    id: String(r.pacienteId ?? r.id),
    ticket: String(r.ticket ?? ''),
    nombre: String(r.pacienteNombre ?? ''),
    prioridad: (r.prioridad as Prioridad) ?? 'IV-VERDE',
    destino: (r.destino as Destino) ?? 'Consultorio normal',
    horaClasificado: r.timestamp ? new Date(String(r.timestamp)) : new Date(),
    estado: 'Esperando',
  }));
}

/** Pacientes en observación. */
export async function listarObservaciones(): Promise<PacienteObservacion[]> {
  const res = await authFetch('/api/triaje/observacion');
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudieron cargar las observaciones'));
  const data = ((await res.json()) as ApiResponse<Record<string, unknown>[]>).data ?? [];
  return data.map((o) => ({
    id: String(o.id),
    nombre: String(o.pacienteNombre ?? ''),
    horaIngreso: o.horaIngreso ? new Date(String(o.horaIngreso)) : new Date(),
    prioridad: (o.prioridad as Prioridad) ?? 'IV-VERDE',
    motivo: String(o.motivo ?? ''),
    kardex: [],
  }));
}

/** Cuerpo para registrar un triaje. */
export interface RegistrarTriajePayload {
  colaId?: string;
  pacienteId: string;
  citaId?: string;
  enfermeraId: string;
  signos: SignosVitales;
  motivoConsulta: string;
  nivelConciencia: string;
  dolor: number;
  prioridad: Prioridad;
  justificacion: string;
}

/** Registra el triaje de un paciente (signos + clasificación). */
export async function registrarTriaje(payload: RegistrarTriajePayload): Promise<void> {
  const res = await authFetch('/api/triaje/registrar', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo registrar el triaje'));
}
