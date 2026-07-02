import type { OrdenLab, EstadoOrden, PrioridadLab, ExamenSolicitado } from '@/lib/laboratorio';
import type { EstudioImagen, ModalidadEstudio, EstadoEstudio, PrioridadEstudio, SerieDICOM, InformeRadiologico } from '@/lib/radiologia';

/** Médico en sesión — placeholder hasta integrar usuario-service */
export const MEDICO_ACTUAL = {
  nombre: 'Dr. Luis Torres',
  especialidad: 'Medicina General',
};

export function calcEdad(fechaNac: string): number {
  const birth = new Date(fechaNac);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const AREA_MAP: Record<string, ExamenSolicitado['area']> = {
  Hematologia: 'Hematología',
  Quimica: 'Química',
  Inmunologia: 'Inmunología',
  Microbiologia: 'Microbiología',
  Orina: 'Orina',
};

const MODALIDAD_MAP: Record<string, ModalidadEstudio> = {
  Radiografia: 'Radiografía',
  'Tomografia (TAC)': 'Tomografía (TAC)',
  'Resonancia (RMN)': 'Resonancia (RMN)',
  Ecografia: 'Ecografía',
  Mamografia: 'Mamografía',
};

function mapArea(area: string): ExamenSolicitado['area'] {
  return AREA_MAP[area] ?? 'Química';
}

function mapModalidad(modalidad: string): ModalidadEstudio {
  return MODALIDAD_MAP[modalidad] ?? 'Radiografía';
}

// ── DTOs del backend ────────────────────────────────────────────────────────

interface PacienteDto {
  id?: string | null;
  nombre: string;
  apellidos: string;
  dni: string;
  edad: number;
  sexo: 'M' | 'F';
  nroHistoria: string;
}

interface ExamenSolicitadoDto {
  id: string;
  nombre: string;
  area: string;
  analizador?: string | null;
}

export interface OrdenLabDto {
  id: string;
  nroOrden: string;
  paciente: PacienteDto;
  medicoSolicitante: string;
  especialidadMedico: string;
  fechaSolicitud: string;
  examenes: ExamenSolicitadoDto[];
  prioridad: string;
  estado: string;
  origenMuestra?: string | null;
  ayuno?: string | null;
  indicaciones?: string | null;
}

interface SerieDicomDto {
  id: string;
  descripcion: string;
  numCortes: number;
}

interface InformeRadiologicoDto {
  hallazgos: string;
  impresionDiagnostica: string;
  recomendaciones: string;
  codigoCIE10?: string | null;
  dosisRadiacion?: string | null;
}

export interface EstudioImagenDto {
  id: string;
  nroOrden: string;
  paciente: PacienteDto;
  medicoSolicitante: string;
  especialidadMedico: string;
  modalidad: string;
  tipoEstudio: string;
  regionAnatomica: string;
  fechaSolicitud: string;
  fechaEstudio: string;
  prioridad: string;
  estado: string;
  series: SerieDicomDto[];
  informe?: InformeRadiologicoDto | null;
  firmadoEn?: string | null;
  esCritico?: boolean | null;
  indicaciones?: string | null;
}

// ── Mappers front ← backend ─────────────────────────────────────────────────

export function mapOrdenLab(dto: OrdenLabDto): OrdenLab {
  return {
    id: dto.id,
    nroOrden: dto.nroOrden,
    paciente: {
      nombre: dto.paciente.nombre,
      apellidos: dto.paciente.apellidos,
      dni: dto.paciente.dni,
      edad: dto.paciente.edad,
      sexo: dto.paciente.sexo,
      nroHistoria: dto.paciente.nroHistoria,
    },
    medicoSolicitante: dto.medicoSolicitante,
    especialidadMedico: dto.especialidadMedico,
    fechaSolicitud: dto.fechaSolicitud,
    examenes: dto.examenes.map(e => ({
      id: e.id,
      nombre: e.nombre,
      area: mapArea(e.area),
      analizador: e.analizador ?? undefined,
    })),
    prioridad: dto.prioridad as PrioridadLab,
    estado: dto.estado as EstadoOrden,
    ...(dto.origenMuestra
      ? {
          muestra: {
            tipo: 'Sangre Venosa' as const,
            origen: dto.origenMuestra,
            tubo: 'Tubo EDTA (morado)',
            fechaToma: dto.fechaSolicitud,
            fechaRecepcion: dto.fechaSolicitud,
            condicion: 'En buen estado' as const,
          },
        }
      : {}),
  };
}

function mapInforme(dto?: InformeRadiologicoDto | null): InformeRadiologico | undefined {
  if (!dto) return undefined;
  return {
    hallazgos: dto.hallazgos,
    impresionDiagnostica: dto.impresionDiagnostica,
    recomendaciones: dto.recomendaciones,
    codigoCIE10: dto.codigoCIE10 ?? undefined,
    dosisRadiacion: dto.dosisRadiacion ?? undefined,
  };
}

export function mapEstudioImagen(dto: EstudioImagenDto): EstudioImagen {
  const series: SerieDICOM[] = dto.series.map(s => ({
    id: s.id,
    descripcion: s.descripcion,
    numCortes: s.numCortes,
  }));

  return {
    id: dto.id,
    nroOrden: dto.nroOrden,
    paciente: {
      nombre: dto.paciente.nombre,
      apellidos: dto.paciente.apellidos,
      dni: dto.paciente.dni,
      edad: dto.paciente.edad,
      sexo: dto.paciente.sexo,
      nroHistoria: dto.paciente.nroHistoria,
    },
    medicoSolicitante: dto.medicoSolicitante,
    especialidadMedico: dto.especialidadMedico,
    modalidad: mapModalidad(dto.modalidad),
    tipoEstudio: dto.tipoEstudio,
    regionAnatomica: dto.regionAnatomica,
    fechaSolicitud: dto.fechaSolicitud,
    fechaEstudio: dto.fechaEstudio,
    prioridad: dto.prioridad as PrioridadEstudio,
    estado: dto.estado as EstadoEstudio,
    series,
    informe: mapInforme(dto.informe),
    firmadoEn: dto.firmadoEn ?? undefined,
    esCritico: dto.esCritico ?? undefined,
  };
}
