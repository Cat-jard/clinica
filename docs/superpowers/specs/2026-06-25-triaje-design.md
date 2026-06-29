# Especificación de Diseño: Rol Enfermería / Triaje

**Fecha:** 2026-06-25  
**Proyecto:** SIHCE — Sistema de Historia Clínica Electrónica  
**Rol:** Personal de Enfermería (Triaje)  
**Normativa:** NTS N°139-MINSA, N.T.S. Nº 042-MINSA/DGSP-V.01, Ley 29733, Ley 30024

---

## 1. Rutas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/triaje` | Dashboard | KPIs + 5 gráficas + cola de triaje + clasificados |
| `/triaje/paciente/[id]` | Formulario de Triaje | Signos vitales + alertas + modal de prioridad |
| `/triaje/observacion` | Panel de Observación | Tabla de observación + Kardex con firma digital |

---

## 2. Arquitectura

- **Enfoque:** Rol independiente, sin dependencias cruzadas con `/recepcionista/*`
- **Layout:** `app/triaje/layout.tsx` envuelve con `<TriajeNavbar />` + fondo `bg-[#f0f0f5]`
- **Reutiliza:** `ModalBase`, `useToast`, `calcAge`, `formatDate`, `todayISO` de `lib/format.ts`
- **No comparte** componentes con el rol de recepcionista (evita acoplamiento)

---

## 3. Modelo de Datos

```typescript
type Prioridad = 'I-ROJO' | 'II-NARANJA' | 'III-AMARILLO' | 'IV-VERDE' | 'V-AZUL';
type Destino   = 'Reanimación/UCI' | 'Emergencias' | 'Consultorio prioritario' | 'Consultorio normal' | 'Consulta externa';
type NivelConciencia = 'Alerta' | 'Verbal' | 'Dolor' | 'Inconsciente';

interface PacienteEspera {
  id: string;
  ticket: string;
  nombre: string;
  dni: string;
  fechaNac: string;      // ISO → edad calculada con calcAge()
  horaLlegada: string;   // "08:45"
  motivo: string;
}

interface SignosVitales {
  pasSistolica: number;
  pasDiastolica: number;
  frecCardiaca: number;
  frecRespiratoria: number;
  temperatura: number;   // decimal
  spo2: number;
  peso: number;
  talla: number;
  imc?: number;          // calculado: peso / (talla/100)²
}

interface RegistroTriaje {
  pacienteId: string;
  signos: SignosVitales;
  motivoConsulta: string;
  nivelConciencia: NivelConciencia;
  dolor: number;         // 0–10
  prioridad: Prioridad;
  destino: Destino;
  justificacion: string; // obligatorio
  enfermera: string;
  timestamp: string;     // ISO — auditoría NTS N°139
}

interface EntradaKardex {
  id: string;
  pacienteId: string;
  fechaHora: string;     // auto, no editable
  signos?: Partial<SignosVitales>;
  ingresosHidricos: number;
  egresosHidricos: number;
  medicamentos: { nombre: string; dosis: string; via: string; hora: string }[];
  evolucion: string;
  firmado: boolean;
  firmadoPor?: string;
  firmaCanvas?: string;  // base64
}
```

---

## 4. Componentes

### 4.1 `TriajeNavbar` (`components/TriajeNavbar.tsx`)
- Logo SIHCE + subtítulo "Enfermería"
- Links activos: **Dashboard** | **Observación**
- Reloj digital en tiempo real (`useEffect` + `setInterval` cada segundo)
- Badge rojo con conteo de registros Kardex sin firmar
- Avatar "Ana Ríos — Enfermera" con menú desplegable (Mi Perfil / Cerrar Sesión)

### 4.2 `KpiCards` (`components/triaje/KpiCards.tsx`)
Cuatro tarjetas en grid:

| Tarjeta | Color | Dato |
|---------|-------|------|
| En Espera | Amarillo | Pacientes sin clasificar |
| Prioridad Roja | Rojo | Pacientes críticos |
| Prioridad Naranja | Naranja | Pacientes urgentes |
| Tiempo Prom. Triaje | Azul | Minutos promedio |

### 4.3 Gráficas del Dashboard (todas `'use client'` + Recharts)

| Componente | Tipo | Descripción |
|------------|------|-------------|
| `PriorityDonut` | `PieChart` | Distribución de los 5 niveles de prioridad con colores reales |
| `HourlyArrivalsChart` | `BarChart` | Llegadas de pacientes por hora (8am–5pm), barras con patrón diagonal |
| `TriageTimeChart` | `AreaChart` | Tiempo promedio de triaje por hora a lo largo del día |
| `SpO2Gauge` | `RadialBarChart` | SpO2 promedio actual; verde >95%, amarillo 90–95%, rojo <90% |
| `TopMotivoChart` | `BarChart` horizontal | Top 5 motivos de consulta del día |

Layout en el dashboard:
```
┌─────────┬─────────┬─────────┬──────────────────┐
│ En      │ Rojo    │Naranja  │  Gauge SpO2       │
│ Espera  │         │         │                   │
├─────────┴─────────┴─────────┤                   │
│   Donut Prioridades         ├───────────────────┤
│                             │ Top Motivos       │
├─────────────────────────────┴───────────────────┤
│  Barras Pacientes/Hora  │  Área Tiempo Triaje   │
├─────────────────────────┴───────────────────────┤
│  Cola de Triaje (tabla)                         │
├─────────────────────────────────────────────────┤
│  Clasificados Esperando Médico (tabla)           │
└─────────────────────────────────────────────────┘
```

### 4.4 `ColaTriaje` (`components/triaje/ColaTriaje.tsx`)
- Tabla: Ticket | Paciente | Hora Llegada | Motivo | Acción
- Botón "Iniciar Triaje" (azul, grande) → `router.push('/triaje/paciente/[id]')`
- Pacientes ordenados por hora de llegada (FIFO)

### 4.5 `ClasificadosTable` (`components/triaje/ClasificadosTable.tsx`)
- Tabla: Ticket | Paciente | Prioridad (badge color) | Tiempo en Espera | Estado
- Tiempo en espera: contador animado con `useEffect`/`setInterval`, formato `HH:MM`, color rojo si supera el tiempo máximo permitido para su prioridad (ej. Naranja > 15 min → texto rojo parpadeante)
- Botón "Ver Ficha" → modal de solo lectura

### 4.6 `VitalSignsForm` (`components/triaje/VitalSignsForm.tsx`)
- Página `/triaje/paciente/[id]`
- Header fijo: foto placeholder + nombre + DNI + edad (calculada)
- 7 campos numéricos grandes (táctil-friendly: `text-2xl p-4`)
- Alertas inline por campo (`onBlur`):
  - PAS > 140 o < 90 → badge amarillo
  - FC > 100 o < 60 → badge amarillo; FC > 120 → badge rojo + ⚠️
  - SpO2 < 95% → badge amarillo; SpO2 < 90% → badge rojo + ⚠️ + toast de alerta crítica
  - Temp > 38°C → badge amarillo; Temp > 39°C → badge rojo + ⚠️
- Botón "Calcular IMC" visible cuando peso y talla están completos
- Evaluación subjetiva: motivo (textarea, obligatorio), nivel de conciencia (select), dolor (slider 0–10)
- Al guardar → abre `PriorityModal` automáticamente

### 4.7 `PriorityModal` (`components/triaje/PriorityModal.tsx`)
- Modal `max-w-4xl` usando `ModalBase`
- 5 botones gigantes en fila, colores reales:

| Botón | Color Tailwind | Tiempo |
|-------|---------------|--------|
| I — RESUCITACIÓN | `bg-red-600` | Inmediato |
| II — EMERGENCIA | `bg-orange-500` | < 15 min |
| III — URGENTE | `bg-yellow-400 text-gray-900` | < 60 min |
| IV — MENOS URGENTE | `bg-green-500` | < 120 min |
| V — NO URGENTE | `bg-blue-500` | > 120 min |

**Hard logic (bloqueante):**
- SpO2 < 90% → Verde y Azul: `opacity-40 cursor-not-allowed pointer-events-none`
- PAS > 180 → badge "⚠️ Sugerido" encima del botón Naranja
- Al seleccionar color → aparece textarea "Justificación" (obligatorio, mín. 10 chars)
- Botón "Asignar Prioridad y Enviar" deshabilitado hasta: color seleccionado + justificación válida
- Al confirmar: toast de éxito + `router.push('/triaje')` + paciente aparece en ClasificadosTable

### 4.8 `KardexForm` (`components/triaje/KardexForm.tsx`)
- Modal `max-w-2xl`
- Fecha/hora: auto-completada, campo `disabled`
- Signos vitales: opcionales (si vacíos, se asumen los últimos)
- Balance hídrico: dos inputs (Ingresos ml / Egresos ml)
- Medicamentos: lista dinámica con botón "+ Agregar medicamento"
- Evolución: textarea grande (obligatorio)
- Canvas de firma (igual al `ConsentModal` existente): mouse + touch
- Sin firma → badge "Pendiente de Firma" en la fila de ObservacionTable; el botón "Iniciar Alta" queda deshabilitado hasta que exista al menos un registro Kardex firmado

### 4.9 `ObservacionTable` (`components/triaje/ObservacionTable.tsx`)
- Tabla: Paciente | Hora Ingreso | Prioridad | Motivo | Tiempo en Obs.
- 3 acciones por fila: "Registrar Evolución" | "Solicitar Reevaluación" | "Iniciar Alta"
- "Solicitar Reevaluación" → toast de confirmación (simula notificación al médico)
- "Iniciar Alta" → modal de confirmación con selector (Alta domiciliaria / Hospitalización / Traslado)

---

## 5. Lógica de Negocio (`lib/vitals.ts`)

```typescript
// Rangos normales adulto (extensible por edad)
export const RANGOS = {
  pasSistolica:      { min: 90,   max: 140 },
  pasDiastolica:     { min: 60,   max: 90  },
  frecCardiaca:      { min: 60,   max: 100 },
  frecRespiratoria:  { min: 12,   max: 20  },
  temperatura:       { min: 36.5, max: 37.5 },
  spo2:              { min: 95,   max: 100 },
};

export function calcIMC(peso: number, talla: number): number
export function alertaSpo2(spo2: number): 'normal' | 'warning' | 'critical'
export function alertaFC(fc: number): 'normal' | 'warning' | 'critical'
export function alertaTemp(temp: number): 'normal' | 'warning' | 'critical'
export function alertaPAS(pas: number): 'normal' | 'warning'
export function destinoPorPrioridad(p: Prioridad): Destino
```

---

## 6. Reglas de Negocio (Hard Logic — Cumplimiento NTS)

1. **Prioridad obligatoria:** botón "Asignar y Enviar" deshabilitado sin color + justificación
2. **SpO2 < 90%:** bloquea botones Verde y Azul; muestra toast rojo "¡Hipoxemia! Mínimo prioridad Amarilla"
3. **FC > 120 o Temp > 39°C:** ícono ⚠️ inline junto al campo
4. **Firma Kardex obligatoria:** badge "Pendiente de Firma" visible en tabla; no se puede cerrar la atención sin firma
5. **Trazabilidad:** cada acción (iniciar triaje, guardar signos, asignar prioridad, firmar Kardex) genera log con `userId`, `timestamp`, `pacienteId`
6. **Formato de fechas:** siempre `DD/MM/YYYY — HH:MM` (formato peruano)

---

## 7. Stack y Convenciones

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"`, sin `tailwind.config.js`)
- Recharts para gráficas (siempre con `'use client'`)
- lucide-react para íconos
- Fondo `#f0f0f5`, cards `rounded-2xl shadow-sm border border-gray-100`
- Acento principal: `blue-600`. Sin dark mode.
- Campos de signos vitales: `input type="number"`, `step="0.1"` para temperatura/peso/talla, `step="1"` para los demás
- Campos táctil-friendly: mínimo `text-xl p-4` para uso en tablets

---

## 8. Archivos a Crear

```
app/triaje/layout.tsx
app/triaje/page.tsx
app/triaje/paciente/[id]/page.tsx
app/triaje/observacion/page.tsx
components/TriajeNavbar.tsx
components/triaje/KpiCards.tsx
components/triaje/ColaTriaje.tsx
components/triaje/ClasificadosTable.tsx
components/triaje/VitalSignsForm.tsx
components/triaje/PriorityModal.tsx
components/triaje/KardexForm.tsx
components/triaje/ObservacionTable.tsx
components/triaje/charts/PriorityDonut.tsx
components/triaje/charts/HourlyArrivalsChart.tsx
components/triaje/charts/TriageTimeChart.tsx
components/triaje/charts/SpO2Gauge.tsx
components/triaje/charts/TopMotivoChart.tsx
lib/vitals.ts
```

**Total: 19 archivos nuevos.** No se modifica ningún archivo existente del rol de recepcionista.
