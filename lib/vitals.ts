// lib/vitals.ts

export type Prioridad = 'I-ROJO' | 'II-NARANJA' | 'III-AMARILLO' | 'IV-VERDE' | 'V-AZUL';
export type Destino   = 'Reanimación/UCI' | 'Emergencias' | 'Consultorio prioritario' | 'Consultorio normal' | 'Consulta externa';
export type NivelConciencia = 'Alerta' | 'Verbal' | 'Dolor' | 'Inconsciente';
export type AlertLevel = 'normal' | 'warning' | 'critical';

export interface PacienteEspera {
  id: string;
  ticket: string;
  nombre: string;
  dni: string;
  fechaNac: string;     // ISO YYYY-MM-DD
  horaLlegada: string;  // "08:45"
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
