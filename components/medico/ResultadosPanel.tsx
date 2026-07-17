'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, FlaskConical, FileText, Eye, Loader2 } from 'lucide-react';
import type { OrdenLab } from '@/lib/laboratorio';
import type { EstudioImagen } from '@/lib/radiologia';
import { listarOrdenesLab } from '@/lib/laboratorio';
import { listarEstudios } from '@/lib/radiologia';
import VerResultadoRadModal from './VerResultadoRadModal';

interface ResultadosPanelProps {
  pacienteId: string;
  pacienteDni: string;
}

type Tab = 'laboratorio' | 'imagenes';

export default function ResultadosPanel({ pacienteId, pacienteDni }: ResultadosPanelProps) {
  const [tab, setTab]             = useState<Tab>('laboratorio');
  const [ordenes, setOrdenes]     = useState<OrdenLab[]>([]);
  const [estudios, setEstudios]   = useState<EstudioImagen[]>([]);
  const [loading, setLoading]     = useState(true);
  const [estudioVer, setEstudioVer] = useState<EstudioImagen | null>(null);

  useEffect(() => {
    Promise.all([
      listarOrdenesLab().catch(() => [] as OrdenLab[]),
      listarEstudios().catch(() => [] as EstudioImagen[]),
    ]).then(([ords, ests]) => {
      setOrdenes(ords.filter(o => o.paciente.dni === pacienteDni));
      setEstudios(ests.filter(e => e.paciente.dni === pacienteDni));
    }).finally(() => setLoading(false));
  }, [pacienteDni]);

  const labValidos = ordenes.filter(o => o.estado === 'Resultados Pendientes' || o.estado === 'Validado');

  if (loading) {
    return <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button onClick={() => setTab('laboratorio')} className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${tab === 'laboratorio' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <FlaskConical size={14} /> Laboratorio {labValidos.length > 0 && <span className="ml-1 w-4 h-4 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center">{labValidos.length}</span>}
        </button>
        <button onClick={() => setTab('imagenes')} className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${tab === 'imagenes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <FileText size={14} /> Imagenología {estudios.length > 0 && <span className="ml-1 w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">{estudios.length}</span>}
        </button>
      </div>

      {tab === 'laboratorio' && (
        <>
          {labValidos.length === 0 ? (
            <div className="text-center py-6">
              <FlaskConical size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No hay resultados de laboratorio para este paciente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {labValidos.map(o => o.examenes.map(ex => {
                const estadoOk = o.estado === 'Validado';
                return (
                  <div key={ex.id} className={`flex items-center gap-3 p-3 rounded-xl border ${estadoOk ? 'bg-white border-gray-100' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex-shrink-0">{estadoOk ? <CheckCircle size={13} className="text-green-500" /> : <Clock size={13} className="text-yellow-500" />}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{ex.nombre}</p>
                      <p className="text-[10px] text-gray-400">{o.nroOrden} · {o.fechaSolicitud}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${estadoOk ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {o.estado === 'Validado' ? 'Validado' : 'Pendiente'}
                    </span>
                  </div>
                );
              }))}
            </div>
          )}
        </>
      )}

      {tab === 'imagenes' && (
        <>
          {estudios.length === 0 ? (
            <div className="text-center py-6">
              <FileText size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No hay estudios de imagenología para este paciente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {estudios.map(e => {
                const tieneInforme = !!e.informe;
                return (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{e.tipoEstudio}</p>
                      <p className="text-[10px] text-gray-400">{e.modalidad} · {e.fechaEstudio}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {e.esCritico && <AlertTriangle size={13} className="text-red-500" />}
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${e.estado === 'Firmado' || e.estado === 'Revisado' ? 'bg-green-100 text-green-700' : e.estado === 'Borrador' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {e.estado}
                      </span>
                      <button
                        onClick={() => setEstudioVer(e)}
                        className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <Eye size={12} /> {tieneInforme ? 'Ver Resultado' : 'Ver Estudio'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {labValidos.some(o => o.estado === 'Validado' && o.examenes.some(ex => checkCritico(ex.nombre, ''))) && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700 font-medium">
            Hay resultados con valores críticos que requieren atención inmediata.
          </p>
        </div>
      )}

      {estudioVer && (
        <VerResultadoRadModal estudio={estudioVer} onClose={() => setEstudioVer(null)} />
      )}
    </div>
  );
}

function checkCritico(nombre: string, _resultado: string): boolean {
  return ['Hemoglobina', 'Glucosa', 'Potasio'].includes(nombre);
}
