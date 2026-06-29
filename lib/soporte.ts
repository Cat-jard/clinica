// ============================================================
// Integración con el microservicio soporte-service (puerto 8083)
// ============================================================
import { authFetchAt, errorMensaje } from '@/lib/auth';

// ===================== TIPOS =====================

export type NivelLog = 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
export type EstadoServicio = 'Activo' | 'Advertencia' | 'Caído';
export type PrioridadTicket = 'Baja' | 'Media' | 'Alta' | 'Crítica';
export type EstadoTicket = 'Abierto' | 'En Progreso' | 'Resuelto' | 'Cerrado';
export type EstadoBackup = 'Exitosa' | 'Fallida' | 'En Progreso';
export type TipoBackup = 'Completa' | 'Incremental' | 'Diferencial';
export type EstadoUsuarioSis = 'Activo' | 'Bloqueado' | 'Inactivo';
export type EstadoVersion = 'Instalada' | 'Pendiente de Instalación' | 'En Pruebas';

export interface Servicio {
  id: string;
  nombre: string;
  estado: EstadoServicio;
  latencia: string;
}

export interface LogSistema {
  id: string;
  fechaHora: string;       // DD/MM/YYYY - HH:MM:SS
  servicio: string;
  nivel: NivelLog;
  mensaje: string;
  ip?: string;
}

export interface AlertaSistema {
  id: string;
  nivel: 'WARNING' | 'ERROR';
  texto: string;
  fechaHora: string;
}

export interface Ticket {
  id: string;
  nroTicket: string;
  titulo: string;
  reportadoPor: string;
  rolReporta: string;
  fechaReporte: string;
  prioridad: PrioridadTicket;
  estado: EstadoTicket;
  asignadoA?: string;
  modulo: string;
  descripcion: string;
}

export interface Backup {
  id: string;
  fechaHora: string;
  tipo: TipoBackup;
  tamano: string;
  ubicacion: string;
  estado: EstadoBackup;
}

export interface UsuarioSistema {
  id: string;
  usuario: string;
  nombreCompleto: string;
  rol: string;
  estado: EstadoUsuarioSis;
  ultimoAcceso: string;
  ipUltimoAcceso: string;
}

export interface VersionSistema {
  id: string;
  version: string;
  fechaLanzamiento: string;
  estado: EstadoVersion;
  descripcion: string;
}

export interface EntradaAuditoriaSoporte {
  id: string;
  fechaHora: string;
  tecnico: string;
  accion: string;
  ip: string;
  detalle: string;
}

// ===================== CONFIG DE ESTADO =====================

export const NIVEL_LOG_CONFIG: Record<NivelLog, { className: string; dot: string }> = {
  'INFO':    { className: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'   },
  'WARNING': { className: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500'  },
  'ERROR':   { className: 'bg-red-100 text-red-700',       dot: 'bg-red-500'    },
  'DEBUG':   { className: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400'   },
};

export const ESTADO_SERVICIO_CONFIG: Record<EstadoServicio, { label: string; dot: string; text: string }> = {
  'Activo':      { label: 'Activo',      dot: 'bg-green-500', text: 'text-green-700'  },
  'Advertencia': { label: 'Advertencia', dot: 'bg-amber-500', text: 'text-amber-700'  },
  'Caído':       { label: 'Caído',       dot: 'bg-red-500',   text: 'text-red-700'    },
};

export const PRIORIDAD_TICKET_CONFIG: Record<PrioridadTicket, { className: string }> = {
  'Baja':    { className: 'bg-gray-100 text-gray-600'    },
  'Media':   { className: 'bg-blue-100 text-blue-700'    },
  'Alta':    { className: 'bg-amber-100 text-amber-700'  },
  'Crítica': { className: 'bg-red-100 text-red-700'      },
};

export const ESTADO_TICKET_CONFIG: Record<EstadoTicket, { className: string }> = {
  'Abierto':     { className: 'bg-blue-100 text-blue-700'    },
  'En Progreso': { className: 'bg-amber-100 text-amber-700'  },
  'Resuelto':    { className: 'bg-green-100 text-green-700'  },
  'Cerrado':     { className: 'bg-gray-100 text-gray-500'    },
};

export const ESTADO_BACKUP_CONFIG: Record<EstadoBackup, { className: string; dot: string }> = {
  'Exitosa':     { className: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  'Fallida':     { className: 'bg-red-100 text-red-700',     dot: 'bg-red-500'   },
  'En Progreso': { className: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
};

export const ESTADO_USUARIO_SIS_CONFIG: Record<EstadoUsuarioSis, { className: string; dot: string }> = {
  'Activo':    { className: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  'Bloqueado': { className: 'bg-red-100 text-red-700',     dot: 'bg-red-500'   },
  'Inactivo':  { className: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400'  },
};

export const ESTADO_VERSION_CONFIG: Record<EstadoVersion, { className: string }> = {
  'Instalada':                { className: 'bg-green-100 text-green-700'  },
  'Pendiente de Instalación': { className: 'bg-amber-100 text-amber-700'  },
  'En Pruebas':               { className: 'bg-blue-100 text-blue-700'    },
};

// ===================== DATA PARA GRÁFICOS =====================

// Serie inicial de CPU/RAM (24 puntos = últimas 24h, 1 por hora)
export function generarSerieRecursos() {
  const data = [];
  for (let h = 0; h < 24; h++) {
    data.push({
      hora: `${String(h).padStart(2, '0')}:00`,
      cpu: 30 + Math.round(Math.sin(h / 3) * 18 + Math.random() * 12),
      ram: 45 + Math.round(Math.cos(h / 4) * 14 + Math.random() * 10),
    });
  }
  return data;
}

export const TRAFICO_RED = [
  { servidor: 'Web-01',  trafico: 42 },
  { servidor: 'API-01',  trafico: 78 },
  { servidor: 'DB-01',   trafico: 95 },
  { servidor: 'Files-01',trafico: 31 },
  { servidor: 'Mail-01', trafico: 18 },
];

// ===================== MOCK DATA =====================

export const MOCK_SERVICIOS: Servicio[] = [
  { id: 's1', nombre: 'Base de Datos (PostgreSQL)', estado: 'Activo',      latencia: '4 ms'   },
  { id: 's2', nombre: 'API Principal (REST)',       estado: 'Activo',      latencia: '38 ms'  },
  { id: 's3', nombre: 'Servidor Web (Nginx)',       estado: 'Activo',      latencia: '12 ms'  },
  { id: 's4', nombre: 'Servidor de Archivos (PACS)',estado: 'Advertencia', latencia: '420 ms' },
  { id: 's5', nombre: 'Servidor de Correo (SMTP)',  estado: 'Activo',      latencia: '95 ms'  },
  { id: 's6', nombre: 'Servicio de Backups',        estado: 'Caído',       latencia: '—'      },
];

export const MOCK_LOGS: LogSistema[] = [
  { id: 'l1',  fechaHora: '25/06/2026 - 11:02:14', servicio: 'API',     nivel: 'INFO',    mensaje: 'GET /api/pacientes/72341567 — 200 OK (38ms)', ip: '192.168.1.42' },
  { id: 'l2',  fechaHora: '25/06/2026 - 11:01:58', servicio: 'Backups', nivel: 'ERROR',   mensaje: 'Fallo al conectar con el destino de respaldo: timeout tras 30s', ip: '192.168.1.5' },
  { id: 'l3',  fechaHora: '25/06/2026 - 11:01:30', servicio: 'PACS',    nivel: 'WARNING', mensaje: 'Latencia de almacenamiento elevada (420ms) en servidor de archivos' },
  { id: 'l4',  fechaHora: '25/06/2026 - 11:00:45', servicio: 'BD',      nivel: 'INFO',    mensaje: 'Consulta ejecutada: SELECT historia_clinica WHERE id=... (12ms)', ip: '192.168.1.42' },
  { id: 'l5',  fechaHora: '25/06/2026 - 10:59:12', servicio: 'Web',     nivel: 'INFO',    mensaje: 'Sesión iniciada: usuario ltorres desde 192.168.1.42', ip: '192.168.1.42' },
  { id: 'l6',  fechaHora: '25/06/2026 - 10:58:03', servicio: 'API',     nivel: 'WARNING', mensaje: 'Rate limit alcanzado para IP 192.168.1.99 (120 req/min)', ip: '192.168.1.99' },
  { id: 'l7',  fechaHora: '25/06/2026 - 10:55:41', servicio: 'BD',      nivel: 'DEBUG',   mensaje: 'Pool de conexiones: 18/50 activas' },
  { id: 'l8',  fechaHora: '25/06/2026 - 10:54:20', servicio: 'API',     nivel: 'ERROR',   mensaje: 'Excepción no controlada en /api/recetas/firmar: NullReference', ip: '192.168.1.43' },
];

export const MOCK_ALERTAS: AlertaSistema[] = [
  { id: 'al1', nivel: 'ERROR',   texto: 'Copia de seguridad fallida — no se ejecuta hace más de 24 horas', fechaHora: '25/06/2026 - 11:01:58' },
  { id: 'al2', nivel: 'WARNING', texto: 'Uso de almacenamiento del servidor PACS al 87%',                   fechaHora: '25/06/2026 - 10:30:00' },
  { id: 'al3', nivel: 'WARNING', texto: 'Latencia elevada en Servidor de Archivos (420 ms)',                fechaHora: '25/06/2026 - 11:01:30' },
];

export const MOCK_TICKETS: Ticket[] = [
  { id: 't1', nroTicket: 'TK-2026-0142', titulo: 'No carga el visor DICOM en radiología', reportadoPor: 'Dr. Ricardo Mendoza', rolReporta: 'Radiólogo', fechaReporte: '25/06/2026 - 10:15', prioridad: 'Alta', estado: 'En Progreso', asignadoA: 'Carlos Yupanqui', modulo: 'Radiología', descripcion: 'Al abrir un estudio de TAC el visor queda en blanco y no carga las imágenes. Pasos: abrir estudio IMG-2026-0313 → clic en Iniciar Lectura.' },
  { id: 't2', nroTicket: 'TK-2026-0143', titulo: 'Error al firmar receta electrónica', reportadoPor: 'Dr. Luis Torres', rolReporta: 'Médico', fechaReporte: '25/06/2026 - 10:54', prioridad: 'Crítica', estado: 'Abierto', modulo: 'Médico', descripcion: 'Al presionar "Firmar receta" aparece error y no se guarda. Bloquea la atención de pacientes.' },
  { id: 't3', nroTicket: 'TK-2026-0141', titulo: 'Impresora de etiquetas no responde', reportadoPor: 'María Torres', rolReporta: 'Laboratorio', fechaReporte: '25/06/2026 - 09:20', prioridad: 'Media', estado: 'Abierto', modulo: 'Laboratorio', descripcion: 'La impresora de etiquetas de muestras no imprime desde esta mañana.' },
  { id: 't4', nroTicket: 'TK-2026-0138', titulo: 'Lentitud al buscar pacientes', reportadoPor: 'Rosa García', rolReporta: 'Recepción', fechaReporte: '24/06/2026 - 16:40', prioridad: 'Media', estado: 'Resuelto', asignadoA: 'Carlos Yupanqui', modulo: 'Recepción', descripcion: 'El buscador de pacientes tarda más de 5 segundos en mostrar resultados.' },
  { id: 't5', nroTicket: 'TK-2026-0135', titulo: 'Solicitud de acceso a reportes financieros', reportadoPor: 'Jorge Salas', rolReporta: 'Farmacia', fechaReporte: '24/06/2026 - 11:10', prioridad: 'Baja', estado: 'Cerrado', asignadoA: 'Ana Lúcar', modulo: 'Administración', descripcion: 'Solicito permiso para visualizar reportes de consumo de farmacia.' },
];

export const MOCK_BACKUPS: Backup[] = [
  { id: 'b1', fechaHora: '24/06/2026 - 02:00:00', tipo: 'Completa',     tamano: '8.4 GB',  ubicacion: 'Nube (AWS S3)',    estado: 'Exitosa' },
  { id: 'b2', fechaHora: '25/06/2026 - 02:00:00', tipo: 'Incremental',  tamano: '1.2 GB',  ubicacion: 'Nube (AWS S3)',    estado: 'Fallida' },
  { id: 'b3', fechaHora: '23/06/2026 - 02:00:00', tipo: 'Incremental',  tamano: '0.9 GB',  ubicacion: 'Nube (AWS S3)',    estado: 'Exitosa' },
  { id: 'b4', fechaHora: '22/06/2026 - 02:00:00', tipo: 'Completa',     tamano: '8.1 GB',  ubicacion: 'Disco externo',    estado: 'Exitosa' },
  { id: 'b5', fechaHora: '21/06/2026 - 02:00:00', tipo: 'Diferencial',  tamano: '2.3 GB',  ubicacion: 'Almacenamiento local', estado: 'Exitosa' },
];

export const MOCK_USUARIOS_SIS: UsuarioSistema[] = [
  { id: 'us1', usuario: 'rgarcia',  nombreCompleto: 'Rosa García Pérez',    rol: 'Recepción',   estado: 'Activo',    ultimoAcceso: '25/06/2026 - 10:42', ipUltimoAcceso: '192.168.1.20' },
  { id: 'us2', usuario: 'ltorres',  nombreCompleto: 'Luis Torres Vega',     rol: 'Médico',      estado: 'Activo',    ultimoAcceso: '25/06/2026 - 10:58', ipUltimoAcceso: '192.168.1.42' },
  { id: 'us3', usuario: 'rmendoza', nombreCompleto: 'Ricardo Mendoza Q.',   rol: 'Radiólogo',   estado: 'Activo',    ultimoAcceso: '25/06/2026 - 08:05', ipUltimoAcceso: '192.168.1.60' },
  { id: 'us4', usuario: 'mtorres',  nombreCompleto: 'María Torres Huamán',  rol: 'Laboratorio', estado: 'Activo',    ultimoAcceso: '25/06/2026 - 07:20', ipUltimoAcceso: '192.168.1.50' },
  { id: 'us5', usuario: 'jsalas',   nombreCompleto: 'Jorge Salas Ríos',     rol: 'Farmacia',    estado: 'Bloqueado', ultimoAcceso: '24/06/2026 - 18:45', ipUltimoAcceso: '192.168.1.70' },
  { id: 'us6', usuario: 'drojas',   nombreCompleto: 'Daniel Rojas Medina',  rol: 'Médico',      estado: 'Inactivo',  ultimoAcceso: '12/05/2026 - 16:20', ipUltimoAcceso: '192.168.1.41' },
];

export const MOCK_VERSIONES: VersionSistema[] = [
  { id: 'v1', version: 'v2.4.1', fechaLanzamiento: '20/06/2026', estado: 'Instalada',                descripcion: 'Mejoras de rendimiento en el visor DICOM y corrección de errores en recetas.' },
  { id: 'v2', version: 'v2.5.0', fechaLanzamiento: '24/06/2026', estado: 'Pendiente de Instalación', descripcion: 'Nuevo módulo de telemedicina e integración HL7 FHIR R4 mejorada.' },
  { id: 'v3', version: 'v2.5.1', fechaLanzamiento: '25/06/2026', estado: 'En Pruebas',               descripcion: 'Parche de seguridad crítico (CVE-2026-1234) en el módulo de autenticación.' },
  { id: 'v4', version: 'v2.4.0', fechaLanzamiento: '01/06/2026', estado: 'Instalada',                descripcion: 'Versión base del SIHCE con todos los roles clínicos.' },
];

export const MOCK_AUDITORIA_SOPORTE: EntradaAuditoriaSoporte[] = [
  { id: 'as1', fechaHora: '25/06/2026 - 11:00:12', tecnico: 'Carlos Yupanqui', accion: 'Consulta de logs',       ip: '192.168.1.5', detalle: 'Acceso a logs del servicio API (nivel ERROR)' },
  { id: 'as2', fechaHora: '25/06/2026 - 10:45:30', tecnico: 'Carlos Yupanqui', accion: 'Asignación de ticket',   ip: '192.168.1.5', detalle: 'TK-2026-0142 asignado a Carlos Yupanqui' },
  { id: 'as3', fechaHora: '25/06/2026 - 09:30:00', tecnico: 'Ana Lúcar',       accion: 'Bloqueo de usuario',     ip: '192.168.1.6', detalle: 'Usuario jsalas bloqueado por seguridad' },
  { id: 'as4', fechaHora: '24/06/2026 - 18:00:00', tecnico: 'Carlos Yupanqui', accion: 'Ejecución de backup',    ip: '192.168.1.5', detalle: 'Backup manual completo iniciado' },
  { id: 'as5', fechaHora: '24/06/2026 - 16:50:00', tecnico: 'Ana Lúcar',       accion: 'Resolución de ticket',   ip: '192.168.1.6', detalle: 'TK-2026-0138 marcado como Resuelto' },
];

// ===================== BCP =====================

export const BCP_CHECKLIST = [
  'Restaurar base de datos desde el último backup completo',
  'Verificar integridad de los datos restaurados',
  'Levantar servicios críticos (API, Web, BD)',
  'Probar acceso de usuarios por rol',
  'Validar interoperabilidad con RENHICE (HL7 FHIR)',
  'Confirmar funcionamiento del visor DICOM y PACS',
  'Notificar a las áreas clínicas la restauración del servicio',
];

export const BCP_CONTACTOS = [
  { nombre: 'Carlos Yupanqui', cargo: 'Jefe de Soporte Técnico', telefono: '987-111-222' },
  { nombre: 'Ana Lúcar',       cargo: 'Administradora de BD',     telefono: '987-333-444' },
  { nombre: 'Proveedor Cloud', cargo: 'Soporte AWS (24/7)',       telefono: '0800-12345'  },
  { nombre: 'Proveedor PACS',  cargo: 'Soporte Imágenes',         telefono: '01-555-7890' },
];

export const MODULOS_SISTEMA = ['Recepción', 'Triaje', 'Médico', 'Farmacia', 'Laboratorio', 'Radiología', 'Portal Paciente', 'Administración', 'RRHH'];
export const ROLES_SISTEMA = ['Recepción', 'Enfermería', 'Médico', 'Radiólogo', 'Laboratorio', 'Farmacia', 'Admin', 'Soporte'];
export const TECNICOS = ['Carlos Yupanqui', 'Ana Lúcar', 'Sin asignar'];

// Categorías reconocidas por el soporte-service (coinciden con el enum CategoriaTicket).
export const CATEGORIAS_TICKET = ['Hardware', 'Software', 'Red / Conectividad', 'Accesos / Cuentas', 'Otro'];

// ============================================================
// API REST — soporte-service
// ============================================================

export const SOPORTE_URL =
  process.env.NEXT_PUBLIC_SOPORTE_URL ?? 'http://localhost:8083';

// ---- Forma que devuelve el backend (TicketResponse) ----
interface TicketApi {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  solicitanteDni: string | null;
  solicitanteNombre: string;
  categoria: string;     // etiqueta: "Hardware"
  prioridad: string;     // etiqueta: "Alta"
  estado: string;        // etiqueta: "En proceso"
  asignadoA: string;     // "Sin asignar" si no tiene
  fechaCreacion: string;
  fechaActualizacion: string;
}

// El backend usa "En proceso"; la UI usa "En Progreso".
function estadoApiToUi(estado: string): EstadoTicket {
  return estado === 'En proceso' ? 'En Progreso' : (estado as EstadoTicket);
}

// La UI envía la etiqueta; el backend acepta el nombre del enum (más robusto).
const ESTADO_UI_TO_API: Record<EstadoTicket, string> = {
  'Abierto': 'ABIERTO', 'En Progreso': 'EN_PROCESO', 'Resuelto': 'RESUELTO', 'Cerrado': 'CERRADO',
};
const PRIORIDAD_UI_TO_API: Record<PrioridadTicket, string> = {
  'Baja': 'BAJA', 'Media': 'MEDIA', 'Alta': 'ALTA', 'Crítica': 'CRITICA',
};
const CATEGORIA_ETIQUETA_TO_API: Record<string, string> = {
  'Hardware': 'HARDWARE', 'Software': 'SOFTWARE', 'Red / Conectividad': 'RED',
  'Accesos / Cuentas': 'ACCESO', 'Otro': 'OTRO',
};

function apiToTicket(t: TicketApi): Ticket {
  return {
    id: t.id,
    nroTicket: t.codigo,
    titulo: t.titulo,
    descripcion: t.descripcion,
    reportadoPor: t.solicitanteNombre,
    rolReporta: t.solicitanteDni ? `DNI ${t.solicitanteDni}` : '',
    fechaReporte: t.fechaCreacion,
    prioridad: t.prioridad as PrioridadTicket,
    estado: estadoApiToUi(t.estado),
    asignadoA: t.asignadoA && t.asignadoA !== 'Sin asignar' ? t.asignadoA : undefined,
    modulo: t.categoria,
  };
}

/** Lista tickets (requiere usuario autenticado). */
export async function listarTickets(filtroEstado?: string, q?: string): Promise<Ticket[]> {
  const params = new URLSearchParams();
  if (filtroEstado && filtroEstado !== 'Todos') {
    params.set('estado', ESTADO_UI_TO_API[filtroEstado as EstadoTicket] ?? filtroEstado);
  }
  if (q) params.set('q', q);
  const query = params.toString() ? `?${params.toString()}` : '';

  const res = await authFetchAt(SOPORTE_URL, `/api/tickets${query}`);
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudieron cargar los tickets'));
  const data = (await res.json()) as TicketApi[];
  return data.map(apiToTicket);
}

/** Abre un nuevo ticket. */
export async function crearTicket(t: Ticket): Promise<Ticket> {
  const res = await authFetchAt(SOPORTE_URL, '/api/tickets', {
    method: 'POST',
    body: JSON.stringify({
      titulo: t.titulo,
      descripcion: t.descripcion,
      solicitanteNombre: t.reportadoPor,
      categoria: CATEGORIA_ETIQUETA_TO_API[t.modulo] ?? 'OTRO',
      prioridad: PRIORIDAD_UI_TO_API[t.prioridad],
    }),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo crear el ticket'));
  return apiToTicket((await res.json()) as TicketApi);
}

/** Actualiza los datos de un ticket (ADMIN/SOPORTE). */
export async function actualizarTicket(id: string, t: Ticket): Promise<Ticket> {
  const res = await authFetchAt(SOPORTE_URL, `/api/tickets/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      titulo: t.titulo,
      descripcion: t.descripcion,
      categoria: CATEGORIA_ETIQUETA_TO_API[t.modulo] ?? 'OTRO',
      prioridad: PRIORIDAD_UI_TO_API[t.prioridad],
      estado: ESTADO_UI_TO_API[t.estado],
      asignadoA: t.asignadoA ?? '',
    }),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo actualizar el ticket'));
  return apiToTicket((await res.json()) as TicketApi);
}

/** Cambia el estado de un ticket, opcionalmente asignándolo (ADMIN/SOPORTE). */
export async function cambiarEstadoTicket(id: string, estado: EstadoTicket, asignadoA?: string): Promise<Ticket> {
  const res = await authFetchAt(SOPORTE_URL, `/api/tickets/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: ESTADO_UI_TO_API[estado], asignadoA }),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cambiar el estado'));
  return apiToTicket((await res.json()) as TicketApi);
}
