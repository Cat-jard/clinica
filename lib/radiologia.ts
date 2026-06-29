// ===================== TIPOS =====================

export type EstadoEstudio = 'Pendiente' | 'En Proceso' | 'Borrador' | 'Firmado' | 'Revisado';
export type PrioridadEstudio = 'Normal' | 'Urgente';
export type ModalidadEstudio = 'Radiografía' | 'Tomografía (TAC)' | 'Resonancia (RMN)' | 'Ecografía' | 'Mamografía';

export interface PacienteRadiologia {
  nombre: string;
  apellidos: string;
  dni: string;
  edad: number;
  sexo: 'M' | 'F';
  nroHistoria: string;
}

export interface SerieDICOM {
  id: string;
  descripcion: string;
  numCortes: number;
}

export interface InformeRadiologico {
  hallazgos: string;
  impresionDiagnostica: string;
  recomendaciones: string;
  codigoCIE10?: string;
  dosisRadiacion?: string;
}

export interface EstudioImagen {
  id: string;
  nroOrden: string;
  paciente: PacienteRadiologia;
  medicoSolicitante: string;
  especialidadMedico: string;
  modalidad: ModalidadEstudio;
  tipoEstudio: string;          // ej. "TAC Abdominal con contraste"
  regionAnatomica: string;
  fechaSolicitud: string;
  fechaEstudio: string;
  prioridad: PrioridadEstudio;
  estado: EstadoEstudio;
  series: SerieDICOM[];
  informe?: InformeRadiologico;
  firmadoEn?: string;
  esCritico?: boolean;
}

export interface InformePrevio {
  id: string;
  fecha: string;
  tipoEstudio: string;
  medicoSolicitante: string;
  impresion: string;
  estado: EstadoEstudio;
}

export interface EntradaAuditoriaRad {
  id: string;
  fechaHora: string;
  accion: string;
  pacienteNombre?: string;
  pacienteDni?: string;
  ip: string;
  detalle: string;
}

// ===================== CATÁLOGOS =====================

export const MODALIDADES: ModalidadEstudio[] = [
  'Radiografía', 'Tomografía (TAC)', 'Resonancia (RMN)', 'Ecografía', 'Mamografía',
];

export const REGIONES_ANATOMICAS = [
  'Tórax', 'Abdomen', 'Cráneo', 'Columna', 'Pelvis', 'Extremidad Superior', 'Extremidad Inferior', 'Mama',
];

// Plantillas de hallazgos por modalidad — agilizan la redacción del radiólogo
export const PLANTILLAS_HALLAZGOS: Record<string, string> = {
  'Radiografía': 'Silueta cardiaca de tamaño y morfología conservados.\nCampos pulmonares sin consolidaciones ni infiltrados.\nSenos costofrénicos libres.\nEstructuras óseas sin alteraciones evidentes.',
  'Tomografía (TAC)': 'Densidad del parénquima dentro de límites normales.\nNo se observan lesiones ocupantes de espacio.\nEstructuras vasculares de calibre conservado.\nNo hay evidencia de colecciones líquidas.',
  'Resonancia (RMN)': 'Intensidad de señal conservada en secuencias T1 y T2.\nNo se observan lesiones focales.\nEstructuras anatómicas de morfología normal.',
  'Ecografía': 'Ecogenicidad del parénquima homogénea.\nContornos regulares.\nNo se observan colecciones ni masas.',
  'Mamografía': 'Patrón mamario fibroglandular disperso (ACR B).\nNo se observan nódulos, distorsiones ni microcalcificaciones sospechosas.\nBI-RADS 1.',
};

// ===================== MOCK DATA =====================

function generarSeries(modalidad: ModalidadEstudio): SerieDICOM[] {
  switch (modalidad) {
    case 'Tomografía (TAC)':
      return [
        { id: 's1', descripcion: 'Axial', numCortes: 120 },
        { id: 's2', descripcion: 'Coronal reconstruido', numCortes: 64 },
      ];
    case 'Resonancia (RMN)':
      return [
        { id: 's1', descripcion: 'Sagital T1', numCortes: 24 },
        { id: 's2', descripcion: 'Axial T2', numCortes: 30 },
      ];
    case 'Radiografía':
      return [{ id: 's1', descripcion: 'PA / Lateral', numCortes: 2 }];
    case 'Ecografía':
      return [{ id: 's1', descripcion: 'Cortes seleccionados', numCortes: 8 }];
    case 'Mamografía':
      return [{ id: 's1', descripcion: 'CC / MLO bilateral', numCortes: 4 }];
  }
}

export const MOCK_ESTUDIOS: EstudioImagen[] = [
  {
    id: 'es-001',
    nroOrden: 'IMG-2026-0312',
    paciente: { nombre: 'Ana', apellidos: 'Fernández Llanos', dni: '72341567', edad: 36, sexo: 'F', nroHistoria: 'HC-2024-0342' },
    medicoSolicitante: 'Dr. Luis Torres',
    especialidadMedico: 'Medicina General',
    modalidad: 'Radiografía',
    tipoEstudio: 'Rx de Tórax PA y Lateral',
    regionAnatomica: 'Tórax',
    fechaSolicitud: '25/06/2026 - 09:30',
    fechaEstudio: '25/06/2026 - 10:10',
    prioridad: 'Urgente',
    estado: 'Pendiente',
    series: generarSeries('Radiografía'),
  },
  {
    id: 'es-002',
    nroOrden: 'IMG-2026-0313',
    paciente: { nombre: 'Pedro', apellidos: 'Martínez Soto', dni: '38901245', edad: 58, sexo: 'M', nroHistoria: 'HC-2025-0119' },
    medicoSolicitante: 'Dra. Carmen Vega',
    especialidadMedico: 'Cardiología',
    modalidad: 'Tomografía (TAC)',
    tipoEstudio: 'TAC Abdominal con contraste',
    regionAnatomica: 'Abdomen',
    fechaSolicitud: '25/06/2026 - 08:50',
    fechaEstudio: '25/06/2026 - 09:40',
    prioridad: 'Urgente',
    estado: 'Pendiente',
    series: generarSeries('Tomografía (TAC)'),
  },
  {
    id: 'es-003',
    nroOrden: 'IMG-2026-0310',
    paciente: { nombre: 'Rosa', apellidos: 'Quispe Mamani', dni: '61872340', edad: 42, sexo: 'F', nroHistoria: 'HC-2024-0891' },
    medicoSolicitante: 'Dr. Luis Torres',
    especialidadMedico: 'Traumatología',
    modalidad: 'Resonancia (RMN)',
    tipoEstudio: 'RMN de Rodilla derecha',
    regionAnatomica: 'Extremidad Inferior',
    fechaSolicitud: '25/06/2026 - 08:15',
    fechaEstudio: '25/06/2026 - 09:00',
    prioridad: 'Normal',
    estado: 'En Proceso',
    series: generarSeries('Resonancia (RMN)'),
  },
  {
    id: 'es-004',
    nroOrden: 'IMG-2026-0308',
    paciente: { nombre: 'Carlos', apellidos: 'Rodríguez Pérez', dni: '45231890', edad: 52, sexo: 'M', nroHistoria: 'HC-2020-0045' },
    medicoSolicitante: 'Dr. Luis Torres',
    especialidadMedico: 'Medicina General',
    modalidad: 'Ecografía',
    tipoEstudio: 'Ecografía Abdominal completa',
    regionAnatomica: 'Abdomen',
    fechaSolicitud: '25/06/2026 - 07:40',
    fechaEstudio: '25/06/2026 - 08:20',
    prioridad: 'Normal',
    estado: 'Borrador',
    series: generarSeries('Ecografía'),
    informe: {
      hallazgos: 'Hígado de tamaño normal, ecogenicidad ligeramente aumentada.\nVesícula biliar sin litiasis.\nRiñones de morfología conservada.',
      impresionDiagnostica: '',
      recomendaciones: '',
    },
  },
  {
    id: 'es-005',
    nroOrden: 'IMG-2026-0305',
    paciente: { nombre: 'María', apellidos: 'Huanca Torres', dni: '52190873', edad: 49, sexo: 'F', nroHistoria: 'HC-2023-0412' },
    medicoSolicitante: 'Dra. Carmen Vega',
    especialidadMedico: 'Ginecología',
    modalidad: 'Mamografía',
    tipoEstudio: 'Mamografía Bilateral de Tamizaje',
    regionAnatomica: 'Mama',
    fechaSolicitud: '24/06/2026 - 16:20',
    fechaEstudio: '25/06/2026 - 07:30',
    prioridad: 'Normal',
    estado: 'Firmado',
    series: generarSeries('Mamografía'),
    informe: {
      hallazgos: 'Patrón mamario fibroglandular disperso (ACR B).\nNo se observan nódulos ni microcalcificaciones sospechosas.',
      impresionDiagnostica: 'Estudio mamográfico sin hallazgos sospechosos de malignidad. BI-RADS 1.',
      recomendaciones: 'Control mamográfico de rutina en 1 año.',
    },
    firmadoEn: '25/06/2026 - 08:05',
  },
];

export const MOCK_INFORMES_PREVIOS: InformePrevio[] = [
  { id: 'ip-1', fecha: '12/03/2026 - 11:20', tipoEstudio: 'Rx de Tórax', medicoSolicitante: 'Dr. Luis Torres', impresion: 'Sin alteraciones pleuropulmonares', estado: 'Revisado' },
  { id: 'ip-2', fecha: '05/11/2025 - 09:45', tipoEstudio: 'TAC Craneal', medicoSolicitante: 'Dra. Carmen Vega', impresion: 'Estudio dentro de límites normales', estado: 'Revisado' },
  { id: 'ip-3', fecha: '18/07/2025 - 15:10', tipoEstudio: 'Ecografía Abdominal', medicoSolicitante: 'Dr. Luis Torres', impresion: 'Esteatosis hepática leve', estado: 'Revisado' },
];

export const MOCK_AUDITORIA_RAD: EntradaAuditoriaRad[] = [
  { id: 'ar-01', fechaHora: '25/06/2026 - 07:35', accion: 'Apertura de estudio', pacienteNombre: 'María Huanca Torres', pacienteDni: '52190873', ip: '192.168.1.60', detalle: 'Mamografía IMG-2026-0305 abierta en visor' },
  { id: 'ar-02', fechaHora: '25/06/2026 - 08:05', accion: 'Firma de informe', pacienteNombre: 'María Huanca Torres', pacienteDni: '52190873', ip: '192.168.1.60', detalle: 'Informe IMG-2026-0305 firmado digitalmente — BI-RADS 1' },
  { id: 'ar-03', fechaHora: '25/06/2026 - 08:22', accion: 'Apertura de estudio', pacienteNombre: 'Carlos Rodríguez Pérez', pacienteDni: '45231890', ip: '192.168.1.60', detalle: 'Ecografía IMG-2026-0308 abierta en visor' },
  { id: 'ar-04', fechaHora: '25/06/2026 - 08:40', accion: 'Guardado de borrador', pacienteNombre: 'Carlos Rodríguez Pérez', pacienteDni: '45231890', ip: '192.168.1.60', detalle: 'Borrador de hallazgos guardado — IMG-2026-0308' },
  { id: 'ar-05', fechaHora: '25/06/2026 - 09:05', accion: 'Apertura de estudio', pacienteNombre: 'Rosa Quispe Mamani', pacienteDni: '61872340', ip: '192.168.1.60', detalle: 'RMN IMG-2026-0310 abierta en visor' },
  { id: 'ar-06', fechaHora: '25/06/2026 - 09:18', accion: 'Medición en imagen', pacienteNombre: 'Rosa Quispe Mamani', pacienteDni: '61872340', ip: '192.168.1.60', detalle: 'Medición de distancia registrada en corte axial T2' },
  { id: 'ar-07', fechaHora: '25/06/2026 - 10:12', accion: 'Recepción de estudio urgente', pacienteNombre: 'Ana Fernández Llanos', pacienteDni: '72341567', ip: '192.168.1.60', detalle: 'Rx Tórax IMG-2026-0312 marcada URGENTE' },
];

// ===================== HELPERS =====================

export const PRIORIDAD_ORDER: Record<PrioridadEstudio, number> = { 'Urgente': 0, 'Normal': 1 };

export const ESTADO_CONFIG: Record<EstadoEstudio, { label: string; className: string }> = {
  'Pendiente': { label: 'Pendiente', className: 'bg-gray-100 text-gray-600'    },
  'En Proceso':{ label: 'En Proceso',className: 'bg-amber-100 text-amber-700'  },
  'Borrador':  { label: 'Borrador',  className: 'bg-purple-100 text-purple-700'},
  'Firmado':   { label: 'Firmado',   className: 'bg-green-100 text-green-700'  },
  'Revisado':  { label: 'Revisado',  className: 'bg-blue-100 text-blue-700'    },
};

export function nombrePacienteRad(p: PacienteRadiologia): string {
  return `${p.nombre} ${p.apellidos}`;
}

// Calcula minutos transcurridos desde una fecha "DD/MM/YYYY - HH:MM" respecto a un "ahora" simulado
export function minutosEspera(fecha: string, ahora = new Date('2026-06-25T11:00:00')): number {
  const m = fecha.match(/(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2}):(\d{2})/);
  if (!m) return 0;
  const [, dd, mm, yyyy, hh, min] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
  return Math.max(0, Math.round((ahora.getTime() - d.getTime()) / 60000));
}

export function formatoEspera(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}
