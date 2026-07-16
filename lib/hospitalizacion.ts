import { authFetch, errorMensaje } from './auth';
import type { Cama, EstadoCama } from './admin';

// Map backend states to frontend EstadoCama
export function mapStateToFrontend(estado: string): EstadoCama {
  switch (estado?.toUpperCase()) {
    case 'DISPONIBLE': return 'Disponible';
    case 'OCUPADO':
    case 'OCUPADA': return 'Ocupada';
    case 'LIMPIEZA': return 'Limpieza';
    case 'FUERA_DE_SERVICIO': return 'Fuera de Servicio';
    default: return 'Disponible';
  }
}

// Map frontend EstadoCama to backend states
export function mapStateToBackend(estado: EstadoCama): string {
  switch (estado) {
    case 'Disponible': return 'DISPONIBLE';
    case 'Ocupada': return 'OCUPADO';
    case 'Limpieza': return 'LIMPIEZA';
    case 'Fuera de Servicio': return 'FUERA_DE_SERVICIO';
    default: return 'DISPONIBLE';
  }
}

export interface CamaApi {
  id: string;
  numero: string;
  servicio: string;
  estado: string;
  pacienteId?: string;
  pacienteNombre?: string;
  fechaIngreso?: string;
  diagnostico?: string;
  medicoNombre?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Lists all beds from the hospitalizacion-service. */
export async function listCamasApi(servicio?: string, estado?: string): Promise<Cama[]> {
  const params = new URLSearchParams();
  if (servicio && servicio !== 'Todos') params.set('servicio', servicio);
  if (estado) params.set('estado', mapStateToBackend(estado as EstadoCama));
  
  const res = await authFetch(`/api/hospitalizacion/camas/all?${params.toString()}`);
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cargar camas'));
  const body = await res.json();
  const data = body.data || body || [];
  
  return data.map((c: CamaApi) => {
    // calculate diasEstancia if there is a fechaIngreso
    let diasEstancia = 0;
    if (c.fechaIngreso) {
      const diffMs = Date.now() - new Date(c.fechaIngreso).getTime();
      diasEstancia = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    }
    
    // format fechaIngreso from ISO to UI format: "dd/MM/yyyy - HH:mm"
    let formattedFecha = '';
    if (c.fechaIngreso) {
      const d = new Date(c.fechaIngreso);
      formattedFecha = d.toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).replace(',', ' -');
    }

    return {
      id: c.id,
      numero: c.numero,
      servicio: c.servicio,
      estado: mapStateToFrontend(c.estado),
      paciente: c.pacienteNombre,
      fechaIngreso: formattedFecha,
      diagnostico: c.diagnostico,
      medicoTratante: c.medicoNombre,
      diasEstancia
    };
  });
}

/** Occupy a bed with a patient. */
export async function ocuparCamaApi(id: string, payload: {
  pacienteId: string;
  pacienteNombre: string;
  diagnostico: string;
  medicoId: string;
  medicoNombre: string;
}): Promise<void> {
  const res = await authFetch(`/api/hospitalizacion/camas/${id}/ocupar`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo ocupar la cama'));
}

/** Liberate a bed. */
export async function liberarCamaApi(id: string): Promise<void> {
  const res = await authFetch(`/api/hospitalizacion/camas/${id}/liberar`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo liberar la cama'));
}

/** Creates a new bed. */
export async function crearCamaApi(numero: string, servicio: string): Promise<void> {
  const res = await authFetch('/api/hospitalizacion/camas/crear', {
    method: 'POST',
    body: JSON.stringify({ numero, servicio }),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo crear la cama'));
}

/** Register high-level hospital admission. */
export async function registrarIngresoHospitalizacion(data: {
  camaId: string;
  pacienteId: string;
  servicio: string;
  medicoId: string;
  motivoIngreso: string;
  diagnosticoIngreso: string;
  userId: string;
}): Promise<void> {
  const payload = {
    camaId: data.camaId,
    pacienteId: data.pacienteId,
    servicio: data.servicio,
    medicoId: data.medicoId,
    motivoIngreso: data.motivoIngreso,
    diagnosticoIngreso: data.diagnosticoIngreso,
    userId: data.userId,
  };
  const res = await authFetch('/api/hospitalizacion/ingreso', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo registrar ingreso hospitalario'));
}

/** Get occupancy statistics. */
export async function getOcupacionStats(): Promise<any> {
  const res = await authFetch('/api/hospitalizacion/dashboard/ocupacion');
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cargar estadísticas de ocupación'));
  const body = await res.json();
  return body.data;
}
