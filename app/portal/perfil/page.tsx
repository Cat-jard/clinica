'use client';

import { useState, useEffect } from 'react';
import { User, Lock, ShieldCheck, Bell, FileText, Trash2, Save, Loader2 } from 'lucide-react';
import PortalShell from '@/components/portal/PortalShell';
import { getPerfilPacienteApi, type PerfilPaciente } from '@/lib/paciente-portal';

export default function PerfilPaciente() {
  const [perfil, setPerfil] = useState<PerfilPaciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfa, setMfa]             = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms]   = useState(false);
  const [toast, setToast]         = useState('');

  useEffect(() => {
    getPerfilPacienteApi().then(setPerfil).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  return (
    <PortalShell>
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl max-w-[90vw] text-center">
          {toast}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {!loading && !perfil && (
        <div className="text-center py-12 text-sm text-gray-400">No se pudo cargar el perfil.</div>
      )}

      {perfil && (<>
      {/* Header de perfil */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-white">{perfil.nombre[0]}{perfil.apellidos[0]}</span>
        </div>
        <h1 className="text-lg font-bold text-gray-900">{perfil.nombre} {perfil.apellidos}</h1>
        <p className="text-xs text-gray-500">DNI: {perfil.dni}</p>
      </div>

      {/* Datos personales */}
      <Section Icon={User} title="Datos Personales">
        <ReadField label="Fecha de Nacimiento" value={`${perfil.fechaNac} (${perfil.edad} años)`} />
        <ReadField label="Sexo" value={perfil.sexo} />
        <EditField label="Correo Electrónico" value={perfil.email} />
        <EditField label="Teléfono Celular" value={perfil.telefono} />
        <EditField label="Dirección" value={perfil.direccion} />
        <button onClick={() => showToast('✓ Cambios guardados')}
          className="w-full flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors mt-2">
          <Save size={14} /> Guardar Cambios
        </button>
      </Section>

      {/* Seguridad */}
      <Section Icon={Lock} title="Seguridad de la Cuenta">
        <button onClick={() => showToast('Se requiere verificación MFA para cambiar la contraseña')}
          className="w-full text-left flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors">
          <span>Cambiar contraseña</span>
          <Lock size={14} className="text-gray-400" />
        </button>
        <ToggleRow label="Autenticación de Dos Factores (MFA)" desc="Código por SMS o correo" value={mfa} onToggle={() => setMfa(v => !v)} />
      </Section>

      {/* Notificaciones */}
      <Section Icon={Bell} title="Notificaciones">
        <ToggleRow label="Por Correo Electrónico" desc="Citas, resultados, mensajes" value={notifEmail} onToggle={() => setNotifEmail(v => !v)} />
        <ToggleRow label="Por SMS / WhatsApp" desc="Recordatorios de citas" value={notifSms} onToggle={() => setNotifSms(v => !v)} />
      </Section>

      {/* Consentimientos ARCO (Ley 29733) */}
      <Section Icon={FileText} title="Gestión de Consentimientos">
        <ConsentRow label="Tratamiento de Datos Personales" estado="Firmado" onRevocar={() => showToast('Solicitud de revocación registrada')} />
        <ConsentRow label="Consentimiento para Telemedicina" estado="Firmado" onRevocar={() => showToast('Solicitud de revocación registrada')} />
        <p className="text-[11px] text-gray-400 mt-1">Ejerce tus derechos ARCO: Acceso, Rectificación, Cancelación y Oposición (Ley 29733).</p>
      </Section>

      {/* Eliminar cuenta */}
      <button onClick={() => showToast('Proceso de eliminación iniciado (sujeto a plazos legales)')}
        className="w-full flex items-center justify-center gap-1.5 text-red-600 border border-red-200 rounded-2xl py-3 text-sm font-medium hover:bg-red-50 transition-colors mb-2">
        <Trash2 size={14} /> Solicitar Eliminación de Cuenta
      </button>
    </>)}
    </PortalShell>
  );
}

function Section({ Icon, title, children }: { Icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-blue-600" />
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className="text-sm text-gray-700">{value} <span className="text-[10px] text-gray-400">(no editable)</span></p>
    </div>
  );
}

function EditField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-[11px] text-gray-400 mb-1">{label}</label>
      <input defaultValue={value}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );
}

function ToggleRow({ label, desc, value, onToggle }: { label: string; desc: string; value: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        <p className="text-[10px] text-gray-400">{desc}</p>
      </div>
      <button onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-green-500' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

function ConsentRow({ label, estado, onRevocar }: { label: string; estado: string; onRevocar: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-2">
        <ShieldCheck size={14} className="text-green-600" />
        <div>
          <p className="text-sm text-gray-700">{label}</p>
          <p className="text-[10px] text-green-600">{estado}</p>
        </div>
      </div>
      <button onClick={onRevocar} className="text-[11px] font-medium text-red-600">Revocar</button>
    </div>
  );
}
