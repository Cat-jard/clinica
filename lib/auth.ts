// ============================================================
// Integración con el backend a través del API Gateway
// ============================================================

// El gateway (puerto 8080) enruta cada ruta a su microservicio:
//   /api/auth/**         → usuario-service
//   /api/pacientes/**    → recepcion-service
//   /api/citas/**        → citas-service
//   /api/triaje/**       → triaje-service
//   /api/hospitalizacion/** → hospitalizacion-service
//   /api/usuarios/**     → usuario-service
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

const TOKEN_KEY = 'sihce_token';
const USER_KEY = 'sihce_user';

export interface AuthUsuario {
  id: string;
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: string;            // etiqueta: "Médico"
  especialidad?: string | null;
  estado: string;         // "Activo" | "Inactivo"
  ultimoAcceso: string;
  ruta: string;           // ruta del módulo, p.ej. "/medico"
}

interface LoginResponse {
  token: string;
  tipoToken: string;
  expiraEnMs: number;
  ruta: string;
  usuario: AuthUsuario;
}

/** Inicia sesión contra el backend. Lanza Error con el mensaje del servidor si falla. */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message ?? 'No se pudo iniciar sesión');
  }

  const login = data as LoginResponse;
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, login.token);
    localStorage.setItem(USER_KEY, JSON.stringify(login.usuario));
  }
  return login;
}

/** Cierra la sesión (borra token y usuario). */
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsuario(): AuthUsuario | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUsuario) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/** fetch con el token JWT incluido (para llamar endpoints protegidos del usuario-service). */
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return authFetchAt(API_URL, path, options);
}

/**
 * Igual que authFetch pero contra la URL base de otro microservicio
 * (auditoria-service, soporte-service, …). Reutiliza el mismo JWT, ya que todos
 * los servicios validan el token emitido por el usuario-service.
 */
export async function authFetchAt(baseUrl: string, path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${baseUrl}${path}`, { ...options, headers });
}

/** Extrae el mensaje de error de una respuesta JSON del backend (formato estandar SIHCE). */
export async function errorMensaje(res: Response, porDefecto: string): Promise<string> {
  const data = await res.json().catch(() => null);
  return data?.message ?? porDefecto;
}
