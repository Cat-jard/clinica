import { authFetch, errorMensaje } from './auth';

const MOCK_CITAS_STORE: Cita[] = [];
let MOCK_CITA_ID = 1;

export interface Cita {
  id: string;
  pacienteId: string;
  pacienteNombre?: string; // UI friendly
  pacienteDni?: string; // UI friendly
  medicoId: number;
  medicoNombre?: string; // UI friendly
  fechaCita: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm:ss
  horaFin: string; // HH:mm:ss
  estado: 'PROGRAMADA' | 'CONFIRMADA' | 'PENDIENTE' | 'CANCELADA' | 'ATENDIDA';
  motivo: string;
  observaciones?: string;
  tipoSeguro?: string;
  numeroHistoria?: string;
  createdAt?: string;
}

export interface CitaResumen {
  programadas: number;
  atendidas: number;
  canceladas: number;
}

/** Resumen legacy: computed from CitaResumen for backwards compat. */
export function citaResumenTotal(r: CitaResumen): number {
  return r.programadas + r.atendidas + r.canceladas;
}

/** Lists all appointments from the backend, optionally filtered by date. */
export async function listCitasApi(desde?: string, hasta?: string): Promise<Cita[]> {
  try {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    // Get a large size to fit all daily appointments
    params.set('size', '100');
    
    const res = await authFetch(`/api/citas/all?${params.toString()}`);
    if (!res.ok) throw new Error('API error');
    const body = await res.json();
    const content = body.data?.content || body.data || [];
    return content;
  } catch {
    const from = desde || '0000-00-00';
    const to = hasta || '9999-99-99';
    return MOCK_CITAS_STORE.filter(c => c.fechaCita >= from && c.fechaCita <= to);
  }
}

/** Creates a new appointment in the backend. */
export async function createCitaApi(data: {
  pacienteId: string;
  medicoId: number;
  fechaCita: string;
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  motivo: string;
  observaciones?: string;
  tipoSeguro: string;
}): Promise<Cita> {
  try {
    // Ensure time includes seconds
    const formatTime = (t: string) => t.length === 5 ? `${t}:00` : t;
    const payload = {
      ...data,
      horaInicio: formatTime(data.horaInicio),
      horaFin: formatTime(data.horaFin)
    };

    const res = await authFetch('/api/citas/crear', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('API error');
    const body = await res.json();
    return body.data;
  } catch {
    const id = String(MOCK_CITA_ID++);
    const cita: Cita = {
      id,
      pacienteId: data.pacienteId,
      medicoId: data.medicoId,
      medicoNombre: '',
      pacienteNombre: '',
      fechaCita: data.fechaCita,
      horaInicio: data.horaInicio.length === 5 ? `${data.horaInicio}:00` : data.horaInicio,
      horaFin: data.horaFin.length === 5 ? `${data.horaFin}:00` : data.horaFin,
      estado: 'PROGRAMADA',
      motivo: data.motivo,
      observaciones: data.observaciones,
      tipoSeguro: data.tipoSeguro,
      createdAt: new Date().toISOString(),
    };
    MOCK_CITAS_STORE.push(cita);
    return cita;
  }
}

/** Cancels an appointment. */
export async function cancelCitaApi(id: string, motivo: string, canceladoPor: string): Promise<void> {
  const res = await authFetch(`/api/citas/${id}/cancelar`, {
    method: 'POST',
    body: JSON.stringify({ motivo, canceladoPor }),
  });
  if (!res.ok) throw new Error(await errorMensaje(res, 'No se pudo cancelar la cita'));
}
