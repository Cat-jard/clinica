import { authFetch, errorMensaje } from './auth';

export interface SignosVitales {
  pasSistolica: number;
  pasDiastolica: number;
  frecCardiaca: number;
  frecRespiratoria: number;
  temperatura: number;
  spo2: number;
  peso: number;
  talla: number;
}

export interface RegistroTriaje {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteDni: string;
  medicoId?: string;
  medicoNombre?: string;
  especialidadId?: string;
  especialidadNombre?: string;
  citaId?: string;
  ticket: string;
  horaLlegada: string;
  fechaTriaje: string;
  motivoConsulta: string;
  nivelConciencia: string;
  dolor: number;
  prioridad: 'I-ROJO' | 'II-NARANJA' | 'III-AMARILLO' | 'IV-VERDE' | 'V-AZUL';
  destino: string;
  justificacion: string;
  enfermeraId: string;
  conCita: boolean;
  timestamp: string;
  estado?: string;
  signos: SignosVitales;
}

export interface ColaTriajeItem {
  id: string; // queue ID (colaId)
  pacienteId: string;
  pacienteNombre: string;
  ticket: string;
  horaLlegada: string;
  medicoNombre?: string;
  especialidad?: string;
  motivo?: string;
  citaId?: string;
}

export interface TriajeKPIs {
  totalTriajes: number;
  rojo: number;
  naranja: number;
  amarillo: number;
  verde: number;
  azul: number;
}

/** Fetch waiting queue for triages. Fallbacks to empty array if endpoint returns 404 or fails. */
export async function getColaTriajeApi(fecha: string): Promise<ColaTriajeItem[]> {
  try {
    const res = await authFetch(`/api/triaje/cola?fecha=${fecha}`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cargar la cola'));
    const body = await res.json();
    return body.data || body || [];
  } catch (error) {
    console.error('Error fetching cola triaje:', error);
    return [];
  }
}

/** Initiate triage for a queue item. */
export async function iniciarTriajeApi(colaId: string): Promise<void> {
  const res = await authFetch(`/api/triaje/cola/${colaId}/iniciar`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo iniciar el triaje'));
}

/** Registers a new triage record. */
export async function registrarTriajeApi(data: {
  colaId: string;
  pacienteId: string;
  citaId?: string;
  enfermeraId: string;
  signos: SignosVitales;
  motivoConsulta: string;
  nivelConciencia: 'Alerta' | 'Verbal' | 'Dolor' | 'Inconsciente';
  dolor: number;
  prioridad: 'I-ROJO' | 'II-NARANJA' | 'III-AMARILLO' | 'IV-VERDE' | 'V-AZUL';
  justificacion: string;
}): Promise<RegistroTriaje> {
  const res = await authFetch('/api/triaje/registrar', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo registrar el triaje'));
  const body = await res.json();
  return body.data;
}

/** Lists classified patients (registros triaje). */
export async function listRegistrosTriajeApi(fecha: string, prioridad?: string): Promise<RegistroTriaje[]> {
  const params = new URLSearchParams();
  params.set('fecha', fecha);
  if (prioridad && prioridad !== 'Todos') params.set('prioridad', prioridad);
  
  const res = await authFetch(`/api/triaje/registros?${params.toString()}`);
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo listar registros de triaje'));
  const body = await res.json();
  
  // TriajeController returns Page<RegistroTriajeResponse>
  const content = body.data?.content || body.data || [];
  return content;
}

export interface ObservacionPaciente {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  medicoId?: number;
  medicoNombre?: string;
  especialidad?: string;
  horaIngreso: string;
  prioridad: string;
  motivo: string;
  estado: string;
  createdAt: string;
}

/** Lists observation patients. */
export async function getObservacionApi(): Promise<ObservacionPaciente[]> {
  try {
    const res = await authFetch('/api/triaje/observacion');
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cargar observación'));
    const body = await res.json();
    return body.data || body || [];
  } catch (error) {
    console.error('Error fetching observacion:', error);
    return [];
  }
}

/** Register a kardex entry for a patient in observation. */
export async function crearKardexApi(data: {
  pacienteId: string;
  signos: { pasSistolica: number; pasDiastolica: number; frecCardiaca: number; frecRespiratoria: number; temperatura: number; spo2: number };
  ingresosHidricos: number;
  egresosHidricos: number;
  medicamentos: { nombre: string; dosis: string; via: string; hora: string }[];
  evolucion: string;
}): Promise<any> {
  const res = await authFetch(`/api/triaje/pacientes/${data.pacienteId}/kardex`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo guardar el kardex'));
  const body = await res.json();
  return body.data;
}

/** Sign a kardex entry. */
export async function firmarKardexApi(id: string, firmaBase64: string): Promise<any> {
  const res = await authFetch(`/api/triaje/kardex/${id}/firmar`, {
    method: 'PUT',
    body: JSON.stringify({ firmaBase64 }),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo firmar el kardex'));
  const body = await res.json();
  return body.data;
}

/** Discharge a patient from observation. */
export async function altaObservacionApi(id: string, tipoAlta: string): Promise<void> {
  const res = await authFetch(`/api/triaje/observacion/${id}/alta`, {
    method: 'PUT',
    body: JSON.stringify({ tipoAlta }),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo dar de alta'));
}

/** Mark a patient as attended in triage (removes from queue). */
export async function marcarAtendidoApi(pacienteId: string): Promise<void> {
  try {
    await authFetch(`/api/triaje/registros/${pacienteId}/atender`, { method: 'POST' });
    await authFetch(`/api/citas/paciente/${pacienteId}/atender`, { method: 'POST' }).catch(() => null);
  } catch {
    console.error('Error marking patient as attended');
  }
}

/** Gets KPIs for dashboard. */
export async function getTriajeKPIsApi(fecha: string): Promise<TriajeKPIs> {
  try {
    const res = await authFetch(`/api/triaje/dashboard/kpi?fecha=${fecha}`);
    if (!res.ok) throw new Error(await errorMensaje(res, 'Error en KPIs'));
    const body = await res.json();
    return body.data as TriajeKPIs;
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return { totalTriajes: 0, rojo: 0, naranja: 0, amarillo: 0, verde: 0, azul: 0 };
  }
}

export interface DistribucionPrioridad {
  prioridad: string;
  cantidad: number;
}

export interface LlegadaPorHora {
  hora: string;
  cantidad: number;
}

export interface TopMotivo {
  motivo: string;
  cantidad: number;
}

export interface Spo2Promedio {
  fecha: string;
  spo2Promedio: number | null;
}

/** Gets priority distribution for dashboard. */
export async function getDistribucionPrioridadesApi(fecha: string): Promise<DistribucionPrioridad[]> {
  try {
    const res = await authFetch(`/api/triaje/dashboard/distribucion-prioridades?fecha=${fecha}`);
    if (!res.ok) return [];
    const body = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}

/** Gets arrivals by hour for dashboard. */
export async function getLlegadasPorHoraApi(fecha: string): Promise<LlegadaPorHora[]> {
  try {
    const res = await authFetch(`/api/triaje/dashboard/llegadas-por-hora?fecha=${fecha}`);
    if (!res.ok) return [];
    const body = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}

/** Gets top reasons for visit for dashboard. */
export async function getTopMotivosApi(fecha: string): Promise<TopMotivo[]> {
  try {
    const res = await authFetch(`/api/triaje/dashboard/top-motivos?fecha=${fecha}`);
    if (!res.ok) return [];
    const body = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}

/** Gets average SpO2 for dashboard. */
export async function getSpo2PromedioApi(fecha: string): Promise<Spo2Promedio> {
  try {
    const res = await authFetch(`/api/triaje/dashboard/spo2-promedio?fecha=${fecha}`);
    if (!res.ok) return { fecha, spo2Promedio: null };
    const body = await res.json();
    return body.data as Spo2Promedio;
  } catch {
    return { fecha, spo2Promedio: null };
  }
}
