// ===================== TIPOS =====================

export type RolUsuario = 'Recepción' | 'Enfermería' | 'Médico' | 'Radiólogo' | 'Laboratorio' | 'Farmacia' | 'Admin';
export type EstadoUsuario = 'Activo' | 'Inactivo';
export type EstadoCama = 'Disponible' | 'Ocupada' | 'Limpieza' | 'Fuera de Servicio';
export type EstadoFactura = 'Pagado' | 'Pendiente' | 'Vencido' | 'Anulado';
export type Aseguradora = 'SIS' | 'EsSalud' | 'EPS' | 'Particular';

export interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  rol: RolUsuario;
  especialidad?: string;
  estado: EstadoUsuario;
  ultimoAcceso: string;
}

export interface Cama {
  id: string;
  numero: string;
  servicio: string;
  estado: EstadoCama;
  paciente?: string;
  fechaIngreso?: string;
  diagnostico?: string;
  medicoTratante?: string;
  diasEstancia?: number;
}

export interface ServicioOcupacion {
  servicio: string;
  total: number;
  ocupadas: number;
  enEspera: number;
}

export interface Factura {
  id: string;
  nroFactura: string;
  paciente: string;
  aseguradora: Aseguradora;
  monto: number;
  estado: EstadoFactura;
  fechaEmision: string;
  fechaVencimiento: string;
}

export interface ActividadReciente {
  id: string;
  fechaHora: string;
  usuario: string;
  rol: RolUsuario;
  accion: string;
  detalle: string;
}

export interface EntradaAuditoriaAdmin {
  id: string;
  fechaHora: string;
  usuario: string;
  rol: RolUsuario;
  accion: string;
  paciente?: string;
  ip: string;
  detalle: string;
}

// ===================== CATÁLOGOS =====================

export const ROLES: RolUsuario[] = ['Recepción', 'Enfermería', 'Médico', 'Radiólogo', 'Laboratorio', 'Farmacia', 'Admin'];

export const ESPECIALIDADES = [
  'Medicina General', 'Cardiología', 'Pediatría', 'Ginecología', 'Traumatología',
  'Neurología', 'Dermatología', 'Gastroenterología', 'Endocrinología', 'Oftalmología',
];

export const SERVICIOS = ['Medicina Interna', 'Cirugía', 'Pediatría', 'UCI', 'Ginecología', 'Emergencia'];

export const ROL_CONFIG: Record<RolUsuario, { className: string }> = {
  'Recepción':   { className: 'bg-gray-100 text-gray-700'      },
  'Enfermería':  { className: 'bg-pink-100 text-pink-700'      },
  'Médico':      { className: 'bg-blue-100 text-blue-700'      },
  'Radiólogo':   { className: 'bg-indigo-100 text-indigo-700'  },
  'Laboratorio': { className: 'bg-purple-100 text-purple-700'  },
  'Farmacia':    { className: 'bg-teal-100 text-teal-700'      },
  'Admin':       { className: 'bg-amber-100 text-amber-700'    },
};

export const ESTADO_CAMA_CONFIG: Record<EstadoCama, { label: string; dot: string; card: string }> = {
  'Disponible':        { label: 'Disponible',        dot: 'bg-green-500',  card: 'bg-green-50 border-green-200'   },
  'Ocupada':           { label: 'Ocupada',           dot: 'bg-red-500',    card: 'bg-red-50 border-red-200'       },
  'Limpieza':          { label: 'Limpieza',          dot: 'bg-amber-500',  card: 'bg-amber-50 border-amber-200'   },
  'Fuera de Servicio': { label: 'Fuera de Servicio', dot: 'bg-gray-400',   card: 'bg-gray-100 border-gray-300'    },
};

export const ESTADO_FACTURA_CONFIG: Record<EstadoFactura, { className: string }> = {
  'Pagado':    { className: 'bg-green-100 text-green-700'  },
  'Pendiente': { className: 'bg-amber-100 text-amber-700'  },
  'Vencido':   { className: 'bg-red-100 text-red-700'      },
  'Anulado':   { className: 'bg-gray-100 text-gray-500'    },
};

// ===================== DATA PARA GRÁFICOS =====================

export const ATENCIONES_ESPECIALIDAD = [
  { especialidad: 'Med. General', atenciones: 312 },
  { especialidad: 'Cardiología',  atenciones: 184 },
  { especialidad: 'Pediatría',    atenciones: 256 },
  { especialidad: 'Ginecología',  atenciones: 142 },
  { especialidad: 'Traumatología',atenciones: 198 },
  { especialidad: 'Neurología',   atenciones: 96  },
];

export const DISTRIBUCION_ASEGURADORA = [
  { name: 'SIS',        value: 542, color: '#2563eb' },
  { name: 'EsSalud',    value: 318, color: '#059669' },
  { name: 'EPS',        value: 196, color: '#f59e0b' },
  { name: 'Particular', value: 189, color: '#6b7280' },
];

export const FLUJO_PACIENTES = [
  { dia: '01', ingresos: 42, altas: 38 },
  { dia: '05', ingresos: 55, altas: 49 },
  { dia: '10', ingresos: 48, altas: 52 },
  { dia: '15', ingresos: 61, altas: 47 },
  { dia: '20', ingresos: 58, altas: 60 },
  { dia: '25', ingresos: 67, altas: 55 },
  { dia: '30', ingresos: 52, altas: 58 },
];

// Heatmap: días x franjas horarias (intensidad de demanda 0-100)
export const HORAS_DEMANDA = {
  dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  franjas: ['8-10', '10-12', '12-14', '14-16', '16-18', '18-20'],
  // matriz[dia][franja]
  matriz: [
    [45, 88, 72, 60, 75, 40],
    [50, 92, 78, 65, 70, 38],
    [48, 85, 70, 58, 68, 42],
    [52, 95, 80, 62, 72, 45],
    [60, 98, 85, 70, 82, 55],
    [70, 75, 60, 45, 50, 30],
    [25, 35, 30, 28, 22, 15],
  ],
};

// ===================== MOCK DATA =====================

export const MOCK_USUARIOS: Usuario[] = [
  { id: 'u-01', nombre: 'Rosa',     apellidos: 'García Pérez',     dni: '40128734', email: 'rosa.garcia@clinica.pe',     telefono: '987654321', rol: 'Recepción',   estado: 'Activo',   ultimoAcceso: '25/06/2026 - 10:42' },
  { id: 'u-02', nombre: 'Lucía',    apellidos: 'Ramírez Soto',     dni: '41298765', email: 'lucia.ramirez@clinica.pe',   telefono: '987111222', rol: 'Enfermería',  estado: 'Activo',   ultimoAcceso: '25/06/2026 - 11:05' },
  { id: 'u-03', nombre: 'Luis',     apellidos: 'Torres Vega',      dni: '42876541', email: 'luis.torres@clinica.pe',     telefono: '987333444', rol: 'Médico',      especialidad: 'Medicina General', estado: 'Activo', ultimoAcceso: '25/06/2026 - 10:58' },
  { id: 'u-04', nombre: 'Carmen',   apellidos: 'Vega Flores',      dni: '43219087', email: 'carmen.vega@clinica.pe',     telefono: '987555666', rol: 'Médico',      especialidad: 'Cardiología', estado: 'Activo', ultimoAcceso: '25/06/2026 - 09:30' },
  { id: 'u-05', nombre: 'Ricardo',  apellidos: 'Mendoza Quispe',   dni: '44567812', email: 'ricardo.mendoza@clinica.pe', telefono: '987777888', rol: 'Radiólogo',   estado: 'Activo',   ultimoAcceso: '25/06/2026 - 08:05' },
  { id: 'u-06', nombre: 'María',    apellidos: 'Torres Huamán',    dni: '45678123', email: 'maria.torres@clinica.pe',    telefono: '987999000', rol: 'Laboratorio', estado: 'Activo',   ultimoAcceso: '25/06/2026 - 07:20' },
  { id: 'u-07', nombre: 'Jorge',    apellidos: 'Salas Ríos',       dni: '46781234', email: 'jorge.salas@clinica.pe',     telefono: '986111333', rol: 'Farmacia',    estado: 'Activo',   ultimoAcceso: '24/06/2026 - 18:45' },
  { id: 'u-08', nombre: 'Patricia', apellidos: 'Núñez Campos',     dni: '47812345', email: 'patricia.nunez@clinica.pe',  telefono: '986444555', rol: 'Admin',       estado: 'Activo',   ultimoAcceso: '25/06/2026 - 11:10' },
  { id: 'u-09', nombre: 'Daniel',   apellidos: 'Rojas Medina',     dni: '48123456', email: 'daniel.rojas@clinica.pe',    telefono: '986666777', rol: 'Médico',      especialidad: 'Pediatría', estado: 'Inactivo', ultimoAcceso: '12/05/2026 - 16:20' },
  { id: 'u-10', nombre: 'Elena',    apellidos: 'Castro Díaz',      dni: '49234567', email: 'elena.castro@clinica.pe',    telefono: '986888999', rol: 'Enfermería',  estado: 'Inactivo', ultimoAcceso: '03/04/2026 - 14:10' },
];

function genCamas(): Cama[] {
  const camas: Cama[] = [];
  const config: { servicio: string; total: number }[] = [
    { servicio: 'Medicina Interna', total: 12 },
    { servicio: 'Cirugía',          total: 10 },
    { servicio: 'Pediatría',        total: 8  },
    { servicio: 'UCI',              total: 6  },
    { servicio: 'Ginecología',      total: 8  },
  ];
  const diagnosticos = ['Neumonía', 'Post-operatorio apendicectomía', 'ICC descompensada', 'Sepsis', 'EDA con deshidratación', 'Fractura de fémur'];
  const medicos = ['Dr. Luis Torres', 'Dra. Carmen Vega', 'Dr. Daniel Rojas'];
  const pacientes = ['Ana Fernández', 'Pedro Martínez', 'Rosa Quispe', 'Carlos Rodríguez', 'María Huanca', 'José Pari', 'Lucía Mamani', 'Juan Cruz'];

  config.forEach((c, ci) => {
    for (let i = 1; i <= c.total; i++) {
      const r = (ci * 7 + i) % 10;
      let estado: EstadoCama = 'Disponible';
      if (r < 6) estado = 'Ocupada';
      else if (r < 7) estado = 'Limpieza';
      else if (r < 8) estado = 'Fuera de Servicio';
      const cama: Cama = {
        id: `${c.servicio.slice(0, 3).toLowerCase()}-${i}`,
        numero: `${c.servicio.slice(0, 2).toUpperCase()}-${String(i).padStart(2, '0')}`,
        servicio: c.servicio,
        estado,
      };
      if (estado === 'Ocupada') {
        cama.paciente = pacientes[(ci + i) % pacientes.length];
        cama.fechaIngreso = `${20 + (i % 5)}/06/2026 - 0${(i % 9) + 1}:30`;
        cama.diagnostico = diagnosticos[(ci + i) % diagnosticos.length];
        cama.medicoTratante = medicos[(ci + i) % medicos.length];
        cama.diasEstancia = (i % 7) + 1;
      }
      camas.push(cama);
    }
  });
  return camas;
}

export const MOCK_CAMAS: Cama[] = genCamas();

export function ocupacionPorServicio(camas: Cama[]): ServicioOcupacion[] {
  return SERVICIOS.filter(s => camas.some(c => c.servicio === s)).map(servicio => {
    const delServicio = camas.filter(c => c.servicio === servicio);
    const ocupadas = delServicio.filter(c => c.estado === 'Ocupada').length;
    return {
      servicio,
      total: delServicio.length,
      ocupadas,
      enEspera: servicio === 'UCI' ? 3 : servicio === 'Medicina Interna' ? 2 : 0,
    };
  });
}

export const MOCK_FACTURAS: Factura[] = [
  { id: 'f-01', nroFactura: 'F001-00012847', paciente: 'Ana Fernández Llanos',  aseguradora: 'SIS',        monto: 1250.00,  estado: 'Pendiente', fechaEmision: '20/06/2026', fechaVencimiento: '20/07/2026' },
  { id: 'f-02', nroFactura: 'F001-00012848', paciente: 'Pedro Martínez Soto',   aseguradora: 'EsSalud',    monto: 3480.50,  estado: 'Pagado',    fechaEmision: '18/06/2026', fechaVencimiento: '18/07/2026' },
  { id: 'f-03', nroFactura: 'F001-00012849', paciente: 'Rosa Quispe Mamani',    aseguradora: 'Particular', monto: 850.00,   estado: 'Pagado',    fechaEmision: '22/06/2026', fechaVencimiento: '22/06/2026' },
  { id: 'f-04', nroFactura: 'F001-00012850', paciente: 'Carlos Rodríguez Pérez',aseguradora: 'EPS',        monto: 5200.00,  estado: 'Vencido',   fechaEmision: '01/05/2026', fechaVencimiento: '31/05/2026' },
  { id: 'f-05', nroFactura: 'F001-00012851', paciente: 'María Huanca Torres',   aseguradora: 'SIS',        monto: 620.00,   estado: 'Pendiente', fechaEmision: '24/06/2026', fechaVencimiento: '24/07/2026' },
  { id: 'f-06', nroFactura: 'F001-00012852', paciente: 'José Pari Apaza',       aseguradora: 'EsSalud',    monto: 2100.00,  estado: 'Pagado',    fechaEmision: '15/06/2026', fechaVencimiento: '15/07/2026' },
  { id: 'f-07', nroFactura: 'F001-00012853', paciente: 'Lucía Mamani Cruz',     aseguradora: 'Particular', monto: 1450.00,  estado: 'Anulado',   fechaEmision: '10/06/2026', fechaVencimiento: '10/07/2026' },
];

export const MOCK_ACTIVIDAD: ActividadReciente[] = [
  { id: 'a-01', fechaHora: '25/06/2026 - 11:08', usuario: 'Dr. Luis Torres',      rol: 'Médico',      accion: 'Firma de epicrisis',       detalle: 'Epicrisis de Ana Fernández — alta médica' },
  { id: 'a-02', fechaHora: '25/06/2026 - 11:02', usuario: 'Jorge Salas',          rol: 'Farmacia',    accion: 'Ingreso de inventario',    detalle: '500 unidades de Paracetamol 500mg' },
  { id: 'a-03', fechaHora: '25/06/2026 - 10:58', usuario: 'María Torres',         rol: 'Laboratorio', accion: 'Validación de resultados', detalle: 'Hemograma — Carlos Rodríguez' },
  { id: 'a-04', fechaHora: '25/06/2026 - 10:45', usuario: 'Dr. Ricardo Mendoza',  rol: 'Radiólogo',   accion: 'Firma de informe',         detalle: 'Mamografía — María Huanca (BI-RADS 1)' },
  { id: 'a-05', fechaHora: '25/06/2026 - 10:30', usuario: 'Rosa García',          rol: 'Recepción',   accion: 'Registro de paciente',     detalle: 'Nuevo paciente: José Pari Apaza' },
  { id: 'a-06', fechaHora: '25/06/2026 - 10:15', usuario: 'Lucía Ramírez',        rol: 'Enfermería',  accion: 'Triaje completado',        detalle: 'Pedro Martínez — Prioridad III' },
];

export const MOCK_AUDITORIA_ADMIN: EntradaAuditoriaAdmin[] = [
  { id: 'aa-01', fechaHora: '25/06/2026 - 11:10', usuario: 'Patricia Núñez',   rol: 'Admin',       accion: 'Modificación de rol',   ip: '192.168.1.10', detalle: 'Cambió rol de Daniel Rojas a Inactivo' },
  { id: 'aa-02', fechaHora: '25/06/2026 - 11:08', usuario: 'Dr. Luis Torres',  rol: 'Médico',      accion: 'Firma de receta',       paciente: 'Ana Fernández Llanos',  ip: '192.168.1.42', detalle: 'Receta electrónica firmada' },
  { id: 'aa-03', fechaHora: '25/06/2026 - 10:58', usuario: 'María Torres',     rol: 'Laboratorio', accion: 'Validación de resultados', paciente: 'Carlos Rodríguez Pérez', ip: '192.168.1.50', detalle: 'Resultados de hemograma validados' },
  { id: 'aa-04', fechaHora: '25/06/2026 - 10:45', usuario: 'Dr. Ricardo Mendoza', rol: 'Radiólogo', accion: 'Firma de informe',    paciente: 'María Huanca Torres',   ip: '192.168.1.60', detalle: 'Informe radiológico firmado' },
  { id: 'aa-05', fechaHora: '25/06/2026 - 10:30', usuario: 'Rosa García',      rol: 'Recepción',   accion: 'Apertura de historia',  paciente: 'José Pari Apaza',       ip: '192.168.1.20', detalle: 'Nueva historia clínica creada' },
  { id: 'aa-06', fechaHora: '25/06/2026 - 09:30', usuario: 'Patricia Núñez',   rol: 'Admin',       accion: 'Cambio de configuración', ip: '192.168.1.10', detalle: 'Tiempo máximo de espera ajustado a 30 min' },
  { id: 'aa-07', fechaHora: '25/06/2026 - 09:15', usuario: 'Dra. Carmen Vega', rol: 'Médico',      accion: 'Cierre de atención',    paciente: 'Pedro Martínez Soto',   ip: '192.168.1.43', detalle: 'Atención cerrada y firmada' },
  { id: 'aa-08', fechaHora: '25/06/2026 - 08:05', usuario: 'Patricia Núñez',   rol: 'Admin',       accion: 'Creación de usuario',   ip: '192.168.1.10', detalle: 'Usuario creado: Elena Castro (Enfermería)' },
];

// ===================== HELPERS =====================

export function formatSoles(n: number): string {
  return 'S/. ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function nombreCompletoUsuario(u: Usuario): string {
  return `${u.nombre} ${u.apellidos}`;
}
