"use client";

/*
 * Separador de secciones temático: trazo de electrocardiograma (ECG)
 * con un segmento luminoso que recorre la línea, como un monitor cardiaco.
 */
export default function EcgDivider() {
  return (
    <div className="ecg-divider" aria-hidden="true">
      <svg viewBox="0 0 600 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        {/* Línea base tenue */}
        <path
          className="ecg-path-base"
          d="M0 20 L230 20 L242 20 L248 14 L254 20 L268 20 L276 34 L284 4 L292 30 L298 20 L312 20 L322 12 L332 20 L600 20"
        />
        {/* Segmento luminoso que recorre el trazo */}
        <path
          className="ecg-path-pulse"
          d="M0 20 L230 20 L242 20 L248 14 L254 20 L268 20 L276 34 L284 4 L292 30 L298 20 L312 20 L322 12 L332 20 L600 20"
        />
      </svg>
    </div>
  );
}
