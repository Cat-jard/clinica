'use client';

import Link from 'next/link';
import {
  CalendarDays, FlaskConical, Pill, MessageSquare, Clock, Plus, ChevronRight,
} from 'lucide-react';
import PortalShell from '@/components/portal/PortalShell';
import {
  MOCK_PERFIL, MOCK_CITAS_PACIENTE, MOCK_RESULTADOS_PACIENTE,
  MOCK_RECETAS_PACIENTE, MOCK_MENSAJES_PACIENTE, MOCK_ACTIVIDAD_PACIENTE,
} from '@/lib/paciente-portal';

export default function DashboardPaciente() {
  const proxima = MOCK_CITAS_PACIENTE.find(c => c.esFutura && (c.estado === 'Confirmada' || c.estado === 'Programada'));
  const resultadosNuevos = MOCK_RESULTADOS_PACIENTE.filter(r => r.estado === 'Validado').length;
  const recetasActivas   = MOCK_RECETAS_PACIENTE.filter(r => r.estado === 'Vigente').length;
  const mensajesNoLeidos = MOCK_MENSAJES_PACIENTE.filter(m => !m.leido).length;

  const hoy = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

  const accesos = [
    { label: 'Agendar Cita',    href: '/portal/citas',      Icon: CalendarDays, color: 'bg-blue-50 text-blue-600'    },
    { label: 'Ver Resultados',  href: '/portal/resultados', Icon: FlaskConical, color: 'bg-purple-50 text-purple-600'},
    { label: 'Mis Recetas',     href: '/portal/recetas',    Icon: Pill,         color: 'bg-teal-50 text-teal-600'    },
    { label: 'Mensajes',        href: '/portal/mensajes',   Icon: MessageSquare,color: 'bg-amber-50 text-amber-600'  },
  ];

  return (
    <PortalShell>
      {/* Saludo */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">¡Hola, {MOCK_PERFIL.nombre}! 👋</h1>
        <p className="text-xs text-gray-500 capitalize">{hoy}</p>
      </div>

      {/* Próxima cita destacada */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white mb-4 shadow-sm">
        <p className="text-xs text-blue-100 mb-1">Próxima Cita</p>
        {proxima ? (
          <>
            <p className="text-lg font-bold">{proxima.especialidad}</p>
            <p className="text-sm text-blue-50">{proxima.medico}</p>
            <div className="flex items-center gap-2 mt-3 text-sm">
              <CalendarDays size={15} />
              <span>{proxima.fecha}</span>
              <Clock size={15} className="ml-2" />
              <span>{proxima.hora}</span>
            </div>
          </>
        ) : (
          <>
            <p className="text-base font-semibold">No tienes citas programadas</p>
            <Link href="/portal/citas" className="inline-flex items-center gap-1.5 mt-3 bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl">
              <Plus size={14} /> Agendar Cita
            </Link>
          </>
        )}
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <ResumenCard Icon={FlaskConical} label="Resultados" value={resultadosNuevos} color="text-purple-600" bg="bg-purple-50" href="/portal/resultados" />
        <ResumenCard Icon={Pill}         label="Recetas"    value={recetasActivas}   color="text-teal-600"   bg="bg-teal-50"   href="/portal/recetas" />
        <ResumenCard Icon={MessageSquare}label="Mensajes"   value={mensajesNoLeidos} color="text-amber-600"  bg="bg-amber-50"  href="/portal/mensajes" />
      </div>

      {/* Accesos rápidos */}
      <p className="text-sm font-semibold text-gray-800 mb-3">Accesos rápidos</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {accesos.map(({ label, href, Icon, color }) => (
          <Link key={href} href={href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
              <Icon size={22} />
            </div>
            <span className="text-xs font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>

      {/* Actividad reciente */}
      <p className="text-sm font-semibold text-gray-800 mb-3">Actividad reciente</p>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {MOCK_ACTIVIDAD_PACIENTE.map(a => (
          <div key={a.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700">{a.evento}</p>
              <p className="text-[10px] text-gray-400">{a.fecha}</p>
            </div>
            <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
          </div>
        ))}
      </div>
    </PortalShell>
  );
}

function ResumenCard({ Icon, label, value, color, bg, href }: {
  Icon: typeof FlaskConical; label: string; value: number; color: string; bg: string; href: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col items-center gap-1.5">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon size={17} className={color} />
      </div>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-[10px] text-gray-500">{label}</span>
    </Link>
  );
}
