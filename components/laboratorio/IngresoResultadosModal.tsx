'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Printer, XCircle } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import FirmaDigitalModal from '@/components/medico/FirmaDigitalModal';
import type { OrdenLab, ValorResultado } from '@/lib/laboratorio';
import { checkResultado, getUnidad, getValorRef } from '@/lib/laboratorio';

interface IngresoResultadosModalProps {
  orden: OrdenLab;
  onClose: () => void;
  onValidar: (ordenId: string, resultados: ValorResultado[]) => void;
}

export default function IngresoResultadosModal({ orden, onClose, onValidar }: IngresoResultadosModalProps) {
  const [resultados, setResultados] = useState<ValorResultado[]>(
    orden.examenes.map(e => ({
      examenId: e.id,
      examenNombre: e.nombre,
      resultado: '',
      unidad: getUnidad(e.nombre),
      valorRef: getValorRef(e.nombre),
      metodo: '',
      observaciones: '',
      critico: false,
      fueraRango: false,
      notificadoMedico: false,
    }))
  );

  const [showFirma, setShowFirma] = useState(false);
  const [validado,  setValidado]  = useState(false);
  const [rechazado, setRechazado] = useState(false);

  function updateResultado(idx: number, field: keyof ValorResultado, value: string | boolean) {
    setResultados(prev => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value };
      if (field === 'resultado') {
        const { critico, fueraRango } = checkResultado(item.examenNombre, value as string);
        item.critico    = critico;
        item.fueraRango = fueraRango;
        if (!critico) item.notificadoMedico = false;
      }
      next[idx] = item;
      return next;
    });
  }

  const hayCriticos    = resultados.some(r => r.critico);
  const sinNotificar   = resultados.some(r => r.critico && !r.notificadoMedico);
  const todoCompleto   = resultados.every(r => r.resultado.trim() !== '');
  const canValidar     = todoCompleto && !sinNotificar && !validado;

  function handleFirmaConfirm() {
    setValidado(true);
    onValidar(orden.id, resultados);
    setTimeout(onClose, 1400);
  }

  if (rechazado) {
    return (
      <ModalBase title={`Muestra Rechazada — ${orden.nroOrden}`} onClose={onClose} width="max-w-md">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <XCircle size={32} className="text-red-600" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Muestra rechazada</p>
          <p className="text-xs text-gray-500">Se ha notificado al médico para que solicite una nueva muestra.</p>
          <button onClick={onClose} className="mt-4 px-5 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">Cerrar</button>
        </div>
      </ModalBase>
    );
  }

  return (
    <>
      <ModalBase title={`Ingreso de Resultados — ${orden.nroOrden}`} onClose={onClose} width="max-w-4xl">
        <div className="p-6 space-y-6">

          {validado && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm font-semibold">
              <CheckCircle size={16} /> Resultados validados y firmados. Enviando a la HCE del paciente…
            </div>
          )}

          {/* ── Identificación de la muestra (solo lectura) ── */}
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-gray-400">Nº Orden</p>
              <p className="font-mono font-bold text-blue-700">{orden.nroOrden}</p>
            </div>
            <div>
              <p className="text-gray-400">Paciente</p>
              <p className="font-semibold text-gray-800">{orden.paciente.nombre} {orden.paciente.apellidos}</p>
            </div>
            <div>
              <p className="text-gray-400">Muestra</p>
              <p className="text-gray-700">{orden.muestra?.tipo ?? 'Sangre Venosa'}</p>
            </div>
            <div>
              <p className="text-gray-400">Recepción</p>
              <p className="font-mono text-gray-600">{orden.muestra?.fechaRecepcion ?? '—'}</p>
            </div>
          </div>

          {/* ── Alertas críticos sin notificar ── */}
          {hayCriticos && sinNotificar && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-xs font-medium">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              <span>Hay resultados críticos sin notificar al médico. Marque el checkbox de notificación para habilitar la validación.</span>
            </div>
          )}

          {/* ── Tabla de ingreso de resultados ── */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-medium">
                  <th className="py-2 pr-3 text-left">Examen</th>
                  <th className="py-2 pr-3 text-left">Resultado <span className="text-red-500">*</span></th>
                  <th className="py-2 pr-3 text-left">Unidad</th>
                  <th className="py-2 pr-3 text-left">Valor Referencia</th>
                  <th className="py-2 pr-3 text-left hidden lg:table-cell">Método</th>
                  <th className="py-2 pr-3 text-left hidden lg:table-cell">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {resultados.map((r, idx) => (
                  <tr
                    key={r.examenId}
                    className={
                      r.critico ? 'bg-red-50' :
                      r.fueraRango ? 'bg-amber-50' : ''
                    }
                  >
                    {/* Examen */}
                    <td className="py-2 pr-3 font-semibold text-gray-800 whitespace-nowrap">
                      {r.examenNombre}
                      {r.critico && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded uppercase">Crítico</span>
                      )}
                      {!r.critico && r.fueraRango && (
                        <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded uppercase">Fuera Rango</span>
                      )}
                    </td>

                    {/* Resultado */}
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        step="0.01"
                        value={r.resultado}
                        onChange={e => updateResultado(idx, 'resultado', e.target.value)}
                        className={`w-24 border rounded-lg px-2 py-1.5 text-center font-bold focus:outline-none focus:ring-2 ${
                          r.critico    ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-400' :
                          r.fueraRango ? 'border-amber-400 bg-amber-50 text-amber-700 focus:ring-amber-400' :
                          'border-gray-200 focus:ring-blue-400'
                        }`}
                        placeholder="0.00"
                      />
                      {/* Notificación obligatoria si crítico */}
                      {r.critico && (
                        <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={r.notificadoMedico}
                            onChange={e => updateResultado(idx, 'notificadoMedico', e.target.checked)}
                            className="accent-red-600"
                          />
                          <span className={`text-[10px] ${r.notificadoMedico ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}`}>
                            {r.notificadoMedico ? '✓ Médico notificado' : '⚠ Notificar médico (obligatorio)'}
                          </span>
                        </label>
                      )}
                    </td>

                    {/* Unidad */}
                    <td className="py-2 pr-3 text-gray-500">{r.unidad}</td>

                    {/* Valor Referencia */}
                    <td className="py-2 pr-3 text-gray-500 max-w-[140px]">{r.valorRef}</td>

                    {/* Método */}
                    <td className="py-2 pr-3 hidden lg:table-cell">
                      <input
                        type="text"
                        value={r.metodo ?? ''}
                        onChange={e => updateResultado(idx, 'metodo', e.target.value)}
                        placeholder="Método…"
                        className="w-28 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </td>

                    {/* Observaciones */}
                    <td className="py-2 pr-3 hidden lg:table-cell">
                      <input
                        type="text"
                        value={r.observaciones ?? ''}
                        onChange={e => updateResultado(idx, 'observaciones', e.target.value)}
                        placeholder="Observación…"
                        className="w-36 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Botones ── */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => setRechazado(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
              >
                <XCircle size={13} /> Rechazar Muestra
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Printer size={13} /> Imprimir Informe
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Guardar Borrador
              </button>
              <button
                onClick={() => setShowFirma(true)}
                disabled={!canValidar}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={13} /> Validar y Firmar Resultados
              </button>
            </div>
          </div>

          {!todoCompleto && (
            <p className="text-[11px] text-amber-600 text-right">* Complete todos los resultados para habilitar la validación</p>
          )}
        </div>
      </ModalBase>

      {showFirma && (
        <FirmaDigitalModal
          titulo="Validar y Firmar Resultados"
          descripcion={`Está a punto de validar los resultados de la orden ${orden.nroOrden} para ${orden.paciente.nombre} ${orden.paciente.apellidos}. Esta acción tiene validez legal y clínica.`}
          onConfirm={handleFirmaConfirm}
          onClose={() => setShowFirma(false)}
        />
      )}
    </>
  );
}
