'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, LogOut, Settings, ScanLine } from 'lucide-react';

const NAV = [
  { label: 'Dashboard', href: '/radiologo'           },
  { label: 'Auditoría', href: '/radiologo/auditoria' },
];

interface RadiologoNavbarProps {
  alertCount?: number;
}

export default function RadiologoNavbar({ alertCount = 2 }: RadiologoNavbarProps) {
  const pathname = usePathname();
  const [userMenu, setUserMenu] = useState(false);
  const [now, setNow] = useState(new Date());
  const [search, setSearch] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-40">

      {/* Logo */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-600">
          <ScanLine size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">SIHCE</p>
          <p className="text-[10px] text-gray-400 leading-tight">Diagnóstico por Imágenes</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex-1 max-w-sm mx-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar estudio, orden, DNI o paciente…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-0.5">
        {NAV.map(({ label, href }) => {
          const active = pathname === href || (href !== '/radiologo' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
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

        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-gray-800 leading-tight tabular-nums">{timeStr}</p>
          <p className="text-[10px] text-gray-400 leading-tight capitalize">{dateStr}</p>
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600">
              <span className="text-xs font-bold text-white">RM</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-700 leading-tight">Dr. Ricardo Mendoza</p>
              <p className="text-[10px] text-gray-400 leading-tight">Médico Radiólogo</p>
            </div>
            <ChevronDown size={12} className="text-gray-400 hidden md:block" />
          </button>

          {userMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-40 overflow-hidden">
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <User size={14} className="text-gray-400" /> Mi Perfil
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Settings size={14} className="text-gray-400" /> Config. Firma Digital
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
