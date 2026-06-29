'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bell, ChevronDown, User, LogOut, Settings, Building2 } from 'lucide-react';

const NAV = [
  { label: 'Dashboard',     href: '/admin'               },
  { label: 'Reportes',      href: '/admin/reportes'      },
  { label: 'Usuarios',      href: '/admin/usuarios'      },
  { label: 'Camas',         href: '/admin/camas'         },
  { label: 'Finanzas',      href: '/admin/finanzas'      },
  { label: 'Auditoría',     href: '/admin/auditoria'     },
  { label: 'Configuración', href: '/admin/configuracion' },
];

interface AdminNavbarProps {
  alertCount?: number;
}

export default function AdminNavbar({ alertCount = 4 }: AdminNavbarProps) {
  const pathname = usePathname();
  const [userMenu, setUserMenu] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between gap-4 sticky top-0 z-40">

      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-600">
          <Building2 size={16} className="text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-gray-900 leading-tight">SIHCE</p>
          <p className="text-[10px] text-gray-400 leading-tight">Gestión Hospitalaria</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-0.5 flex-1 overflow-x-auto no-scrollbar">
        {NAV.map(({ label, href }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                active ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right: clock + bell + avatar */}
      <div className="flex items-center gap-3 flex-shrink-0 justify-end">

        <div className="text-right hidden xl:block">
          <p className="text-sm font-bold text-gray-800 leading-tight tabular-nums">{timeStr}</p>
          <p className="text-[10px] text-gray-400 leading-tight">{now.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
        </div>

        <div className="relative">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
            <Bell size={18} />
          </button>
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenu(v => !v)}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-500">
              <span className="text-xs font-bold text-white">PN</span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-gray-700 leading-tight">Patricia Núñez</p>
              <p className="text-[10px] text-gray-400 leading-tight">Directora Médica</p>
            </div>
            <ChevronDown size={12} className="text-gray-400 hidden lg:block" />
          </button>

          {userMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-40 overflow-hidden">
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <User size={14} className="text-gray-400" /> Mi Perfil
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Settings size={14} className="text-gray-400" /> Configuración
                </button>
                <div className="border-t border-gray-100" />
                <Link href="/" className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={14} /> Cerrar Sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
