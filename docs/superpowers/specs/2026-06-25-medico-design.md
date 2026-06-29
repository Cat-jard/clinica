# Diseño: Rol Médico — SIHCE Perú
**Fecha:** 2026-06-25  
**Estado:** Aprobado  
**Normativa:** NTS N°139-MINSA/2018/DGAIN · Ley 30024 (RENHICE) · Ley 29733 · Ley 30421 · RM N°164-2025/MINSA

---

## 1. Contexto y Objetivo

El rol Médico es el tercer rol del SIHCE. Se integra sobre los roles de Recepcionista (admisión) y Enfermería/Triaje (signos vitales y clasificación) ya implementados.

El médico recibe al paciente ya triado, documentando toda la atención clínica en la Historia Clínica Electrónica (HCE): anamnesis, examen físico, diagnóstico CIE-10, plan de tratamiento, receta, órdenes de examen e interconsultas. Cada acción crítica requiere firma digital.

---

## 2. Rutas

| Ruta | Descripción |
|------|-------------|
| `/medico` | Dashboard: KPIs, cola de citas, cola de espera triada |
| `/medico/atencion/[id]` | HCE completa del paciente |
| `/medico/auditoria` | Bitácora de auditoría del médico |

---

## 3. Stack y Convenciones

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"`, sin config)
- Fondo `#f0f0f5`, cards `rounded-2xl shadow-sm border border-gray-100`
- Acento `blue-600`. Sin dark mode.
- Recharts para gráficas → siempre `'use client'`; `formatter={(v) =>}` sin tipo explícito
- lucide-react para iconos
- `params: Promise<{id: string}>` debe ser `await`-eado (Next.js 16)
- Fechas en formato `DD/MM/YYYY — HH:MM` vía `formatoFechaHoraPeru()` de `lib/vitals.ts`
- Toasts inline (estado local) — mismo patrón que triaje

---

## 4. Tipos Nuevos — `lib/medico.ts`

```ts
// Paciente en cola del médico (viene del triaje)
interface PacienteMedicoEspera {
  id: string;
  ticket: string;
  nombre: string;
  dni: string;
  edad: number;
  sexo: 'M' | 'F';
  prioridad: Prioridad;              // del lib/vitals.ts
  signos: Partial<SignosVitales>;    // del lib/vitals.ts
  tiempoEspera: Date;
  motivoConsulta: string;
  aseguradora: 'SIS' | 'EsSalud' | 'EPS' | 'Particular';
}

// Cita del día
interface CitaDia {
  id: string;
  hora: string;          // "08:30"
  pacienteNombre: string;
  pacienteDni: string;
  motivoResumen: string;
  estado: 'Confirmada' | 'Pendiente' | 'En Atención' | 'Atendida';
}

// Diagnóstico CIE-10
interface DiagnosticoCIE10 {
  codigo: string;        // "E11.9"
  descripcion: string;   // "Diabetes mellitus tipo 2 sin complicaciones"
  tipo: 'Principal' | 'Secundario';
}

// Registro de Anamnesis
interface Anamnesis {
  motivoConsulta: string;
  enfermedadActual: string;
  antecedentesPatologicos: string[];   // checkboxes: 'DM2','HTA','Asma',...
  antecedentesQuirurgicos: string;
  antecedentesAlergicos: string;       // CRÍTICO: si se llena, aparece en PacienteHeader en rojo
  antecedentesFamiliares: string;
  habitos: string[];                   // 'Fumador','Alcohol','Sedentario'
  medicacionActual: string;
}

// Examen Físico
interface ExamenFisico {
  examenGeneral: string;
  cabezaCuello: string;
  toraxPulmones: string;
  corazon: string;
  abdomen: string;
  extremidades: string;
  neurologico: string;
  otros: string;
}

// Ítem de receta
interface ItemReceta {
  id: string;
  medicamento: string;
  concentracion: string;
  presentacion: string;
  dosis: string;
  via: 'Oral' | 'IV' | 'IM' | 'SC' | 'Tópica' | 'Inhalatoria';
  frecuencia: string;
  duracion: string;
  cantidad: number;
  indicacionesEspeciales: string;
}

// Receta
interface Receta {
  id: string;
  pacienteId: string;
  medicoId: string;
  items: ItemReceta[];
  estado: 'Borrador' | 'Firmada' | 'Enviada';
  firmadaEn?: string;
}

// Ítem de solicitud de examen
interface ItemExamen {
  id: string;
  tipo: 'Laboratorio' | 'Imágenes' | 'Otros';
  nombre: string;
  origenMuestra?: string;
  ayuno?: string;
  urgente: boolean;
  indicaciones: string;
}

// Solicitud de exámenes
interface SolicitudExamenes {
  id: string;
  pacienteId: string;
  items: ItemExamen[];
  estado: 'Borrador' | 'Firmada' | 'Enviada';
}

// Interconsulta
interface Interconsulta {
  id: string;
  especialidadDestino: string;
  medicoDestino: string;
  motivoInterconsulta: string;
  hallazgosRelevantes: string;
  preguntaEspecialista: string;
  urgencia: 'Normal' | 'Urgente';
  estado: 'Enviada' | 'Respondida' | 'Cancelada';
}

// HCE completa de una atención
interface AtencionMedica {
  id: string;
  pacienteId: string;
  medicoId: string;
  fechaInicio: string;
  anamnesis: Anamnesis;
  examenFisico: ExamenFisico;
  diagnosticos: DiagnosticoCIE10[];
  indicacionesGenerales: string;
  procedimientosRealizados: string;
  receta?: Receta;
  examenes?: SolicitudExamenes;
  interconsultas: Interconsulta[];
  estado: 'Borrador' | 'Firmada';
  firmadaEn?: string;
}

// Entrada de auditoría
interface EntradaAuditoria {
  id: string;
  fechaHora: string;
  accion: string;
  pacienteNombre: string;
  pacienteDni: string;
  ip: string;
  detalle: string;
}
```

---

## 5. Arquitectura de Componentes

### 5.1 Layout y Navbar

**`app/medico/layout.tsx`** — server component, monta `<MedicoNavbar>` y fondo `#f0f0f5`.

**`components/MedicoNavbar.tsx`** — `'use client'`
- Logo + título "Módulo de Atención Médica"
- Buscador global (input con lupa → abre SearchPatientModal existente)
- Reloj digital en tiempo real (`setInterval` 1s, igual a TriajeNavbar)
- Avatar "Dr. Luis Torres" con gradiente azul (`from-blue-500 to-blue-700`), iniciales "LT"
- Campana con badge rojo: suma resultados pendientes + firmas pendientes
- Links nav: Dashboard `/medico` · Auditoría `/medico/auditoria`

### 5.2 Dashboard — `app/medico/page.tsx`

`'use client'`. Grilla:

**Fila 1 — KPIs (4 tarjetas):**
- "Citas de Hoy" (CalendarDays, blue)
- "Pacientes en Espera" (Clock, yellow)
- "Resultados Pendientes" (FlaskConical, red)
- "Atendidos Hoy" (CheckCircle, green)

**Fila 2 — Tablas (2 columnas):**
- `ColaCitas` — citas del día con estado badge + botón "Iniciar Atención"
- `ColaEspera` — pacientes triados con badge de prioridad (mismos colores triaje) + tiempo de espera en tiempo real + botón "Atender"

**Botón flotante:** "Atender Siguiente" (toma el primero de mayor prioridad) — posición `fixed bottom-6 right-6`, azul.

### 5.3 HCE — `app/medico/atencion/[id]/page.tsx`

Server component async, `await params`. Busca paciente mock por id, llama `notFound()` si no existe. Renderiza `<PacienteHeader>` + `<HCEContent>` (client).

**`components/medico/PacienteHeader.tsx`** — fija en la parte superior de la HCE:
- Nombre, DNI, edad/sexo, N° Historia Clínica, aseguradora
- Alergias: si `anamnesis.antecedentesAlergicos` no está vacío → banner `bg-red-50 border-red-200 text-red-700` con ⚠️ siempre visible
- Botón "Ver Resumen" → abre modal con atenciones previas
- Botón "Guardar Borrador" (secundario) + "Cerrar y Firmar" (primario, **disabled hasta que `diagnosticos.length > 0`**)

**`components/medico/HCETabs.tsx`** — 5 tabs con indicador de completitud (check verde si sección tiene datos):
1. **Anamnesis** → `AnamnesisForm`
2. **Examen Físico** → `ExamenFisicoForm`
3. **Diagnóstico** → `DiagnosticoCIE10Form`
4. **Plan** → `PlanTratamiento`
5. **Historial** → lista de atenciones previas (solo lectura)

### 5.4 Formularios de la HCE

**`AnamnesisForm.tsx`**
- Motivo de consulta (textarea, obligatorio)
- Enfermedad actual (textarea, obligatorio)
- Antecedentes patológicos (checkboxes: DM2, HTA, Asma, Cardiopatía, Hepatitis, TB + "Otros" texto libre)
- Antecedentes quirúrgicos (texto)
- **Antecedentes alérgicos** (input — al escribir, actualiza `PacienteHeader` banner rojo en tiempo real)
- Antecedentes familiares (texto)
- Hábitos (checkboxes: Fumador, Alcohol, Sedentario, Actividad física)
- Medicación actual (textarea)

**`ExamenFisicoForm.tsx`**
- Signos vitales: se autocompletan desde datos de triaje (readonly con botón "Actualizar")
- 7 sistemas: Examen General, Cabeza/Cuello, Tórax/Pulmones, Corazón, Abdomen, Extremidades, Neurológico — cada uno es un textarea
- Botón "Guardar Examen Físico" (guarda sin cerrar la atención)

**`DiagnosticoCIE10Form.tsx`**
- Buscador con debounce 300ms sobre catálogo CIE-10 mock (al menos 30 diagnósticos frecuentes)
- Resultados como dropdown (código + descripción)
- Al seleccionar: se agrega a la lista como Principal (si es el primero) o Secundario
- Tabla de diagnósticos asignados: Código · Descripción · Tipo (radio Principal/Secundario) · Eliminar
- **Sin diagnósticos → botón "Cerrar y Firmar" sigue deshabilitado**

**`PlanTratamiento.tsx`**
- Indicaciones generales (textarea)
- Procedimientos realizados (textarea)
- 3 botones de acción que abren modales: "Receta Electrónica" · "Solicitar Exámenes" · "Interconsulta"
- Checkbox "Telemedicina" → muestra campo de consentimiento y nota de Ley 30421

### 5.5 Modales de la HCE

**`RecetaModal.tsx`** — abre desde PlanTratamiento
- Lista de ítems de receta (agregar / quitar)
- Por ítem: medicamento (buscador), dosis, vía (select), frecuencia, duración, cantidad, indicaciones
- Botones: "Guardar Receta" (borrador) · "Firmar Receta" → abre `FirmaDigitalModal`
- Alerta de interacción: si medicamento nuevo coincide con medicación actual del paciente → toast warning amarillo

**`ExamenesModal.tsx`** — abre desde PlanTratamiento
- Lista de exámenes (agregar / quitar)
- Por ítem: tipo (Lab/Imágenes/Otros), nombre, origen muestra, ayuno, urgente checkbox, indicaciones
- Botones: "Guardar" · "Firmar y Enviar" → abre `FirmaDigitalModal`

**`InterconsultaModal.tsx`** — abre desde PlanTratamiento
- Especialidad destino (select), médico destino (select filtrado), motivo, hallazgos, pregunta, urgencia
- Botón "Enviar Interconsulta" (sin firma requerida, pero con confirmación)

**`FirmaDigitalModal.tsx`** — reutilizable para todas las acciones críticas
- Props: `titulo`, `descripcion`, `onConfirm`, `onClose`
- Muestra resumen de lo que se va a firmar
- Input "PIN de firma" (simulado, 4-6 dígitos)
- Checkbox "Confirmo que revisé la información"
- Botón "Firmar" → `onConfirm()`, cierra modal, dispara toast éxito
- Badge "Firma Digital — Válida según RM N°164-2025/MINSA"

**`EpicrisModal.tsx`** — desde botón "Dar de Alta" (solo hospitalización, disponible en HCE)
- Todos los campos de epicrisis del spec (fecha ingreso/alta, motivo, diagnósticos, evolución, procedimientos, complicaciones, tratamiento, recomendaciones, próxima cita)
- Botón "Firmar Epicrisis" → FirmaDigitalModal → PDF simulado

### 5.6 Auditoría — `app/medico/auditoria/page.tsx`

`'use client'`. Tabla con filtros (fecha, tipo de acción):
- Columnas: Fecha/Hora · Acción · Paciente · IP · Detalle
- 10 entradas mock que cubren: apertura HCE, modificación diagnóstico, firma receta, cierre atención, etc.
- Filtro por fecha (date picker) y por tipo de acción (select)

---

## 6. Reglas de Negocio en UI

| Regla | Implementación |
|-------|---------------|
| CIE-10 obligatorio | `disabled={diagnosticos.length === 0}` en botón "Cerrar y Firmar" |
| Alergias visibles | Banner rojo en `PacienteHeader`, se actualiza reactivamente desde `AnamnesisForm` |
| Firma obligatoria | `FirmaDigitalModal` intercepta: cerrar atención, firmar receta, firmar orden, epicrisis |
| Consentimiento telemedicina | Checkbox en `PlanTratamiento` bloquea guardado si no está marcado |
| Formato de fechas | `formatoFechaHoraPeru()` en todos los timestamps |
| Interacción medicamentosa | Toast warning si medicamento nuevo ∈ medicación actual |

---

## 7. Datos Mock

- 3 pacientes en cola de espera (vinculados a los del triaje: ids '1','2','3')
- 4 citas del día con estados variados
- Catálogo CIE-10: 30 diagnósticos frecuentes en medicina general
- Catálogo de medicamentos: 20 medicamentos comunes
- Catálogo de exámenes: 15 exámenes (lab + imágenes)
- 10 entradas de auditoría

---

## 8. Archivos a Crear (21 total)

```
lib/medico.ts
components/MedicoNavbar.tsx
app/medico/layout.tsx
app/medico/page.tsx
app/medico/atencion/[id]/page.tsx
app/medico/auditoria/page.tsx
components/medico/KpiCards.tsx
components/medico/ColaCitas.tsx
components/medico/ColaEspera.tsx
components/medico/PacienteHeader.tsx
components/medico/HCETabs.tsx
components/medico/AnamnesisForm.tsx
components/medico/ExamenFisicoForm.tsx
components/medico/DiagnosticoCIE10Form.tsx
components/medico/PlanTratamiento.tsx
components/medico/RecetaModal.tsx
components/medico/ExamenesModal.tsx
components/medico/InterconsultaModal.tsx
components/medico/FirmaDigitalModal.tsx
components/medico/EpicrisModal.tsx
components/medico/ResultadosPanel.tsx
```

`ResultadosPanel.tsx` se renderiza dentro del tab "Historial" de `HCETabs` mostrando resultados de lab/imágenes del paciente. No requiere ruta propia — es accesible desde la HCE.
