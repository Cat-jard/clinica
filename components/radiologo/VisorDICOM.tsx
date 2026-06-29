'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ZoomIn, Move, Sun, Ruler, RotateCw, FlipHorizontal,
  RefreshCw, Loader2, ChevronUp, ChevronDown,
} from 'lucide-react';
import type { EstudioImagen } from '@/lib/radiologia';

type Herramienta = 'zoom' | 'pan' | 'ventana' | 'medicion';

interface VisorDICOMProps {
  estudio: EstudioImagen;
}

export default function VisorDICOM({ estudio }: VisorDICOMProps) {
  const serie = estudio.series[0];
  const totalCortes = serie?.numCortes ?? 1;

  const [cargando, setCargando]   = useState(true);
  const [progreso, setProgreso]   = useState(0);
  const [corte, setCorte]         = useState(Math.ceil(totalCortes / 2));
  const [herramienta, setHerr]    = useState<Herramienta>('pan');

  // Transformaciones de imagen
  const [zoom, setZoom]           = useState(1);
  const [offset, setOffset]       = useState({ x: 0, y: 0 });
  const [brillo, setBrillo]       = useState(100);   // %
  const [contraste, setContraste] = useState(100);   // %
  const [rotacion, setRotacion]   = useState(0);     // grados
  const [flip, setFlip]           = useState(false);

  const dragRef = useRef<{ x: number; y: number; oamx: number; ox: number; oy: number; b: number; c: number } | null>(null);

  // Simula la carga progresiva de imágenes DICOM pesadas
  useEffect(() => {
    setCargando(true);
    setProgreso(0);
    const id = setInterval(() => {
      setProgreso(p => {
        if (p >= 100) { clearInterval(id); setCargando(false); return 100; }
        return p + 10;
      });
    }, 80);
    return () => clearInterval(id);
  }, [estudio.id]);

  function reset() {
    setZoom(1); setOffset({ x: 0, y: 0 });
    setBrillo(100); setContraste(100);
    setRotacion(0); setFlip(false);
  }

  function onWheel(e: React.WheelEvent) {
    if (herramienta === 'zoom') {
      setZoom(z => Math.min(5, Math.max(0.5, z - e.deltaY * 0.001)));
    } else {
      // Navegar entre cortes con la rueda
      setCorte(c => Math.min(totalCortes, Math.max(1, c + (e.deltaY > 0 ? 1 : -1))));
    }
  }

  function onMouseDown(e: React.MouseEvent) {
    dragRef.current = {
      x: e.clientX, y: e.clientY,
      oamx: 0, ox: offset.x, oy: offset.y,
      b: brillo, c: contraste,
    };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    if (herramienta === 'pan') {
      setOffset({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy });
    } else if (herramienta === 'ventana') {
      // Ajuste de ventana: horizontal = contraste, vertical = brillo
      setContraste(Math.min(200, Math.max(20, dragRef.current.c + dx * 0.5)));
      setBrillo(Math.min(200, Math.max(20, dragRef.current.b - dy * 0.5)));
    }
  }
  function onMouseUp() { dragRef.current = null; }

  const TOOLS: { id: Herramienta; Icon: typeof ZoomIn; label: string }[] = [
    { id: 'zoom',     Icon: ZoomIn, label: 'Zoom (rueda)' },
    { id: 'pan',      Icon: Move,   label: 'Desplazar'    },
    { id: 'ventana',  Icon: Sun,    label: 'Brillo/Contraste' },
    { id: 'medicion', Icon: Ruler,  label: 'Medición'     },
  ];

  return (
    <div className="flex flex-col h-full bg-black rounded-2xl overflow-hidden border border-gray-800">
      {/* Barra de herramientas */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[#111] border-b border-gray-800">
        {TOOLS.map(({ id, Icon, label }) => (
          <button
            key={id}
            onClick={() => setHerr(id)}
            title={label}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              herramienta === id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Icon size={16} />
          </button>
        ))}
        <div className="w-px h-6 bg-gray-700 mx-1" />
        <button onClick={() => setRotacion(r => (r + 90) % 360)} title="Rotar 90°"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-800 transition-colors">
          <RotateCw size={16} />
        </button>
        <button onClick={() => setFlip(f => !f)} title="Espejo horizontal"
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${flip ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
          <FlipHorizontal size={16} />
        </button>
        <button onClick={reset} title="Reiniciar vista"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-800 transition-colors">
          <RefreshCw size={16} />
        </button>

        <div className="ml-auto flex items-center gap-3 text-[11px] text-gray-400 font-mono">
          <span>Zoom {Math.round(zoom * 100)}%</span>
          <span>B {Math.round(brillo)}</span>
          <span>C {Math.round(contraste)}</span>
        </div>
      </div>

      {/* Área de visualización */}
      <div
        className="relative flex-1 overflow-hidden cursor-crosshair select-none"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ minHeight: 420 }}
      >
        {/* Overlay de carga progresiva */}
        {cargando && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 gap-3">
            <Loader2 size={28} className="text-blue-400 animate-spin" />
            <p className="text-xs text-gray-300">Cargando imágenes DICOM… {progreso}%</p>
            <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${progreso}%` }} />
            </div>
          </div>
        )}

        {/* Imagen simulada */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotacion}deg) scaleX(${flip ? -1 : 1})`,
            filter: `brightness(${brillo}%) contrast(${contraste}%)`,
          }}
        >
          <SimulatedScan modalidad={estudio.modalidad} corte={corte} total={totalCortes} />
        </div>

        {/* Overlay de información del paciente (estándar DICOM) */}
        <div className="absolute top-3 left-3 z-10 text-[11px] text-green-400 font-mono leading-relaxed pointer-events-none drop-shadow">
          <p className="font-bold">{estudio.paciente.nombre} {estudio.paciente.apellidos}</p>
          <p>DNI: {estudio.paciente.dni} · {estudio.paciente.sexo} · {estudio.paciente.edad}a</p>
          <p>{estudio.nroOrden}</p>
        </div>
        <div className="absolute top-3 right-3 z-10 text-[11px] text-green-400 font-mono leading-relaxed text-right pointer-events-none drop-shadow">
          <p>{estudio.modalidad}</p>
          <p>{estudio.tipoEstudio}</p>
          <p>{estudio.fechaEstudio}</p>
        </div>
        <div className="absolute bottom-3 left-3 z-10 text-[11px] text-green-400 font-mono pointer-events-none drop-shadow">
          <p>{serie?.descripcion}</p>
          <p>Corte {corte} / {totalCortes}</p>
        </div>

        {/* Navegación de cortes */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
          <button onClick={() => setCorte(c => Math.max(1, c - 1))}
            className="w-8 h-8 rounded-lg bg-gray-800/80 text-gray-200 flex items-center justify-center hover:bg-gray-700">
            <ChevronUp size={16} />
          </button>
          <button onClick={() => setCorte(c => Math.min(totalCortes, c + 1))}
            className="w-8 h-8 rounded-lg bg-gray-800/80 text-gray-200 flex items-center justify-center hover:bg-gray-700">
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Slider de cortes */}
      {totalCortes > 2 && (
        <div className="px-4 py-2 bg-[#111] border-t border-gray-800 flex items-center gap-3">
          <span className="text-[11px] text-gray-400 font-mono w-16">Corte {corte}</span>
          <input
            type="range" min={1} max={totalCortes} value={corte}
            onChange={e => setCorte(Number(e.target.value))}
            className="flex-1 accent-blue-500"
          />
          <span className="text-[11px] text-gray-400 font-mono w-12 text-right">/ {totalCortes}</span>
        </div>
      )}

      {/* Miniaturas */}
      <div className="flex gap-2 px-3 py-2.5 bg-[#0a0a0a] border-t border-gray-800 overflow-x-auto">
        {estudio.series.map(s => (
          <div key={s.id} className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-lg border border-gray-700 bg-gray-900 flex items-center justify-center overflow-hidden">
              <SimulatedScan modalidad={estudio.modalidad} corte={1} total={s.numCortes} mini />
            </div>
            <p className="text-[9px] text-gray-500 mt-1 w-16 truncate">{s.descripcion}</p>
            <p className="text-[9px] text-gray-600">{s.numCortes} cortes</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Representación simulada de un scan en escala de grises (placeholder, sin librería DICOM real)
function SimulatedScan({ modalidad, corte, total, mini = false }: { modalidad: string; corte: number; total: number; mini?: boolean }) {
  const size = mini ? 64 : 380;
  // El "ruido" varía con el corte para dar sensación de navegación
  const seed = (corte * 37) % 100;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className="max-w-full max-h-full">
      <defs>
        <radialGradient id={`g-${mini ? 'm' : 'f'}-${seed}`} cx="50%" cy="48%" r="60%">
          <stop offset="0%" stopColor="#d4d4d4" />
          <stop offset="45%" stopColor="#737373" />
          <stop offset="80%" stopColor="#262626" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="#000" />
      {/* Cuerpo / región */}
      <ellipse cx="100" cy={100 + (seed % 8) - 4} rx="78" ry="88" fill={`url(#g-${mini ? 'm' : 'f'}-${seed})`} />
      {/* Estructuras internas — varían por modalidad */}
      {modalidad.includes('Tomografía') && (
        <>
          <ellipse cx="78" cy="95" rx="22" ry="30" fill="#1a1a1a" opacity="0.7" />
          <ellipse cx="124" cy="95" rx="22" ry="30" fill="#1a1a1a" opacity="0.7" />
          <circle cx="100" cy="120" r="10" fill="#525252" />
        </>
      )}
      {modalidad.includes('Radiografía') && (
        <>
          <rect x="92" y="40" width="16" height="120" fill="#404040" opacity="0.6" rx="6" />
          {[55, 75, 95, 115, 135].map(y => (
            <path key={y} d={`M 60 ${y} Q 100 ${y - 14} 140 ${y}`} stroke="#525252" strokeWidth="3" fill="none" opacity="0.5" />
          ))}
        </>
      )}
      {modalidad.includes('Resonancia') && (
        <>
          <ellipse cx="100" cy="95" rx="40" ry="48" fill="#3f3f46" opacity="0.6" />
          <ellipse cx="100" cy="95" rx="18" ry="24" fill="#0a0a0a" />
        </>
      )}
      {modalidad.includes('Ecografía') && (
        <path d="M 100 30 L 40 170 L 160 170 Z" fill={`url(#g-${mini ? 'm' : 'f'}-${seed})`} opacity="0.9" />
      )}
      {modalidad.includes('Mamografía') && (
        <path d="M 60 40 Q 150 60 150 150 Q 80 160 60 40 Z" fill={`url(#g-${mini ? 'm' : 'f'}-${seed})`} />
      )}
    </svg>
  );
}
