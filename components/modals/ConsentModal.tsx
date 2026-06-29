'use client';

import { useRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ModalBase from './ModalBase';
import { useToast } from '@/context/ToastContext';

const LEGAL_TEXT = `CONSENTIMIENTO INFORMADO PARA EL TRATAMIENTO DE DATOS PERSONALES EN SALUD

De conformidad con la Ley N° 29733 – Ley de Protección de Datos Personales y su Reglamento (D.S. N° 003-2013-JUS), se le informa lo siguiente:

RESPONSABLE DEL TRATAMIENTO
La institución de salud que lo atiende es la responsable del banco de datos personales denominado "HISTORIA CLÍNICA ELECTRÓNICA", inscrito en el Registro Nacional de Protección de Datos Personales (RNPDP).

FINALIDAD DEL TRATAMIENTO
Sus datos personales y de salud serán tratados con las siguientes finalidades:
• Prestación de servicios de salud y seguimiento clínico.
• Comunicación con familiares o responsables designados.
• Facturación y gestión administrativa.
• Cumplimiento de obligaciones legales ante el MINSA, SIS, EsSalud u otras entidades reguladoras.
• Investigación científica o estadística (solo en forma anonimizada).

DERECHOS ARCO
Usted tiene derecho a:
• Acceder a sus datos personales en cualquier momento.
• Rectificar datos inexactos o incompletos.
• Cancelar sus datos cuando no sean necesarios para la finalidad del tratamiento.
• Oponerse al tratamiento de sus datos en los casos previstos por ley.

Para ejercer sus derechos, diríjase a la Unidad de Admisión presentando su DNI.

CONFIDENCIALIDAD
Su información médica es estrictamente confidencial. Solo podrá ser compartida con otros profesionales de la salud que participen en su atención o ante requerimiento de autoridad competente.

Normativa aplicable: Ley N°29733, NTS N°139-MINSA/2018/DGAIN, Ley N°30024 (RENHICE).`;

interface Props {
  patientName: string;
  onClose: () => void;
  onAccepted: () => void;
}

export default function ConsentModal({ patientName, onClose, onAccepted }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [checked, setChecked] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.preventDefault();
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
    e.preventDefault();
  }

  function stopDraw() { setIsDrawing(false); }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  }

  async function handleAccept() {
    if (!checked) { error('Debe aceptar el consentimiento antes de continuar.'); return; }
    if (!hasSigned) { error('El paciente debe firmar antes de continuar.'); return; }
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    success(`Consentimiento de ${patientName} registrado correctamente.`);
    onAccepted();
  }

  const canAccept = checked && hasSigned && !loading;

  return (
    <ModalBase title="Consentimiento Informado" onClose={onClose} width="max-w-2xl">
      <div className="p-6 space-y-5">

        {/* Patient name */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
          <p className="text-xs text-blue-600">
            Paciente: <span className="font-semibold">{patientName}</span>
          </p>
        </div>

        {/* Legal text */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Texto Legal — Ley N°29733
          </p>
          <div className="h-44 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
            {LEGAL_TEXT}
          </div>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer"
            aria-label="Acepto el tratamiento de mis datos personales"
          />
          <span className="text-sm text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">
            He leído y comprendido la información proporcionada, y autorizo el tratamiento de mis datos
            personales para fines de atención médica, de acuerdo con la Ley N°29733.
          </span>
        </label>

        {/* Signature canvas */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Firma del Paciente
            </p>
            <button
              onClick={clearCanvas}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Limpiar firma
            </button>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-white relative">
            <canvas
              ref={canvasRef}
              width={600}
              height={140}
              className="w-full touch-none cursor-crosshair"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            {!hasSigned && (
              <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-300 pointer-events-none">
                Firme aquí con el mouse o dedo (touch)
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={handleAccept}
            disabled={!canAccept}
            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Registrando…' : 'Aceptar y Firmar'}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
