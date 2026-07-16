// Integración con laboratorio-service vía API Gateway (:8080 → /api/laboratorio/**).
import { authFetch, errorMensaje } from '@/lib/auth';

// ===================== TIPOS =====================

export type EstadoOrden = 'Pendiente' | 'Muestra Registrada' | 'En Proceso' | 'Resultados Pendientes' | 'Validado' | 'Rechazado';
export type PrioridadLab = 'Normal' | 'Urgente';
export type TipoMuestra = 'Sangre Venosa' | 'Sangre Arterial' | 'Orina' | 'Heces' | 'LCR' | 'Biopsia' | 'Esputo';
export type CondicionMuestra = 'En buen estado' | 'Hemolizada' | 'Lipémica' | 'Ictérica' | 'Coagulada';
export type EstadoControlCalidad = 'Aceptado' | 'Rechazado' | 'En Revisión';

export interface ExamenSolicitado {
  id: string;
  nombre: string;
  area: 'Hematología' | 'Química' | 'Inmunología' | 'Microbiología' | 'Orina';
  analizador?: string;
}

export interface PacienteLab {
  nombre: string;
  apellidos: string;
  dni: string;
  edad: number;
  sexo: 'M' | 'F';
  nroHistoria: string;
}

export interface MuestraLab {
  tipo: TipoMuestra;
  origen: string;
  tubo: string;
  fechaToma: string;
  fechaRecepcion: string;
  condicion: CondicionMuestra;
  observaciones?: string;
}

export interface OrdenLab {
  id: string;
  nroOrden: string;
  paciente: PacienteLab;
  medicoSolicitante: string;
  especialidadMedico: string;
  fechaSolicitud: string;
  examenes: ExamenSolicitado[];
  prioridad: PrioridadLab;
  estado: EstadoOrden;
  muestra?: MuestraLab;
}

export interface ValorResultado {
  examenId: string;
  examenNombre: string;
  resultado: string;
  unidad: string;
  valorRef: string;
  metodo?: string;
  observaciones?: string;
  critico: boolean;
  fueraRango: boolean;
  notificadoMedico: boolean;
}

export interface ControlCalidad {
  id: string;
  analizador: string;
  tipoControl: string;
  lote: string;
  fechaControl: string;
  estado: EstadoControlCalidad;
  observaciones?: string;
  firmadoEn?: string;
}

export interface EntradaAuditoriaLab {
  id: string;
  fechaHora: string;
  accion: string;
  pacienteNombre?: string;
  pacienteDni?: string;
  ip: string;
  detalle: string;
}

export interface ResultadoCritico {
  id: string;
  paciente: string;
  dni: string;
  examen: string;
  resultado: string;
  valorRef: string;
  fechaResultado: string;
  notificado: boolean;
}

// ===================== CATÁLOGOS =====================

export const TIPOS_MUESTRA: TipoMuestra[] = [
  'Sangre Venosa', 'Sangre Arterial', 'Orina', 'Heces', 'LCR', 'Biopsia', 'Esputo',
];

export const ORIGENES_MUESTRA = ['Suero', 'Plasma', 'Sangre Total', 'N/A'];

export const TUBOS = [
  'Tubo EDTA (morado)',
  'Tubo sin anticoagulante (rojo)',
  'Tubo Heparina (verde)',
  'Tubo citrato (azul)',
  'Frasco estéril',
  'Recipiente de orina',
];

export const CONDICIONES: CondicionMuestra[] = [
  'En buen estado', 'Hemolizada', 'Lipémica', 'Ictérica', 'Coagulada',
];

export const ANALIZADORES = [
  'Coulter DxH 900 (Hematología)',
  'Architect c8000 (Química)',
  'Cobas e411 (Inmunología)',
  'Vitek 2 (Microbiología)',
  'iQ200 (Urinálisis)',
];

export const TIPOS_CONTROL = ['Control Nivel 1', 'Control Nivel 2', 'Control Externo', 'Control Interno'];

// ===================== VALORES DE REFERENCIA =====================

interface RefValor {
  valorRef: string;
  unidad: string;
  criticoMin?: number;
  criticoMax?: number;
  normalMin?: number;
  normalMax?: number;
}

export const EXAMENES_REF: Record<string, RefValor> = {
  'Hemoglobina':        { valorRef: 'H: 13-17 g/dL | M: 12-16 g/dL', unidad: 'g/dL',   criticoMin: 7,      criticoMax: 20,     normalMin: 12,   normalMax: 17   },
  'Hematocrito':        { valorRef: 'H: 40-50% | M: 36-46%',          unidad: '%',       criticoMin: 20,     criticoMax: 60,     normalMin: 36,   normalMax: 50   },
  'Leucocitos':         { valorRef: '4,500 - 11,000 /mm³',             unidad: '/mm³',    criticoMin: 2000,   criticoMax: 30000,  normalMin: 4500, normalMax: 11000 },
  'Plaquetas':          { valorRef: '150,000 - 400,000 /mm³',          unidad: '/mm³',    criticoMin: 50000,  criticoMax: 1000000,normalMin: 150000,normalMax: 400000 },
  'Glucosa':            { valorRef: '70 - 100 mg/dL (Ayunas)',         unidad: 'mg/dL',   criticoMin: 40,     criticoMax: 300,    normalMin: 70,   normalMax: 100  },
  'Urea':               { valorRef: '10 - 50 mg/dL',                   unidad: 'mg/dL',   normalMin: 10,      normalMax: 50                                        },
  'Creatinina':         { valorRef: 'H: 0.7-1.3 | M: 0.6-1.1 mg/dL', unidad: 'mg/dL',   criticoMax: 10,     normalMin: 0.6,     normalMax: 1.3                   },
  'TGO (AST)':          { valorRef: '10 - 40 UI/L',                    unidad: 'UI/L',    normalMin: 10,      normalMax: 40                                        },
  'TGP (ALT)':          { valorRef: '7 - 56 UI/L',                     unidad: 'UI/L',    normalMin: 7,       normalMax: 56                                        },
  'Sodio':              { valorRef: '136 - 145 mEq/L',                  unidad: 'mEq/L',   criticoMin: 120,    criticoMax: 160,    normalMin: 136,  normalMax: 145  },
  'Potasio':            { valorRef: '3.5 - 5.0 mEq/L',                 unidad: 'mEq/L',   criticoMin: 2.5,    criticoMax: 6.5,    normalMin: 3.5,  normalMax: 5.0  },
  'Proteína C Reactiva':{ valorRef: '< 5 mg/L',                        unidad: 'mg/L',    normalMin: 0,       normalMax: 5                                         },
  'TSH':                { valorRef: '0.4 - 4.0 mUI/L',                 unidad: 'mUI/L',   criticoMin: 0.1,    criticoMax: 10,     normalMin: 0.4,  normalMax: 4.0  },
};

export function checkResultado(examen: string, valorStr: string): { critico: boolean; fueraRango: boolean } {
  const ref = EXAMENES_REF[examen];
  if (!ref || !valorStr.trim()) return { critico: false, fueraRango: false };
  const v = parseFloat(valorStr);
  if (isNaN(v)) return { critico: false, fueraRango: false };
  const critico =
    (ref.criticoMin !== undefined && v < ref.criticoMin) ||
    (ref.criticoMax !== undefined && v > ref.criticoMax);
  const fueraRango =
    (ref.normalMin !== undefined && v < ref.normalMin) ||
    (ref.normalMax !== undefined && v > ref.normalMax);
  return { critico, fueraRango: fueraRango || critico };
}

export function getUnidad(examen: string): string {
  return EXAMENES_REF[examen]?.unidad ?? '';
}

export function getValorRef(examen: string): string {
  return EXAMENES_REF[examen]?.valorRef ?? '—';
}

// ===================== MOCK DATA =====================

export const MOCK_ORDENES_LAB: OrdenLab[] = [
  {
    id: 'ol-001',
    nroOrden: 'ORD-2026-0847',
    paciente: { nombre: 'Ana', apellidos: 'Fernández Llanos', dni: '72341567', edad: 36, sexo: 'F', nroHistoria: 'HC-2024-0342' },
    medicoSolicitante: 'Dr. Luis Torres',
    especialidadMedico: 'Medicina General',
    fechaSolicitud: '25/06/2026 - 09:28',
    examenes: [
      { id: 'e1', nombre: 'Hemoglobina', area: 'Hematología', analizador: 'Coulter DxH 900 (Hematología)' },
      { id: 'e2', nombre: 'Glucosa',     area: 'Química',     analizador: 'Architect c8000 (Química)'    },
      { id: 'e3', nombre: 'Creatinina',  area: 'Química',     analizador: 'Architect c8000 (Química)'    },
    ],
    prioridad: 'Urgente',
    estado: 'Pendiente',
  },
  {
    id: 'ol-002',
    nroOrden: 'ORD-2026-0848',
    paciente: { nombre: 'Pedro', apellidos: 'Martínez Soto', dni: '38901245', edad: 58, sexo: 'M', nroHistoria: 'HC-2025-0119' },
    medicoSolicitante: 'Dr. Luis Torres',
    especialidadMedico: 'Medicina General',
    fechaSolicitud: '25/06/2026 - 09:35',
    examenes: [
      { id: 'e4', nombre: 'Glucosa',   area: 'Química' },
      { id: 'e5', nombre: 'Urea',      area: 'Química' },
      { id: 'e6', nombre: 'Creatinina',area: 'Química' },
      { id: 'e7', nombre: 'TGO (AST)', area: 'Química' },
      { id: 'e8', nombre: 'TGP (ALT)', area: 'Química' },
    ],
    prioridad: 'Normal',
    estado: 'Pendiente',
  },
  {
    id: 'ol-003',
    nroOrden: 'ORD-2026-0849',
    paciente: { nombre: 'Rosa', apellidos: 'Quispe Mamani', dni: '61872340', edad: 42, sexo: 'F', nroHistoria: 'HC-2024-0891' },
    medicoSolicitante: 'Dra. Carmen Vega',
    especialidadMedico: 'Cardiología',
    fechaSolicitud: '25/06/2026 - 10:15',
    examenes: [
      { id: 'e9',  nombre: 'Sodio',     area: 'Química'     },
      { id: 'e10', nombre: 'Potasio',   area: 'Química'     },
      { id: 'e11', nombre: 'Leucocitos',area: 'Hematología' },
      { id: 'e12', nombre: 'Plaquetas', area: 'Hematología' },
    ],
    prioridad: 'Urgente',
    estado: 'Muestra Registrada',
    muestra: {
      tipo: 'Sangre Venosa', origen: 'Suero', tubo: 'Tubo EDTA (morado)',
      fechaToma: '25/06/2026 - 10:05', fechaRecepcion: '25/06/2026 - 10:18',
      condicion: 'En buen estado',
    },
  },
  {
    id: 'ol-004',
    nroOrden: 'ORD-2026-0845',
    paciente: { nombre: 'Carlos', apellidos: 'Rodríguez Pérez', dni: '45231890', edad: 52, sexo: 'M', nroHistoria: 'HC-2020-0045' },
    medicoSolicitante: 'Dr. Luis Torres',
    especialidadMedico: 'Medicina General',
    fechaSolicitud: '25/06/2026 - 08:05',
    examenes: [
      { id: 'e13', nombre: 'Hemoglobina',area: 'Hematología' },
      { id: 'e14', nombre: 'Glucosa',    area: 'Química'     },
      { id: 'e15', nombre: 'TSH',        area: 'Inmunología' },
    ],
    prioridad: 'Normal',
    estado: 'En Proceso',
    muestra: {
      tipo: 'Sangre Venosa', origen: 'Suero', tubo: 'Tubo sin anticoagulante (rojo)',
      fechaToma: '25/06/2026 - 08:20', fechaRecepcion: '25/06/2026 - 08:32',
      condicion: 'En buen estado',
    },
  },
  {
    id: 'ol-005',
    nroOrden: 'ORD-2026-0843',
    paciente: { nombre: 'María', apellidos: 'Huanca Torres', dni: '52190873', edad: 29, sexo: 'F', nroHistoria: 'HC-2023-0412' },
    medicoSolicitante: 'Dra. Carmen Vega',
    especialidadMedico: 'Cardiología',
    fechaSolicitud: '25/06/2026 - 07:45',
    examenes: [
      { id: 'e16', nombre: 'Leucocitos',          area: 'Hematología'  },
      { id: 'e17', nombre: 'Proteína C Reactiva',  area: 'Inmunología'  },
    ],
    prioridad: 'Normal',
    estado: 'Resultados Pendientes',
    muestra: {
      tipo: 'Sangre Venosa', origen: 'Suero', tubo: 'Tubo EDTA (morado)',
      fechaToma: '25/06/2026 - 07:55', fechaRecepcion: '25/06/2026 - 08:02',
      condicion: 'En buen estado',
    },
  },
];

export const MOCK_RESULTADOS_CRITICOS: ResultadoCritico[] = [
  {
    id: 'rc-001',
    paciente: 'Ana Fernández Llanos',
    dni: '72341567',
    examen: 'Glucosa',
    resultado: '345 mg/dL',
    valorRef: '70-100 mg/dL',
    fechaResultado: '25/06/2026 - 10:42',
    notificado: false,
  },
  {
    id: 'rc-002',
    paciente: 'Pedro Martínez Soto',
    dni: '38901245',
    examen: 'Hemoglobina',
    resultado: '6.8 g/dL',
    valorRef: '13-17 g/dL',
    fechaResultado: '25/06/2026 - 10:55',
    notificado: false,
  },
];

export const MOCK_CONTROLES: ControlCalidad[] = [
  {
    id: 'cc-001',
    analizador: 'Architect c8000 (Química)',
    tipoControl: 'Control Nivel 1',
    lote: 'LOT-2026-0612',
    fechaControl: '25/06/2026 - 07:00',
    estado: 'Aceptado',
    firmadoEn: '25/06/2026 - 07:10',
  },
  {
    id: 'cc-002',
    analizador: 'Coulter DxH 900 (Hematología)',
    tipoControl: 'Control Nivel 2',
    lote: 'LOT-2026-0589',
    fechaControl: '25/06/2026 - 07:15',
    estado: 'Rechazado',
    observaciones: 'Control fuera de rango, se repitió calibración.',
  },
  {
    id: 'cc-003',
    analizador: 'Cobas e411 (Inmunología)',
    tipoControl: 'Control Externo',
    lote: 'LOT-2026-0601',
    fechaControl: '24/06/2026 - 07:00',
    estado: 'Aceptado',
    firmadoEn: '24/06/2026 - 07:08',
  },
];

export const MOCK_AUDITORIA_LAB: EntradaAuditoriaLab[] = [
  { id: 'al-01', fechaHora: '25/06/2026 - 07:05', accion: 'Registro de control de calidad', ip: '192.168.1.50', detalle: 'Control Nivel 1 — Architect c8000 — Aceptado' },
  { id: 'al-02', fechaHora: '25/06/2026 - 07:20', accion: 'Registro de control de calidad', ip: '192.168.1.50', detalle: 'Control Nivel 2 — Coulter DxH 900 — Rechazado' },
  { id: 'al-03', fechaHora: '25/06/2026 - 08:32', accion: 'Registro de muestra', pacienteNombre: 'Carlos Rodríguez Pérez', pacienteDni: '45231890', ip: '192.168.1.50', detalle: 'Muestra ORD-2026-0845 — Sangre Venosa — En buen estado' },
  { id: 'al-04', fechaHora: '25/06/2026 - 09:10', accion: 'Ingreso de resultados', pacienteNombre: 'Carlos Rodríguez Pérez', pacienteDni: '45231890', ip: '192.168.1.50', detalle: 'Hemoglobina + Glucosa + TSH — ORD-2026-0845' },
  { id: 'al-05', fechaHora: '25/06/2026 - 09:15', accion: 'Validación de resultados', pacienteNombre: 'Carlos Rodríguez Pérez', pacienteDni: '45231890', ip: '192.168.1.50', detalle: 'Resultados ORD-2026-0845 validados y firmados digitalmente' },
  { id: 'al-06', fechaHora: '25/06/2026 - 09:35', accion: 'Recepción de orden médica', pacienteNombre: 'Ana Fernández Llanos', pacienteDni: '72341567', ip: '192.168.1.50', detalle: 'Orden ORD-2026-0847 recibida — Urgente' },
  { id: 'al-07', fechaHora: '25/06/2026 - 09:50', accion: 'Registro de muestra', pacienteNombre: 'Rosa Quispe Mamani', pacienteDni: '61872340', ip: '192.168.1.50', detalle: 'Muestra ORD-2026-0849 — Sangre Venosa — En buen estado' },
  { id: 'al-08', fechaHora: '25/06/2026 - 10:42', accion: 'Alerta resultado crítico', pacienteNombre: 'Ana Fernández Llanos', pacienteDni: '72341567', ip: '192.168.1.50', detalle: 'Glucosa 345 mg/dL — Valor crítico detectado' },
  { id: 'al-09', fechaHora: '25/06/2026 - 10:55', accion: 'Alerta resultado crítico', pacienteNombre: 'Pedro Martínez Soto', pacienteDni: '38901245', ip: '192.168.1.50', detalle: 'Hemoglobina 6.8 g/dL — Valor crítico detectado' },
  { id: 'al-10', fechaHora: '25/06/2026 - 11:00', accion: 'Notificación al médico', pacienteNombre: 'Ana Fernández Llanos', pacienteDni: '72341567', ip: '192.168.1.50', detalle: 'Resultado crítico notificado al Dr. Luis Torres' },
];

export function nombrePacienteCompleto(p: PacienteLab): string {
  return `${p.nombre} ${p.apellidos}`;
}

// ===================== API (laboratorio-service) =====================
// El endpoint devuelve el arreglo de órdenes directamente (sin envoltura ApiResponse).

/** Lista las órdenes de laboratorio (cola de trabajo). */
export async function listarOrdenesLab(): Promise<OrdenLab[]> {
  const res = await authFetch('/api/laboratorio/ordenes');
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudieron cargar las órdenes'));
  return (await res.json()) as OrdenLab[];
}

/** Registra la muestra de una orden (pasa a "Muestra Registrada"). */
export async function registrarMuestraLab(
  id: string,
  payload: { origenMuestra: string; condicion: string; observaciones?: string },
): Promise<OrdenLab> {
  const res = await authFetch(`/api/laboratorio/ordenes/${id}/muestra`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo registrar la muestra'));
  return (await res.json()) as OrdenLab;
}

/** Ingresa los resultados de los exámenes de una orden. */
export async function ingresarResultadosLab(id: string, resultados: ValorResultado[]): Promise<OrdenLab> {
  const body = {
    resultados: resultados.map((r) => ({
      examenId: r.examenId,
      resultado: r.resultado,
      unidad: r.unidad,
      valorRef: r.valorRef,
      critico: r.critico,
      observaciones: r.observaciones ?? null,
    })),
  };
  const res = await authFetch(`/api/laboratorio/ordenes/${id}/resultados`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudieron ingresar los resultados'));
  return (await res.json()) as OrdenLab;
}

/** Valida la orden (pasa a "Validado" y se envía a la Historia Clínica). */
export async function validarOrdenLab(id: string): Promise<OrdenLab> {
  const res = await authFetch(`/api/laboratorio/ordenes/${id}/validar`, { method: 'PATCH' });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo validar la orden'));
  return (await res.json()) as OrdenLab;
}
