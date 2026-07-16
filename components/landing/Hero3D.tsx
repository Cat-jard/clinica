"use client";

import { useRef, useState, useMemo, useCallback, Suspense, useEffect, createContext, useContext } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Float, Text } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  FarmaciaScene, EmergenciasScene, ConsultoriosScene,
  LaboratorioScene, RecepcionScene, RadiologiaScene,
} from "./InteriorScenes";
import MedicalAvatar from "./MedicalAvatar";

/* ===== Area data definitions ===== */
interface AreaData {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  hoverColor: string;
  label: string;
  icon: string;
  description: string;
}

const AREAS: AreaData[] = [
  { position: [0, -0.1, 1.5], size: [2.5, 0.8, 1.8], color: "#bfdbfe", hoverColor: "#60a5fa", label: "Recepción", icon: "🏥", description: "Bienvenido a VitalCare. Nuestro personal de recepción te guía desde tu llegada, gestiona tus citas y te orienta hacia el servicio que necesitas." },
  { position: [-2, 0, -0.5], size: [1.5, 1, 1.5], color: "#fecaca", hoverColor: "#f87171", label: "Emergencias", icon: "🚑", description: "Atención de urgencias 24/7 con equipo médico especializado, ambulancias equipadas y monitoreo continuo para salvar vidas." },
  { position: [2, -0.05, -0.5], size: [1.8, 0.9, 1.5], color: "#bbf7d0", hoverColor: "#4ade80", label: "Consultorios", icon: "👨‍⚕️", description: "Consultas personalizadas con especialistas certificados. Diagnóstico preciso y planes de tratamiento adaptados a cada paciente." },
  { position: [0, -0.075, -2.2], size: [2, 0.85, 1.3], color: "#e9d5ff", hoverColor: "#c084fc", label: "Laboratorio", icon: "🔬", description: "Análisis clínicos de alta precisión con tecnología de última generación. Resultados rápidos y confiables para un diagnóstico certero." },
  { position: [-2.2, -0.15, 1.8], size: [1.2, 0.7, 1.2], color: "#fef9c3", hoverColor: "#fbbf24", label: "Farmacia", icon: "💊", description: "Farmacia integral con amplio inventario de medicamentos. Nuestros farmacéuticos te asesoran sobre dosis y tratamientos." },
  { position: [2.5, -0.125, 1.8], size: [1.3, 0.75, 1.2], color: "#d1fae5", hoverColor: "#34d399", label: "Radiología", icon: "📡", description: "Servicio de radiología y diagnóstico por imágenes de alta resolución: Rayos X, tomografías y resonancias magnéticas." },
];

/* ===== Context for selected area (shared between 3D scene and UI overlay) ===== */
const AreaContext = createContext<{
  selected: string | null;
  setSelected: (s: string | null) => void;
}>({ selected: null, setSelected: () => {} });

/* ===== Camera Controller ===== */
function CameraController() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const { selected } = useContext(AreaContext);

  // En móvil la cámara orbita más cerca y más baja para que los
  // edificios se vean grandes y sean fáciles de tocar
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 640,
    []
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useFrame(({ clock }) => {
    if (selected) {
      const area = AREAS.find(a => a.label === selected);
      if (!area) return;
      const [ax, , az] = area.position;
      // Position camera close and low to look INSIDE the building
      const targetX = ax + 1.4;
      const targetY = 0.85;
      const targetZ = az + 1.4;
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.position.z += (targetZ - camera.position.z) * 0.04;
      const lookTarget = new THREE.Vector3(ax, -0.12, az);
      camera.lookAt(lookTarget);
    } else {
      const t = clock.getElapsedTime() * 0.15;
      const radius = isMobile ? 5.4 : 7;
      const baseHeight = isMobile ? 3.4 : 4.5;
      const baseX = Math.sin(t) * radius;
      const baseZ = Math.cos(t) * radius;
      const parallaxX = mouse.current.x * 0.8;
      const parallaxY = mouse.current.y * 0.5;
      camera.position.x += ((baseX + parallaxX) - camera.position.x) * 0.02;
      camera.position.z += (baseZ - camera.position.z) * 0.02;
      camera.position.y += ((baseHeight - parallaxY) - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

/* ===== Individual Clinic Area Building ===== */
function ClinicArea({ position, size, color, hoverColor, label, icon }: AreaData) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { selected, setSelected } = useContext(AreaContext);
  const isSelected = selected === label;
  const isOther = selected !== null && !isSelected;

  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  const highlightColor = useMemo(() => new THREE.Color(hoverColor), [hoverColor]);

  const roofRef = useRef<THREE.Mesh>(null);
  const doorRef = useRef<THREE.Mesh>(null);
  // Texto del letrero (troika-three-text); su opacidad se sincroniza con signMat
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signTextRef = useRef<any>(null);

  // Shared materials for architectural details (windows, trim, sign, rooftop units)
  // so their opacity can be animated together on select/deselect
  const windowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#e0f2fe", emissive: "#7dd3fc", emissiveIntensity: 0.25,
    roughness: 0.15, metalness: 0.4, transparent: true, opacity: 1,
  }), []);
  const trimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f8fafc", roughness: 0.6, transparent: true, opacity: 1,
  }), []);
  const signMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: hoverColor, emissive: hoverColor, emissiveIntensity: 0.3,
    roughness: 0.4, transparent: true, opacity: 1,
  }), [hoverColor]);
  const roofDecoMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#cbd5e1", roughness: 0.6, transparent: true, opacity: 1,
  }), []);

  // Window layout computed from building footprint (door occupies front center)
  const { frontWindows, sideWindows, windowY } = useMemo(() => {
    const fw: number[] = [];
    const usable = size[0] / 2 - 0.32;
    if (usable > 0.14) {
      const perSide = Math.max(1, Math.round(usable / 0.42));
      for (let i = 0; i < perSide; i++) {
        const x = 0.34 + usable * ((i + 0.5) / perSide);
        fw.push(x, -x);
      }
    }
    const sw: number[] = [];
    const perDepth = Math.max(1, Math.round(size[2] / 0.55));
    for (let i = 0; i < perDepth; i++) {
      sw.push(((i + 0.5) / perDepth) * size[2] - size[2] / 2);
    }
    return { frontWindows: fw, sideWindows: sw, windowY: size[1] * 0.08 };
  }, [size]);

  useFrame(() => {
    if (!meshRef.current || !groupRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const targetColor = (hovered || isSelected) ? highlightColor : baseColor;
    mat.color.lerp(targetColor, 0.08);
    // When selected: walls become glass-transparent to see inside
    const targetOpacity = isSelected ? 0.1 : (isOther ? 0.15 : (hovered ? 0.95 : 0.85));
    mat.opacity += (targetOpacity - mat.opacity) * 0.08;

    // Hover entire building group together!
    const targetY = hovered && !selected ? 0.15 : 0;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.08;

    // Architectural details fade with the walls
    const decoTarget = isSelected ? 0.06 : (isOther ? 0.12 : 1);
    windowMat.opacity += (decoTarget - windowMat.opacity) * 0.1;
    trimMat.opacity += (decoTarget - trimMat.opacity) * 0.1;
    signMat.opacity += (decoTarget - signMat.opacity) * 0.1;
    if (signTextRef.current?.material) {
      signTextRef.current.material.transparent = true;
      signTextRef.current.material.opacity = signMat.opacity;
    }

    // Hide roof when selected (to see inside from above)
    const roofTarget = isSelected ? 0 : (isOther ? 0.2 : 1);
    if (roofRef.current) {
      const roofMat = roofRef.current.material as THREE.MeshStandardMaterial;
      roofMat.opacity += (roofTarget - roofMat.opacity) * 0.1;
    }
    roofDecoMat.opacity += (roofTarget - roofDecoMat.opacity) * 0.1;
    if (doorRef.current) {
      const doorMat = doorRef.current.material as THREE.MeshStandardMaterial;
      const doorTarget = isSelected ? 0.15 : (isOther ? 0.15 : 1);
      doorMat.opacity += (doorTarget - doorMat.opacity) * 0.1;
    }
  });

  const bottomY = position[1] - size[1] / 2;
  const frontZ = position[2] + size[2] / 2;

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={(e) => { e.stopPropagation(); if (!selected) { setHovered(true); document.body.style.cursor = "pointer"; } }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
        onClick={(e) => { e.stopPropagation(); if (!selected) setSelected(label); }}
        castShadow receiveShadow
      >
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} transparent opacity={0.85} />
      </mesh>
      {/* Roof - hides when selected so we can see inside */}
      <mesh ref={roofRef} position={[position[0], position[1] + size[1] / 2 + 0.05, position[2]]} castShadow>
        <boxGeometry args={[size[0] + 0.1, 0.1, size[2] + 0.1]} />
        <meshStandardMaterial color={(hovered || isSelected) ? hoverColor : "#e2e8f0"} roughness={0.3} metalness={0.05} transparent opacity={1} />
      </mesh>
      {/* Rooftop units (AC + vent) - fade with the roof */}
      <mesh material={roofDecoMat} position={[position[0] + size[0] * 0.25, position[1] + size[1] / 2 + 0.16, position[2] - size[2] * 0.2]} castShadow>
        <boxGeometry args={[0.18, 0.12, 0.18]} />
      </mesh>
      <mesh material={roofDecoMat} position={[position[0] - size[0] * 0.25, position[1] + size[1] / 2 + 0.2, position[2] + size[2] * 0.15]}>
        <cylinderGeometry args={[0.035, 0.05, 0.2, 10]} />
      </mesh>

      {/* Base plinth */}
      <mesh material={trimMat} position={[position[0], bottomY + 0.03, position[2]]} receiveShadow>
        <boxGeometry args={[size[0] + 0.12, 0.06, size[2] + 0.12]} />
      </mesh>
      {/* Corner pillars */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={`p${i}`} material={trimMat} position={[position[0] + sx * (size[0] / 2), position[1], position[2] + sz * (size[2] / 2)]} castShadow>
          <boxGeometry args={[0.07, size[1], 0.07]} />
        </mesh>
      ))}

      {/* Front windows (flanking the entrance) */}
      {frontWindows.map((x, i) => (
        <group key={`fw${i}`} position={[position[0] + x, position[1] + windowY, frontZ + 0.015]}>
          <mesh material={windowMat}><boxGeometry args={[0.22, 0.2, 0.02]} /></mesh>
          <mesh material={trimMat} position={[0, -0.125, 0]}><boxGeometry args={[0.26, 0.03, 0.04]} /></mesh>
        </group>
      ))}
      {/* Side windows (both lateral faces) */}
      {sideWindows.map((z, i) => (
        <group key={`sw${i}`}>
          <mesh material={windowMat} position={[position[0] - size[0] / 2 - 0.015, position[1] + windowY, position[2] + z]}>
            <boxGeometry args={[0.02, 0.2, 0.24]} />
          </mesh>
          <mesh material={windowMat} position={[position[0] + size[0] / 2 + 0.015, position[1] + windowY, position[2] + z]}>
            <boxGeometry args={[0.02, 0.2, 0.24]} />
          </mesh>
        </group>
      ))}

      {/* Entrance: frame + double glass door + canopy + step (human scale) */}
      <mesh material={trimMat} position={[position[0], bottomY + 0.26, frontZ + 0.005]}>
        <boxGeometry args={[0.46, 0.52, 0.03]} />
      </mesh>
      <mesh ref={doorRef} position={[position[0], bottomY + 0.24, frontZ + 0.025]}>
        <boxGeometry args={[0.36, 0.46, 0.02]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.15} metalness={0.3} transparent opacity={1} />
      </mesh>
      <mesh material={trimMat} position={[position[0], bottomY + 0.24, frontZ + 0.038]}>
        <boxGeometry args={[0.015, 0.46, 0.012]} />
      </mesh>
      <mesh material={trimMat} position={[position[0], bottomY + 0.545, frontZ + 0.1]} castShadow>
        <boxGeometry args={[0.56, 0.035, 0.22]} />
      </mesh>
      <mesh material={trimMat} position={[position[0], bottomY + 0.005, frontZ + 0.12]}>
        <boxGeometry args={[0.5, 0.05, 0.2]} />
      </mesh>
      {/* Sign band above the entrance, with the area name */}
      <mesh material={signMat} position={[position[0], bottomY + 0.625, frontZ + 0.03]}>
        <boxGeometry args={[0.7, 0.09, 0.02]} />
      </mesh>
      <Text
        ref={signTextRef}
        position={[position[0], bottomY + 0.625, frontZ + 0.045]}
        fontSize={0.05}
        letterSpacing={0.06}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label.toUpperCase()}
      </Text>
      {/* Hover label (only in overview mode) */}
      {hovered && !selected && (
        <Html position={[position[0], position[1] + size[1] / 2 + 0.5, position[2]]} center distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div className="glass-card rounded-xl px-3 py-2 text-center whitespace-nowrap" style={{ animation: "fadeIn 0.3s ease" }}>
            <span className="text-lg mr-1">{icon}</span>
            <span className="text-xs font-semibold text-gray-700">{label}</span>
            <span className="block text-[9px] text-blue-500 mt-0.5">Click para explorar</span>
          </div>
        </Html>
      )}
      {/* Glow ring on hover */}
      {hovered && !selected && (
        <mesh position={[position[0], position[1] - size[1] / 2 + 0.01, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(size[0], size[2]) * 0.7, Math.max(size[0], size[2]) * 0.8, 32]} />
          <meshBasicMaterial color={hoverColor} transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/* ===== Interior Scene Wrapper (INSIDE the building) ===== */
function InteriorDisplay() {
  const { selected } = useContext(AreaContext);
  const area = AREAS.find(a => a.label === selected);
  if (!area || !selected) return null;
  const [ax, , az] = area.position;
  // Scale interior to fit inside the building dimensions
  const scaleX = area.size[0] * 0.4;
  const scaleY = area.size[1] * 0.5;
  const scaleZ = area.size[2] * 0.4;
  const uniformScale = Math.min(scaleX, scaleY, scaleZ);

  const SceneMap: Record<string, React.FC> = {
    "Recepción": RecepcionScene,
    "Emergencias": EmergenciasScene,
    "Consultorios": ConsultoriosScene,
    "Laboratorio": LaboratorioScene,
    "Farmacia": FarmaciaScene,
    "Radiología": RadiologiaScene,
  };
  const Scene = SceneMap[selected];
  if (!Scene) return null;

  return (
    <group position={[ax, -0.1, az]}>
      {/* Interior floor tile */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.39, 0]}>
        <planeGeometry args={[area.size[0] * 0.9, area.size[2] * 0.9]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Warm interior lighting */}
      <pointLight position={[0, 0.8, 0]} intensity={2} color="#ffffff" distance={3} />
      <pointLight position={[0.5, 0.3, 0.5]} intensity={0.8} color={area.hoverColor} distance={2.5} />
      <pointLight position={[-0.5, 0.3, -0.5]} intensity={0.5} color="#fef3c7" distance={2} />
      {/* Scaled scene anchored to the building floor (scene y=0 = floor tile) */}
      <group position={[0, -0.385, 0]} scale={[uniformScale, uniformScale, uniformScale]}>
        <Scene />
      </group>
    </group>
  );
}

/* ===== Ground, Pathways, Trees, Cross (unchanged helpers) ===== */
function Ground() {
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#f0f9ff" roughness={0.8} metalness={0} /></mesh>;
}
function Pathways() {
  const paths = useMemo(() => [
    { s: [0, -0.49, -1.2] as [number,number,number], sz: [0.2, 0.01, 3] as [number,number,number] },
    { s: [-1.5, -0.49, 0] as [number,number,number], sz: [3, 0.01, 0.2] as [number,number,number] },
    { s: [1.5, -0.49, 0.5] as [number,number,number], sz: [1.5, 0.01, 0.2] as [number,number,number] },
  ], []);
  return <>{paths.map((p, i) => <mesh key={i} position={p.s}><boxGeometry args={p.sz} /><meshStandardMaterial color="#dbeafe" roughness={0.9} /></mesh>)}</>;
}
function Trees() {
  // Árboles a escala de edificio de una planta (~1 unidad de alto), anclados al suelo
  // Posiciones alejadas de las cámaras interiores (centro de edificio + [1.4, 1.4])
  const positions = useMemo(() => [[-3,-0.51,-2.5],[3.2,-0.51,-1.5],[-3.4,-0.51,3.1],[4.6,-0.51,-0.6],[-1,-0.51,-3],[2,-0.51,-3.2]] as [number,number,number][], []);
  return <>{positions.map((pos, i) => (
    <group key={i} position={pos}>
      {/* Tronco */}
      <mesh position={[0, 0.28, 0]} castShadow><cylinderGeometry args={[0.045, 0.07, 0.56, 8]} /><meshStandardMaterial color="#8a5a3b" roughness={0.9} /></mesh>
      {/* Copa en capas */}
      <Float speed={1 + i * 0.3} floatIntensity={0.04} rotationIntensity={0.03}>
        <group>
          <mesh position={[0, 0.75, 0]} castShadow><sphereGeometry args={[0.3, 12, 12]} /><meshStandardMaterial color="#4ade80" roughness={0.7} /></mesh>
          <mesh position={[0.17, 0.62, 0.08]}><sphereGeometry args={[0.19, 10, 10]} /><meshStandardMaterial color="#86efac" roughness={0.7} /></mesh>
          <mesh position={[-0.16, 0.64, -0.06]}><sphereGeometry args={[0.17, 10, 10]} /><meshStandardMaterial color="#6ee7b7" roughness={0.7} /></mesh>
        </group>
      </Float>
    </group>
  ))}</>;
}

/* ===== Personas a escala real caminando por la clínica ===== */
// Escala 0.36: persona ≈ 0.39 u de alto vs edificios de 0.7-1.0 u
// (proporción real: un adulto mide ~40-50% de un edificio de una planta)
const PERSON_SCALE = 0.36;
const PERSON_GROUND_Y = -0.51 + 0.5 * PERSON_SCALE; // pies exactamente sobre el suelo

/* Camina en línea de ida y vuelta entre dos puntos, mirando hacia donde avanza */
function Walker({ from, to, speed = 0.2, children }: {
  from: [number, number];
  to: [number, number];
  speed?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const phase = (clock.getElapsedTime() * speed) % 2;
    const k = phase < 1 ? phase : 2 - phase; // ping-pong 0..1..0
    const dir = phase < 1 ? 1 : -1;
    ref.current.position.set(
      from[0] + (to[0] - from[0]) * k,
      PERSON_GROUND_Y,
      from[1] + (to[1] - from[1]) * k
    );
    ref.current.rotation.y = Math.atan2((to[0] - from[0]) * dir, (to[1] - from[1]) * dir);
  });
  return <group ref={ref} position={[from[0], PERSON_GROUND_Y, from[1]]} scale={PERSON_SCALE}>{children}</group>;
}

function ExteriorPeople() {
  const { selected } = useContext(AreaContext);
  if (selected) return null;
  return (
    <group>
      {/* Paciente que camina hacia la entrada de Recepción */}
      <Walker from={[0.5, 3.5]} to={[0.15, 2.6]} speed={0.35}>
        <MedicalAvatar role="patient" skinColor="#c68642" clothingColor="#f472b6" floorY={-0.5} animationOffset={1.2} isWalking />
      </Walker>
      {/* Paciente que recorre el sendero frente a Emergencias */}
      <Walker from={[-2.9, 0.45]} to={[-0.3, 0.45]} speed={0.13}>
        <MedicalAvatar role="patient" skinColor="#8d5524" clothingColor="#2dd4bf" floorY={-0.5} animationOffset={2.2} isWalking />
      </Walker>
      {/* Doctor de guardia afuera de Consultorios */}
      <group position={[1.7, PERSON_GROUND_Y, 0.7]} scale={PERSON_SCALE} rotation={[0, 0.6, 0]}>
        <MedicalAvatar role="doctor" skinColor="#e0ac69" floorY={-0.5} animationOffset={0.4} />
      </group>
    </group>
  );
}

/* ===== Ambulancia estacionada junto a Emergencias (luces animadas) ===== */
function Ambulance() {
  const redLight = useRef<THREE.MeshStandardMaterial>(null);
  const blueLight = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const on = Math.sin(clock.getElapsedTime() * 7) > 0;
    if (redLight.current) redLight.current.emissiveIntensity = on ? 1.6 : 0.15;
    if (blueLight.current) blueLight.current.emissiveIntensity = on ? 0.15 : 1.6;
  });
  return (
    <group position={[-3.35, -0.51, 0.85]} rotation={[0, 0.9, 0]}>
      {/* Caja trasera */}
      <mesh position={[0, 0.33, -0.18]} castShadow>
        <boxGeometry args={[0.48, 0.42, 0.85]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} />
      </mesh>
      {/* Cabina */}
      <mesh position={[0, 0.26, 0.47]} castShadow>
        <boxGeometry args={[0.44, 0.28, 0.45]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} />
      </mesh>
      {/* Parabrisas */}
      <mesh position={[0, 0.33, 0.63]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.4, 0.16, 0.02]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Franjas rojas laterales */}
      <mesh position={[0.243, 0.28, -0.18]}>
        <boxGeometry args={[0.006, 0.08, 0.85]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-0.243, 0.28, -0.18]}>
        <boxGeometry args={[0.006, 0.08, 0.85]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Cruz médica en ambos costados */}
      {([-0.245, 0.245] as number[]).map((x, i) => (
        <group key={i} position={[x, 0.42, -0.18]}>
          <mesh><boxGeometry args={[0.006, 0.05, 0.16]} /><meshStandardMaterial color="#ef4444" /></mesh>
          <mesh><boxGeometry args={[0.006, 0.16, 0.05]} /><meshStandardMaterial color="#ef4444" /></mesh>
        </group>
      ))}
      {/* Barra de luces (roja/azul alternando) */}
      <mesh position={[-0.09, 0.57, -0.05]}>
        <boxGeometry args={[0.13, 0.06, 0.11]} />
        <meshStandardMaterial ref={redLight} color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0.09, 0.57, -0.05]}>
        <boxGeometry args={[0.13, 0.06, 0.11]} />
        <meshStandardMaterial ref={blueLight} color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
      </mesh>
      {/* Ruedas */}
      {([[-0.22, 0.42], [0.22, 0.42], [-0.22, -0.42], [0.22, -0.42]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.09, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.05, 12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}
function MedicalCross() {
  const { selected } = useContext(AreaContext);
  if (selected) return null;
  return (
    <Float speed={2} floatIntensity={0.3} rotationIntensity={0.1}>
      <group position={[0, 2.5, 0]}>
        <mesh><boxGeometry args={[0.6, 0.15, 0.15]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} /></mesh>
        <mesh><boxGeometry args={[0.15, 0.6, 0.15]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} /></mesh>
      </group>
    </Float>
  );
}

/* ===== Full Scene ===== */
function ClinicScene() {
  return (
    <>
      <ambientLight intensity={0.6} color="#f8fafc" />
      <directionalLight position={[5, 8, 5]} intensity={0.8} color="#fff7ed" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3, 5, -3]} intensity={0.3} color="#dbeafe" />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#bfdbfe" />
      <hemisphereLight color="#f0f9ff" groundColor="#ecfdf5" intensity={0.5} />
      <CameraController />
      <Ground /><Pathways /><Trees /><MedicalCross /><ExteriorPeople /><Ambulance />
      {AREAS.map((area) => <ClinicArea key={area.label} {...area} />)}
      <InteriorDisplay />
      <fog attach="fog" args={["#f0f9ff", 8, 18]} />
    </>
  );
}

/* ===== Loading Fallback ===== */
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 z-10">
      <div className="relative mb-6"><div className="loading-spinner" /><div className="absolute inset-0 flex items-center justify-center"><span className="text-xl">🏥</span></div></div>
      <p className="text-sm text-gray-500 font-medium loading-pulse">Cargando clínica 3D...</p>
    </div>
  );
}

/* ===== Main Hero3D Export ===== */
export default function Hero3D() {
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedArea = selected ? AREAS.find(a => a.label === selected) : null;

  // Optimización: pausa el render 3D cuando el hero sale de pantalla
  const sectionRef = useRef<HTMLElement>(null);
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setFrameloop(entry.isIntersecting ? "always" : "never"),
      { threshold: 0.02 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <AreaContext.Provider value={{ selected, setSelected }}>
      <section ref={sectionRef} id="inicio" className={`relative flex items-center overflow-hidden transition-all duration-700 ${selected ? "min-h-screen h-screen" : "min-h-screen"}`}>
        {/* Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
        </div>

        {/* 3D Canvas */}
        <div className="canvas-container">
          {!loaded && <LoadingFallback />}
          <Suspense fallback={<LoadingFallback />}>
            <Canvas shadows dpr={[1, 1.5]} frameloop={frameloop} camera={{ position: [7, 4.5, 7], fov: 40 }} onCreated={() => setLoaded(true)} style={{ background: "transparent" }}>
              <ClinicScene />
            </Canvas>
          </Suspense>
        </div>

        {/* ===== OVERLAY: Hero content (hidden when area selected) ===== */}
        <AnimatePresence>
          {!selected && (
            <>
              <div className="hero-overlay absolute inset-0 pointer-events-none" />
              <motion.div
                key="hero-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 pointer-events-none"
              >
                <div className="max-w-2xl">
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-900/50 backdrop-blur text-blue-600 dark:text-blue-300 text-xs font-semibold mb-6 border border-blue-100 dark:border-blue-800">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Centro Médico de Excelencia
                    </span>
                  </motion.div>
                  <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-poppins)] text-gray-900 dark:text-white leading-tight mb-6">
                    Tu salud, <span className="gradient-text">nuestra prioridad</span>
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-lg">
                    Atención médica integral con tecnología de vanguardia. Haz click en cualquier edificio para explorar su interior.
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }} className="flex flex-wrap gap-4 pointer-events-auto">
                    <a href="#contacto" className="btn-primary text-base"><span>Agendar cita</span></a>
                    <a href="#servicios" className="btn-secondary text-base">Ver servicios</a>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }} className="flex flex-wrap gap-5 sm:gap-8 mt-10 sm:mt-12">
                    {[{ value: "15+", label: "Especialidades" }, { value: "50k+", label: "Pacientes atendidos" }, { value: "30+", label: "Doctores expertos" }].map((stat) => (
                      <div key={stat.label}>
                        <div className="text-xl sm:text-2xl font-bold gradient-text">{stat.value}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ===== OVERLAY: Area detail panel (shown when area selected) ===== */}
        <AnimatePresence>
          {selected && selectedArea && (
            <motion.div
              key="area-detail"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-0 right-0 z-20 p-6 pointer-events-auto"
            >
              <div className="max-w-3xl mx-auto">
                <div className="glass rounded-2xl p-6 sm:p-8 shadow-2xl shadow-blue-200/30 border border-white/40">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl" style={{ background: `${selectedArea.hoverColor}20` }}>
                      {selectedArea.icon}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-poppins)] text-gray-900 dark:text-white">
                          {selectedArea.label}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border" style={{ background: `${selectedArea.hoverColor}15`, borderColor: `${selectedArea.hoverColor}30`, color: selectedArea.hoverColor }}>
                          Explorando
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        {selectedArea.description}
                      </p>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200/50">
                    <button onClick={() => setSelected(null)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-900/40 transition-all duration-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                      Volver a la clínica
                    </button>
                    <a href="#contacto" className="btn-primary text-sm !py-2 !px-4" onClick={() => setSelected(null)}>
                      <span>Agendar cita</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== BACK BUTTON (top-left, when exploring) ===== */}
        <AnimatePresence>
          {selected && (
            <motion.button
              key="back-btn"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelected(null)}
              className="absolute top-24 left-6 z-20 glass rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-900/40 transition-all pointer-events-auto shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Vista general
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scroll indicator (hidden when exploring) */}
        {!selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
            <span className="text-xs text-gray-400 font-medium">Descubre más</span>
            <div className="w-5 h-8 rounded-full border-2 border-gray-300 flex justify-center pt-1.5">
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1 h-1 bg-blue-400 rounded-full" />
            </div>
          </motion.div>
        )}
      </section>
    </AreaContext.Provider>
  );
}
