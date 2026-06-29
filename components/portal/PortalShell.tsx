'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HeartPulse, Bell, LayoutDashboard, CalendarDays, FlaskConical,
  Pill, MessageSquare, User, LogOut, Settings, Check, ChevronDown,
} from 'lucide-react';
import { MOCK_NOTIFICACIONES_PACIENTE, MOCK_PERFIL } from '@/lib/paciente-portal';

const NAV = [
  { label: 'Inicio',      href: '/portal/dashboard',  Icon: LayoutDashboard },
  { label: 'Citas',       href: '/portal/citas',      Icon: CalendarDays    },
  { label: 'Resultados',  href: '/portal/resultados', Icon: FlaskConical    },
  { label: 'Recetas',     href: '/portal/recetas',    Icon: Pill            },
  { label: 'Mensajes',    href: '/portal/mensajes',   Icon: MessageSquare   },
];

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [notifs, setNotifs]       = useState(MOCK_NOTIFICACIONES_PACIENTE);
  const [now, setNow]             = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const noLeidas = notifs.filter(n => !n.leida).length;
  const iniciales = (MOCK_PERFIL.nombre[0] + MOCK_PERFIL.apellidos[0]).toUpperCase();
  const timeStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="min-h-screen bg-[#f0f0f5]">
      {/* Navbar superior */}
      <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between gap-4 sticky top-0 z-40">
        {/* Logo */}
        <Link href="/portal/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-600">
            <HeartPulse size={16} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-tight">SIHCE</p>
            <p className="text-[10px] text-gray-400 leading-tight">Mi Portal de Salud</p>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto no-scrollbar justify-center">
          {NAV.map(({ label, href, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  active ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right: reloj + notificaciones + avatar */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <p className="text-sm font-bold text-gray-800 tabular-nums hidden lg:block">{timeStr}</p>

          {/* Notificaciones */}
          <div className="relative">
            <button onClick={() => { setNotifOpen(v => !v); setUserOpen(false); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors relative">
              <Bell size={18} />
              {noLeidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {noLeidas}
                </span>
              )}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Notificaciones</p>
                    <button onClick={() => setNotifs(prev => prev.map(n => ({ ...n, leida: true })))}
                      className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                      <Check size={11} /> Marcar leídas
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifs.map(n => (
                      <div key={n.id} className={`px-4 py-3 ${!n.leida ? 'bg-blue-50/50' : ''}`}>
                        <p className="text-xs text-gray-700">{n.texto}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{n.fecha}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Avatar */}
          <div className="relative">
            <button onClick={() => { setUserOpen(v => !v); setNotifOpen(false); }}
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 flex-shrink-0">
                <span className="text-xs font-bold text-white">{iniciales}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-gray-700 leading-tight">{MOCK_PERFIL.nombre} {MOCK_PERFIL.apellidos}</p>
                <p className="text-[10px] text-gray-400 leading-tight">Paciente</p>
              </div>
              <ChevronDown size={12} className="text-gray-400 hidden md:block" />
            </button>
            {userOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setUserOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 md:hidden">
                    <p className="text-xs font-semibold text-gray-800">{MOCK_PERFIL.nombre} {MOCK_PERFIL.apellidos}</p>
                    <p className="text-[10px] text-gray-400">DNI: {MOCK_PERFIL.dni}</p>
                  </div>
                  <Link href="/portal/perfil" onClick={() => setUserOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <User size={14} className="text-gray-400" /> Mi Perfil
                  </Link>
                  <Link href="/portal/perfil" onClick={() => setUserOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <Settings size={14} className="text-gray-400" /> Configuración
                  </Link>
                  <div className="border-t border-gray-100" />
                  <Link href="/"
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={14} /> Cerrar Sesión
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="px-6 py-6 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
