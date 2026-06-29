'use client';

import { useState } from 'react';
import { ShieldCheck, X, Lock } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';

interface FirmaDigitalModalProps {
  titulo: string;
  descripcion: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function FirmaDigitalModal({ titulo, descripcion, onConfirm, onClose }: FirmaDigitalModalProps) {
  const [pin, setPin] = useState('');
  const [revisado, setRevisado] = useState(false);

  const canFirmar = pin.length >= 4 && revisado;

  function handleFirmar() {
    if (!canFirmar) return;
    onConfirm();
    onClose();
  }

  return (
    <ModalBase title="Firma Digital" onClose={onClose} width="max-w-md">
      <div className="p-6 space-y-5">

        {/* Icono y titulo */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <ShieldCheck size={28} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-base">{titulo}</h3>
          <p className="text-sm text-gray-500">{descripcion}</p>
        </div>

        {/* Badge normativa */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Lock size={13} className="text-blue-500 flex-shrink-0" />
          <p className="text-[11px] text-blue-700 font-medium">
            Firma Digital · Válida según RM N°164-2025/MINSA y Ley 30024 (RENHICE)
          </p>
        </div>

        {/* PIN */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            PIN de Firma Digital <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Ingrese su PIN (4-6 dígitos)"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center text-lg"
            maxLength={6}
          />
          <p className="text-[10px] text-gray-400 mt-1">Mínimo 4 dígitos numéricos</p>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={revisado}
            onChange={e => setRevisado(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-600">
            Confirmo que he revisado la información y que este documento es correcto y completo.
          </span>
        </label>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleFirmar}
            disabled={!canFirmar}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShieldCheck size={15} />
            Firmar Documento
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
