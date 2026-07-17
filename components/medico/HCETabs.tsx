'use client';

import { useState } from 'react';
import { Check, FileText, Stethoscope, Tag, ClipboardList, History } from 'lucide-react';
import type { PacienteMedico, Anamnesis, ExamenFisico, DiagnosticoCIE10, Receta, SolicitudExamenes, ItemReceta, ItemExamen } from '@/lib/medico';
import AnamnesisForm from './AnamnesisForm';
import ExamenFisicoForm from './ExamenFisicoForm';
import DiagnosticoCIE10Form from './DiagnosticoCIE10Form';
import PlanTratamiento from './PlanTratamiento';
import ResultadosPanel from './ResultadosPanel';
import RecetaModal from './RecetaModal';
import ExamenesModal from './ExamenesModal';
import InterconsultaModal from './InterconsultaModal';

interface HCETabsProps {
  paciente: PacienteMedico;
  anamnesis: Anamnesis;
  examenFisico: ExamenFisico;
  diagnosticos: DiagnosticoCIE10[];
  indicaciones: string;
  procedimientos: string;
  recetas: Receta[];
  solicitudesExamenes: SolicitudExamenes[];
  interconsultas: InterconsultaData[];
  onAnamnesisChange: (a: Anamnesis) => void;
  onExamenChange: (e: ExamenFisico) => void;
  onDiagnosticosChange: (d: DiagnosticoCIE10[]) => void;
  onIndicacionesChange: (v: string) => void;
  onProcedimientosChange: (v: string) => void;
  onAddReceta: (items: ItemReceta[], estado: string) => void;
  onAddExamenes: (items: ItemExamen[], estado: string) => void;
  onAddInterconsulta: (data: InterconsultaData) => void;
}

interface InterconsultaData {
  especialidadDestino: string;
  medicoDestino: string;
  motivoInterconsulta: string;
  hallazgosRelevantes: string;
  preguntaEspecialista: string;
  urgencia: string;
  estado: string;
}

const TABS = [
  { id: 'anamnesis',    label: 'Anamnesis',     Icon: FileText      },
  { id: 'examen',       label: 'Examen Físico',  Icon: Stethoscope   },
  { id: 'diagnostico',  label: 'Diagnóstico',    Icon: Tag           },
  { id: 'plan',         label: 'Plan',           Icon: ClipboardList },
  { id: 'historial',    label: 'Historial',      Icon: History       },
] as const;

type TabId = typeof TABS[number]['id'];

export default function HCETabs({
  paciente, anamnesis, examenFisico, diagnosticos, indicaciones, procedimientos,
  recetas, solicitudesExamenes, interconsultas,
  onAnamnesisChange, onExamenChange, onDiagnosticosChange, onIndicacionesChange, onProcedimientosChange,
  onAddReceta, onAddExamenes, onAddInterconsulta,
}: HCETabsProps) {
  const [tab, setTab]             = useState<TabId>('anamnesis');
  const [showReceta, setShowReceta]       = useState(false);
  const [showExamenes, setShowExamenes]   = useState(false);
  const [showInterconsulta, setShowInterconsulta] = useState(false);

  function isComplete(id: TabId): boolean {
    if (id === 'anamnesis')   return !!anamnesis.motivoConsulta && !!anamnesis.enfermedadActual;
    if (id === 'examen')      return !!examenFisico.examenGeneral;
    if (id === 'diagnostico') return diagnosticos.length > 0;
    if (id === 'plan')        return !!indicaciones;
    return false;
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => {
            const active   = tab === id;
            const complete = isComplete(id);
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                  active ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={14} />
                {label}
                {complete && !active && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <Check size={9} className="text-green-600" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Contenido */}
        <div className="p-6">
          {tab === 'anamnesis' && (
            <AnamnesisForm data={anamnesis} onChange={onAnamnesisChange} />
          )}
          {tab === 'examen' && (
            <ExamenFisicoForm
              data={examenFisico}
              paciente={paciente}
              onChange={onExamenChange}
              onGuardar={() => {}}
            />
          )}
          {tab === 'diagnostico' && (
            <DiagnosticoCIE10Form diagnosticos={diagnosticos} onChange={onDiagnosticosChange} />
          )}
          {tab === 'plan' && (
            <PlanTratamiento
              indicaciones={indicaciones}
              procedimientos={procedimientos}
              recetasCount={recetas.length}
              examenesCount={solicitudesExamenes.length}
              interconsultasCount={interconsultas.length}
              onIndicacionesChange={onIndicacionesChange}
              onProcedimientosChange={onProcedimientosChange}
              onOpenReceta={() => setShowReceta(true)}
              onOpenExamenes={() => setShowExamenes(true)}
              onOpenInterconsulta={() => setShowInterconsulta(true)}
            />
          )}
          {tab === 'historial' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Atenciones Previas</h3>
                {paciente.atencionesPrevias.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">Sin atenciones previas</p>
                ) : (
                  <div className="space-y-2">
                    {paciente.atencionesPrevias.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{a.diagnostico}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{a.fecha} · {a.medico}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <ResultadosPanel pacienteId={paciente.id} pacienteDni={paciente.dni} />
            </div>
          )}
        </div>
      </div>

      {showReceta && (
        <RecetaModal
          onClose={() => setShowReceta(false)}
          onSave={onAddReceta}
          medicacionActual={anamnesis.medicacionActual}
          pacienteNombre={`${paciente.nombre} ${paciente.apellidos}`}
        />
      )}
      {showExamenes && (
        <ExamenesModal
          onClose={() => setShowExamenes(false)}
          onSave={onAddExamenes}
          pacienteNombre={`${paciente.nombre} ${paciente.apellidos}`}
        />
      )}
      {showInterconsulta && (
        <InterconsultaModal
          onClose={() => setShowInterconsulta(false)}
          onSave={onAddInterconsulta}
          pacienteNombre={`${paciente.nombre} ${paciente.apellidos}`}
          hallazgos={examenFisico.examenGeneral}
        />
      )}
    </>
  );
}
