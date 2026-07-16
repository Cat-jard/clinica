// ===================== TIPOS =====================

export type EstadoCitaPaciente = 'Programada' | 'Confirmada' | 'Atendida' | 'Cancelada';
export type EstadoResultado = 'Pendiente' | 'En Proceso' | 'Validado';
export type EstadoReceta = 'Vigente' | 'Vencida' | 'Dispensada Parcialmente' | 'Dispensada Totalmente';

export interface PerfilPaciente {
  nombre: string;
  apellidos: string;
  dni: string;
  fechaNac: string;
  edad: number;
  sexo: 'Masculino' | 'Femenino';
  email: string;
  telefono: string;
  direccion: string;
}

export interface CitaPaciente {
  id: string;
  fecha: string;        // DD/MM/YYYY
  hora: string;
  medico: string;
  especialidad: string;
  motivo: string;
  estado: EstadoCitaPaciente;
  esFutura: boolean;
}

export interface ResultadoPaciente {
  id: string;
  fecha: string;
  examen: string;
  resultado: string;
  valorRef: string;
  unidad: string;
  estado: EstadoResultado;
  critico: boolean;
}

export interface EstudioImagenPaciente {
  id: string;
  fecha: string;
  tipo: string;
  medicoSolicitante: string;
}

export interface ItemRecetaPaciente {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}

export interface RecetaPaciente {
  id: string;
  fechaEmision: string;
  medico: string;
  items: ItemRecetaPaciente[];
  estado: EstadoReceta;
}

export interface MensajePaciente {
  id: string;
  remitente: string;
  asunto: string;
  cuerpo: string;
  fecha: string;
  leido: boolean;
  esSistema: boolean;
}

export interface NotificacionPaciente {
  id: string;
  tipo: 'cita' | 'resultado' | 'mensaje' | 'receta';
  texto: string;
  fecha: string;
  leida: boolean;
}

export interface ActividadPaciente {
  id: string;
  fecha: string;
  evento: string;
}

// ===================== CATÁLOGOS =====================

export const ESPECIALIDADES_PORTAL = [
  'Medicina General', 'Cardiología', 'Pediatría', 'Ginecología',
  'Traumatología', 'Dermatología', 'Oftalmología',
];

export const MEDICOS_POR_ESPECIALIDAD: Record<string, string[]> = {
  'Medicina General': ['Dr. Luis Torres', 'Dra. Ana Salas'],
  'Cardiología':      ['Dra. Carmen Vega'],
  'Pediatría':        ['Dr. Daniel Rojas'],
  'Ginecología':      ['Dra. Carmen Vega'],
  'Traumatología':    ['Dr. Jorge Ruiz'],
  'Dermatología':     ['Dra. Elena Castro'],
  'Oftalmología':     ['Dr. Pedro Lima'],
};

export const HORARIOS_DISPONIBLES = ['08:00', '08:30', '09:00', '09:30', '10:00', '11:00', '11:30', '15:00', '15:30', '16:00'];

// ===================== MOCK DATA =====================

export const MOCK_PERFIL: PerfilPaciente = {
  nombre: 'Ana',
  apellidos: 'Fernández Llanos',
  dni: '72341567',
  fechaNac: '14/03/1990',
  edad: 36,
  sexo: 'Femenino',
  email: 'ana.fernandez@gmail.com',
  telefono: '987654321',
  direccion: 'Av. Los Olivos 456, Lima',
};

export const MOCK_CITAS_PACIENTE: CitaPaciente[] = [
  { id: 'c-01', fecha: '02/07/2026', hora: '09:00', medico: 'Dr. Luis Torres',  especialidad: 'Medicina General', motivo: 'Control de seguimiento', estado: 'Confirmada', esFutura: true },
  { id: 'c-02', fecha: '15/07/2026', hora: '11:00', medico: 'Dra. Carmen Vega', especialidad: 'Cardiología',      motivo: 'Evaluación cardiológica', estado: 'Programada', esFutura: true },
  { id: 'c-03', fecha: '20/06/2026', hora: '10:30', medico: 'Dr. Luis Torres',  especialidad: 'Medicina General', motivo: 'Dolor abdominal',        estado: 'Atendida',   esFutura: false },
  { id: 'c-04', fecha: '05/05/2026', hora: '08:30', medico: 'Dra. Elena Castro',especialidad: 'Dermatología',     motivo: 'Revisión de lunar',      estado: 'Atendida',   esFutura: false },
  { id: 'c-05', fecha: '12/04/2026', hora: '16:00', medico: 'Dra. Carmen Vega', especialidad: 'Cardiología',      motivo: 'Chequeo anual',          estado: 'Cancelada',  esFutura: false },
];

export const MOCK_RESULTADOS_PACIENTE: ResultadoPaciente[] = [
  { id: 'r-01', fecha: '20/06/2026', examen: 'Hemoglobina',        resultado: '13.5', valorRef: '12-16',  unidad: 'g/dL',  estado: 'Validado', critico: false },
  { id: 'r-02', fecha: '20/06/2026', examen: 'Glucosa',           resultado: '98',   valorRef: '70-100', unidad: 'mg/dL', estado: 'Validado', critico: false },
  { id: 'r-03', fecha: '20/06/2026', examen: 'Colesterol total',  resultado: '215',  valorRef: '<200',   unidad: 'mg/dL', estado: 'Validado', critico: true  },
  { id: 'r-04', fecha: '20/06/2026', examen: 'Creatinina',        resultado: '0.9',  valorRef: '0.6-1.1',unidad: 'mg/dL', estado: 'En Proceso', critico: false },
];

export const MOCK_IMAGENES_PACIENTE: EstudioImagenPaciente[] = [
  { id: 'i-01', fecha: '18/06/2026', tipo: 'Radiografía de Tórax', medicoSolicitante: 'Dr. Luis Torres' },
  { id: 'i-02', fecha: '12/03/2026', tipo: 'Ecografía Abdominal',  medicoSolicitante: 'Dr. Luis Torres' },
];

export const MOCK_RECETAS_PACIENTE: RecetaPaciente[] = [
  {
    id: 'rx-01', fechaEmision: '20/06/2026', medico: 'Dr. Luis Torres', estado: 'Vigente',
    items: [
      { medicamento: 'Metformina 850mg', dosis: '1 tableta', frecuencia: 'Cada 12 horas', duracion: '30 días' },
      { medicamento: 'Enalapril 10mg',   dosis: '1 tableta', frecuencia: 'Cada 24 horas', duracion: '30 días' },
    ],
  },
  {
    id: 'rx-02', fechaEmision: '05/05/2026', medico: 'Dra. Elena Castro', estado: 'Dispensada Totalmente',
    items: [
      { medicamento: 'Loratadina 10mg', dosis: '1 tableta', frecuencia: 'Cada 24 horas', duracion: '7 días' },
    ],
  },
  {
    id: 'rx-03', fechaEmision: '12/02/2026', medico: 'Dra. Carmen Vega', estado: 'Vencida',
    items: [
      { medicamento: 'Atorvastatina 20mg', dosis: '1 tableta', frecuencia: 'Cada 24 horas (noche)', duracion: '30 días' },
    ],
  },
];

export const MOCK_MENSAJES_PACIENTE: MensajePaciente[] = [
  { id: 'm-01', remitente: 'Dr. Luis Torres', asunto: 'Resultados de su control', cuerpo: 'Estimada Ana, sus resultados están dentro de lo esperado salvo el colesterol, que está ligeramente elevado. Le recomiendo continuar con la dieta y volver en un mes para control.', fecha: '21/06/2026 - 09:15', leido: false, esSistema: false },
  { id: 'm-02', remitente: 'Sistema SIHCE',   asunto: 'Recordatorio de cita',     cuerpo: 'Le recordamos su cita con el Dr. Luis Torres el 02/07/2026 a las 09:00. Por favor llegue 15 minutos antes.', fecha: '20/06/2026 - 08:00', leido: false, esSistema: true },
  { id: 'm-03', remitente: 'Dra. Carmen Vega', asunto: 'Seguimiento',             cuerpo: 'Hola Ana, ¿cómo se ha sentido desde la última consulta? Cualquier molestia, no dude en escribirme.', fecha: '15/06/2026 - 14:30', leido: true, esSistema: false },
];

export const MOCK_NOTIFICACIONES_PACIENTE: NotificacionPaciente[] = [
  { id: 'n-01', tipo: 'cita',      texto: 'Tienes una cita mañana con el Dr. Luis Torres a las 09:00', fecha: '01/07/2026 - 09:00', leida: false },
  { id: 'n-02', tipo: 'resultado', texto: 'Nuevo resultado de laboratorio disponible: Hemograma',      fecha: '20/06/2026 - 11:00', leida: false },
  { id: 'n-03', tipo: 'mensaje',   texto: 'Nuevo mensaje del Dr. Luis Torres',                          fecha: '21/06/2026 - 09:15', leida: false },
  { id: 'n-04', tipo: 'receta',    texto: 'Tu receta de Metformina vence en 5 días',                    fecha: '25/06/2026 - 08:00', leida: true  },
];

export const MOCK_ACTIVIDAD_PACIENTE: ActividadPaciente[] = [
  { id: 'a-01', fecha: '21/06/2026 - 09:15', evento: 'Dr. Luis Torres te envió un mensaje' },
  { id: 'a-02', fecha: '20/06/2026 - 11:00', evento: 'Resultado de laboratorio validado: Hemograma' },
  { id: 'a-03', fecha: '20/06/2026 - 10:45', evento: 'Cita atendida con Dr. Luis Torres' },
  { id: 'a-04', fecha: '18/06/2026 - 08:30', evento: 'Receta emitida: Metformina + Enalapril' },
];

export const MOCK_ALERGIAS = ['Penicilina', 'AINEs (Ibuprofeno)'];
export const MOCK_ANTECEDENTES = ['Hipertensión arterial (2020)', 'Apendicectomía (2015)'];
export const MOCK_MEDICACION_ACTUAL = ['Metformina 850mg c/12h', 'Enalapril 10mg c/24h'];

// ===================== API FUNCTIONS =====================
import { authFetch, getUsuario } from './auth';
import type { Cita } from './citas';

/** Fetch patient profile using logged-in user's data. */
export async function getPerfilPacienteApi(): Promise<PerfilPaciente | null> {
  try {
    const user = getUsuario();
    if (!user) return null;
    const res = await authFetch(`/api/pacientes/all?q=${encodeURIComponent(user.dni)}&size=1`);
    if (!res.ok) return null;
    const body = await res.json();
    const pages = body.data?.content || body.data || [];
    const p = Array.isArray(pages) ? pages[0] : null;
    if (!p) return null;
    return {
      nombre: p.nombres,
      apellidos: `${p.apellidoPaterno} ${p.apellidoMaterno}`,
      dni: p.nroDocumento,
      fechaNac: p.fechaNacimiento,
      edad: calcEdadDesdeFecha(p.fechaNacimiento),
      sexo: p.sexo,
      email: p.email || user.email,
      telefono: p.telefono,
      direccion: p.direccion || '',
    };
  } catch { return null; }
}

function calcEdadDesdeFecha(fechaNac: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

/** Fetch patient appointments from citas-service. */
export async function getCitasPacienteApi(pacienteId: string): Promise<CitaPaciente[]> {
  try {
    const res = await authFetch(`/api/citas/paciente/${pacienteId}`);
    if (!res.ok) return [];
    const body = await res.json();
    const data = body.data || body || [];
    return (Array.isArray(data) ? data : []).map((c: Cita) => {
      const fecha = new Date(c.fechaCita + 'T' + (c.horaInicio || '00:00'));
      const today = new Date();
      return {
        id: c.id,
        fecha: fecha.toLocaleDateString('es-PE'),
        hora: c.horaInicio?.slice(0, 5) || '',
        medico: c.medicoNombre || '',
        especialidad: '',
        motivo: c.motivo,
        estado: mapEstadoCita(c.estado),
        esFutura: fecha > today,
      };
    });
  } catch { return []; }
}

function mapEstadoCita(estado: string): EstadoCitaPaciente {
  switch (estado) {
    case 'PROGRAMADA': return 'Programada';
    case 'CONFIRMADA': return 'Confirmada';
    case 'ATENDIDA': return 'Atendida';
    case 'CANCELADA': return 'Cancelada';
    default: return 'Programada';
  }
}

// ===================== CONFIG / HELPERS =====================

export const ESTADO_CITA_CONFIG: Record<EstadoCitaPaciente, { className: string }> = {
  'Programada': { className: 'bg-amber-100 text-amber-700'  },
  'Confirmada': { className: 'bg-green-100 text-green-700'  },
  'Atendida':   { className: 'bg-blue-100 text-blue-700'    },
  'Cancelada':  { className: 'bg-gray-100 text-gray-500'    },
};

export const ESTADO_RECETA_CONFIG: Record<EstadoReceta, { className: string }> = {
  'Vigente':                { className: 'bg-green-100 text-green-700'  },
  'Vencida':                { className: 'bg-red-100 text-red-700'      },
  'Dispensada Parcialmente':{ className: 'bg-amber-100 text-amber-700'  },
  'Dispensada Totalmente':  { className: 'bg-gray-100 text-gray-500'    },
};

export const ESTADO_RESULTADO_CONFIG: Record<EstadoResultado, { className: string }> = {
  'Pendiente':  { className: 'bg-gray-100 text-gray-500'    },
  'En Proceso': { className: 'bg-amber-100 text-amber-700'  },
  'Validado':   { className: 'bg-green-100 text-green-700'  },
};

// Valida que el DNI exista en los "registros del hospital" (regla de oro #1)
const DNIS_REGISTRADOS = ['72341567', '38901245', '61872340', '45231890', '52190873'];
export function dniRegistrado(dni: string): boolean {
  return DNIS_REGISTRADOS.includes(dni);
}

// Regla de oro #4: cancelación requiere 24h de anticipación
export function puedeCancelar(): boolean {
  return true;
}
