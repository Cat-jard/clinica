'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { BedDouble, Loader2 } from 'lucide-react';
import PacienteHeader from '@/components/medico/PacienteHeader';
import HCETabs from '@/components/medico/HCETabs';
import EpicrisModal from '@/components/medico/EpicrisModal';
import type { Anamnesis, ExamenFisico, DiagnosticoCIE10, PacienteMedico, GuardarAtencionInput, AtencionResponse, Receta, SolicitudExamenes, ItemReceta, ItemExamen, Interconsulta } from '@/lib/medico';
import { getPacienteMedicoApi, buscarOCrearAtencionApi, guardarAtencionApi, firmarAtencionApi, calcEdad } from '@/lib/medico';
import { marcarAtendidoApi } from '@/lib/triaje';
import { authFetch, getUsuario } from '@/lib/auth';

const anamnesisVacio: Anamnesis = {
  motivoConsulta: '', enfermedadActual: '', antecedentesPatologicos: [],
  antecedentesQuirurgicos: '', antecedentesAlergicos: '', antecedentesFamiliares: '',
  habitos: [], medicacionActual: '',
};
const examenFisicoVacio: ExamenFisico = {
  examenGeneral: '', cabezaCuello: '', toraxPulmones: '',
  corazon: '', abdomen: '', extremidades: '', neurologico: '', otros: '',
};

export default function AtencionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [pacienteBase, setPacienteBase] = useState<PacienteMedico | null | undefined>(undefined);
  const [atencionId, setAtencionId]     = useState<string | null>(null);
  const [saving, setSaving]             = useState(false);
  const [anamnesis, setAnamnesis]         = useState<Anamnesis>({ motivoConsulta: '', enfermedadActual: '', antecedentesPatologicos: [], antecedentesQuirurgicos: '', antecedentesAlergicos: '', antecedentesFamiliares: '', habitos: [], medicacionActual: '' });
  const [examenFisico, setExamenFisico]   = useState<ExamenFisico>({ examenGeneral: '', cabezaCuello: '', toraxPulmones: '', corazon: '', abdomen: '', extremidades: '', neurologico: '', otros: '' });
  const [diagnosticos, setDiagnosticos]   = useState<DiagnosticoCIE10[]>([]);
  const [indicaciones, setIndicaciones]   = useState('');
  const [procedimientos, setProcedimientos] = useState('');
  const [recetas, setRecetas]               = useState<Receta[]>([]);
  const [solicitudesExamenes, setSolicitudesExamenes] = useState<SolicitudExamenes[]>([]);
  const [interconsultas, setInterconsultas] = useState<Interconsulta[]>([]);
  const [showEpicris, setShowEpicris]       = useState(false);
  const [toast, setToast]                   = useState('');
  const [firmado, setFirmado]               = useState(false);

  useEffect(() => {
    getPacienteMedicoApi(id).then(async (p) => {
      if (p) {
        const draft: AtencionResponse | null = await buscarOCrearAtencionApi(id);
        if (draft) {
          setAtencionId(draft.id);
          if (draft.anamnesis) setAnamnesis({ ...anamnesisVacio, ...draft.anamnesis });
          if (draft.examenFisico) setExamenFisico({ ...examenFisicoVacio, ...draft.examenFisico });
          if (draft.diagnosticos) setDiagnosticos(draft.diagnosticos);
          if (draft.indicacionesGenerales) setIndicaciones(draft.indicacionesGenerales);
          if (draft.procedimientosRealizados) setProcedimientos(draft.procedimientosRealizados);
          if (draft.recetas?.length) setRecetas(draft.recetas);
          if (draft.solicitudesExamenes?.length) setSolicitudesExamenes(draft.solicitudesExamenes);
          if (draft.interconsultas?.length) setInterconsultas(draft.interconsultas as Interconsulta[]);
          if (draft.estado === 'FIRMADA') setFirmado(true);
        }
      }
      setPacienteBase(p);
    }).catch(() => setPacienteBase(null));
  }, [id]);

  if (pacienteBase === undefined) return <div className="p-8 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-400" /></div>;
  if (!pacienteBase) notFound();

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function handleAddReceta(items: ItemReceta[], estado: string) {
    setRecetas(prev => [...prev, {
      id: `temp-${Date.now()}`, pacienteId: id, items,
      estado: estado === 'FIRMADA' ? 'Firmada' : 'Borrador',
    }]);
  }

  function handleAddExamenes(items: ItemExamen[], estado: string) {
    setSolicitudesExamenes(prev => [...prev, {
      id: `temp-${Date.now()}`, pacienteId: id, items,
      estado: estado === 'FIRMADA' ? 'Firmada' : 'Borrador',
    }]);
  }

  function handleAddInterconsulta(data: { especialidadDestino: string; medicoDestino: string; motivoInterconsulta: string; hallazgosRelevantes: string; preguntaEspecialista: string; urgencia: string; estado: string }) {
    setInterconsultas(prev => [...prev, { ...data, id: `temp-${Date.now()}`, urgencia: data.urgencia as 'Normal' | 'Urgente', estado: data.estado as 'Enviada' | 'Respondida' | 'Cancelada' }]);
  }

  async function handleGuardarBorrador() {
    if (!atencionId) return;
    setSaving(true);
    const payload: GuardarAtencionInput = {
      anamnesis,
      examenFisico,
      diagnosticos,
      indicacionesGenerales: indicaciones,
      procedimientosRealizados: procedimientos,
      recetas: recetas.length > 0 ? recetas : undefined,
      solicitudesExamenes: solicitudesExamenes.length > 0 ? solicitudesExamenes : undefined,
      interconsultas: interconsultas.length > 0 ? interconsultas : undefined,
    };
    const ok = await guardarAtencionApi(atencionId, payload);
    setSaving(false);
    showToast(ok ? '✓ Borrador guardado correctamente' : '✗ Error al guardar borrador');
  }

  async function handleCerrarFirmar() {
    if (!atencionId) return;
    setSaving(true);
    const payload: GuardarAtencionInput = {
      anamnesis,
      examenFisico,
      diagnosticos,
      indicacionesGenerales: indicaciones,
      procedimientosRealizados: procedimientos,
      recetas: recetas.length > 0 ? recetas : undefined,
      solicitudesExamenes: solicitudesExamenes.length > 0 ? solicitudesExamenes : undefined,
      interconsultas: interconsultas.length > 0 ? interconsultas : undefined,
    };
    const saved = await guardarAtencionApi(atencionId, payload);
    if (!saved) {
      setSaving(false);
      showToast('✗ Error al guardar antes de firmar');
      return;
    }
    const signed = await firmarAtencionApi(atencionId, 'data:image/png;base64,firma-placeholder');
    if (signed) {
      const user = getUsuario();
      if (user && solicitudesExamenes.length > 0 && pacienteBase) {
        for (const sol of solicitudesExamenes) {
          await authFetch('/api/solicitudes-examenes', {
            method: 'POST',
            body: JSON.stringify({
              atencionId,
              paciente: {
                id: pacienteBase.id,
                nombre: pacienteBase.nombre,
                apellidos: pacienteBase.apellidos,
                dni: pacienteBase.dni,
                edad: calcEdad(pacienteBase.fechaNac),
                sexo: pacienteBase.sexo,
                nroHistoria: pacienteBase.nroHistoria,
              },
              medicoSolicitante: `Dr. ${user.nombre} ${user.apellidos}`,
              especialidadMedico: user.especialidad || 'Medicina General',
              items: sol.items.map(item => ({
                id: item.id.startsWith('temp-') ? undefined : item.id,
                tipo: item.tipo,
                nombre: item.nombre,
                origenMuestra: item.origenMuestra || null,
                ayuno: item.ayuno || null,
                urgente: item.urgente,
                indicaciones: item.indicaciones || null,
              })),
            }),
          }).catch(err => console.error("Error sending lab request:", err));
        }
      }
      await marcarAtendidoApi(id);
      setFirmado(true);
    }
    setSaving(false);
    if (signed) {
      showToast('✓ Atención firmada — Redirigiendo al dashboard...');
      setTimeout(() => router.push('/medico'), 1500);
    } else {
      showToast('✗ Error al firmar la atención');
    }
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
        firmado={firmado}
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
        recetas={recetas}
        solicitudesExamenes={solicitudesExamenes}
        interconsultas={interconsultas}
        onAnamnesisChange={setAnamnesis}
        onExamenChange={setExamenFisico}
        onDiagnosticosChange={setDiagnosticos}
        onIndicacionesChange={setIndicaciones}
        onProcedimientosChange={setProcedimientos}
        onAddReceta={handleAddReceta}
        onAddExamenes={handleAddExamenes}
        onAddInterconsulta={handleAddInterconsulta}
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
