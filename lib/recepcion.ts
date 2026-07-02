import { authFetch, errorMensaje } from './auth';

// Local store for patients created in this session — compensates for
// PacienteResumenResponse lacking fechaNacimiento / telefono fields.
const PACIENTES_STORE = new Map<string, Paciente>();

const MOCK_MEDICOS: Medico[] = [
  { id: 1, dni: '12345678', nombre: 'Carlos', apellidos: 'López García', email: 'carlos.lopez@clinica.com', telefono: '999111000', rol: 'MEDICO', especialidad: 'Medicina General', estado: 'ACTIVO' },
  { id: 2, dni: '23456789', nombre: 'María', apellidos: 'Fernández Torres', email: 'maria.fernandez@clinica.com', telefono: '999111001', rol: 'MEDICO', especialidad: 'Pediatría', estado: 'ACTIVO' },
  { id: 3, dni: '34567890', nombre: 'José', apellidos: 'Ramírez Mendoza', email: 'jose.ramirez@clinica.com', telefono: '999111002', rol: 'MEDICO', especialidad: 'Cardiología', estado: 'ACTIVO' },
  { id: 4, dni: '45678901', nombre: 'Ana', apellidos: 'Gutiérrez Rojas', email: 'ana.gutierrez@clinica.com', telefono: '999111003', rol: 'MEDICO', especialidad: 'Traumatología', estado: 'ACTIVO' },
  { id: 5, dni: '56789012', nombre: 'Luis', apellidos: 'Vargas Paredes', email: 'luis.vargas@clinica.com', telefono: '999111004', rol: 'MEDICO', especialidad: 'Medicina General', estado: 'ACTIVO' },
];

const MOCK_PACIENTES: Paciente[] = [
  { id: '1', tipoDocumento: 'DNI', nroDocumento: '11111111', apellidoPaterno: 'Quispe', apellidoMaterno: 'Huamán', nombres: 'Juan', nombreCompleto: 'Juan Quispe Huamán', fechaNacimiento: '1990-05-15', sexo: 'Masculino', telefono: '999888000', aseguradora: 'SIS' },
  { id: '2', tipoDocumento: 'DNI', nroDocumento: '22222222', apellidoPaterno: 'Mamani', apellidoMaterno: 'Condori', nombres: 'Rosa', nombreCompleto: 'Rosa Mamani Condori', fechaNacimiento: '1985-08-22', sexo: 'Femenino', telefono: '999888001', aseguradora: 'EsSalud' },
  { id: '3', tipoDocumento: 'DNI', nroDocumento: '33333333', apellidoPaterno: 'García', apellidoMaterno: 'Pérez', nombres: 'Pedro', nombreCompleto: 'Pedro García Pérez', fechaNacimiento: '2000-01-10', sexo: 'Masculino', telefono: '999888002', aseguradora: 'Particular' },
];

export interface Paciente {
  id: string;
  tipoDocumento: string;
  nroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  // combined field for UI convenience (generated in listPacientesApi)
  nombreCompleto?: string;
  fechaNacimiento: string; // YYYY-MM-DD
  sexo: 'Masculino' | 'Femenino';
  telefono: string;
  email?: string;
  direccion?: string;
  aseguradora: 'SIS' | 'EsSalud' | 'EPS' | 'Particular';
  nroHistoria?: string;
  alergias?: string;
  consentimiento?: string;
  hasConsent?: boolean;
  createdAt?: string;
}

export interface Medico {
  id: number;
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: string;
  especialidad?: string;
  estado: string;
}

/** Lists patients from the backend. Filters by search query `q`. */
export async function listPacientesApi(q?: string): Promise<Paciente[]> {
  try {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    const res = await authFetch(`/api/pacientes/all${query}`);
    if (!res.ok) throw new Error('API error');
    const body = await res.json();
    
    // The backend paginates: Page<PacienteResumenResponse>
    const content = body.data?.content || [];
    return content.map((p: any) => {
      const stored = PACIENTES_STORE.get(p.id);
      return {
        id: p.id,
        tipoDocumento: p.tipoDocumento,
        nroDocumento: p.nroDocumento,
        nombres: p.nombres,
        apellidoPaterno: p.apellidoPaterno,
        apellidoMaterno: p.apellidoMaterno,
        // combined field for UI convenience
        nombreCompleto: `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`,
        fechaNacimiento: p.fechaNacimiento || stored?.fechaNacimiento || '',
        sexo: p.sexo || stored?.sexo || '',
        telefono: p.telefono || stored?.telefono || '',
        email: p.email || stored?.email,
        direccion: p.direccion || stored?.direccion,
        aseguradora: p.aseguradora,
        nroHistoria: p.nroHistoria,
        alergias: p.alergias || stored?.alergias,
        consentimiento: p.consentimiento,
        hasConsent: p.consentimiento === 'Aceptado' || !!p.consentimiento
      };
    });
  } catch {
    if (!q) return MOCK_PACIENTES;
    const lower = q.toLowerCase();
    return MOCK_PACIENTES.filter(p =>
      p.nombres.toLowerCase().includes(lower) ||
      p.nroDocumento.includes(q) ||
      p.apellidoPaterno.toLowerCase().includes(lower)
    );
  }
}

/** Creates a new patient in the backend. */
export async function createPacienteApi(data: any): Promise<Paciente> {
  const res = await authFetch('/api/pacientes/crear', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo registrar el paciente'));
  const body = await res.json();
  const paciente = body.data as Paciente;
  // Store full details (incl. fechaNacimiento / telefono) for listPacientesApi merge
  PACIENTES_STORE.set(paciente.id, paciente);
  return paciente;
}

/** Lists active doctors in the system via public endpoint. */
export async function listMedicosApi(): Promise<Medico[]> {
  try {
    const res = await authFetch('/api/public/medicos/all');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return (data as any[]).map((u: any) => ({
      id: Number(u.id),
      dni: u.dni,
      nombre: u.nombre,
      apellidos: u.apellidos,
      email: u.email,
      telefono: u.telefono,
      rol: u.rol,
      especialidad: u.especialidad,
      estado: u.estado,
    }));
  } catch {
    return MOCK_MEDICOS;
  }
}
