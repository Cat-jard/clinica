'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import {
  CalendarDays, FlaskConical, Pill, MessageSquare, Clock, Plus, ChevronRight,
} from 'lucide-react';
import PortalShell from '@/components/portal/PortalShell';
import {
  getPerfilPacienteApi, getCitasPacienteApi,
  type PerfilPaciente, type CitaPaciente,
} from '@/lib/paciente-portal';
import { getUsuario } from '@/lib/auth';

export default function DashboardPaciente() {
  const [perfil, setPerfil] = useState<PerfilPaciente | null>(null);
  const [citas, setCitas] = useState<CitaPaciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const p = await getPerfilPacienteApi();
        setPerfil(p);
        if (p?.dni) {
          const user = getUsuario();
          if (user) {
            const res = await fetch(`/api/pacientes/all?q=${encodeURIComponent(p.dni)}&size=1`);
            const body = await res.json().catch(() => ({}));
            const pages = body.data?.content || body.data || [];
            const paciente = Array.isArray(pages) ? pages[0] : null;
            if (paciente?.id) {
              const citasData = await getCitasPacienteApi(paciente.id);
              setCitas(citasData);
            }
          }
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const proxima = citas.find(c => c.esFutura && (c.estado === 'Confirmada' || c.estado === 'Programada'));
  const hoy = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

  const accesos = [
    { label: 'Agendar Cita',    href: '/portal/citas',      Icon: CalendarDays, color: 'bg-blue-50 text-blue-600'    },
    { label: 'Ver Resultados',  href: '/portal/resultados', Icon: FlaskConical, color: 'bg-purple-50 text-purple-600'},
    { label: 'Mis Recetas',     href: '/portal/recetas',    Icon: Pill,         color: 'bg-teal-50 text-teal-600'    },
    { label: 'Mensajes',        href: '/portal/mensajes',   Icon: MessageSquare,color: 'bg-amber-50 text-amber-600'  },
  ];

  return (
    <PortalShell>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Saludo */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">¡Hola, {perfil?.nombre || 'Paciente'}! 👋</h1>
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
        <ResumenCard Icon={FlaskConical} label="Resultados" value={0} color="text-purple-600" bg="bg-purple-50" href="/portal/resultados" />
        <ResumenCard Icon={Pill}         label="Recetas"    value={0} color="text-teal-600"   bg="bg-teal-50"   href="/portal/recetas" />
        <ResumenCard Icon={MessageSquare}label="Mensajes"   value={0} color="text-amber-600"  bg="bg-amber-50"  href="/portal/mensajes" />
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

      {/* Actividad reciente - próximas citas */}
      <p className="text-sm font-semibold text-gray-800 mb-3">Próximas citas</p>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {citas.filter(c => c.esFutura).length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-gray-400">No tienes próximas citas programadas.</div>
        )}
        {citas.filter(c => c.esFutura).map(c => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700">{c.medico} — {c.motivo}</p>
              <p className="text-[10px] text-gray-400">{c.fecha} a las {c.hora}</p>
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
