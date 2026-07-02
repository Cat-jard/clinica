'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Ban, CheckCircle, Search, Loader2 } from 'lucide-react';
import UsuarioModal from '@/components/admin/UsuarioModal';
import type { Usuario } from '@/lib/admin';
import {
  listUsuariosApi, crearUsuarioApi, actualizarUsuarioApi, toggleEstadoUsuarioApi,
  ROL_CONFIG, ROLES,
} from '@/lib/admin';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalUser, setModalUser] = useState<Usuario | null | undefined>(undefined);
  const [filtroRol, setFiltroRol] = useState('Todos');
  const [busca, setBusca]         = useState('');
  const [toast, setToast]         = useState('');

  useEffect(() => {
    listUsuariosApi().then(setUsuarios).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function handleGuardar(u: Usuario) {
    try {
      if (u.id) {
        await actualizarUsuarioApi(u.id, {
          dni: u.dni, nombre: u.nombre, apellidos: u.apellidos, email: u.email,
          telefono: u.telefono, rol: u.rol, especialidad: u.especialidad,
        });
      } else {
        await crearUsuarioApi({
          dni: u.dni, nombre: u.nombre, apellidos: u.apellidos, email: u.email,
          telefono: u.telefono, rol: u.rol, especialidad: u.especialidad,
        });
      }
      const list = await listUsuariosApi();
      setUsuarios(list);
      setModalUser(undefined);
      showToast('✓ Usuario guardado correctamente');
    } catch (err: any) {
      showToast('✗ ' + (err.message || 'Error al guardar usuario'));
    }
  }

  async function toggleEstado(id: string) {
    try {
      await toggleEstadoUsuarioApi(id);
      const list = await listUsuariosApi();
      setUsuarios(list);
      showToast('✓ Estado del usuario actualizado');
    } catch (err: any) {
      showToast('✗ ' + (err.message || 'Error al cambiar estado'));
    }
  }

  const filtered = usuarios.filter(u => {
    const matchRol = filtroRol === 'Todos' || u.rol === filtroRol;
    const q = busca.toLowerCase();
    const matchBusca = !q || `${u.nombre} ${u.apellidos} ${u.dni} ${u.email}`.toLowerCase().includes(q);
    return matchRol && matchBusca;
  });

  const activos = usuarios.filter(u => u.estado === 'Activo').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Gestión de Usuarios y Roles</h1>
            <p className="text-xs text-gray-500">{activos} activos · {usuarios.length} totales · RBAC (Ley 29733)</p>
          </div>
        </div>
        <button
          onClick={() => setModalUser(null)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} /> Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nombre, DNI o correo…"
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Todos</option>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 font-medium">
                <th className="px-5 py-3 text-left">Usuario</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">DNI</th>
                <th className="px-5 py-3 text-left">Rol</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Último Acceso</th>
                <th className="px-5 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors ${u.estado === 'Inactivo' ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{u.nombre} {u.apellidos}</p>
                    <p className="text-gray-400">{u.email}{u.especialidad ? ` · ${u.especialidad}` : ''}</p>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-500 hidden md:table-cell">{u.dni}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ROL_CONFIG[u.rol].className}`}>{u.rol}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.estado === 'Activo' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-gray-400 hidden lg:table-cell">{u.ultimoAcceso}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModalUser(u)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={11} /> Editar
                      </button>
                      <button
                        onClick={() => toggleEstado(u.id)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-colors ${
                          u.estado === 'Activo'
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-green-600 border-green-200 hover:bg-green-50'
                        }`}
                      >
                        {u.estado === 'Activo' ? <><Ban size={11} /> Desactivar</> : <><CheckCircle size={11} /> Activar</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No se encontraron usuarios</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota normativa */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
        <Ban size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <b>Política de seguridad:</b> Los usuarios no se eliminan, solo se <b>desactivan</b>. Su historial (logs, atenciones)
          permanece intacto para auditoría conforme a la Ley 30024 (RENHICE).
        </p>
      </div>

      {/* Modal */}
      {modalUser !== undefined && (
        <UsuarioModal usuario={modalUser} onClose={() => setModalUser(undefined)} onGuardar={handleGuardar} />
      )}
    </div>
  );
}
