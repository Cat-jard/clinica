import type { Prioridad, SignosVitales } from './vitals';

export type { Prioridad };

// ── Paciente en cola del médico ──────────────────────────────────────────────
export interface PacienteMedicoEspera {
  id: string;
  ticket: string;
  nombre: string;
  dni: string;
  edad: number;
  sexo: 'M' | 'F';
  prioridad: Prioridad;
  signos: Partial<SignosVitales>;
  tiempoEspera: Date;
  motivoConsulta: string;
  aseguradora: 'SIS' | 'EsSalud' | 'EPS' | 'Particular';
}

// ── Cita del día ─────────────────────────────────────────────────────────────
export interface CitaDia {
  id: string;
  hora: string;
  pacienteNombre: string;
  pacienteDni: string;
  motivoResumen: string;
  estado: 'Confirmada' | 'Pendiente' | 'En Atención' | 'Atendida';
}

// ── Diagnóstico CIE-10 ───────────────────────────────────────────────────────
export interface DiagnosticoCIE10 {
  codigo: string;
  descripcion: string;
  tipo: 'Principal' | 'Secundario';
}

// ── Anamnesis ────────────────────────────────────────────────────────────────
export interface Anamnesis {
  motivoConsulta: string;
  enfermedadActual: string;
  antecedentesPatologicos: string[];
  antecedentesQuirurgicos: string;
  antecedentesAlergicos: string;
  antecedentesFamiliares: string;
  habitos: string[];
  medicacionActual: string;
}

// ── Examen Físico ────────────────────────────────────────────────────────────
export interface ExamenFisico {
  examenGeneral: string;
  cabezaCuello: string;
  toraxPulmones: string;
  corazon: string;
  abdomen: string;
  extremidades: string;
  neurologico: string;
  otros: string;
}

// ── Receta ───────────────────────────────────────────────────────────────────
export interface ItemReceta {
  id: string;
  medicamento: string;
  concentracion: string;
  presentacion: string;
  dosis: string;
  via: 'Oral' | 'IV' | 'IM' | 'SC' | 'Tópica' | 'Inhalatoria';
  frecuencia: string;
  duracion: string;
  cantidad: number;
  indicacionesEspeciales: string;
}

export interface Receta {
  id: string;
  pacienteId: string;
  items: ItemReceta[];
  estado: 'Borrador' | 'Firmada' | 'Enviada';
  firmadaEn?: string;
}

// ── Exámenes ─────────────────────────────────────────────────────────────────
export interface ItemExamen {
  id: string;
  tipo: 'Laboratorio' | 'Imágenes' | 'Otros';
  nombre: string;
  origenMuestra?: string;
  ayuno?: string;
  urgente: boolean;
  indicaciones: string;
}

export interface SolicitudExamenes {
  id: string;
  pacienteId: string;
  items: ItemExamen[];
  estado: 'Borrador' | 'Firmada' | 'Enviada';
}

// ── Interconsulta ────────────────────────────────────────────────────────────
export interface Interconsulta {
  id: string;
  especialidadDestino: string;
  medicoDestino: string;
  motivoInterconsulta: string;
  hallazgosRelevantes: string;
  preguntaEspecialista: string;
  urgencia: 'Normal' | 'Urgente';
  estado: 'Enviada' | 'Respondida' | 'Cancelada';
}

// ── Atención médica (HCE) ────────────────────────────────────────────────────
export interface AtencionMedica {
  id: string;
  pacienteId: string;
  fechaInicio: string;
  anamnesis: Anamnesis;
  examenFisico: ExamenFisico;
  diagnosticos: DiagnosticoCIE10[];
  indicacionesGenerales: string;
  procedimientosRealizados: string;
  receta?: Receta;
  examenes?: SolicitudExamenes;
  interconsultas: Interconsulta[];
  estado: 'Borrador' | 'Firmada';
  firmadaEn?: string;
}

// ── Paciente completo (HCE) ──────────────────────────────────────────────────
export interface PacienteMedico {
  id: string;
  nombre: string;
  apellidos: string;
  dni: string;
  fechaNac: string;
  sexo: 'M' | 'F';
  nroHistoria: string;
  aseguradora: 'SIS' | 'EsSalud' | 'EPS' | 'Particular';
  alergias: string;
  signos: Partial<SignosVitales>;
  prioridad: Prioridad;
  motivoConsulta: string;
  atencionActual: AtencionMedica;
  atencionesPrevias: { fecha: string; diagnostico: string; medico: string }[];
}

// ── Auditoría ────────────────────────────────────────────────────────────────
export interface EntradaAuditoria {
  id: string;
  fechaHora: string;
  accion: string;
  pacienteNombre: string;
  pacienteDni: string;
  ip: string;
  detalle: string;
}

// ── Resultado de laboratorio ─────────────────────────────────────────────────
export interface ResultadoLab {
  id: string;
  nombre: string;
  fechaToma: string;
  fechaResultado: string;
  resultado: string;
  valorRef: string;
  unidad: string;
  critico: boolean;
  estado: 'Pendiente' | 'En Proceso' | 'Validado';
}

// ── Catálogo CIE-10 ──────────────────────────────────────────────────────────
export const CIE10_CATALOG: { codigo: string; descripcion: string }[] = [
  { codigo: 'A09',   descripcion: 'Diarrea y gastroenteritis de presunto origen infeccioso' },
  { codigo: 'A15.0', descripcion: 'Tuberculosis pulmonar confirmada por examen microscópico' },
  { codigo: 'B34.9', descripcion: 'Infección viral, no especificada' },
  { codigo: 'E11.9', descripcion: 'Diabetes mellitus tipo 2 sin complicaciones' },
  { codigo: 'E11.0', descripcion: 'Diabetes mellitus tipo 2 con coma' },
  { codigo: 'E14.9', descripcion: 'Diabetes mellitus no especificada, sin complicaciones' },
  { codigo: 'E66.9', descripcion: 'Obesidad, no especificada' },
  { codigo: 'I10',   descripcion: 'Hipertensión esencial (primaria)' },
  { codigo: 'I11.9', descripcion: 'Enfermedad cardíaca hipertensiva sin insuficiencia cardíaca' },
  { codigo: 'I20.9', descripcion: 'Angina de pecho, no especificada' },
  { codigo: 'I25.1', descripcion: 'Enfermedad aterosclerótica del corazón' },
  { codigo: 'J00',   descripcion: 'Rinofaringitis aguda (resfriado común)' },
  { codigo: 'J06.9', descripcion: 'Infección aguda de las vías respiratorias superiores' },
  { codigo: 'J18.9', descripcion: 'Neumonía, no especificada' },
  { codigo: 'J44.1', descripcion: 'Enfermedad pulmonar obstructiva crónica con exacerbación aguda' },
  { codigo: 'J45.9', descripcion: 'Asma, no especificada' },
  { codigo: 'K21.0', descripcion: 'Enfermedad por reflujo gastroesofágico con esofagitis' },
  { codigo: 'K29.7', descripcion: 'Gastritis, no especificada' },
  { codigo: 'K35.9', descripcion: 'Apendicitis aguda, no especificada' },
  { codigo: 'K80.2', descripcion: 'Cálculos de la vesícula biliar sin colecistitis' },
  { codigo: 'M54.5', descripcion: 'Lumbago no especificado' },
  { codigo: 'N18.9', descripcion: 'Insuficiencia renal crónica, no especificada' },
  { codigo: 'N39.0', descripcion: 'Infección de vías urinarias, sitio no especificado' },
  { codigo: 'R05',   descripcion: 'Tos' },
  { codigo: 'R50.9', descripcion: 'Fiebre, no especificada' },
  { codigo: 'R51',   descripcion: 'Cefalea' },
  { codigo: 'R07.4', descripcion: 'Dolor torácico, no especificado' },
  { codigo: 'R10.4', descripcion: 'Otros dolores abdominales y los no especificados' },
  { codigo: 'Z00.0', descripcion: 'Examen médico general' },
  { codigo: 'Z30.0', descripcion: 'Consejo y asesoramiento sobre anticoncepción' },
];

// ── Catálogo de medicamentos ─────────────────────────────────────────────────
export const MEDICAMENTOS_CATALOG = [
  { nombre: 'Paracetamol', concentracion: '500 mg', presentacion: 'Tableta' },
  { nombre: 'Ibuprofeno',  concentracion: '400 mg', presentacion: 'Tableta' },
  { nombre: 'Amoxicilina', concentracion: '500 mg', presentacion: 'Cápsula' },
  { nombre: 'Metformina',  concentracion: '850 mg', presentacion: 'Tableta' },
  { nombre: 'Enalapril',   concentracion: '10 mg',  presentacion: 'Tableta' },
  { nombre: 'Losartán',    concentracion: '50 mg',  presentacion: 'Tableta' },
  { nombre: 'Atorvastatina', concentracion: '20 mg', presentacion: 'Tableta' },
  { nombre: 'Omeprazol',   concentracion: '20 mg',  presentacion: 'Cápsula' },
  { nombre: 'Salbutamol',  concentracion: '100 mcg', presentacion: 'Inhalador' },
  { nombre: 'Amlodipino',  concentracion: '5 mg',   presentacion: 'Tableta' },
  { nombre: 'Ciprofloxacino', concentracion: '500 mg', presentacion: 'Tableta' },
  { nombre: 'Azitromicina', concentracion: '500 mg', presentacion: 'Tableta' },
  { nombre: 'Diclofenaco', concentracion: '50 mg',  presentacion: 'Tableta' },
  { nombre: 'Tramadol',    concentracion: '50 mg',  presentacion: 'Cápsula' },
  { nombre: 'Metronidazol', concentracion: '500 mg', presentacion: 'Tableta' },
  { nombre: 'Clonazepam',  concentracion: '0.5 mg', presentacion: 'Tableta' },
  { nombre: 'Captopril',   concentracion: '25 mg',  presentacion: 'Tableta' },
  { nombre: 'Furosemida',  concentracion: '40 mg',  presentacion: 'Tableta' },
  { nombre: 'Insulina NPH', concentracion: '100 UI/mL', presentacion: 'Vial' },
  { nombre: 'Prednisona',  concentracion: '20 mg',  presentacion: 'Tableta' },
];

// ── Catálogo de exámenes ─────────────────────────────────────────────────────
export const EXAMENES_CATALOG = [
  { tipo: 'Laboratorio' as const, nombre: 'Hemograma completo',       muestra: 'Sangre' },
  { tipo: 'Laboratorio' as const, nombre: 'Glucosa en ayunas',        muestra: 'Sangre' },
  { tipo: 'Laboratorio' as const, nombre: 'Hemoglobina glicosilada',  muestra: 'Sangre' },
  { tipo: 'Laboratorio' as const, nombre: 'Perfil lipídico completo', muestra: 'Sangre' },
  { tipo: 'Laboratorio' as const, nombre: 'Creatinina sérica',        muestra: 'Sangre' },
  { tipo: 'Laboratorio' as const, nombre: 'Urea sérica',              muestra: 'Sangre' },
  { tipo: 'Laboratorio' as const, nombre: 'TGO / TGP',               muestra: 'Sangre' },
  { tipo: 'Laboratorio' as const, nombre: 'Examen de orina completo', muestra: 'Orina' },
  { tipo: 'Laboratorio' as const, nombre: 'Urocultivo',               muestra: 'Orina' },
  { tipo: 'Laboratorio' as const, nombre: 'Baciloscopía de esputo',   muestra: 'Esputo' },
  { tipo: 'Imágenes' as const,    nombre: 'Radiografía de tórax PA',  muestra: '' },
  { tipo: 'Imágenes' as const,    nombre: 'Ecografía abdominal',      muestra: '' },
  { tipo: 'Imágenes' as const,    nombre: 'TAC de cráneo simple',     muestra: '' },
  { tipo: 'Imágenes' as const,    nombre: 'Ecografía renal',          muestra: '' },
  { tipo: 'Imágenes' as const,    nombre: 'Electrocardiograma',       muestra: '' },
];

// ── Datos mock ───────────────────────────────────────────────────────────────
export const MOCK_CITAS: CitaDia[] = [
  { id: 'c1', hora: '08:00', pacienteNombre: 'Carlos Rodríguez Pérez',  pacienteDni: '45231890', motivoResumen: 'Control diabetes',           estado: 'Atendida'    },
  { id: 'c2', hora: '08:30', pacienteNombre: 'Ana Fernández Llanos',    pacienteDni: '72341567', motivoResumen: 'Dolor abdominal 3 días',     estado: 'En Atención' },
  { id: 'c3', hora: '09:00', pacienteNombre: 'Pedro Martínez Soto',     pacienteDni: '38901245', motivoResumen: 'Hipertensión mal controlada', estado: 'Confirmada'  },
  { id: 'c4', hora: '09:30', pacienteNombre: 'Rosa Quispe Mamani',      pacienteDni: '61872340', motivoResumen: 'Cefalea intensa recurrente',  estado: 'Pendiente'   },
];

export const MOCK_COLA_ESPERA: PacienteMedicoEspera[] = [
  {
    id: '2',
    ticket: 'T-002',
    nombre: 'Ana Fernández Llanos',
    dni: '72341567',
    edad: 34,
    sexo: 'F',
    prioridad: 'II-NARANJA',
    signos: { pasSistolica: 185, pasDiastolica: 112, frecCardiaca: 98, spo2: 96, temperatura: 37.2 },
    tiempoEspera: new Date(Date.now() - 18 * 60000),
    motivoConsulta: 'Dolor abdominal intenso de 3 días de evolución',
    aseguradora: 'SIS',
  },
  {
    id: '3',
    ticket: 'T-003',
    nombre: 'Pedro Martínez Soto',
    dni: '38901245',
    edad: 58,
    sexo: 'M',
    prioridad: 'III-AMARILLO',
    signos: { pasSistolica: 160, pasDiastolica: 95, frecCardiaca: 82, spo2: 97, temperatura: 36.8 },
    tiempoEspera: new Date(Date.now() - 45 * 60000),
    motivoConsulta: 'Hipertensión arterial mal controlada',
    aseguradora: 'EsSalud',
  },
  {
    id: '4',
    ticket: 'T-004',
    nombre: 'Rosa Quispe Mamani',
    dni: '61872340',
    edad: 42,
    sexo: 'F',
    prioridad: 'IV-VERDE',
    signos: { pasSistolica: 130, pasDiastolica: 80, frecCardiaca: 76, spo2: 98, temperatura: 37.0 },
    tiempoEspera: new Date(Date.now() - 62 * 60000),
    motivoConsulta: 'Cefalea intensa recurrente',
    aseguradora: 'Particular',
  },
];

const anamnesisVacia: Anamnesis = {
  motivoConsulta: '', enfermedadActual: '', antecedentesPatologicos: [],
  antecedentesQuirurgicos: '', antecedentesAlergicos: '', antecedentesFamiliares: '',
  habitos: [], medicacionActual: '',
};

const examenVacio: ExamenFisico = {
  examenGeneral: '', cabezaCuello: '', toraxPulmones: '',
  corazon: '', abdomen: '', extremidades: '', neurologico: '', otros: '',
};

export const MOCK_PACIENTES: PacienteMedico[] = [
  {
    id: '2',
    nombre: 'Ana',
    apellidos: 'Fernández Llanos',
    dni: '72341567',
    fechaNac: '1990-03-15',
    sexo: 'F',
    nroHistoria: 'HC-2024-0342',
    aseguradora: 'SIS',
    alergias: 'Penicilina, AINEs',
    prioridad: 'II-NARANJA',
    motivoConsulta: 'Dolor abdominal intenso de 3 días de evolución',
    signos: { pasSistolica: 185, pasDiastolica: 112, frecCardiaca: 98, spo2: 96, temperatura: 37.2, peso: 62, talla: 165 },
    atencionActual: {
      id: 'at-2', pacienteId: '2', fechaInicio: new Date().toISOString(),
      anamnesis: { ...anamnesisVacia, motivoConsulta: 'Dolor abdominal intenso de 3 días de evolución' },
      examenFisico: examenVacio, diagnosticos: [], indicacionesGenerales: '',
      procedimientosRealizados: '', interconsultas: [], estado: 'Borrador',
    },
    atencionesPrevias: [
      { fecha: '15/01/2026', diagnostico: 'J00 — Resfriado común', medico: 'Dr. Luis Torres' },
      { fecha: '03/11/2025', diagnostico: 'K29.7 — Gastritis', medico: 'Dr. Luis Torres' },
    ],
  },
  {
    id: '3',
    nombre: 'Pedro',
    apellidos: 'Martínez Soto',
    dni: '38901245',
    fechaNac: '1966-07-22',
    sexo: 'M',
    nroHistoria: 'HC-2022-0118',
    aseguradora: 'EsSalud',
    alergias: '',
    prioridad: 'III-AMARILLO',
    motivoConsulta: 'Hipertensión arterial mal controlada',
    signos: { pasSistolica: 160, pasDiastolica: 95, frecCardiaca: 82, spo2: 97, temperatura: 36.8, peso: 84, talla: 172 },
    atencionActual: {
      id: 'at-3', pacienteId: '3', fechaInicio: new Date().toISOString(),
      anamnesis: { ...anamnesisVacia, motivoConsulta: 'Hipertensión arterial mal controlada', antecedentesPatologicos: ['HTA', 'DM2'], medicacionActual: 'Enalapril 10 mg/día, Metformina 850 mg c/12h' },
      examenFisico: examenVacio, diagnosticos: [], indicacionesGenerales: '',
      procedimientosRealizados: '', interconsultas: [], estado: 'Borrador',
    },
    atencionesPrevias: [
      { fecha: '10/06/2026', diagnostico: 'I10 — Hipertensión esencial', medico: 'Dr. Luis Torres' },
      { fecha: '12/03/2026', diagnostico: 'E11.9 — DM2 sin complicaciones', medico: 'Dr. Luis Torres' },
    ],
  },
  {
    id: '4',
    nombre: 'Rosa',
    apellidos: 'Quispe Mamani',
    dni: '61872340',
    fechaNac: '1984-11-08',
    sexo: 'F',
    nroHistoria: 'HC-2025-0891',
    aseguradora: 'Particular',
    alergias: '',
    prioridad: 'IV-VERDE',
    motivoConsulta: 'Cefalea intensa recurrente',
    signos: { pasSistolica: 130, pasDiastolica: 80, frecCardiaca: 76, spo2: 98, temperatura: 37.0, peso: 57, talla: 158 },
    atencionActual: {
      id: 'at-4', pacienteId: '4', fechaInicio: new Date().toISOString(),
      anamnesis: { ...anamnesisVacia, motivoConsulta: 'Cefalea intensa recurrente' },
      examenFisico: examenVacio, diagnosticos: [], indicacionesGenerales: '',
      procedimientosRealizados: '', interconsultas: [], estado: 'Borrador',
    },
    atencionesPrevias: [],
  },
];

export const MOCK_AUDITORIA: EntradaAuditoria[] = [
  { id: 'a1',  fechaHora: '25/06/2026 — 08:05', accion: 'Apertura de historia clínica',    pacienteNombre: 'Carlos Rodríguez Pérez', pacienteDni: '45231890', ip: '192.168.1.42', detalle: 'Historia HC-2020-0045 abierta' },
  { id: 'a2',  fechaHora: '25/06/2026 — 08:32', accion: 'Registro de anamnesis',            pacienteNombre: 'Carlos Rodríguez Pérez', pacienteDni: '45231890', ip: '192.168.1.42', detalle: 'Motivo: control diabetes' },
  { id: 'a3',  fechaHora: '25/06/2026 — 08:44', accion: 'Diagnóstico CIE-10 registrado',   pacienteNombre: 'Carlos Rodríguez Pérez', pacienteDni: '45231890', ip: '192.168.1.42', detalle: 'E11.9 — DM2 sin complicaciones' },
  { id: 'a4',  fechaHora: '25/06/2026 — 08:46', accion: 'Receta firmada digitalmente',      pacienteNombre: 'Carlos Rodríguez Pérez', pacienteDni: '45231890', ip: '192.168.1.42', detalle: 'Metformina 850 mg + Enalapril 10 mg' },
  { id: 'a5',  fechaHora: '25/06/2026 — 08:50', accion: 'Atención cerrada y firmada',       pacienteNombre: 'Carlos Rodríguez Pérez', pacienteDni: '45231890', ip: '192.168.1.42', detalle: 'Atención at-1 firmada y cerrada' },
  { id: 'a6',  fechaHora: '25/06/2026 — 09:15', accion: 'Apertura de historia clínica',    pacienteNombre: 'Ana Fernández Llanos',   pacienteDni: '72341567', ip: '192.168.1.42', detalle: 'Historia HC-2024-0342 abierta' },
  { id: 'a7',  fechaHora: '25/06/2026 — 09:28', accion: 'Orden de exámenes enviada',        pacienteNombre: 'Ana Fernández Llanos',   pacienteDni: '72341567', ip: '192.168.1.42', detalle: 'Hemograma + Ecografía abdominal' },
  { id: 'a8',  fechaHora: '25/06/2026 — 09:35', accion: 'Interconsulta enviada',            pacienteNombre: 'Ana Fernández Llanos',   pacienteDni: '72341567', ip: '192.168.1.42', detalle: 'Gastroenterología — Urgente' },
  { id: 'a9',  fechaHora: '25/06/2026 — 10:02', accion: 'Diagnóstico CIE-10 modificado',   pacienteNombre: 'Pedro Martínez Soto',    pacienteDni: '38901245', ip: '192.168.1.42', detalle: 'Cambio de I10 a I11.9' },
  { id: 'a10', fechaHora: '25/06/2026 — 10:18', accion: 'Solicitud de exámenes firmada',    pacienteNombre: 'Pedro Martínez Soto',    pacienteDni: '38901245', ip: '192.168.1.42', detalle: 'Perfil lipídico + Creatinina' },
];

export const MOCK_RESULTADOS: ResultadoLab[] = [
  { id: 'r1', nombre: 'Hemoglobina',      fechaToma: '24/06/2026', fechaResultado: '24/06/2026', resultado: '9.2',  valorRef: '12.0-16.0', unidad: 'g/dL',    critico: true,  estado: 'Validado'  },
  { id: 'r2', nombre: 'Glucosa en ayunas', fechaToma: '24/06/2026', fechaResultado: '24/06/2026', resultado: '245', valorRef: '70-100',    unidad: 'mg/dL',   critico: true,  estado: 'Validado'  },
  { id: 'r3', nombre: 'Creatinina',        fechaToma: '24/06/2026', fechaResultado: '24/06/2026', resultado: '1.1', valorRef: '0.6-1.2',   unidad: 'mg/dL',   critico: false, estado: 'Validado'  },
  { id: 'r4', nombre: 'Colesterol total',  fechaToma: '25/06/2026', fechaResultado: '25/06/2026', resultado: '---', valorRef: '< 200',     unidad: 'mg/dL',   critico: false, estado: 'En Proceso'},
];

// ── Helpers ──────────────────────────────────────────────────────────────────
export function calcEdad(fechaNac: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate())) edad--;
  return edad;
}

export function nombreCompleto(p: PacienteMedico): string {
  return `${p.apellidos}, ${p.nombre}`;
}
