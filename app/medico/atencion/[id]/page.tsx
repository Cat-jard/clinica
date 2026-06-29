'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { BedDouble } from 'lucide-react';
import PacienteHeader from '@/components/medico/PacienteHeader';
import HCETabs from '@/components/medico/HCETabs';
import EpicrisModal from '@/components/medico/EpicrisModal';
import type { Anamnesis, ExamenFisico, DiagnosticoCIE10 } from '@/lib/medico';
import { MOCK_PACIENTES } from '@/lib/medico';

export default function AtencionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pacienteBase = MOCK_PACIENTES.find(p => p.id === id);
  if (!pacienteBase) notFound();

  const [anamnesis, setAnamnesis]         = useState<Anamnesis>(pacienteBase.atencionActual.anamnesis);
  const [examenFisico, setExamenFisico]   = useState<ExamenFisico>(pacienteBase.atencionActual.examenFisico);
  const [diagnosticos, setDiagnosticos]   = useState<DiagnosticoCIE10[]>(pacienteBase.atencionActual.diagnosticos);
  const [indicaciones, setIndicaciones]   = useState('');
  const [procedimientos, setProcedimientos] = useState('');
  const [showEpicris, setShowEpicris]     = useState(false);
  const [toast, setToast]                 = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function handleGuardarBorrador() {
    showToast('✓ Borrador guardado correctamente');
  }

  function handleCerrarFirmar() {
    showToast('✓ Atención cerrada y firmada digitalmente. Documento guardado en la HCE.');
  }

  const paciente = { ...pacienteBase, atencionActual: { ...pacienteBase.atencionActual, anamnesis } };

  return (
    <div className="space-y-4">

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-right">
          {toast}
        </div>
      )}

      {/* Cabecera paciente */}
      <PacienteHeader
        paciente={paciente}
        diagnosticos={diagnosticos}
        alergias={anamnesis.antecedentesAlergicos}
        onGuardarBorrador={handleGuardarBorrador}
        onCerrarFirmar={handleCerrarFirmar}
      />

      {/* HCE con tabs */}
      <HCETabs
        paciente={paciente}
        anamnesis={anamnesis}
        examenFisico={examenFisico}
        diagnosticos={diagnosticos}
        indicaciones={indicaciones}
        procedimientos={procedimientos}
        onAnamnesisChange={setAnamnesis}
        onExamenChange={setExamenFisico}
        onDiagnosticosChange={setDiagnosticos}
        onIndicacionesChange={setIndicaciones}
        onProcedimientosChange={setProcedimientos}
      />

      {/* Botón Dar de Alta (hospitalización) */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowEpicris(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
        >
          <BedDouble size={16} />
          Dar de Alta — Generar Epicrisis
        </button>
      </div>

      {showEpicris && (
        <EpicrisModal paciente={paciente} onClose={() => setShowEpicris(false)} />
      )}
    </div>
  );
}
