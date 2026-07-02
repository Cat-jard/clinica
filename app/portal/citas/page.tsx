'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Clock, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import PortalShell from '@/components/portal/PortalShell';
import AgendarCitaModal from '@/components/portal/AgendarCitaModal';
import type { CitaPaciente } from '@/lib/paciente-portal';
import { getCitasPacienteApi, ESTADO_CITA_CONFIG } from '@/lib/paciente-portal';

export default function CitasPaciente() {
  const [citas, setCitas]   = useState<CitaPaciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) return;
        const user = await res.json();
        if (user?.dni) {
          const pRes = await fetch(`/api/pacientes/all?q=${encodeURIComponent(user.dni)}&size=1`);
          const pBody = await pRes.json().catch(() => ({}));
          const pages = pBody.data?.content || pBody.data || [];
          const paciente = Array.isArray(pages) ? pages[0] : null;
          if (paciente?.id) {
            const citasData = await getCitasPacienteApi(paciente.id);
            setCitas(citasData);
          }
        }
      } catch (err) {
        console.error('Error loading citas:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  const [tab, setTab]       = useState<'futuras' | 'pasadas'>('futuras');
  const [showAgendar, setShowAgendar] = useState(false);
  const [toast, setToast]   = useState('');
  const [aviso, setAviso]   = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function handleAgendar() {
    setShowAgendar(false);
    showToast('✓ Cita agendada correctamente. Te enviamos la confirmación.');
  }

  // Regla de oro #4: cancelar requiere 24h de anticipación
  function handleCancelar(id: string) {
    setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: 'Cancelada' } : c));
    showToast('✓ Cita cancelada');
  }

  const visibles = citas.filter(c => tab === 'futuras' ? c.esFutura : !c.esFutura);

  return (
    <PortalShell>
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl max-w-[90vw] text-center">
          {toast}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Mis Citas</h1>
        <button onClick={() => setShowAgendar(true)}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Agendar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['futuras', 'pasadas'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}>
            {t === 'futuras' ? 'Próximas' : 'Pasadas'}
          </button>
        ))}
      </div>

      {/* Aviso de cancelación */}
      {aviso && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex items-start gap-2">
          <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-amber-700">{aviso}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => { const id = aviso.split('|')[1]; handleCancelar(id); setAviso(''); }}
                className="text-[11px] font-semibold text-red-600">Cancelar de todos modos</button>
              <button onClick={() => setAviso('')} className="text-[11px] font-semibold text-gray-500">Mantener cita</button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Lista de citas */}
      {!loading && (
        <div className="space-y-3">
          {visibles.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-gray-900">{c.especialidad}</p>
                <p className="text-xs text-gray-500">{c.medico}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ESTADO_CITA_CONFIG[c.estado].className}`}>
                {c.estado}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-1">
              <span className="flex items-center gap-1"><CalendarDays size={13} /> {c.fecha}</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {c.hora}</span>
            </div>
            <p className="text-xs text-gray-400">{c.motivo}</p>

            {c.esFutura && c.estado !== 'Cancelada' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <button onClick={() => showToast('Reprogramación: elige nueva fecha y hora')}
                  className="flex-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-colors">
                  Reprogramar
                </button>
                <button onClick={() => setAviso('Recuerda: cancelar con menos de 24h de anticipación puede requerir llamar al hospital (116).|' + c.id)}
                  className="flex-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors">
                  Cancelar
                </button>
              </div>
            )}
          </div>
        ))}
          {visibles.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              No tienes citas {tab === 'futuras' ? 'próximas' : 'pasadas'}
            </div>
          )}
        </div>
      )}

      {showAgendar && <AgendarCitaModal onClose={() => setShowAgendar(false)} onAgendar={handleAgendar} />}
    </PortalShell>
  );
}
