'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDown, LogOut, User, Bell, Search, Settings } from 'lucide-react';

const NAV = [
  { label: 'Dashboard',  href: '/medico' },
  { label: 'Auditoría',  href: '/medico/auditoria' },
];

interface MedicoNavbarProps {
  pendingCount?: number;
}

export default function MedicoNavbar({ pendingCount = 2 }: MedicoNavbarProps) {
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
      <div className="flex items-center gap-2 min-w-[160px]">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path d="M12 2L9.5 8.5H3L8.5 12.5L6.5 19L12 15L17.5 19L15.5 12.5L21 8.5H14.5L12 2Z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">SIHCE</p>
          <p className="text-[10px] text-gray-400 leading-tight">Médico</p>
        </div>
      </div>

      {/* Buscador global */}
      <div className="flex-1 max-w-sm mx-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar paciente por DNI o nombre…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
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

        {/* Reloj */}
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-gray-800 leading-tight tabular-nums">{timeStr}</p>
          <p className="text-[10px] text-gray-400 leading-tight capitalize">{dateStr}</p>
        </div>

        {/* Campana */}
        <div className="relative">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
            <Bell size={18} />
          </button>
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </div>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenu(v => !v)}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
              <span className="text-xs font-bold text-white">LT</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-700 leading-tight">Dr. Luis Torres</p>
              <p className="text-[10px] text-gray-400 leading-tight">Médico General</p>
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
