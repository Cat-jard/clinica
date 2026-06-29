'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import ModalBase from './ModalBase';
import { useToast } from '@/context/ToastContext';

type Aseguradora = 'SIS' | 'EsSalud' | 'EPS' | 'Particular';
type VerifyStatus = 'idle' | 'loading' | 'verified' | 'failed';

const ASEGURADORAS: Aseguradora[] = ['SIS', 'EsSalud', 'EPS', 'Particular'];

interface Props {
  patientName: string;
  onClose: () => void;
}

export default function CoverageModal({ patientName, onClose }: Props) {
  const [aseguradora, setAseguradora] = useState<Aseguradora | ''>('');
  const [nroAfiliado, setNroAfiliado] = useState('');
  const [status, setStatus] = useState<VerifyStatus>('idle');
  const { success, error } = useToast();

  const needsAfiliado = aseguradora && aseguradora !== 'Particular';

  async function handleVerify() {
    if (!aseguradora) { error('Seleccione una aseguradora.'); return; }
    if (needsAfiliado && !nroAfiliado.trim()) { error('Ingrese el número de afiliado.'); return; }

    setStatus('loading');
    // Mock API — 80% success rate
    await new Promise((r) => setTimeout(r, 1800));
    const ok = Math.random() > 0.2;
    setStatus(ok ? 'verified' : 'failed');
    if (ok) success(`Cobertura ${aseguradora} verificada para ${patientName}.`);
    else error(`No se encontró cobertura activa en ${aseguradora}. Verifique el número de afiliado.`);
  }

  return (
    <ModalBase title="Verificar Cobertura" onClose={onClose} width="max-w-md">
      <div className="p-6 space-y-4">

        {/* Patient */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
          <p className="text-xs text-blue-600">Paciente: <span className="font-semibold">{patientName}</span></p>
        </div>

        {/* Aseguradora */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Aseguradora <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ASEGURADORAS.map((a) => (
              <button
                key={a}
                onClick={() => { setAseguradora(a); setStatus('idle'); setNroAfiliado(''); }}
                className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  aseguradora === a
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Nro afiliado (condicional) */}
        {needsAfiliado && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              N° de Afiliado <span className="text-red-500">*</span>
            </label>
            <input
              value={nroAfiliado}
              onChange={(e) => { setNroAfiliado(e.target.value); setStatus('idle'); }}
              placeholder={aseguradora === 'SIS' ? 'Ej: SIS-123456789' : 'Número de afiliado'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Status result */}
        {status === 'verified' && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle2 size={16} className="text-green-500" />
            <div>
              <p className="text-sm font-semibold text-green-700">Cobertura Verificada</p>
              <p className="text-xs text-green-600">{aseguradora} · Afiliado activo</p>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <XCircle size={16} className="text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-700">Sin Cobertura Activa</p>
              <p className="text-xs text-red-600">Verifique el número de afiliado o seleccione "Particular".</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cerrar
          </button>
          <button
            onClick={handleVerify}
            disabled={status === 'loading'}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {status === 'loading' && <Loader2 size={14} className="animate-spin" />}
            {status === 'loading' ? 'Verificando…' : 'Verificar'}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
