'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';

const ESPECIALIDADES = ['Cardiología', 'Neurología', 'Gastroenterología', 'Neumología', 'Endocrinología', 'Nefrología', 'Dermatología', 'Traumatología', 'Ginecología', 'Pediatría', 'Psiquiatría', 'Cirugía General', 'Urología', 'Oftalmología'];
const MEDICOS_POR_ESP: Record<string, string[]> = {
  'Cardiología':    ['Dr. Roberto Chávez', 'Dra. María Paredes'],
  'Neurología':     ['Dr. Juan Mendoza'],
  'Gastroenterología': ['Dra. Carmen Ríos', 'Dr. Álvaro Soto'],
  'Neumología':     ['Dr. Felipe Vargas'],
  'Endocrinología': ['Dra. Paola Cruz'],
  'Nefrología':     ['Dr. Mario Huanca'],
  default: ['Dr. Consultor Disponible'],
};

interface InterconsultaModalProps {
  onClose: () => void;
  pacienteNombre: string;
  hallazgos: string;
}

export default function InterconsultaModal({ onClose, pacienteNombre, hallazgos }: InterconsultaModalProps) {
  const [esp, setEsp]           = useState('');
  const [medico, setMedico]     = useState('');
  const [motivo, setMotivo]     = useState('');
  const [hallaz, setHallaz]     = useState(hallazgos);
  const [pregunta, setPregunta] = useState('');
  const [urgencia, setUrgencia] = useState<'Normal' | 'Urgente'>('Normal');
  const [enviada, setEnviada]   = useState(false);

  const medicos = MEDICOS_POR_ESP[esp] ?? MEDICOS_POR_ESP['default'];
  const canEnviar = esp && medico && motivo.trim() && hallaz.trim() && pregunta.trim();

  function handleEnviar() {
    if (!canEnviar) return;
    setEnviada(true);
  }

  if (enviada) {
    return (
      <ModalBase title="Interconsulta Enviada" onClose={onClose} width="max-w-md">
        <div className="p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
            <CheckCircle size={32} className="text-teal-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Interconsulta enviada exitosamente</h3>
            <p className="text-sm text-gray-500 mt-1">
              {medico} de {esp} ha recibido la solicitud para {pacienteNombre}.
              <br />Urgencia: <b className={urgencia === 'Urgente' ? 'text-red-600' : 'text-gray-700'}>{urgencia}</b>
            </p>
          </div>
          <button onClick={onClose} className="px-6 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors">
            Cerrar
          </button>
        </div>
      </ModalBase>
    );
  }

  return (
    <ModalBase title="Solicitud de Interconsulta" onClose={onClose} width="max-w-2xl">
      <div className="p-6 space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Especialidad Destino *</label>
            <select value={esp} onChange={e => { setEsp(e.target.value); setMedico(''); }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Seleccionar especialidad…</option>
              {ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Médico Destino *</label>
            <select value={medico} onChange={e => setMedico(e.target.value)} disabled={!esp}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-400">
              <option value="">Seleccionar médico…</option>
              {medicos.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Motivo de Interconsulta *</label>
          <textarea rows={2} value={motivo} onChange={e => setMotivo(e.target.value)}
            placeholder="Explique detalladamente por qué se deriva al paciente…"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Hallazgos Relevantes *</label>
          <textarea rows={2} value={hallaz} onChange={e => setHallaz(e.target.value)}
            placeholder="Resumen de hallazgos clínicos relevantes para el especialista…"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pregunta al Especialista *</label>
          <textarea rows={2} value={pregunta} onChange={e => setPregunta(e.target.value)}
            placeholder="¿Qué necesita saber el especialista? Ej: ¿Requiere cirugía? ¿Ajuste de medicación?"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urgencia *</label>
          <div className="flex gap-3">
            {(['Normal', 'Urgente'] as const).map(u => (
              <label key={u} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${urgencia === u ? (u === 'Urgente' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-teal-50 border-teal-300 text-teal-700') : 'border-gray-200 text-gray-600'}`}>
                <input type="radio" value={u} checked={urgencia === u} onChange={() => setUrgencia(u)} className="hidden" />
                {u}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
          <button onClick={handleEnviar} disabled={!canEnviar}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Enviar Interconsulta
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
