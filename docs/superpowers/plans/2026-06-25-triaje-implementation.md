# Rol Enfermería / Triaje — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el rol de Enfermería/Triaje del SIHCE en 3 rutas (`/triaje`, `/triaje/paciente/[id]`, `/triaje/observacion`) con 19 archivos nuevos, sin modificar ningún archivo existente del rol de Recepcionista.

**Architecture:** Rol completamente independiente. `app/triaje/layout.tsx` envuelve con `TriajeNavbar` y fondo `#f0f0f5`. La página de triaje `/triaje/paciente/[id]` es un Server Component que pasa el paciente a `VitalSignsForm` (Client Component). El estado se gestiona localmente con `useState` + datos mock. La lógica de alertas de signos vitales vive en `lib/vitals.ts`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Recharts (`'use client'` obligatorio), lucide-react, HTML5 Canvas API para firma digital, `ModalBase`/`useToast`/`lib/format.ts` del proyecto existente.

---

### Task 1: Tipos y lógica de signos vitales

**Files:**
- Create: `lib/vitals.ts`

- [ ] **Step 1: Crear `lib/vitals.ts`**

```typescript
// lib/vitals.ts

export type Prioridad = 'I-ROJO' | 'II-NARANJA' | 'III-AMARILLO' | 'IV-VERDE' | 'V-AZUL';
export type Destino   = 'Reanimación/UCI' | 'Emergencias' | 'Consultorio prioritario' | 'Consultorio normal' | 'Consulta externa';
export type NivelConciencia = 'Alerta' | 'Verbal' | 'Dolor' | 'Inconsciente';
export type AlertLevel = 'normal' | 'warning' | 'critical';

export interface PacienteEspera {
  id: string;
  ticket: string;
  nombre: string;
  dni: string;
  fechaNac: string;     // ISO YYYY-MM-DD
  horaLlegada: string;  // "08:45"
  motivo: string;
}

export interface SignosVitales {
  pasSistolica: number;
  pasDiastolica: number;
  frecCardiaca: number;
  frecRespiratoria: number;
  temperatura: number;
  spo2: number;
  peso: number;
  talla: number;
  imc?: number;
}

export interface RegistroTriaje {
  pacienteId: string;
  signos: SignosVitales;
  motivoConsulta: string;
  nivelConciencia: NivelConciencia;
  dolor: number;
  prioridad: Prioridad;
  destino: Destino;
  justificacion: string;
  enfermera: string;
  timestamp: string;
}

export interface PacienteClasificado {
  id: string;
  ticket: string;
  nombre: string;
  prioridad: Prioridad;
  destino: Destino;
  horaClasificado: Date;
  estado: string;
}

export interface Medicamento {
  nombre: string;
  dosis: string;
  via: string;
  hora: string;
}

export interface EntradaKardex {
  id: string;
  pacienteId: string;
  fechaHora: string;
  signos?: Partial<SignosVitales>;
  ingresosHidricos: number;
  egresosHidricos: number;
  medicamentos: Medicamento[];
  evolucion: string;
  firmado: boolean;
  firmadoPor?: string;
  firmaCanvas?: string;
}

export interface PacienteObservacion {
  id: string;
  nombre: string;
  horaIngreso: Date;
  prioridad: Prioridad;
  motivo: string;
  kardex: EntradaKardex[];
}

export const PRIORIDAD_CONFIG: Record<Prioridad, {
  label: string;
  color: string;
  bg: string;
  border: string;
  maxMinutes: number;
  destino: Destino;
}> = {
  'I-ROJO':       { label: 'I — Resucitación',  color: 'text-white',    bg: 'bg-red-600',    border: 'border-red-700',    maxMinutes: 0,   destino: 'Reanimación/UCI'         },
  'II-NARANJA':   { label: 'II — Emergencia',    color: 'text-white',    bg: 'bg-orange-500', border: 'border-orange-600', maxMinutes: 15,  destino: 'Emergencias'             },
  'III-AMARILLO': { label: 'III — Urgente',       color: 'text-gray-900', bg: 'bg-yellow-400', border: 'border-yellow-500', maxMinutes: 60,  destino: 'Consultorio prioritario' },
  'IV-VERDE':     { label: 'IV — Menos Urgente', color: 'text-white',    bg: 'bg-green-500',  border: 'border-green-600',  maxMinutes: 120, destino: 'Consultorio normal'      },
  'V-AZUL':       { label: 'V — No Urgente',     color: 'text-white',    bg: 'bg-blue-500',   border: 'border-blue-600',   maxMinutes: 240, destino: 'Consulta externa'        },
};

export function calcIMC(peso: number, talla: number): number {
  const tallaMts = talla / 100;
  return Math.round((peso / (tallaMts * tallaMts)) * 10) / 10;
}

export function alertaSpo2(spo2: number): AlertLevel {
  if (spo2 < 90) return 'critical';
  if (spo2 < 95) return 'warning';
  return 'normal';
}

export function alertaFC(fc: number): AlertLevel {
  if (fc > 120 || fc < 50) return 'critical';
  if (fc > 100 || fc < 60) return 'warning';
  return 'normal';
}

export function alertaTemp(temp: number): AlertLevel {
  if (temp > 39)   return 'critical';
  if (temp > 38)   return 'warning';
  return 'normal';
}

export function alertaPAS(pas: number): AlertLevel {
  if (pas > 180 || pas < 80) return 'critical';
  if (pas > 140 || pas < 90) return 'warning';
  return 'normal';
}

export function alertaPAD(pad: number): AlertLevel {
  if (pad > 110 || pad < 50) return 'critical';
  if (pad > 90  || pad < 60) return 'warning';
  return 'normal';
}

export function alertaFR(fr: number): AlertLevel {
  if (fr > 30 || fr < 8)  return 'critical';
  if (fr > 20 || fr < 12) return 'warning';
  return 'normal';
}

export function destinoPorPrioridad(p: Prioridad): Destino {
  return PRIORIDAD_CONFIG[p].destino;
}

export function formatoFechaHoraPeru(date: Date): string {
  const d   = date.getDate().toString().padStart(2, '0');
  const m   = (date.getMonth() + 1).toString().padStart(2, '0');
  const y   = date.getFullYear();
  const h   = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${d}/${m}/${y} — ${h}:${min}`;
}

export function elapsedHHMM(from: Date): string {
  const diff = Math.floor((Date.now() - from.getTime()) / 60000);
  const h    = Math.floor(diff / 60).toString().padStart(2, '0');
  const min  = (diff % 60).toString().padStart(2, '0');
  return `${h}:${min}`;
}

export function isOverTime(prioridad: Prioridad, from: Date): boolean {
  const diffMin = (Date.now() - from.getTime()) / 60000;
  const max     = PRIORIDAD_CONFIG[prioridad].maxMinutes;
  return max === 0 ? diffMin > 2 : diffMin > max;
}
```

- [ ] **Step 2: Verificar compilación**

```bash
cd "C:\Users\panc1\OneDrive\Documentos\SOA-CLINICA\clinica-app" && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add lib/vitals.ts
git commit -m "feat(triaje): agregar tipos y lógica de signos vitales"
```

---

### Task 2: TriajeNavbar

**Files:**
- Create: `components/TriajeNavbar.tsx`

- [ ] **Step 1: Crear `components/TriajeNavbar.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDown, LogOut, User, Bell } from 'lucide-react';

const NAV = [
  { label: 'Dashboard',   href: '/triaje' },
  { label: 'Observación', href: '/triaje/observacion' },
];

interface TriajeNavbarProps {
  pendingKardex?: number;
}

export default function TriajeNavbar({ pendingKardex = 0 }: TriajeNavbarProps) {
  const pathname = usePathname();
  const [userMenu, setUserMenu] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-40">

      {/* Logo */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path d="M12 2L9.5 8.5H3L8.5 12.5L6.5 19L12 15L17.5 19L15.5 12.5L21 8.5H14.5L12 2Z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">SIHCE</p>
          <p className="text-[10px] text-gray-400 leading-tight">Enfermería</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-0.5">
        {NAV.map(({ label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                active ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right: clock + bell + avatar */}
      <div className="flex items-center gap-3 min-w-[260px] justify-end">

        {/* Reloj digital */}
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-gray-800 leading-tight tabular-nums">{timeStr}</p>
          <p className="text-[10px] text-gray-400 leading-tight capitalize">{dateStr}</p>
        </div>

        {/* Badge kardex pendientes */}
        {pendingKardex > 0 && (
          <div className="relative">
            <Bell size={18} className="text-gray-400" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {pendingKardex}
            </span>
          </div>
        )}

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenu((v) => !v)}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">AR</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-700 leading-tight">Ana Ríos</p>
              <p className="text-[10px] text-gray-400 leading-tight">Enfermera</p>
            </div>
            <ChevronDown size={12} className="text-gray-400 hidden md:block" />
          </button>

          {userMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-40 overflow-hidden">
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <User size={14} className="text-gray-400" /> Mi Perfil
                </button>
                <div className="border-t border-gray-100" />
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={14} /> Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TriajeNavbar.tsx
git commit -m "feat(triaje): agregar TriajeNavbar con reloj digital en tiempo real"
```

---

### Task 3: Layout de Triaje

**Files:**
- Create: `app/triaje/layout.tsx`

- [ ] **Step 1: Crear `app/triaje/layout.tsx`**

```tsx
import TriajeNavbar from '@/components/TriajeNavbar';

export default function TriajeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f0f5]">
      <TriajeNavbar />
      <main className="px-6 py-6 max-w-[1400px] mx-auto">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/triaje/layout.tsx
git commit -m "feat(triaje): agregar layout con TriajeNavbar y fondo"
```

---

### Task 4: KpiCards

**Files:**
- Create: `components/triaje/KpiCards.tsx`

- [ ] **Step 1: Crear `components/triaje/KpiCards.tsx`**

```tsx
import { Clock, AlertCircle, AlertTriangle, Timer } from 'lucide-react';

interface Props {
  enEspera: number;
  rojo: number;
  naranja: number;
  tiempoPromedio: number;
}

export default function KpiCards({ enEspera, rojo, naranja, tiempoPromedio }: Props) {
  const cards = [
    { label: 'En Espera',           value: enEspera,       sub: 'Sin clasificar',      icon: <Clock size={18} />,         bg: 'bg-yellow-50 border-yellow-100', color: 'text-yellow-600', iconBg: 'bg-yellow-100 text-yellow-600' },
    { label: 'Prioridad Roja',      value: rojo,           sub: 'Críticos activos',    icon: <AlertCircle size={18} />,   bg: 'bg-red-50 border-red-100',       color: 'text-red-600',    iconBg: 'bg-red-100 text-red-600'       },
    { label: 'Prioridad Naranja',   value: naranja,        sub: 'Urgentes activos',    icon: <AlertTriangle size={18} />, bg: 'bg-orange-50 border-orange-100', color: 'text-orange-500', iconBg: 'bg-orange-100 text-orange-500' },
    { label: 'Tiempo Prom. Triaje', value: tiempoPromedio, sub: 'minutos por paciente',icon: <Timer size={18} />,         bg: 'bg-blue-50 border-blue-100',     color: 'text-blue-600',   iconBg: 'bg-blue-100 text-blue-600'     },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-2xl border px-5 py-4 ${c.bg}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">{c.label}</p>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.iconBg}`}>{c.icon}</div>
          </div>
          <p className={`text-4xl font-black ${c.color}`}>{c.value}</p>
          <p className="text-[11px] text-gray-400 mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/triaje/KpiCards.tsx
git commit -m "feat(triaje): agregar KpiCards con 4 indicadores"
```

---

### Task 5: Gráficas del Dashboard (5 componentes)

**Files:**
- Create: `components/triaje/charts/PriorityDonut.tsx`
- Create: `components/triaje/charts/HourlyArrivalsChart.tsx`
- Create: `components/triaje/charts/TriageTimeChart.tsx`
- Create: `components/triaje/charts/SpO2Gauge.tsx`
- Create: `components/triaje/charts/TopMotivoChart.tsx`

- [ ] **Step 1: Crear `components/triaje/charts/PriorityDonut.tsx`**

```tsx
'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DATA = [
  { name: 'Rojo',     value: 3,  color: '#dc2626' },
  { name: 'Naranja',  value: 7,  color: '#f97316' },
  { name: 'Amarillo', value: 12, color: '#facc15' },
  { name: 'Verde',    value: 18, color: '#22c55e' },
  { name: 'Azul',     value: 8,  color: '#3b82f6' },
];

export default function PriorityDonut() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Distribución de Prioridades</h2>
        <span className="text-xs text-gray-400">Hoy</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
            {DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }}
            formatter={(v: number, name: string) => [`${v} pacientes`, name]}
          />
          <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '11px', color: '#6b7280' }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Crear `components/triaje/charts/HourlyArrivalsChart.tsx`**

```tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DATA = [
  { hora: '8am',  pacientes: 6  },
  { hora: '9am',  pacientes: 12 },
  { hora: '10am', pacientes: 18 },
  { hora: '11am', pacientes: 14 },
  { hora: '12pm', pacientes: 9  },
  { hora: '1pm',  pacientes: 5  },
  { hora: '2pm',  pacientes: 8  },
  { hora: '3pm',  pacientes: 11 },
  { hora: '4pm',  pacientes: 7  },
  { hora: '5pm',  pacientes: 4  },
];

const HatchBar = (props: any) => {
  const { x, y, width, height, index } = props;
  const pid = `hatch-arr-${index}`;
  return (
    <g>
      <defs>
        <pattern id={pid} patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45 0 0)">
          <rect width="6" height="10" fill="#93c5fd" />
          <rect x="6" width="4" height="10" fill="#bfdbfe" />
        </pattern>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill={`url(#${pid})`} rx={4} />
    </g>
  );
};

export default function HourlyArrivalsChart() {
  const peak = DATA.reduce((a, b) => b.pacientes > a.pacientes ? b : a, DATA[0]);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-800">Llegadas por Hora</h2>
        <span className="text-xs text-gray-400">Pico: <strong className="text-blue-600">{peak.hora}</strong></span>
      </div>
      <p className="text-xs text-gray-400 mb-4">Flujo de pacientes a triaje</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={DATA} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} formatter={(v: number) => [`${v} pacientes`, 'Llegadas']} />
          <Bar dataKey="pacientes" shape={<HatchBar />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Crear `components/triaje/charts/TriageTimeChart.tsx`**

```tsx
'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DATA = [
  { hora: '8am',  minutos: 4.2 },
  { hora: '9am',  minutos: 6.1 },
  { hora: '10am', minutos: 8.5 },
  { hora: '11am', minutos: 7.3 },
  { hora: '12pm', minutos: 5.8 },
  { hora: '1pm',  minutos: 4.5 },
  { hora: '2pm',  minutos: 5.2 },
  { hora: '3pm',  minutos: 7.8 },
  { hora: '4pm',  minutos: 6.4 },
  { hora: '5pm',  minutos: 3.9 },
];

export default function TriageTimeChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-800">Tiempo Promedio de Triaje</h2>
        <span className="text-xs text-gray-400">Meta: &lt; 7 min</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">Minutos por paciente / hora</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={DATA}>
          <defs>
            <linearGradient id="triageGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} unit="m" />
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} formatter={(v: number) => [`${v} min`, 'Tiempo prom.']} />
          <Area type="monotone" dataKey="minutos" stroke="#3b82f6" strokeWidth={2} fill="url(#triageGrad)" dot={{ fill: '#3b82f6', r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 4: Crear `components/triaje/charts/SpO2Gauge.tsx`**

```tsx
'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

function getColor(spo2: number) {
  if (spo2 < 90) return '#dc2626';
  if (spo2 < 95) return '#f59e0b';
  return '#22c55e';
}

function getLabel(spo2: number) {
  if (spo2 < 90) return { text: 'Crítico',  color: 'text-red-600'    };
  if (spo2 < 95) return { text: 'Bajo',     color: 'text-yellow-500' };
  return               { text: 'Normal',   color: 'text-green-600'   };
}

export default function SpO2Gauge({ spo2 = 96.4 }: { spo2?: number }) {
  const color             = getColor(spo2);
  const { text, color: labelColor } = getLabel(spo2);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-800">SpO₂ Promedio</h2>
        <span className="text-xs text-gray-400">Pacientes activos</span>
      </div>
      <div className="relative flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={180}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={210} endAngle={-30} data={[{ name: 'SpO₂', value: spo2, fill: color }]} barSize={14}>
            <RadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={8} max={100} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-3xl font-black text-gray-800">{spo2}%</p>
          <p className={`text-xs font-semibold ${labelColor}`}>{text}</p>
          <p className="text-[10px] text-gray-400">Saturación O₂</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Crear `components/triaje/charts/TopMotivoChart.tsx`**

```tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DATA = [
  { motivo: 'Dolor abdominal',   count: 14, color: '#3b82f6' },
  { motivo: 'Dif. respiratoria', count: 11, color: '#6366f1' },
  { motivo: 'Cefalea intensa',   count: 9,  color: '#8b5cf6' },
  { motivo: 'Dolor torácico',    count: 7,  color: '#a78bfa' },
  { motivo: 'Fiebre alta',       count: 7,  color: '#c4b5fd' },
];

export default function TopMotivoChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Top Motivos de Consulta</h2>
        <span className="text-xs text-gray-400">Hoy</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={DATA} layout="vertical" barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis dataKey="motivo" type="category" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={115} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} formatter={(v: number) => [`${v} casos`, 'Pacientes']} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {DATA.map((_, i) => <Cell key={i} fill={DATA[i].color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/triaje/charts/
git commit -m "feat(triaje): agregar 5 gráficas del dashboard (donut, arrivals, time, SpO2, motivos)"
```

---

### Task 6: ColaTriaje y ClasificadosTable

**Files:**
- Create: `components/triaje/ColaTriaje.tsx`
- Create: `components/triaje/ClasificadosTable.tsx`

- [ ] **Step 1: Crear `components/triaje/ColaTriaje.tsx`**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { PacienteEspera } from '@/lib/vitals';
import { calcAge } from '@/lib/format';

interface Props {
  pacientes: PacienteEspera[];
}

export default function ColaTriaje({ pacientes }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-800">Cola de Triaje</h2>
        </div>
        <span className="text-xs text-gray-400">{pacientes.length} esperando</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50/50">
          <tr>
            {['Ticket', 'Paciente', 'Edad', 'Llegó', 'Motivo', 'Acción'].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {pacientes.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No hay pacientes en espera.</td>
            </tr>
          )}
          {pacientes.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p.ticket}</span>
              </td>
              <td className="px-5 py-3 font-medium text-gray-800">{p.nombre}</td>
              <td className="px-5 py-3 text-gray-500 text-xs">{calcAge(p.fechaNac)} años</td>
              <td className="px-5 py-3 text-gray-500">{p.horaLlegada}</td>
              <td className="px-5 py-3 text-gray-500 text-xs max-w-[200px] truncate">{p.motivo}</td>
              <td className="px-5 py-3">
                <button
                  onClick={() => router.push(`/triaje/paciente/${p.id}`)}
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <ArrowRight size={12} /> Iniciar Triaje
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Crear `components/triaje/ClasificadosTable.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Eye, CheckCircle2 } from 'lucide-react';
import { PacienteClasificado, PRIORIDAD_CONFIG, elapsedHHMM, isOverTime } from '@/lib/vitals';

interface Props {
  pacientes: PacienteClasificado[];
}

export default function ClasificadosTable({ pacientes }: Props) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-500" />
          <h2 className="text-sm font-semibold text-gray-800">Clasificados — Esperando Médico</h2>
        </div>
        <span className="text-xs text-gray-400">{pacientes.length} pacientes</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50/50">
          <tr>
            {['Ticket', 'Paciente', 'Prioridad', 'Destino', 'Tiempo en Espera', 'Acción'].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {pacientes.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No hay pacientes clasificados aún.</td>
            </tr>
          )}
          {pacientes.map((p) => {
            const cfg  = PRIORIDAD_CONFIG[p.prioridad];
            const over = isOverTime(p.prioridad, p.horaClasificado);
            return (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p.ticket}</span>
                </td>
                <td className="px-5 py-3 font-medium text-gray-800">{p.nombre}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                    {cfg.label}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">{p.destino}</td>
                <td className="px-5 py-3">
                  <span className={`font-mono text-sm font-bold tabular-nums ${over ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                    {elapsedHHMM(p.horaClasificado)}
                  </span>
                  {over && <span className="ml-1 text-[10px] text-red-500 font-semibold">⚠ Excedido</span>}
                </td>
                <td className="px-5 py-3">
                  <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <Eye size={12} /> Ver Ficha
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/triaje/ColaTriaje.tsx components/triaje/ClasificadosTable.tsx
git commit -m "feat(triaje): agregar tablas de cola y clasificados"
```

---

### Task 7: Dashboard `/triaje`

**Files:**
- Create: `app/triaje/page.tsx`

- [ ] **Step 1: Crear `app/triaje/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import KpiCards          from '@/components/triaje/KpiCards';
import ColaTriaje        from '@/components/triaje/ColaTriaje';
import ClasificadosTable from '@/components/triaje/ClasificadosTable';
import PriorityDonut     from '@/components/triaje/charts/PriorityDonut';
import HourlyArrivalsChart from '@/components/triaje/charts/HourlyArrivalsChart';
import TriageTimeChart   from '@/components/triaje/charts/TriageTimeChart';
import SpO2Gauge         from '@/components/triaje/charts/SpO2Gauge';
import TopMotivoChart    from '@/components/triaje/charts/TopMotivoChart';
import { PacienteEspera, PacienteClasificado } from '@/lib/vitals';

const MOCK_COLA: PacienteEspera[] = [
  { id: '1', ticket: 'T-001', nombre: 'Carlos Rodríguez',   dni: '34567890', fechaNac: '1978-11-08', horaLlegada: '08:05', motivo: 'Dolor abdominal agudo'     },
  { id: '2', ticket: 'T-002', nombre: 'Ana Fernández Díaz', dni: '45678901', fechaNac: '1995-01-30', horaLlegada: '08:42', motivo: 'Dificultad para respirar'  },
  { id: '3', ticket: 'T-003', nombre: 'Pedro Martínez',     dni: '56789012', fechaNac: '1982-06-14', horaLlegada: '09:10', motivo: 'Cefalea intensa'            },
];

const now = new Date();
const MOCK_CLASIFICADOS: PacienteClasificado[] = [
  { id: '4', ticket: 'T-004', nombre: 'Lucía Torres Salas', prioridad: 'II-NARANJA',   destino: 'Emergencias',             horaClasificado: new Date(now.getTime() - 8  * 60000), estado: 'Esperando' },
  { id: '5', ticket: 'T-005', nombre: 'Roberto Saenz',      prioridad: 'III-AMARILLO', destino: 'Consultorio prioritario', horaClasificado: new Date(now.getTime() - 35 * 60000), estado: 'Esperando' },
  { id: '6', ticket: 'T-006', nombre: 'Carmen Villanueva',  prioridad: 'IV-VERDE',     destino: 'Consultorio normal',      horaClasificado: new Date(now.getTime() - 90 * 60000), estado: 'Esperando' },
];

export default function TriajeDashboard() {
  const [cola]         = useState<PacienteEspera[]>(MOCK_COLA);
  const [clasificados] = useState<PacienteClasificado[]>(MOCK_CLASIFICADOS);

  const rojo    = clasificados.filter((p) => p.prioridad === 'I-ROJO').length;
  const naranja = clasificados.filter((p) => p.prioridad === 'II-NARANJA').length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Triaje</h1>
        <p className="text-sm text-gray-400">Gestión de prioridades — Enfermería</p>
      </div>

      <KpiCards enEspera={cola.length} rojo={rojo} naranja={naranja} tiempoPromedio={6} />

      {/* Gráficas fila 1 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
        <PriorityDonut />
        <SpO2Gauge />
        <TopMotivoChart />
      </div>

      {/* Gráficas fila 2 */}
      <div className="grid grid-cols-2 gap-4">
        <HourlyArrivalsChart />
        <TriageTimeChart />
      </div>

      <ColaTriaje pacientes={cola} />
      <ClasificadosTable pacientes={clasificados} />
    </div>
  );
}
```

- [ ] **Step 2: Verificar en `http://localhost:3000/triaje` que carga el dashboard completo**

- [ ] **Step 3: Commit**

```bash
git add app/triaje/page.tsx
git commit -m "feat(triaje): agregar dashboard principal con KPIs y 5 gráficas"
```

---

### Task 8: PriorityModal y VitalSignsForm

**Files:**
- Create: `components/triaje/PriorityModal.tsx`
- Create: `components/triaje/VitalSignsForm.tsx`

- [ ] **Step 1: Crear `components/triaje/PriorityModal.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import { useToast } from '@/context/ToastContext';
import { Prioridad, SignosVitales, PRIORIDAD_CONFIG, destinoPorPrioridad } from '@/lib/vitals';

interface Props {
  pacienteNombre: string;
  pacienteId: string;
  signos: SignosVitales;
  onClose: () => void;
}

const PRIORIDADES: Prioridad[] = ['I-ROJO', 'II-NARANJA', 'III-AMARILLO', 'IV-VERDE', 'V-AZUL'];

export default function PriorityModal({ pacienteNombre, pacienteId, signos, onClose }: Props) {
  const router = useRouter();
  const { success } = useToast();
  const [selected, setSelected]         = useState<Prioridad | null>(null);
  const [justificacion, setJustificacion] = useState('');
  const [loading, setLoading]           = useState(false);

  const hipoxemia     = signos.spo2 < 90;
  const sugerirNaranja = signos.pasSistolica > 180;

  const isBlocked = (p: Prioridad) => hipoxemia && (p === 'IV-VERDE' || p === 'V-AZUL');
  const canSubmit  = selected !== null && justificacion.trim().length >= 10 && !loading;

  async function handleSubmit() {
    if (!selected) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const destino = destinoPorPrioridad(selected);
    success(`${pacienteNombre} clasificado/a: ${PRIORIDAD_CONFIG[selected].label}. Destino: ${destino}`);
    router.push('/triaje');
  }

  return (
    <ModalBase title="Clasificación de Prioridad — N.T.S. 042-MINSA" onClose={onClose} width="max-w-4xl">
      <div className="p-6 space-y-6">
        <p className="text-sm text-gray-500">Paciente: <strong className="text-gray-900">{pacienteNombre}</strong></p>

        {/* Alerta hipoxemia */}
        {hipoxemia && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
            <p className="text-sm text-red-700 font-medium">
              ¡Hipoxemia detectada! SpO₂ = <strong>{signos.spo2}%</strong> — Prioridad mínima permitida: <strong>III — Urgente (Amarilla)</strong>
            </p>
          </div>
        )}

        {/* 5 botones */}
        <div className="grid grid-cols-5 gap-3 mt-2">
          {PRIORIDADES.map((p) => {
            const cfg      = PRIORIDAD_CONFIG[p];
            const blocked  = isBlocked(p);
            const isActive = selected === p;
            return (
              <div key={p} className="relative">
                {p === 'II-NARANJA' && sugerirNaranja && (
                  <div className="absolute -top-5 left-0 right-0 text-center">
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">⚠ Sugerido</span>
                  </div>
                )}
                <button
                  onClick={() => { if (!blocked) setSelected(p); }}
                  disabled={blocked}
                  className={`w-full py-5 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                    ${cfg.bg} ${cfg.border} ${cfg.color}
                    ${blocked  ? 'opacity-40 cursor-not-allowed'             : 'hover:scale-105 hover:shadow-md cursor-pointer'}
                    ${isActive ? 'ring-4 ring-offset-2 ring-gray-800 scale-105 shadow-lg' : ''}
                  `}
                >
                  <span className="text-xs font-black text-center leading-tight">{cfg.label}</span>
                  <span className="text-[10px] opacity-80 text-center">
                    {cfg.maxMinutes === 0 ? 'Inmediato' : `< ${cfg.maxMinutes} min`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Justificación */}
        {selected && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              Justificación clínica <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(mín. 10 caracteres)</span>
            </label>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={3}
              placeholder="Ej: Taquicardia 125 lpm + SpO₂ 92% + dificultad respiratoria marcada..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{justificacion.trim().length} / 10 mín.</p>
          </div>
        )}

        {/* Destino auto */}
        {selected && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-xs text-gray-500">Destino sugerido:</span>
            <span className="text-sm font-semibold text-gray-800">{destinoPorPrioridad(selected)}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            canSubmit ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> Asignando…</> : 'Asignar Prioridad y Enviar'}
        </button>
      </div>
    </ModalBase>
  );
}
```

- [ ] **Step 2: Crear `components/triaje/VitalSignsForm.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { AlertTriangle, Calculator, Save } from 'lucide-react';
import PriorityModal from './PriorityModal';
import { useToast } from '@/context/ToastContext';
import {
  PacienteEspera, SignosVitales, AlertLevel,
  alertaSpo2, alertaFC, alertaTemp, alertaPAS, alertaPAD, alertaFR,
  calcIMC, formatoFechaHoraPeru,
} from '@/lib/vitals';
import { calcAge } from '@/lib/format';

type Fields = keyof Omit<SignosVitales, 'imc'>;

const ALERT_BORDER: Record<AlertLevel, string> = {
  normal:   'border-gray-200',
  warning:  'border-yellow-400 bg-yellow-50',
  critical: 'border-red-400 bg-red-50',
};

interface Props { paciente: PacienteEspera; }

export default function VitalSignsForm({ paciente }: Props) {
  const { error: toastError, warning: toastWarning } = useToast();
  const [signos, setSignos]             = useState<Partial<SignosVitales>>({});
  const [alerts, setAlerts]             = useState<Partial<Record<Fields, AlertLevel>>>({});
  const [imc, setImc]                   = useState<number | null>(null);
  const [motivo, setMotivo]             = useState('');
  const [nivelConciencia, setNivel]     = useState('Alerta');
  const [dolor, setDolor]               = useState(0);
  const [showPriority, setShowPriority] = useState(false);

  function getAlert(field: Fields, v: number): AlertLevel {
    switch (field) {
      case 'spo2':             return alertaSpo2(v);
      case 'frecCardiaca':     return alertaFC(v);
      case 'temperatura':      return alertaTemp(v);
      case 'pasSistolica':     return alertaPAS(v);
      case 'pasDiastolica':    return alertaPAD(v);
      case 'frecRespiratoria': return alertaFR(v);
      default: return 'normal';
    }
  }

  function handleBlur(field: Fields, raw: string) {
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const level = getAlert(field, num);
    setAlerts((p) => ({ ...p, [field]: level }));
    if (field === 'spo2' && num < 90) toastError('¡Hipoxemia crítica! SpO₂ < 90% — Asigne mínimo prioridad Amarilla.');
    else if (level === 'critical')    toastWarning(`Valor crítico detectado en ${field}: ${num}`);
  }

  function handleChange(field: Fields, raw: string) {
    const num = parseFloat(raw);
    setSignos((p) => ({ ...p, [field]: isNaN(num) ? undefined : num }));
  }

  function handleGuardar() {
    if (!motivo.trim()) { toastError('El motivo de consulta es obligatorio.'); return; }
    const required: Fields[] = ['pasSistolica', 'pasDiastolica', 'frecCardiaca', 'frecRespiratoria', 'temperatura', 'spo2', 'peso', 'talla'];
    if (required.some((f) => signos[f] === undefined)) { toastError('Completa todos los signos vitales.'); return; }
    setShowPriority(true);
  }

  const completeSignos: SignosVitales = {
    pasSistolica:     signos.pasSistolica     ?? 0,
    pasDiastolica:    signos.pasDiastolica    ?? 0,
    frecCardiaca:     signos.frecCardiaca     ?? 0,
    frecRespiratoria: signos.frecRespiratoria ?? 0,
    temperatura:      signos.temperatura      ?? 0,
    spo2:             signos.spo2             ?? 0,
    peso:             signos.peso             ?? 0,
    talla:            signos.talla            ?? 0,
    imc:              imc ?? undefined,
  };

  const FIELDS: { field: Fields; label: string; unit: string; step: string; placeholder: string }[] = [
    { field: 'pasSistolica',      label: 'P.A. Sistólica',      unit: 'mmHg', step: '1',   placeholder: '120'  },
    { field: 'pasDiastolica',     label: 'P.A. Diastólica',     unit: 'mmHg', step: '1',   placeholder: '80'   },
    { field: 'frecCardiaca',      label: 'Frec. Cardíaca',      unit: 'lpm',  step: '1',   placeholder: '72'   },
    { field: 'frecRespiratoria',  label: 'Frec. Respiratoria',  unit: 'rpm',  step: '1',   placeholder: '16'   },
    { field: 'temperatura',       label: 'Temperatura',          unit: '°C',   step: '0.1', placeholder: '36.5' },
    { field: 'spo2',              label: 'Saturación O₂ (SpO₂)', unit: '%',   step: '1',   placeholder: '98'   },
    { field: 'peso',              label: 'Peso',                 unit: 'kg',   step: '0.1', placeholder: '70'   },
    { field: 'talla',             label: 'Talla',                unit: 'cm',   step: '0.1', placeholder: '170'  },
  ];

  return (
    <>
      <div className="space-y-4">

        {/* Header paciente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{paciente.nombre.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{paciente.nombre}</h1>
            <div className="flex items-center gap-4 mt-0.5">
              <span className="text-xs text-gray-500">DNI: <strong>{paciente.dni}</strong></span>
              <span className="text-xs text-gray-500">Edad: <strong>{calcAge(paciente.fechaNac)} años</strong></span>
              <span className="text-xs text-gray-500">Llegó: <strong>{paciente.horaLlegada}</strong></span>
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{paciente.ticket}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Motivo referido: {paciente.motivo}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-400">Inicio triaje</p>
            <p className="text-xs font-semibold text-gray-700">{formatoFechaHoraPeru(new Date())}</p>
          </div>
        </div>

        {/* Signos vitales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Signos Vitales</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {FIELDS.map(({ field, label, unit, step, placeholder }) => {
              const level = alerts[field] ?? 'normal';
              return (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                    {label} <span className="text-gray-300">({unit})</span>
                    {level === 'critical' && <AlertTriangle size={11} className="inline ml-1 text-red-500" />}
                    {level === 'warning'  && <AlertTriangle size={11} className="inline ml-1 text-yellow-500" />}
                  </label>
                  <input
                    type="number"
                    step={step}
                    placeholder={placeholder}
                    onChange={(e) => handleChange(field, e.target.value)}
                    onBlur={(e) => handleBlur(field, e.target.value)}
                    className={`w-full border-2 rounded-xl px-4 py-3 text-2xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${ALERT_BORDER[level]}`}
                  />
                  {level !== 'normal' && (
                    <span className={`text-[10px] font-semibold mt-0.5 block ${level === 'critical' ? 'text-red-500' : 'text-yellow-600'}`}>
                      {level === 'critical' ? 'CRÍTICO' : 'Fuera de rango'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* IMC */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => { if (signos.peso && signos.talla) setImc(calcIMC(signos.peso, signos.talla)); }}
              disabled={!signos.peso || !signos.talla}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Calculator size={14} /> Calcular IMC
            </button>
            {imc !== null && (
              <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-2 rounded-xl">IMC: {imc} kg/m²</span>
            )}
          </div>
        </div>

        {/* Evaluación clínica */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">Evaluación Clínica</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Motivo de Consulta / Síntoma Principal <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Describa el síntoma principal del paciente..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nivel de Conciencia</label>
              <select
                value={nivelConciencia}
                onChange={(e) => setNivel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Alerta</option>
                <option>Verbal</option>
                <option>Dolor</option>
                <option>Inconsciente</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Escala de Dolor: <strong className="text-gray-800">{dolor}/10</strong>
              </label>
              <input
                type="range" min={0} max={10} value={dolor}
                onChange={(e) => setDolor(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>Sin dolor</span><span>Insoportable</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleGuardar}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-2xl hover:bg-blue-700 transition-colors text-sm"
        >
          <Save size={16} /> Guardar Signos Vitales y Clasificar
        </button>
      </div>

      {showPriority && (
        <PriorityModal
          pacienteNombre={paciente.nombre}
          pacienteId={paciente.id}
          signos={completeSignos}
          onClose={() => setShowPriority(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/triaje/VitalSignsForm.tsx components/triaje/PriorityModal.tsx
git commit -m "feat(triaje): agregar formulario de signos vitales y modal de prioridad con hard logic"
```

---

### Task 9: Página de triaje individual

**Files:**
- Create: `app/triaje/paciente/[id]/page.tsx`

- [ ] **Step 1: Crear `app/triaje/paciente/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import VitalSignsForm from '@/components/triaje/VitalSignsForm';
import { PacienteEspera } from '@/lib/vitals';

const MOCK_PACIENTES: PacienteEspera[] = [
  { id: '1', ticket: 'T-001', nombre: 'Carlos Rodríguez',   dni: '34567890', fechaNac: '1978-11-08', horaLlegada: '08:05', motivo: 'Dolor abdominal agudo'    },
  { id: '2', ticket: 'T-002', nombre: 'Ana Fernández Díaz', dni: '45678901', fechaNac: '1995-01-30', horaLlegada: '08:42', motivo: 'Dificultad para respirar' },
  { id: '3', ticket: 'T-003', nombre: 'Pedro Martínez',     dni: '56789012', fechaNac: '1982-06-14', horaLlegada: '09:10', motivo: 'Cefalea intensa'           },
];

export default async function TriajePacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paciente = MOCK_PACIENTES.find((p) => p.id === id);
  if (!paciente) notFound();

  return <VitalSignsForm paciente={paciente} />;
}
```

- [ ] **Step 2: Verificar que `http://localhost:3000/triaje/paciente/1` carga el formulario**

- [ ] **Step 3: Commit**

```bash
git add "app/triaje/paciente/[id]/page.tsx"
git commit -m "feat(triaje): agregar página de triaje individual por paciente"
```

---

### Task 10: KardexForm

**Files:**
- Create: `components/triaje/KardexForm.tsx`

- [ ] **Step 1: Crear `components/triaje/KardexForm.tsx`**

```tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import { useToast } from '@/context/ToastContext';
import { Medicamento, formatoFechaHoraPeru } from '@/lib/vitals';

interface Props {
  pacienteNombre: string;
  pacienteId: string;
  onClose: () => void;
  onSaved: (firmado: boolean, canvas?: string) => void;
}

export default function KardexForm({ pacienteNombre, onClose, onSaved }: Props) {
  const { success, error } = useToast();
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const drawing     = useRef(false);
  const [hasSign, setHasSign]     = useState(false);
  const [evolucion, setEvolucion] = useState('');
  const [ingresos, setIngresos]   = useState('');
  const [egresos, setEgresos]     = useState('');
  const [meds, setMeds]           = useState<Medicamento[]>([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  }, []);

  function getPos(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath(); ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y); ctx.stroke();
    setHasSign(true);
  }

  function stopDraw() { drawing.current = false; }

  function clearCanvas() {
    canvasRef.current!.getContext('2d')!.clearRect(0, 0, 500, 110);
    setHasSign(false);
  }

  function addMed() { setMeds((p) => [...p, { nombre: '', dosis: '', via: '', hora: '' }]); }
  function removeMed(i: number) { setMeds((p) => p.filter((_, idx) => idx !== i)); }
  function updateMed(i: number, field: keyof Medicamento, val: string) {
    setMeds((p) => p.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  }

  async function handleGuardar(firmar: boolean) {
    if (!evolucion.trim()) { error('La evolución es obligatoria.'); return; }
    if (firmar && !hasSign) { error('Dibuje su firma para validar el registro.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const canvas64 = firmar ? canvasRef.current?.toDataURL() : undefined;
    success(firmar ? 'Kardex guardado y firmado.' : 'Kardex guardado. Pendiente de firma.');
    onSaved(firmar, canvas64);
    setLoading(false);
  }

  return (
    <ModalBase title={`Kardex de Enfermería — ${pacienteNombre}`} onClose={onClose} width="max-w-2xl">
      <div className="p-6 space-y-5">

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha y Hora</label>
          <input type="text" value={formatoFechaHoraPeru(new Date())} disabled
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500" />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Balance Hídrico</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ingresos (ml)</label>
              <input type="number" value={ingresos} onChange={(e) => setIngresos(e.target.value)} placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Egresos (ml)</label>
              <input type="number" value={egresos} onChange={(e) => setEgresos(e.target.value)} placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700">Medicamentos Administrados</p>
            <button onClick={addMed} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
              <Plus size={12} /> Agregar
            </button>
          </div>
          {meds.length === 0 && <p className="text-xs text-gray-400 italic">Sin medicamentos registrados.</p>}
          {meds.map((m, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-center">
              <input value={m.nombre} onChange={(e) => updateMed(i, 'nombre', e.target.value)} placeholder="Medicamento"
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 col-span-1" />
              <input value={m.dosis}  onChange={(e) => updateMed(i, 'dosis',  e.target.value)} placeholder="Dosis"
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input value={m.via}   onChange={(e) => updateMed(i, 'via',   e.target.value)} placeholder="Vía (IV/VO)"
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <div className="flex items-center gap-1">
                <input value={m.hora}  onChange={(e) => updateMed(i, 'hora',  e.target.value)} placeholder="HH:MM"
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button onClick={() => removeMed(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Evolución / Observaciones <span className="text-red-500">*</span>
          </label>
          <textarea value={evolucion} onChange={(e) => setEvolucion(e.target.value)} rows={4}
            placeholder="Estado actual, respuesta al tratamiento, plan de cuidados..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700">Firma Digital</p>
            {hasSign && (
              <button onClick={clearCanvas} className="text-xs text-gray-400 hover:text-gray-600">Limpiar</button>
            )}
          </div>
          <canvas ref={canvasRef} width={500} height={110}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-crosshair"
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
          <p className="text-[11px] text-gray-400 mt-1">Firma obligatoria para validez legal — NTS N°139-MINSA.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button onClick={() => handleGuardar(false)} disabled={loading}
            className="py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40">
            Guardar sin Firmar
          </button>
          <button onClick={() => handleGuardar(true)} disabled={loading || !hasSign}
            className="py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Firmando…</> : 'Firmar Registro'}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/triaje/KardexForm.tsx
git commit -m "feat(triaje): agregar Kardex digital con canvas de firma"
```

---

### Task 11: ObservacionTable

**Files:**
- Create: `components/triaje/ObservacionTable.tsx`

- [ ] **Step 1: Crear `components/triaje/ObservacionTable.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, AlertCircle, LogOut } from 'lucide-react';
import KardexForm from './KardexForm';
import ModalBase from '@/components/modals/ModalBase';
import { useToast } from '@/context/ToastContext';
import { PacienteObservacion, PRIORIDAD_CONFIG, elapsedHHMM } from '@/lib/vitals';

type AltaTipo = 'Alta domiciliaria' | 'Hospitalización' | 'Traslado';

interface Props {
  pacientes: PacienteObservacion[];
  onUpdate: (pacientes: PacienteObservacion[]) => void;
}

export default function ObservacionTable({ pacientes, onUpdate }: Props) {
  const { success, warning } = useToast();
  const [, tick]          = useState(0);
  const [kardex, setKardex] = useState<PacienteObservacion | null>(null);
  const [alta, setAlta]     = useState<PacienteObservacion | null>(null);
  const [altaTipo, setAltaTipo] = useState<AltaTipo>('Alta domiciliaria');

  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  function hasUnsigned(p: PacienteObservacion) { return p.kardex.some((k) => !k.firmado); }
  function hasSigned(p: PacienteObservacion)   { return p.kardex.some((k) =>  k.firmado); }

  function handleKardexSaved(pacienteId: string, firmado: boolean, canvas?: string) {
    onUpdate(pacientes.map((p) => {
      if (p.id !== pacienteId) return p;
      return {
        ...p,
        kardex: [...p.kardex, {
          id: Date.now().toString(),
          pacienteId,
          fechaHora: new Date().toISOString(),
          ingresosHidricos: 0,
          egresosHidricos: 0,
          medicamentos: [],
          evolucion: '',
          firmado,
          firmaCanvas: canvas,
        }],
      };
    }));
    setKardex(null);
  }

  function confirmarAlta() {
    if (!alta) return;
    onUpdate(pacientes.filter((p) => p.id !== alta.id));
    success(`${alta.nombre} — Alta: ${altaTipo}`);
    setAlta(null);
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Pacientes en Observación</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50">
            <tr>
              {['Paciente', 'Ingreso', 'Prioridad', 'Motivo', 'Tiempo', 'Kardex', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pacientes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">No hay pacientes en observación.</td>
              </tr>
            )}
            {pacientes.map((p) => {
              const cfg     = PRIORIDAD_CONFIG[p.prioridad];
              const canAlta = hasSigned(p);
              const pending = hasUnsigned(p);

              return (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{p.nombre}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {p.horaIngreso.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500 max-w-[140px] truncate">{p.motivo}</td>
                  <td className="px-5 py-3 font-mono text-sm font-bold text-gray-700 tabular-nums">{elapsedHHMM(p.horaIngreso)}</td>
                  <td className="px-5 py-3">
                    {pending
                      ? <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">⚠ Pend. Firma</span>
                      : p.kardex.length > 0
                        ? <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">Firmado</span>
                        : <span className="text-[10px] text-gray-400">Sin registros</span>
                    }
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setKardex(p)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                        <FileText size={11} /> Evolución
                      </button>
                      <button onClick={() => warning(`Reevaluación solicitada para ${p.nombre}. Notificando al médico…`)} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium">
                        <AlertCircle size={11} /> Reevaluar
                      </button>
                      <button
                        onClick={() => canAlta ? setAlta(p) : warning('Firme al menos un Kardex antes de dar el alta.')}
                        className={`flex items-center gap-1 text-xs font-medium ${canAlta ? 'text-green-600 hover:text-green-700' : 'text-gray-300 cursor-not-allowed'}`}
                      >
                        <LogOut size={11} /> Alta
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {kardex && (
        <KardexForm
          pacienteNombre={kardex.nombre}
          pacienteId={kardex.id}
          onClose={() => setKardex(null)}
          onSaved={(firmado, canvas) => handleKardexSaved(kardex.id, firmado, canvas)}
        />
      )}

      {alta && (
        <ModalBase title={`Alta — ${alta.nombre}`} onClose={() => setAlta(null)} width="max-w-md">
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">Tipo de alta para <strong>{alta.nombre}</strong>:</p>
            <div className="space-y-2">
              {(['Alta domiciliaria', 'Hospitalización', 'Traslado'] as AltaTipo[]).map((tipo) => (
                <label key={tipo} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${altaTipo === tipo ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="alta" value={tipo} checked={altaTipo === tipo} onChange={() => setAltaTipo(tipo)} className="accent-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{tipo}</span>
                </label>
              ))}
            </div>
            <button onClick={confirmarAlta} className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
              Confirmar Alta
            </button>
          </div>
        </ModalBase>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/triaje/ObservacionTable.tsx
git commit -m "feat(triaje): agregar tabla de observación con kardex y alta"
```

---

### Task 12: Página de observación

**Files:**
- Create: `app/triaje/observacion/page.tsx`

- [ ] **Step 1: Crear `app/triaje/observacion/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import ObservacionTable from '@/components/triaje/ObservacionTable';
import { PacienteObservacion } from '@/lib/vitals';

const now = new Date();
const MOCK: PacienteObservacion[] = [
  {
    id: 'obs-1',
    nombre: 'Juan Pérez García',
    horaIngreso: new Date(now.getTime() - 45 * 60000),
    prioridad: 'III-AMARILLO',
    motivo: 'Dolor abdominal — pendiente resultado de laboratorio',
    kardex: [
      {
        id: 'k-1',
        pacienteId: 'obs-1',
        fechaHora: new Date(now.getTime() - 40 * 60000).toISOString(),
        ingresosHidricos: 500,
        egresosHidricos: 200,
        medicamentos: [{ nombre: 'Ketorolaco', dosis: '30mg', via: 'IV', hora: '09:15' }],
        evolucion: 'Paciente estable, dolor 6/10, tolera posición semisentada.',
        firmado: true,
        firmadoPor: 'Ana Ríos',
      },
    ],
  },
  {
    id: 'obs-2',
    nombre: 'María López Ruiz',
    horaIngreso: new Date(now.getTime() - 20 * 60000),
    prioridad: 'II-NARANJA',
    motivo: 'Dificultad respiratoria — SpO₂ 91% al ingreso',
    kardex: [],
  },
];

export default function ObservacionPage() {
  const [pacientes, setPacientes] = useState<PacienteObservacion[]>(MOCK);
  const pendingCount = pacientes.reduce(
    (acc, p) => acc + p.kardex.filter((k) => !k.firmado).length,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes en Observación</h1>
          <p className="text-sm text-gray-400">Monitoreo activo y registro de evolución</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2 rounded-xl">
            <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{pendingCount}</span>
            <span className="text-sm text-red-600 font-medium">Registros Kardex sin firmar</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'En Observación',        value: pacientes.length,                                                  color: 'text-blue-600'  },
          { label: 'Con Kardex Firmado',    value: pacientes.filter((p) => p.kardex.some((k) => k.firmado)).length,  color: 'text-green-600' },
          { label: 'Kardex Sin Firmar',     value: pendingCount,                                                      color: 'text-red-500'   },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <ObservacionTable pacientes={pacientes} onUpdate={setPacientes} />
    </div>
  );
}
```

- [ ] **Step 2: Verificar `http://localhost:3000/triaje/observacion` carga correctamente**

- [ ] **Step 3: Commit final**

```bash
git add app/triaje/observacion/page.tsx
git commit -m "feat(triaje): agregar página de observación con KPIs y tabla"
```

---

## Verificación Final (Golden Path)

- [ ] `http://localhost:3000/triaje` — Dashboard con 4 KPIs, 5 gráficas, 2 tablas
- [ ] Botón "Iniciar Triaje" en T-001 → navega a `/triaje/paciente/1`
- [ ] Ingresar SpO₂ = 88 y perder foco → toast rojo de hipoxemia + campo con borde rojo
- [ ] Completar todos los signos + motivo → "Guardar y Clasificar" → abre PriorityModal
- [ ] En PriorityModal: Verde y Azul deshabilitados (SpO₂ < 90%), seleccionar Naranja, escribir justificación > 10 chars → botón habilitado → confirmar → toast + redirect a `/triaje`
- [ ] `http://localhost:3000/triaje/observacion` — ver Juan Pérez (firmado) y María López (sin kardex)
- [ ] Abrir Kardex de María → escribir evolución → firmar canvas → "Firmar Registro"
- [ ] Badge "Pend. Firma" de María desaparece → ahora dice "Firmado"
- [ ] Botón "Alta" de Juan habilitado (tiene kardex firmado) → seleccionar tipo → confirmar → desaparece de la tabla
- [ ] Navbar: reloj digital actualiza cada segundo, links Dashboard/Observación navegan correctamente
```
