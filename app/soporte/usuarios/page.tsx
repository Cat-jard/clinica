'use client';

import { useState } from 'react';
import { Users, Lock, Unlock, KeyRound, Pencil, Search } from 'lucide-react';
import type { UsuarioSistema, EstadoUsuarioSis } from '@/lib/soporte';
import { MOCK_USUARIOS_SIS, ESTADO_USUARIO_SIS_CONFIG } from '@/lib/soporte';

export default function UsuariosSoportePage() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>(MOCK_USUARIOS_SIS);
  const [busca, setBusca] = useState('');
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function toggleBloqueo(id: string) {
    setUsuarios(prev => prev.map(u => {
      if (u.id !== id) return u;
      const nuevo: EstadoUsuarioSis = u.estado === 'Bloqueado' ? 'Activo' : 'Bloqueado';
      return { ...u, estado: nuevo };
    }));
    showToast('✓ Estado de acceso actualizado');
  }

  const filtered = usuarios.filter(u => {
    const q = busca.toLowerCase();
    return !q || `${u.usuario} ${u.nombreCompleto} ${u.rol}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>
      )}

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Users size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Usuarios del Sistema (Técnico)</h1>
          <p className="text-xs text-gray-500">Gestión de accesos y seguridad · Ley 29733</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por usuario, nombre o rol…"
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 font-medium">
                <th className="px-5 py-3 text-left">Usuario</th>
                <th className="px-5 py-3 text-left">Nombre</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Rol</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Último Acceso</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">IP</th>
                <th className="px-5 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => {
                const cfg = ESTADO_USUARIO_SIS_CONFIG[u.estado];
                return (
                  <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors ${u.estado === 'Bloqueado' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-3 font-mono font-semibold text-gray-700">{u.usuario}</td>
                    <td className="px-5 py-3 text-gray-800">{u.nombreCompleto}</td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{u.rol}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {u.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-gray-400 hidden lg:table-cell tabular-nums">{u.ultimoAcceso}</td>
                    <td className="px-5 py-3 font-mono text-gray-400 hidden lg:table-cell">{u.ipUltimoAcceso}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        <button title="Editar"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => toggleBloqueo(u.id)} title={u.estado === 'Bloqueado' ? 'Desbloquear' : 'Bloquear'}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-colors ${
                            u.estado === 'Bloqueado' ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-red-600 border-red-200 hover:bg-red-50'
                          }`}>
                          {u.estado === 'Bloqueado' ? <Unlock size={13} /> : <Lock size={13} />}
                        </button>
                        <button onClick={() => showToast('✓ Contraseña temporal enviada por correo')} title="Resetear contraseña"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-amber-600 border border-amber-200 hover:bg-amber-50 transition-colors">
                          <KeyRound size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Lock size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <b>Seguridad:</b> Los usuarios se <b>bloquean</b>, no se eliminan. El bloqueo corta el acceso inmediato manteniendo el historial para auditoría.
        </p>
      </div>
    </div>
  );
}
