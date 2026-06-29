'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Search, ChevronDown, LogOut, User, UserPlus } from 'lucide-react';
import SearchPatientModal from './modals/SearchPatientModal';
import NewPatientModal from './modals/NewPatientModal';

const NAV = [
  { label: 'Dashboard',      href: '/recepcionista' },
  { label: 'Pacientes',      href: '/recepcionista/pacientes' },
  { label: 'Citas',          href: '/recepcionista/citas' },
  { label: 'Cola de Espera', href: '/recepcionista/cola' },
];

type ModalType = 'search' | 'newPatient' | null;

export default function RecepcionistaNavbar() {
  const pathname = usePathname();
  const [modal, setModal] = useState<ModalType>(null);
  const [userMenu, setUserMenu] = useState(false);

  return (
    <>
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
            <p className="text-[10px] text-gray-400 leading-tight">Recepcionista</p>
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
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 min-w-[200px] justify-end">
          {/* Search */}
          <button
            onClick={() => setModal('search')}
            className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Search size={14} />
            <span className="hidden md:inline text-xs">Buscar paciente…</span>
          </button>

          {/* Nuevo Paciente */}
          <button
            onClick={() => setModal('newPatient')}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={14} />
            <span className="hidden md:inline">Nuevo Paciente</span>
          </button>

          {/* User avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenu((v) => !v)}
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">RG</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-gray-700 leading-tight">Rosa García</p>
                <p className="text-[10px] text-gray-400 leading-tight">Recepcionista</p>
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
                  <Link href="/" className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={14} /> Cerrar Sesión
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {modal === 'search'     && <SearchPatientModal onClose={() => setModal(null)} onNewPatient={() => setModal('newPatient')} />}
      {modal === 'newPatient' && <NewPatientModal onClose={() => setModal(null)} />}
    </>
  );
}
