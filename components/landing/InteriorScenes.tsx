"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import MedicalAvatar from "./MedicalAvatar";

/*
 * Escenas interiores con escala humana coherente:
 * - El piso de cada escena está en y = 0 (Hero3D ancla el grupo al piso del edificio).
 * - 1 unidad ≈ 1.55 m (una persona adulta mide 1.09 u).
 * - Alturas de referencia: asiento 0.30, escritorio 0.48, mostrador 0.66, camilla 0.41.
 */

/* ---------- Helpers compartidos ---------- */

function RoomShell({ width, depth, accent }: { width: number; depth: number; accent: string }) {
  return (
    <group>
      {/* Pared trasera */}
      <mesh position={[0, 0.6, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, 1.2, 0.05]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
      </mesh>
      {/* Pared lateral izquierda */}
      <mesh position={[-width / 2, 0.6, 0]} receiveShadow>
        <boxGeometry args={[0.05, 1.2, depth]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      {/* Franja decorativa del área */}
      <mesh position={[0, 0.92, -depth / 2 + 0.03]}>
        <boxGeometry args={[width, 0.07, 0.01]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      <mesh position={[-width / 2 + 0.03, 0.92, 0]}>
        <boxGeometry args={[0.01, 0.07, depth]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      {/* Zócalo */}
      <mesh position={[0, 0.05, -depth / 2 + 0.03]}>
        <boxGeometry args={[width, 0.1, 0.01]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Piso interior */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#ffffff" roughness={0.45} />
      </mesh>
    </group>
  );
}

function Chair({ color = "#93c5fd", rotation = 0 }: { color?: string; rotation?: number }) {
  return (
    <group rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.27, 0]} castShadow>
        <boxGeometry args={[0.34, 0.05, 0.34]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.5, -0.155]} castShadow>
        <boxGeometry args={[0.34, 0.42, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {([[-0.14, -0.14], [-0.14, 0.14], [0.14, -0.14], [0.14, 0.14]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.125, z]}>
          <cylinderGeometry args={[0.015, 0.015, 0.25, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function OfficeChair({ rotation = 0 }: { rotation?: number }) {
  return (
    <group rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.27, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.05, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.52, -0.16]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.05]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.24, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 12]} />
        <meshStandardMaterial color="#1e2937" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Stool() {
  return (
    <group>
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.04, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.36, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.03, 12]} />
        <meshStandardMaterial color="#64748b" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Desk({ w = 1.1, d = 0.55, color = "#e2e8f0" }: { w?: number; d?: number; color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[w, 0.04, d]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[-w / 2 + 0.03, 0.23, 0]}>
        <boxGeometry args={[0.04, 0.46, d - 0.06]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
      <mesh position={[w / 2 - 0.03, 0.23, 0]}>
        <boxGeometry args={[0.04, 0.46, d - 0.06]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Monitor({ on = "#3b82f6" }: { on?: string }) {
  return (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[0.34, 0.22, 0.025]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.16, 0.014]}>
        <boxGeometry args={[0.3, 0.18, 0.005]} />
        <meshStandardMaterial color={on} emissive={on} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.06, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[0.12, 0.01, 0.08]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
    </group>
  );
}

function PlantPot({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.18, 10]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#4ade80" roughness={0.7} />
      </mesh>
      <mesh position={[0.07, 0.34, 0.03]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#86efac" roughness={0.7} />
      </mesh>
    </group>
  );
}

function WallClock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.03, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <torusGeometry args={[0.115, 0.012, 8, 20]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.03, 0.02]}>
        <boxGeometry args={[0.014, 0.07, 0.008]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.025, 0, 0.02]}>
        <boxGeometry args={[0.05, 0.014, 0.008]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

function Cabinet({ w = 0.7, h = 0.85, d = 0.32 }: { w?: number; h?: number; d?: number }) {
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>
      <mesh position={[0, h - 0.015, 0]}>
        <boxGeometry args={[w + 0.03, 0.03, d + 0.03]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
      </mesh>
      <mesh position={[0, h * 0.45, d / 2 + 0.003]}>
        <boxGeometry args={[0.008, h * 0.75, 0.005]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[-0.06, h * 0.5, d / 2 + 0.006]}>
        <boxGeometry args={[0.02, 0.08, 0.01]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0.06, h * 0.5, d / 2 + 0.006]}>
        <boxGeometry args={[0.02, 0.08, 0.01]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  );
}

function IVStand() {
  return (
    <group>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.04, 10]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.013, 0.013, 1.2, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} />
      </mesh>
      <mesh position={[0.12, 1.08, 0]}>
        <boxGeometry args={[0.1, 0.16, 0.05]} />
        <meshStandardMaterial color="#bfdbfe" transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function HospitalBed({ w = 0.62, l = 1.5 }: { w?: number; l?: number }) {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[w, 0.07, l]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <boxGeometry args={[w - 0.06, 0.08, l - 0.06]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Cabecera y piecera */}
      <mesh position={[0, 0.5, -l / 2 + 0.02]}>
        <boxGeometry args={[w, 0.32, 0.04]} />
        <meshStandardMaterial color="#93c5fd" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.44, l / 2 - 0.02]}>
        <boxGeometry args={[w, 0.2, 0.04]} />
        <meshStandardMaterial color="#93c5fd" roughness={0.5} />
      </mesh>
      {/* Barandales */}
      <mesh position={[-w / 2 - 0.01, 0.47, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, l * 0.6, 6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[w / 2 + 0.01, 0.47, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, l * 0.6, 6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Almohada */}
      <mesh position={[0, 0.44, -l / 2 + 0.2]}>
        <boxGeometry args={[w - 0.16, 0.06, 0.24]} />
        <meshStandardMaterial color="#fefce8" roughness={0.8} />
      </mesh>
      {/* Patas */}
      {([[-w / 2 + 0.06, -l / 2 + 0.1], [w / 2 - 0.06, -l / 2 + 0.1], [-w / 2 + 0.06, l / 2 - 0.1], [w / 2 - 0.06, l / 2 - 0.1]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.14, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* Paciente acostado (cabeza + cuello + hombros + cuerpo bajo manta/bata) */
function LyingPatient({
  bodyColor = "#60a5fa", skin = "#f1c27d", hair = "#3b2417", y = 0.46, length = 1.1,
}: { bodyColor?: string; skin?: string; hair?: string; y?: number; length?: number }) {
  const headZ = -length / 2 + 0.06;
  const bodyStart = headZ + 0.17;
  const bodyEnd = length / 2 - 0.05;
  const bodyLen = bodyEnd - bodyStart;
  return (
    <group position={[0, y, 0]}>
      {/* Cabeza */}
      <mesh position={[0, 0.05, headZ]} castShadow>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.06, headZ - 0.04]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color={hair} roughness={0.8} />
      </mesh>
      {/* Cuello (conecta cabeza y hombros) */}
      <mesh position={[0, 0.035, headZ + 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.034, 0.1, 10]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      {/* Hombros */}
      <mesh position={[0, 0.035, headZ + 0.17]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.05, 0.16, 8, 12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {/* Cuerpo bajo la manta (cilindro aplanado, arranca en los hombros) */}
      <mesh position={[0, 0.02, bodyStart + bodyLen / 2]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.5]} castShadow>
        <cylinderGeometry args={[0.13, 0.16, bodyLen, 12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {/* Pies */}
      <mesh position={[0, 0.04, length / 2 - 0.06]} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ===== Farmacia: estanterías de medicamentos + mostrador de despacho ===== */
export function FarmaciaScene() {
  const pillRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (pillRef.current) {
      pillRef.current.position.y = 1.12 + Math.sin(clock.getElapsedTime() * 2) * 0.06;
      pillRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.25;
    }
  });

  const BOX_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#06b6d4", "#eab308", "#ec4899"];

  return (
    <group>
      <RoomShell width={2.8} depth={2.8} accent="#fbbf24" />

      {/* Estanterías traseras llenas de medicamentos */}
      {[-0.78, 0.78].map((sx, s) => (
        <group key={s} position={[sx, 0, -1.2]}>
          <mesh position={[0, 0.575, 0]} castShadow>
            <boxGeometry args={[0.95, 1.15, 0.3]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.7} />
          </mesh>
          {[0.28, 0.56, 0.84].map((sy, j) => (
            <group key={j}>
              <mesh position={[0, sy, 0.14]}>
                <boxGeometry args={[0.88, 0.025, 0.08]} />
                <meshStandardMaterial color="#d97706" roughness={0.6} />
              </mesh>
              {[-0.3, -0.1, 0.1, 0.3].map((bx, k) => (
                <mesh key={k} position={[bx, sy + 0.085, 0.12]} castShadow>
                  <boxGeometry args={[0.13, 0.12, 0.09]} />
                  <meshStandardMaterial color={BOX_COLORS[(s * 4 + j * 3 + k) % BOX_COLORS.length]} roughness={0.6} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* Cruz verde de farmacia entre estanterías */}
      <group position={[0, 0.9, -1.36]}>
        <mesh><boxGeometry args={[0.4, 0.12, 0.03]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.4} /></mesh>
        <mesh><boxGeometry args={[0.12, 0.4, 0.03]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.4} /></mesh>
      </group>

      {/* Mostrador de despacho */}
      <group position={[0, 0, 0.15]}>
        <mesh position={[0, 0.32, 0]} castShadow>
          <boxGeometry args={[2.0, 0.64, 0.45]} />
          <meshStandardMaterial color="#fde68a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.665, 0]} castShadow>
          <boxGeometry args={[2.1, 0.05, 0.55]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} />
        </mesh>
        {/* Caja registradora */}
        <group position={[0.6, 0.69, -0.05]}>
          <mesh position={[0, 0.06, 0]} castShadow>
            <boxGeometry args={[0.22, 0.12, 0.18]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.16, -0.04]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.18, 0.1, 0.02]} />
            <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.25} />
          </mesh>
        </group>
        {/* Terminal de tarjeta */}
        <mesh position={[-0.45, 0.72, 0.12]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.08, 0.13, 0.03]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
        {/* Frascos sobre el mostrador */}
        <mesh position={[-0.1, 0.74, -0.08]}>
          <cylinderGeometry args={[0.035, 0.035, 0.1, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
        <mesh position={[0.05, 0.73, -0.02]}>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
          <meshStandardMaterial color="#fb923c" roughness={0.4} />
        </mesh>
      </group>

      {/* Farmacéutico despachando */}
      <group position={[0.3, 0.5, -0.45]}>
        <MedicalAvatar role="pharmacist" skinColor="#fcd34d" clothingColor="#ffffff" floorY={-0.5} animationOffset={0} />
      </group>
      {/* Paciente recogiendo su receta */}
      <group position={[-0.35, 0.5, 0.9]} rotation={[0, Math.PI, 0]}>
        <MedicalAvatar role="patient" skinColor="#92400e" clothingColor="#60a5fa" floorY={-0.5} animationOffset={0.5} />
      </group>

      {/* Píldora flotante sobre el mostrador */}
      <group ref={pillRef} position={[0, 1.12, 0.15]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.045, 0.08, 4, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
        </mesh>
      </group>

      <group position={[1.25, 0, 0.95]}><PlantPot /></group>
    </group>
  );
}

/* ===== Emergencias: paciente en cama + equipo de urgencias ===== */
export function EmergenciasScene() {
  const monitorMat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (monitorMat.current) {
      monitorMat.current.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 4) * 0.3;
    }
  });

  return (
    <group>
      <RoomShell width={2.6} depth={2.4} accent="#f87171" />

      {/* Cama hospitalaria con paciente */}
      <group position={[-0.35, 0, -0.15]}>
        <HospitalBed />
        <LyingPatient bodyColor="#93c5fd" skin="#e0ac69" y={0.46} length={1.15} />
      </group>

      {/* Doctor revisando al paciente */}
      <group position={[0.35, 0.5, -0.35]} rotation={[0, -Math.PI / 2, 0]}>
        <MedicalAvatar role="doctor" skinColor="#fbbf24" clothingColor="#bbf7d0" floorY={-0.5} animationOffset={1.0} />
      </group>
      {/* Enfermera al pie de la cama */}
      <group position={[-0.35, 0.5, 0.85]} rotation={[0, Math.PI, 0]}>
        <MedicalAvatar role="technician" skinColor="#c68642" clothingColor="#f472b6" floorY={-0.5} animationOffset={2.4} />
      </group>

      {/* Monitor de signos vitales rodante */}
      <group position={[-1.0, 0, -0.8]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.14, 0.16, 0.04, 10]} />
          <meshStandardMaterial color="#64748b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.0, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.34, 0.26, 0.08]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.05, 0.045]}>
          <boxGeometry args={[0.3, 0.22, 0.01]} />
          <meshStandardMaterial ref={monitorMat} color="#052e16" emissive="#22c55e" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Portasueros junto a la cama */}
      <group position={[-0.95, 0, 0.2]}><IVStand /></group>

      {/* Carro rojo de paro con desfibrilador */}
      <group position={[0.85, 0, -0.8]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.5, 0.7, 0.4]} />
          <meshStandardMaterial color="#ef4444" roughness={0.5} />
        </mesh>
        {[0.22, 0.42, 0.62].map((dy, i) => (
          <mesh key={i} position={[0, dy, 0.202]}>
            <boxGeometry args={[0.42, 0.02, 0.006]} />
            <meshStandardMaterial color="#fecaca" />
          </mesh>
        ))}
        <mesh position={[0, 0.82, 0]} castShadow>
          <boxGeometry args={[0.3, 0.14, 0.24]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.84, 0.125]}>
          <boxGeometry args={[0.14, 0.08, 0.01]} />
          <meshStandardMaterial color="#064e3b" emissive="#10b981" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Tanque de oxígeno */}
      <group position={[1.05, 0, -0.3]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.7, 12]} />
          <meshStandardMaterial color="#10b981" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.73, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.6} />
        </mesh>
      </group>

      {/* Letrero de EMERGENCIAS */}
      <mesh position={[0, 1.02, -1.16]}>
        <boxGeometry args={[1.1, 0.18, 0.03]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[-0.42, 1.02, -1.14]}>
        <boxGeometry args={[0.1, 0.03, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.42, 1.02, -1.14]}>
        <boxGeometry args={[0.03, 0.1, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/* ===== Consultorios: escritorio del doctor + camilla de exploración ===== */
export function ConsultoriosScene() {
  return (
    <group>
      <RoomShell width={3.2} depth={2.8} accent="#4ade80" />

      {/* Escritorio del doctor */}
      <group position={[-0.55, 0, -0.35]}>
        <Desk w={1.2} d={0.55} />
        <group position={[-0.25, 0.48, -0.12]}><Monitor /></group>
        <mesh position={[0.12, 0.49, 0.1]}>
          <boxGeometry args={[0.28, 0.015, 0.1]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.6} />
        </mesh>
        <mesh position={[0.4, 0.49, -0.02]} rotation={[0, -0.3, 0]}>
          <boxGeometry args={[0.16, 0.008, 0.22]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
        <mesh position={[0.5, 0.52, -0.18]}>
          <cylinderGeometry args={[0.025, 0.025, 0.07, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>
        {/* Estetoscopio sobre el escritorio */}
        <mesh position={[0.15, 0.49, -0.15]} rotation={[-Math.PI / 2, 0, 0.5]}>
          <torusGeometry args={[0.05, 0.01, 8, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>
      </group>

      {/* Doctor en silla de oficina */}
      <group position={[-0.55, 0, -0.85]}><OfficeChair /></group>
      <group position={[-0.55, 0.3, -0.85]}>
        <MedicalAvatar role="doctor" skinColor="#f1c27d" clothingColor="#ffffff" isSitting floorY={-0.3} animationOffset={1.5} />
      </group>

      {/* Paciente en consulta */}
      <group position={[-0.55, 0, 0.35]}><Chair color="#93c5fd" rotation={Math.PI} /></group>
      <group position={[-0.55, 0.3, 0.35]} rotation={[0, Math.PI, 0]}>
        <MedicalAvatar role="patient" skinColor="#92400e" clothingColor="#fca5a5" isSitting floorY={-0.3} animationOffset={2.0} />
      </group>

      {/* Camilla de exploración con papel */}
      <group position={[0.95, 0, -0.7]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.55, 0.12, 1.3]} />
          <meshStandardMaterial color="#86efac" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.365, 0]}>
          <boxGeometry args={[0.3, 0.012, 1.28]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.4, -0.5]}>
          <boxGeometry args={[0.4, 0.06, 0.22]} />
          <meshStandardMaterial color="#fefce8" roughness={0.8} />
        </mesh>
        {([[-0.22, -0.55], [0.22, -0.55], [-0.22, 0.55], [0.22, 0.55]] as [number, number][]).map(([x, z], i) => (
          <mesh key={i} position={[x, 0.12, z]}>
            <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {/* Escalón de acceso */}
        <mesh position={[-0.42, 0.07, 0.35]} castShadow>
          <boxGeometry args={[0.25, 0.14, 0.3]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
      </group>

      {/* Cortina de privacidad */}
      <group position={[0.42, 0, -0.05]}>
        <mesh position={[0, 1.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 1.3, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.71, 0.25]}>
          <boxGeometry args={[0.02, 0.7, 0.75]} />
          <meshStandardMaterial color="#a5f3fc" roughness={0.8} />
        </mesh>
      </group>

      {/* Báscula */}
      <group position={[1.35, 0, 0.6]}>
        <mesh position={[0, 0.03, 0]} castShadow>
          <boxGeometry args={[0.3, 0.06, 0.35]} />
          <meshStandardMaterial color="#64748b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.55, -0.14]}>
          <cylinderGeometry args={[0.015, 0.015, 1.0, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} />
        </mesh>
        <mesh position={[0, 1.06, -0.14]}>
          <boxGeometry args={[0.18, 0.1, 0.04]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
      </group>

      {/* Gabinete de insumos */}
      <group position={[-1.4, 0, -1.0]}><Cabinet /></group>

      {/* Diplomas y póster de anatomía */}
      {[-0.95, -0.5].map((x, i) => (
        <group key={i} position={[x, 1.0, -1.36]}>
          <mesh><boxGeometry args={[0.3, 0.22, 0.02]} /><meshStandardMaterial color="#fbbf24" roughness={0.6} /></mesh>
          <mesh position={[0, 0, 0.011]}><boxGeometry args={[0.26, 0.18, 0.005]} /><meshStandardMaterial color="#ffffff" /></mesh>
        </group>
      ))}
      <group position={[0.55, 0.95, -1.36]}>
        <mesh><boxGeometry args={[0.32, 0.44, 0.02]} /><meshStandardMaterial color="#e0f2fe" roughness={0.6} /></mesh>
        <mesh position={[0, 0.08, 0.011]}><sphereGeometry args={[0.05, 10, 10]} /><meshStandardMaterial color="#60a5fa" /></mesh>
        <mesh position={[0, -0.07, 0.011]}><boxGeometry args={[0.08, 0.16, 0.005]} /><meshStandardMaterial color="#60a5fa" /></mesh>
      </group>

      <group position={[1.45, 0, -1.15]}><PlantPot /></group>
    </group>
  );
}

/* ===== Laboratorio: mesa de trabajo + equipo de análisis ===== */
export function LaboratorioScene() {
  const tubeRef = useRef<THREE.Group>(null);
  const centrifugeLight = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (tubeRef.current) {
      tubeRef.current.children.forEach((child, i) => {
        child.position.y = 0.68 + Math.sin(t * 2 + i * 0.8) * 0.025;
      });
    }
    if (centrifugeLight.current) {
      centrifugeLight.current.emissiveIntensity = Math.sin(t * 6) > 0 ? 1 : 0.15;
    }
  });

  const REAGENTS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

  return (
    <group>
      <RoomShell width={3.8} depth={2.5} accent="#c084fc" />

      {/* Mesa central de trabajo */}
      <group position={[0, 0, -0.15]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[2.2, 0.52, 0.6]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[2.3, 0.05, 0.7]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
      </group>

      {/* Microscopio */}
      <group position={[-0.75, 0.575, -0.15]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.18, 0.04, 0.14]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.13, -0.04]} rotation={[0.35, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.2, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.26, 0.01]} rotation={[0.35, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.028, 0.16, 8]} />
          <meshStandardMaterial color="#1f2937" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.1, 0.04]}>
          <boxGeometry args={[0.1, 0.015, 0.08]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} />
        </mesh>
      </group>

      {/* Gradilla con tubos de ensayo (animados) */}
      <mesh position={[-0.15, 0.6, -0.15]}>
        <boxGeometry args={[0.32, 0.025, 0.07]} />
        <meshStandardMaterial color="#78716c" roughness={0.6} />
      </mesh>
      <group ref={tubeRef} position={[-0.15, 0, -0.15]}>
        {[-0.12, -0.06, 0, 0.06, 0.12].map((x, i) => (
          <mesh key={i} position={[x, 0.68, 0]}>
            <cylinderGeometry args={[0.015, 0.012, 0.16, 8]} />
            <meshStandardMaterial color={REAGENTS[i]} transparent opacity={0.75} />
          </mesh>
        ))}
      </group>

      {/* Matraces Erlenmeyer */}
      <group position={[0.35, 0.575, -0.22]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.02, 0.07, 0.12, 10]} />
          <meshStandardMaterial color="#a5f3fc" transparent opacity={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.05, 8]} />
          <meshStandardMaterial color="#a5f3fc" transparent opacity={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0.16, 0.05, 0.05]}>
          <cylinderGeometry args={[0.018, 0.055, 0.1, 10]} />
          <meshStandardMaterial color="#d8b4fe" transparent opacity={0.7} roughness={0.2} />
        </mesh>
      </group>

      {/* Centrífuga con luz de estado */}
      <group position={[0.8, 0.575, -0.15]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.12, 0.12, 14]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.135, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 0.03, 14]} />
          <meshStandardMaterial color="#64748b" roughness={0.4} />
        </mesh>
        <mesh position={[0.08, 0.06, 0.09]}>
          <boxGeometry args={[0.03, 0.02, 0.02]} />
          <meshStandardMaterial ref={centrifugeLight} color="#22c55e" emissive="#22c55e" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* Mostrador trasero con estante de reactivos */}
      <group position={[0, 0, -1.05]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[3.0, 0.56, 0.32]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.585, 0]}>
          <boxGeometry args={[3.1, 0.04, 0.36]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.02, 0.02]}>
          <boxGeometry args={[2.6, 0.03, 0.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {REAGENTS.map((c, i) => (
          <mesh key={i} position={[-1.05 + i * 0.3, 1.1, 0.02]}>
            <cylinderGeometry args={[0.035, 0.035, 0.13, 8]} />
            <meshStandardMaterial color={c} transparent opacity={0.85} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Refrigerador de muestras */}
      <group position={[-1.65, 0, -1.0]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.5, 1.2, 0.45]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        <mesh position={[0.18, 0.7, 0.23]}>
          <boxGeometry args={[0.03, 0.35, 0.02]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} />
        </mesh>
        <mesh position={[0, 1.0, 0.228]}>
          <boxGeometry args={[0.3, 0.15, 0.01]} />
          <meshStandardMaterial color="#bfdbfe" emissive="#bfdbfe" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Científica trabajando en la mesa */}
      <group position={[-0.45, 0.5, 0.5]} rotation={[0, Math.PI, 0]}>
        <MedicalAvatar role="scientist" skinColor="#fbbf24" clothingColor="#60a5fa" floorY={-0.5} animationOffset={2.5} />
      </group>
      {/* Técnico en banco de laboratorio */}
      <group position={[0.75, 0, 0.55]}><Stool /></group>
      <group position={[0.75, 0.38, 0.55]} rotation={[0, Math.PI, 0]}>
        <MedicalAvatar role="technician" skinColor="#8d5524" clothingColor="#818cf8" isSitting floorY={-0.38} animationOffset={3.8} />
      </group>

      {/* Señal de bioseguridad */}
      <mesh position={[1.4, 1.0, -1.21]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.2, 0.02]} />
        <meshStandardMaterial color="#facc15" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ===== Recepción: mostrador + sala de espera ===== */
export function RecepcionScene() {
  return (
    <group>
      <RoomShell width={4.4} depth={3.2} accent="#60a5fa" />

      {/* Mostrador de recepción */}
      <group position={[-0.6, 0, -0.55]}>
        <mesh position={[0, 0.32, 0]} castShadow>
          <boxGeometry args={[1.7, 0.64, 0.5]} />
          <meshStandardMaterial color="#dbeafe" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.66, 0]} castShadow>
          <boxGeometry args={[1.8, 0.05, 0.6]} />
          <meshStandardMaterial color="#93c5fd" roughness={0.5} />
        </mesh>
        {/* Panel frontal con cruz */}
        <mesh position={[0, 0.34, 0.253]}>
          <boxGeometry args={[1.7, 0.44, 0.01]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.34, 0.262]}>
          <boxGeometry args={[0.2, 0.055, 0.01]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.34, 0.262]}>
          <boxGeometry args={[0.055, 0.2, 0.01]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Monitor hacia la recepcionista */}
        <group position={[-0.5, 0.685, -0.08]} rotation={[0, Math.PI, 0]}>
          <Monitor on="#60a5fa" />
        </group>
        {/* Teléfono */}
        <mesh position={[0.55, 0.71, -0.08]}>
          <boxGeometry args={[0.16, 0.05, 0.1]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
      </group>

      {/* Recepcionista atendiendo */}
      <group position={[-0.6, 0.5, -1.05]}>
        <MedicalAvatar role="receptionist" skinColor="#b45309" clothingColor="#0284c7" floorY={-0.5} animationOffset={3.0} />
      </group>
      {/* Paciente en el mostrador */}
      <group position={[-0.45, 0.5, 0.1]} rotation={[0, Math.PI, 0]}>
        <MedicalAvatar role="patient" skinColor="#e0ac69" clothingColor="#fb923c" floorY={-0.5} animationOffset={0.8} />
      </group>

      {/* Sala de espera */}
      {[0.75, 1.2, 1.65].map((x, i) => (
        <group key={i} position={[x, 0, 0.85]}><Chair color="#a7f3d0" rotation={Math.PI} /></group>
      ))}
      {/* Paciente esperando su turno */}
      <group position={[1.2, 0.3, 0.85]} rotation={[0, Math.PI, 0]}>
        <MedicalAvatar role="patient" skinColor="#8d5524" clothingColor="#facc15" isSitting floorY={-0.3} animationOffset={1.7} />
      </group>
      {/* Mesa lateral con revista */}
      <group position={[2.0, 0, 0.9]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.04, 12]} />
          <meshStandardMaterial color="#e7e5e4" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.24, 8]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.285, 0]} rotation={[0, 0.4, 0]}>
          <boxGeometry args={[0.14, 0.015, 0.2]} />
          <meshStandardMaterial color="#f87171" roughness={0.7} />
        </mesh>
      </group>

      {/* Letrero VitalCare */}
      <mesh position={[-0.6, 1.0, -1.56]}>
        <boxGeometry args={[1.1, 0.24, 0.03]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.25} />
      </mesh>
      {/* Pantalla de turnos */}
      <mesh position={[1.1, 0.95, -1.56]}>
        <boxGeometry args={[0.55, 0.34, 0.03]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      <mesh position={[1.1, 0.95, -1.54]}>
        <boxGeometry args={[0.5, 0.29, 0.01]} />
        <meshStandardMaterial color="#064e3b" emissive="#10b981" emissiveIntensity={0.4} />
      </mesh>

      <WallClock position={[-1.7, 1.0, -1.56]} />
      <group position={[-2.0, 0, -1.3]}><PlantPot scale={1.2} /></group>
      <group position={[2.0, 0, -1.35]}><PlantPot /></group>
    </group>
  );
}

/* ===== Radiología: tomógrafo con mesa deslizante + estación de control ===== */
export function RadiologiaScene() {
  const tableRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (tableRef.current) {
      tableRef.current.position.z = 0.3 + Math.sin(clock.getElapsedTime() * 0.5) * 0.3;
    }
  });

  return (
    <group>
      <RoomShell width={2.9} depth={2.6} accent="#34d399" />

      {/* Tomógrafo (gantry) */}
      <group position={[-0.55, 0, -0.55]}>
        <mesh position={[0, 0.62, 0]} castShadow>
          <torusGeometry args={[0.48, 0.14, 12, 28]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.2} roughness={0.35} />
        </mesh>
        {/* Túnel del bore */}
        <mesh position={[0, 0.62, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.3, 20, 1, true]} />
          <meshStandardMaterial color="#f1f5f9" side={THREE.DoubleSide} roughness={0.4} />
        </mesh>
        {/* Base del gantry */}
        <mesh position={[0, 0.1, -0.12]} castShadow>
          <boxGeometry args={[0.9, 0.2, 0.35]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </mesh>
        {/* Luz de estado */}
        <mesh position={[0, 1.28, -0.05]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Mesa deslizante con paciente (animada, entra al tomógrafo) */}
      <group ref={tableRef} position={[-0.55, 0, 0.3]}>
        <mesh position={[0, 0.52, 0]} castShadow>
          <boxGeometry args={[0.45, 0.05, 1.3]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <LyingPatient bodyColor="#e2e8f0" skin="#c68642" hair="#090503" y={0.6} length={1.05} />
      </group>
      {/* Pedestal fijo de la mesa */}
      <mesh position={[-0.55, 0.24, 0.85]} castShadow>
        <boxGeometry args={[0.4, 0.48, 0.4]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
      </mesh>

      {/* Mampara de protección */}
      <mesh position={[0.55, 0.6, 0.35]}>
        <boxGeometry args={[0.04, 1.2, 1.1]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.3} roughness={0.1} />
      </mesh>

      {/* Estación de control */}
      <group position={[0.95, 0, 0.55]} rotation={[0, Math.PI / 2, 0]}>
        <Desk w={0.9} d={0.5} />
      </group>
      <group position={[0.95, 0.48, 0.55]} rotation={[0, Math.PI / 2, 0]}>
        <Monitor on="#34d399" />
      </group>
      <group position={[1.32, 0, 0.55]}><OfficeChair rotation={-Math.PI / 2} /></group>
      <group position={[1.32, 0.3, 0.55]} rotation={[0, -Math.PI / 2, 0]}>
        <MedicalAvatar role="technician" skinColor="#fbbf24" clothingColor="#6366f1" isSitting floorY={-0.3} animationOffset={3.5} />
      </group>

      {/* Negatoscopio con radiografía */}
      <group position={[0.2, 0.95, -1.26]}>
        <mesh>
          <boxGeometry args={[0.6, 0.42, 0.04]} />
          <meshStandardMaterial color="#f0f9ff" emissive="#bfdbfe" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.022]}>
          <boxGeometry args={[0.04, 0.32, 0.005]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {[-0.09, -0.03, 0.03, 0.09].map((y, i) => (
          <mesh key={i} position={[0, y, 0.024]}>
            <boxGeometry args={[0.3 - Math.abs(y) * 1.2, 0.02, 0.005]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        ))}
      </group>

      {/* Señal de zona de radiación */}
      <mesh position={[-0.55, 1.05, -1.26]}>
        <boxGeometry args={[0.34, 0.12, 0.02]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}
