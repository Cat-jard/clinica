@AGENTS.md

---

## Stack técnico
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"`, sin tailwind.config.js)
- Recharts para gráficos (marcar con `'use client'`)
- lucide-react para iconos
- Fondo `#f0f0f5`, cards blancas `rounded-2xl shadow-sm border border-gray-100`
- Acento: `blue-600`. Sin dark mode.

---

Perfecto, vamos a profundizar en el primer rol con el nivel de detalle que necesitas para construir el frontend. Aquí tienes la especificación técnica completa para el **Rol de Recepcionista / Admisión**, diseñada para cumplir con la normativa peruana.

---

## ROL: RECEPCIONISTA / ADMISIÓN

**Objetivo del rol:** Gestionar el ingreso, identificación y registro de pacientes, así como la administración de citas, garantizando el cumplimiento de la normativa de protección de datos y el correcto inicio del flujo de atención.

---

### MÓDULO 1: BUSCADOR UNIVERSAL DE PACIENTES

**Ubicación:** Barra superior fija, visible en todas las pantallas del rol.

**Descripción:** Es la puerta de entrada del sistema. Permite localizar rápidamente a un paciente existente o identificar que es uno nuevo.

**Campos y elementos visuales:**
| Elemento | Tipo | Descripción |
|----------|------|-------------|
| **Buscador** | Input de texto con ícono de lupa | Campo de texto único donde se puede ingresar DNI (8 dígitos) o nombres/apellidos. |
| **Autocompletado** | Dropdown de resultados | Al escribir, muestra hasta 5 coincidencias con: DNI, Nombres completos, y un ícono que indica si el paciente está activo. |
| **Botón "Nuevo Paciente"** | Botón primario (destacado en color) | Aparece cuando la búsqueda no arroja resultados. Debe ser grande y visualmente prominente. |

**Acciones y flujo:**
1. El recepcionista escribe el DNI o nombre del paciente.
2. El sistema busca en la base de datos en tiempo real (mientras escribe).
3. Si el paciente existe:
   - Se muestran los resultados en el dropdown.
   - Al hacer clic en un resultado, se abre la **Ficha Resumen del Paciente** (ver Módulo 2).
4. Si el paciente NO existe:
   - El sistema muestra un mensaje: *"No se encontraron resultados. ¿Desea registrar un nuevo paciente?"*
   - Se habilita el botón **"Nuevo Paciente"** que abre el formulario de registro.

**Validaciones técnicas:**
- El DNI debe tener exactamente 8 dígitos numéricos.
- La búsqueda por nombres debe ser insensible a mayúsculas/minúsculas y tolerante a tildes.
- El sistema debe mostrar un **indicador de carga** (spinner) mientras realiza la búsqueda.

**Normativa aplicable:**
- **Ley N° 29733, Ley de Protección de Datos Personales**: El acceso a los datos del paciente debe estar restringido según el rol.
- **NTS N°139-MINSA/2018/DGAIN**: La identificación del paciente es el primer paso para una correcta gestión de la historia clínica.

---

### MÓDULO 2: REGISTRO / FICHA DEL PACIENTE

**Ubicación:** Pantalla completa o modal emergente (según flujo de diseño).

**Descripción:** Formulario para registrar a un paciente nuevo o visualizar/editar los datos de uno existente.

#### 2.1. Datos de Identificación (Sección obligatoria)

| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| **DNI** | Input numérico | Sí | 8 dígitos exactos. Validar contra el RENIEC (opcional). |
| **Nombres** | Input texto | Sí | Solo letras, espacios y tildes. |
| **Apellido Paterno** | Input texto | Sí | Solo letras, espacios y tildes. |
| **Apellido Materno** | Input texto | Sí | Solo letras, espacios y tildes. |
| **Fecha de Nacimiento** | Date picker | Sí | No puede ser futura. Al seleccionarla, calcular y mostrar la **edad** automáticamente. |
| **Sexo** | Select (Radio o Dropdown) | Sí | Opciones: Masculino, Femenino. |
| **Tipo de Documento** | Select | Sí | Opciones: DNI, Carné de Extranjería, Pasaporte. (Por defecto: DNI). |

#### 2.2. Datos de Contacto

| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| **Dirección** | Input texto | No | Texto libre. |
| **Distrito** | Select | No | Cargar desde un catálogo de distritos (opcional). |
| **Teléfono** | Input numérico | Sí | 9 dígitos (celular). |
| **Teléfono Fijo** | Input numérico | No | - |
| **Correo Electrónico** | Input email | No | Validar formato de email. |

#### 2.3. Datos Adicionales (Opcionales)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **Ocupación** | Input texto | - |
| **Persona de Contacto** | Input texto | Nombre de familiar o responsable. |
| **Teléfono de Contacto** | Input numérico | - |
| **Observaciones** | Textarea | Campo para notas adicionales. |

**Acciones y botones:**
| Botón | Acción |
|-------|--------|
| **"Guardar"** | Valida todos los campos obligatorios. Si es correcto, crea el paciente y redirige a la Ficha Resumen. |
| **"Guardar y Solicitar Consentimiento"** | (Botón crítico) Guarda los datos y abre inmediatamente el modal de Consentimiento Informado (ver Módulo 3). |
| **"Cancelar"** | Cierra el formulario sin guardar (con confirmación si hay datos ingresados). |
| **"Editar"** | (Solo en modo vista) Habilita la edición de los campos. |

**Validaciones del formulario:**
- El DNI debe ser único en el sistema. Si ya existe, mostrar error: *"Ya existe un paciente registrado con este DNI"*.
- La fecha de nacimiento no puede ser posterior a la fecha actual.
- La edad se calcula automáticamente al seleccionar la fecha de nacimiento.
- Todos los campos marcados como obligatorios deben estar llenos para habilitar el botón "Guardar".

**Normativa aplicable:**
- **NTS N°139-MINSA/2018/DGAIN**: Establece el contenido básico de la historia clínica, que inicia con los datos de identificación.
- **Ley N° 30024 (RENHICE)**: El DNI es el identificador único para la interoperabilidad con el Registro Nacional de Historias Clínicas Electrónicas.

---

### MÓDULO 3: CONSENTIMIENTO INFORMADO

**Ubicación:** Modal (pop-up) que se abre al hacer clic en "Guardar y Solicitar Consentimiento" o al inicio de cualquier procedimiento.

**Descripción:** Documento legal que registra la autorización del paciente para el tratamiento de sus datos personales y, en su caso, para procedimientos médicos específicos.

**Contenido del modal:**
| Elemento | Descripción |
|----------|-------------|
| **Título** | "CONSENTIMIENTO INFORMADO PARA EL TRATAMIENTO DE DATOS PERSONALES EN SALUD" |
| **Texto del consentimiento** | Área de texto con el contenido legal completo (según formato de la institución). Debe incluir: propósito del tratamiento, derechos del paciente (acceso, rectificación, cancelación, oposición), y la obligación de confidencialidad. |
| **Checkbox** | *"He leído y comprendido la información proporcionada y otorgo mi consentimiento para el tratamiento de mis datos personales con fines de atención de salud."* |
| **Checkbox (si aplica)** | *"Autorizo la realización de [procedimiento específico]"* (para casos de telemedicina o procedimientos invasivos). |
| **Firma del paciente** | Área para firma digital (puede ser un campo para dibujar con el mouse/touch o un lector de DNI electrónico). |
| **Firma del testigo** | (Opcional) Campo para firma de un testigo si el paciente no puede firmar. |

**Acciones y botones:**
| Botón | Acción |
|-------|--------|
| **"Aceptar y Firmar"** | Registra el consentimiento con fecha, hora y firma del paciente. Guarda el documento en la historia clínica. |
| **"Rechazar"** | Registra el rechazo. El paciente no puede ser atendido (excepto en emergencias). |
| **"Imprimir"** | Genera una copia física del consentimiento firmado. |

**Validaciones:**
- El checkbox de aceptación debe estar marcado para habilitar el botón "Aceptar y Firmar".
- La firma del paciente es obligatoria (excepto en casos donde la ley lo exima).
- El sistema debe guardar una copia digital del consentimiento en formato PDF.

**Normativa aplicable:**
- **Ley N° 29733, Ley de Protección de Datos Personales**: Exige el consentimiento del titular para el tratamiento de sus datos personales.
- **Ley N° 30421 (Ley Marco de Telesalud)**: Exige consentimiento informado para atenciones por telemedicina.
- **NTS N°139-MINSA**: El consentimiento informado forma parte de la historia clínica.

---

### MÓDULO 4: GESTIÓN DE CITAS

**Ubicación:** Pantalla principal del rol, generalmente con una vista de calendario.

**Descripción:** Permite programar, reprogramar y cancelar citas médicas, asignando paciente, profesional, fecha y hora.

#### 4.1. Vista de Calendario

| Elemento | Descripción |
|----------|-------------|
| **Selector de vista** | Botones para cambiar entre: Día, Semana, Mes. |
| **Navegación** | Botones "Anterior" y "Siguiente" para cambiar de fecha/período. |
| **Calendario** | Grilla con bloques de tiempo (generalmente de 15, 20 o 30 minutos). |
| **Código de colores** | - **Verde**: Horario disponible.<br>- **Rojo**: Cita ocupada.<br>- **Amarillo**: Cita pendiente de confirmación.<br>- **Gris**: Horario no laboral / bloqueado. |

#### 4.2. Creación de Cita (Modal)

**Campos del formulario:**

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| **Paciente** | Buscador (autocompletado) | Sí | Buscar por DNI o nombre. |
| **Médico / Especialista** | Select | Sí | Lista de profesionales disponibles, filtrada por especialidad. |
| **Especialidad** | Select | Sí | Filtra la lista de médicos. |
| **Fecha** | Date picker | Sí | Seleccionar día. |
| **Hora** | Time picker | Sí | Seleccionar hora (basado en los bloques disponibles). |
| **Duración** | Select | Sí | Opciones: 15, 20, 30, 45, 60 minutos (según configuración). |
| **Tipo de Cita** | Select | Sí | Opciones: Consulta Externa, Teleconsulta, Control, Emergencia, etc. |
| **Observaciones** | Textarea | No | Notas adicionales para el médico. |

**Acciones y botones:**

| Botón | Acción |
|-------|--------|
| **"Agendar Cita"** | Valida los campos y crea la cita. Envía notificación al médico (si el sistema lo soporta). |
| **"Reprogramar"** | (En cita existente) Abre el formulario con los datos actuales para modificar fecha/hora. |
| **"Cancelar Cita"** | Solicita confirmación y motivo de cancelación (obligatorio para trazabilidad). |
| **"Confirmar Cita"** | Cambia el estado de la cita a "Confirmada" (para citas pendientes). |

#### 4.3. Lista de Citas del Día

**Ubicación:** Generalmente debajo del calendario o en una barra lateral.

**Descripción:** Muestra un listado de todas las citas programadas para el día actual (o fecha seleccionada).

**Columnas de la tabla:**
| Columna | Descripción |
|---------|-------------|
| **Hora** | Hora de inicio de la cita. |
| **Paciente** | Nombre completo del paciente. |
| **Médico** | Nombre del médico asignado. |
| **Especialidad** | Especialidad de la consulta. |
| **Estado** | Indicador visual: Confirmada, Pendiente, Atendido, No Atendido, Cancelada. |
| **Acciones** | Botones: Ver ficha, Reprogramar, Cancelar, Marcar como atendido (si aplica). |

**Validaciones:**
- No se puede agendar una cita en un horario ya ocupado por el mismo médico.
- El paciente no puede tener dos citas en el mismo día y hora (validar duplicados).
- La fecha de la cita no puede ser anterior a la fecha actual.
- Se debe registrar el motivo de cancelación (campo obligatorio).

**Normativa aplicable:**
- **Ley N° 29414, Ley que establece los Derechos de las Personas Usuarias de los Servicios de Salud**: Garantiza el derecho a una atención oportuna, lo que implica una correcta gestión de citas.

---

### MÓDULO 5: DASHBOARD DEL RECEPCIONISTA (Pantalla de Inicio)

**Ubicación:** Pantalla principal al iniciar sesión.

**Descripción:** Resumen visual del estado de la admisión y las citas del día.

**Elementos del dashboard:**

| Elemento | Descripción |
|----------|-------------|
| **Tarjeta "Citas de Hoy"** | Número total de citas programadas para el día. |
| **Tarjeta "Pacientes Atendidos"** | Número de pacientes que ya fueron atendidos (marcados como "Atendido"). |
| **Tarjeta "Pacientes en Espera"** | Número de pacientes que han llegado y están esperando ser llamados. |
| **Tarjeta "Nuevos Registros"** | Número de pacientes nuevos registrados en el día. |
| **Lista de Próximas Citas** | Tabla con las próximas 5 citas del día (Hora, Paciente, Médico). |
| **Alertas** | Notificaciones visuales: citas pendientes de confirmación, pacientes en espera prolongada, etc. |
| **Acceso Rápido** | Botones directos a: "Nuevo Paciente", "Agendar Cita", "Buscar Paciente". |

---

### MÓDULO 6: HOJA DE AUTORIZACIÓN DE INGRESO (Para Hospitalización)

**Ubicación:** Accesible desde la ficha del paciente o desde el módulo de hospitalización.

**Descripción:** Documento por el cual el paciente o su representante autorizan la hospitalización y los procedimientos necesarios.

**Campos del formulario:**

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| **Paciente** | Auto-completado | Sí | Buscar por DNI o nombre. |
| **Representante** | Input texto | Condicional | Si el paciente es menor de edad o no puede firmar. |
| **DNI del Representante** | Input numérico | Condicional | - |
| **Motivo de Hospitalización** | Textarea | Sí | Diagnóstico o motivo que justifica la hospitalización. |
| **Fecha de Ingreso** | Date picker | Sí | Fecha y hora de ingreso. |
| **Servicio** | Select | Sí | Opciones: Medicina, Cirugía, Pediatría, etc. |
| **Número de Cama** | Select o Input | Sí | Asignación de cama. |

**Acciones y botones:**

| Botón | Acción |
|-------|--------|
| **"Generar Autorización"** | Crea el documento y lo asocia a la historia clínica. |
| **"Firmar"** | Registra la firma del paciente o representante (digital o física escaneada). |
| **"Imprimir"** | Genera copia física del documento. |

**Normativa aplicable:**
- **Hoja de Autorización de Ingreso**: Documento requerido por la normativa de historias clínicas.

---

### MÓDULO 7: VERIFICACIÓN DE COBERTURA (SIS, EsSalud, EPS)

**Ubicación:** Dentro de la ficha del paciente o en un módulo específico de verificación.

**Descripción:** Permite validar la afiliación del paciente a una aseguradora (SIS, EsSalud, EPS, etc.) para gestionar la facturación y cobertura.

**Campos del formulario:**

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| **Aseguradora** | Select | Sí | Opciones: SIS, EsSalud, EPS, Particular, Otro. |
| **Número de Afiliación** | Input texto | Condicional | Número de afiliado según la aseguradora. |
| **Fecha de Vigencia** | Date picker | Condicional | Fecha de inicio y fin de la cobertura. |
| **Tipo de Plan** | Select | Condicional | Según la aseguradora. |

**Acciones y botones:**

| Botón | Acción |
|-------|--------|
| **"Verificar"** | Consulta el estado de afiliación (integración con API de la aseguradora, si está disponible). |
| **"Guardar"** | Registra la información de cobertura en el perfil del paciente. |

**Normativa aplicable:**
- **Ley N° 26842, Ley General de Salud**: Regula la atención en salud y los mecanismos de financiamiento.

---

## REGLAS DE ORO PARA EL FRONTEND DEL RECEPCIONISTA (Basadas en NTS N°139)

1. **El DNI es la llave maestra**: Todo paciente debe ser identificado únicamente por su DNI. Este será el identificador para la interoperabilidad con el RENHICE.

2. **Consentimiento informado obligatorio**: No se puede iniciar una atención sin haber registrado el consentimiento informado del paciente (excepto en emergencias).

3. **Trazabilidad total**: Cada acción del recepcionista (búsqueda, registro, agendamiento, cancelación) debe quedar registrada en un log de auditoría inalterable, con fecha, hora y usuario.

4. **Confidencialidad**: El recepcionista solo debe ver datos administrativos del paciente, no clínicos. El sistema debe aplicar Control de Acceso Basado en Roles (RBAC).

5. **Conservación de datos**: Los registros de admisión y citas deben conservarse por un período mínimo de 20 años.

---

## FLUJO COMPLETO DEL RECEPCIONISTA (Resumen)

```
1. INICIO → Dashboard con resumen del día.

2. BÚSQUEDA DE PACIENTE
   ├─ ¿Existe? → Sí → Abrir Ficha Resumen.
   └─ ¿Existe? → No → Botón "Nuevo Paciente" → Formulario de Registro.

3. REGISTRO DE PACIENTE
   ├─ Completar datos obligatorios (DNI, Nombres, Fecha Nac., Sexo, Teléfono).
   ├─ Botón "Guardar" → Crear paciente.
   └─ Botón "Guardar y Solicitar Consentimiento" → Crear paciente + Abrir Consentimiento.

4. CONSENTIMIENTO INFORMADO
   ├─ Leer texto, marcar checkbox.
   ├─ Firmar (digital o física).
   └─ Botón "Aceptar y Firmar" → Guardar en HCE.

5. GESTIÓN DE CITAS
   ├─ Buscar paciente (si no está en la ficha).
   ├─ Seleccionar médico, especialidad, fecha, hora.
   └─ Botón "Agendar Cita" → Crear cita.

6. VERIFICACIÓN DE COBERTURA (opcional)
   ├─ Seleccionar aseguradora.
   ├─ Ingresar número de afiliación.
   └─ Botón "Verificar" → Validar cobertura.

7. HOJA DE AUTORIZACIÓN DE INGRESO (si aplica)
   ├─ Completar datos de hospitalización.
   ├─ Firmar.
   └─ Botón "Generar Autorización" → Asociar a HCE.
```

---

Con esta especificación tienes todos los campos, botones, validaciones y flujos necesarios para construir el frontend del rol de Recepcionista/Admisión, cumpliendo con la normativa peruana.
