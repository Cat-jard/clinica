'use client';

import { useState } from 'react';
import { Save, Mail } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import type { Usuario, RolUsuario, EstadoUsuario } from '@/lib/admin';
import { ROLES, ESPECIALIDADES } from '@/lib/admin';

interface UsuarioModalProps {
  usuario: Usuario | null;          // null = creación
  onClose: () => void;
  onGuardar: (u: Usuario) => void;
}

const PERMISOS = [
  'Puede ver reportes financieros',
  'Puede gestionar usuarios',
  'Puede exportar auditoría',
  'Puede modificar configuración',
];

export default function UsuarioModal({ usuario, onClose, onGuardar }: UsuarioModalProps) {
  const esEdicion = !!usuario;

  const [dni,       setDni]       = useState(usuario?.dni ?? '');
  const [nombre,    setNombre]    = useState(usuario?.nombre ?? '');
  const [apellidos, setApellidos] = useState(usuario?.apellidos ?? '');
  const [email,     setEmail]     = useState(usuario?.email ?? '');
  const [telefono,  setTelefono]  = useState(usuario?.telefono ?? '');
  const [rol,       setRol]       = useState<RolUsuario>(usuario?.rol ?? 'Recepción');
  const [especialidad, setEspecialidad] = useState(usuario?.especialidad ?? ESPECIALIDADES[0]);
  const [estado,    setEstado]    = useState<EstadoUsuario>(usuario?.estado ?? 'Activo');
  const [cambiarPass, setCambiarPass] = useState(false);
  const [nuevaPass, setNuevaPass] = useState('');

  // Validaciones
  const dniValido   = /^\d{8}$/.test(dni);
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const telValido   = /^\d{9}$/.test(telefono);
  const canGuardar  = dniValido && nombre.trim() && apellidos.trim() && emailValido && telValido;

  function handleGuardar() {
    if (!canGuardar) return;
    onGuardar({
      id: usuario?.id ?? `u-${Date.now()}`,
      dni, nombre, apellidos, email, telefono, rol,
      especialidad: rol === 'Médico' ? especialidad : undefined,
      estado,
      ultimoAcceso: usuario?.ultimoAcceso ?? '—',
    });
  }

  return (
    <ModalBase title={esEdicion ? `Editar Usuario — ${usuario.nombre} ${usuario.apellidos}` : 'Nuevo Usuario'} onClose={onClose} width="max-w-2xl">
      <div className="p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-gray-600 font-medium mb-1">DNI <span className="text-red-500">*</span></label>
            <input
              value={dni} onChange={e => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="8 dígitos"
              className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${dni && !dniValido ? 'border-red-400' : 'border-gray-200'}`}
            />
            {dni && !dniValido && <p className="text-red-500 text-[10px] mt-1">Debe tener 8 dígitos</p>}
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Teléfono <span className="text-red-500">*</span></label>
            <input
              value={telefono} onChange={e => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="9 dígitos"
              className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${telefono && !telValido ? 'border-red-400' : 'border-gray-200'}`}
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Nombres <span className="text-red-500">*</span></label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Apellidos <span className="text-red-500">*</span></label>
            <input value={apellidos} onChange={e => setApellidos(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-600 font-medium mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              placeholder="usuario@clinica.pe"
              className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${email && !emailValido ? 'border-red-400' : 'border-gray-200'}`}
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Rol <span className="text-red-500">*</span></label>
            <select value={rol} onChange={e => setRol(e.target.value as RolUsuario)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          {/* Especialidad condicional */}
          {rol === 'Médico' && (
            <div>
              <label className="block text-gray-600 font-medium mb-1">Especialidad</label>
              <select value={especialidad} onChange={e => setEspecialidad(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Estado toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div>
            <p className="text-xs font-semibold text-gray-700">Estado del Usuario</p>
            <p className="text-[10px] text-gray-400">Los usuarios inactivos no pueden iniciar sesión</p>
          </div>
          <button
            onClick={() => setEstado(s => s === 'Activo' ? 'Inactivo' : 'Activo')}
            className={`relative w-12 h-6 rounded-full transition-colors ${estado === 'Activo' ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${estado === 'Activo' ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Permisos específicos */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Permisos Específicos</p>
          <div className="grid grid-cols-2 gap-2">
            {PERMISOS.map(p => (
              <label key={p} className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer">
                <input type="checkbox" className="accent-blue-600" defaultChecked={rol === 'Admin'} />
                {p}
              </label>
            ))}
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer mb-2">
            <input type="checkbox" checked={cambiarPass} onChange={e => setCambiarPass(e.target.checked)} className="accent-blue-600" />
            {esEdicion ? 'Cambiar contraseña' : 'Definir contraseña temporal'}
          </label>
          {cambiarPass && (
            <input type="password" value={nuevaPass} onChange={e => setNuevaPass(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
          )}
        </div>

        {/* Botones */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Mail size={13} /> Enviar Credenciales
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={!canGuardar}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={13} /> Guardar Usuario
            </button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
