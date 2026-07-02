"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Default color palettes
const SKINS = ["#ffdbac", "#f1c27d", "#e0ac69", "#c68642", "#8d5524"];
const HAIRS = ["#090503", "#2c1608", "#4a3728", "#b55229", "#8d5b4c", "#eec785"];
const PATIENT_CLOTHES = ["#f87171", "#fb923c", "#facc15", "#a3e635", "#2dd4bf", "#f472b6"];

interface MedicalAvatarProps {
  role: "doctor" | "patient" | "pharmacist" | "scientist" | "receptionist" | "technician";
  isSitting?: boolean;
  isWalking?: boolean; // ciclo de caminata: piernas y brazos oscilan, cuerpo rebota
  skinColor?: string;
  hairColor?: string;
  clothingColor?: string;
  floorY?: number; // Y position of the floor relative to the avatar origin (usually around -0.3 to -0.6)
  animationOffset?: number;
}

export default function MedicalAvatar({
  role,
  isSitting = false,
  isWalking = false,
  skinColor,
  hairColor,
  clothingColor,
  floorY = -0.5,
  animationOffset = 0,
}: MedicalAvatarProps) {
  const charRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const selectedSkin = useMemo(
    () => skinColor || SKINS[Math.floor((animationOffset * 10) % SKINS.length)],
    [skinColor, animationOffset]
  );
  
  const selectedHair = useMemo(
    () => hairColor || HAIRS[Math.floor((animationOffset * 7) % HAIRS.length)],
    [hairColor, animationOffset]
  );

  const selectedClothing = useMemo(() => {
    if (clothingColor) return clothingColor;
    switch (role) {
      case "doctor":
        return "#34d399"; // emerald scrubs
      case "scientist":
        return "#60a5fa"; // blue scrubs under coat
      case "pharmacist":
        return "#3b82f6"; // blue shirt
      case "receptionist":
        return "#0284c7"; // light blue uniform
      case "technician":
        return "#818cf8"; // indigo scrubs
      case "patient":
      default:
        return PATIENT_CLOTHES[Math.floor((animationOffset * 13) % PATIENT_CLOTHES.length)];
    }
  }, [role, clothingColor, animationOffset]);

  const pantsColor =
    role === "patient" ? "#374151" : role === "technician" ? "#6366f1" : "#1e3a8a";

  // Determine accessories
  const hasMask = ["doctor", "scientist", "pharmacist", "technician"].includes(role);
  const hasStethoscope = role === "doctor";
  const hasGlasses = role === "scientist";
  const hasHeadset = role === "receptionist";

  // Animation Loop
  useFrame((state) => {
    if (!charRef.current) return;
    const t = state.clock.getElapsedTime() * 1.8 + animationOffset;

    // Breathing animation
    charRef.current.position.y = Math.sin(t) * 0.005;

    // Head bobbing
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.5) * 0.02;
      headRef.current.rotation.y = Math.cos(t * 0.3) * 0.02;
    }

    // Arm movement
    if (leftArmRef.current && rightArmRef.current) {
      if (isSitting) {
        leftArmRef.current.rotation.x = -0.5 + Math.sin(t * 0.4) * 0.02;
        leftArmRef.current.rotation.y = 0.2;
        leftArmRef.current.rotation.z = -0.1;

        rightArmRef.current.rotation.x = -0.5 - Math.sin(t * 0.4) * 0.02;
        rightArmRef.current.rotation.y = -0.2;
        rightArmRef.current.rotation.z = 0.1;
      } else if (role === "scientist") {
        leftArmRef.current.rotation.x = -0.7 + Math.sin(t) * 0.03;
        leftArmRef.current.rotation.y = 0.3;
        rightArmRef.current.rotation.x = -0.7 - Math.sin(t) * 0.03;
        rightArmRef.current.rotation.y = -0.3;
      } else if (role === "pharmacist") {
        leftArmRef.current.rotation.x = -0.4 + Math.sin(t) * 0.04;
        rightArmRef.current.rotation.x = -0.8 + Math.cos(t) * 0.05;
      } else {
        leftArmRef.current.rotation.x = Math.sin(t * 0.5) * 0.04;
        rightArmRef.current.rotation.x = -Math.sin(t * 0.5) * 0.04;
      }
    }

    // Ciclo de caminata: piernas y brazos en oposición + rebote del cuerpo
    if (isWalking && !isSitting && leftLegRef.current && rightLegRef.current) {
      const w = state.clock.getElapsedTime() * 6 + animationOffset;
      const swing = Math.sin(w) * 0.55;
      leftLegRef.current.rotation.x = swing;
      rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -swing * 0.65;
        rightArmRef.current.rotation.x = swing * 0.65;
      }
      charRef.current.position.y = Math.abs(Math.cos(w)) * 0.02;
    }
  });

  return (
    <group ref={charRef}>
      {/* ==================== NECK ==================== */}
      <mesh position={[0, 0.41, isSitting ? -0.03 : 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, 0.1, 12]} />
        <meshStandardMaterial color={selectedSkin} roughness={0.6} />
      </mesh>

      {/* ==================== HEAD GROUP ==================== */}
      {/* Escala 0.78: cabeza = 1/7.8 de la altura total (proporción humana real) */}
      <group ref={headRef} position={[0, 0.52, isSitting ? -0.02 : 0]} scale={0.78}>
        {/* Face/Head Base (smooth sphere) */}
        <mesh castShadow>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshStandardMaterial color={selectedSkin} roughness={0.6} />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.092, 0, -0.01]} castShadow>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color={selectedSkin} roughness={0.6} />
        </mesh>
        <mesh position={[0.092, 0, -0.01]} castShadow>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color={selectedSkin} roughness={0.6} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.005, 0.088]} castShadow>
          <sphereGeometry args={[0.013, 10, 10]} />
          <meshStandardMaterial color={selectedSkin} roughness={0.5} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.032, 0.015, 0.078]} castShadow>
          <sphereGeometry args={[0.011, 12, 12]} />
          <meshStandardMaterial color="#1e2937" roughness={0.1} />
        </mesh>
        <mesh position={[0.032, 0.015, 0.078]} castShadow>
          <sphereGeometry args={[0.011, 12, 12]} />
          <meshStandardMaterial color="#1e2937" roughness={0.1} />
        </mesh>

        {/* Eyebrows */}
        <mesh position={[-0.032, 0.035, 0.078]} rotation={[0, 0, 0.05]}>
          <boxGeometry args={[0.025, 0.006, 0.01]} />
          <meshStandardMaterial color={selectedHair} roughness={0.8} />
        </mesh>
        <mesh position={[0.032, 0.035, 0.078]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[0.025, 0.006, 0.01]} />
          <meshStandardMaterial color={selectedHair} roughness={0.8} />
        </mesh>

        {/* Mouth/Smile */}
        <mesh position={[0, -0.03, 0.076]} rotation={[Math.PI, 0, 0]}>
          <torusGeometry args={[0.016, 0.004, 8, 12, Math.PI]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>

        {/* Surgical/Medical Mask */}
        {hasMask && (
          <group position={[0, -0.028, 0.065]}>
            {/* Mask body */}
            <mesh castShadow>
              <capsuleGeometry args={[0.055, 0.025, 8, 16]} />
              <meshStandardMaterial color="#a5f3fc" roughness={0.7} />
            </mesh>
            {/* Left Strap */}
            <mesh position={[-0.058, 0, -0.03]} rotation={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.002, 0.002, 0.07]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
            {/* Right Strap */}
            <mesh position={[0.058, 0, -0.03]} rotation={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.002, 0.002, 0.07]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
          </group>
        )}

        {/* Glasses (for Scientist) */}
        {hasGlasses && (
          <group position={[0, 0.018, 0.072]}>
            {/* Left lens frame */}
            <mesh position={[-0.035, 0, 0]}>
              <torusGeometry args={[0.022, 0.004, 6, 16]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Right lens frame */}
            <mesh position={[0.035, 0, 0]}>
              <torusGeometry args={[0.022, 0.004, 6, 16]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Bridge */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.003, 0.003, 0.025]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.8} />
            </mesh>
            {/* Glass panels (transparent blue glow) */}
            <mesh position={[-0.035, 0, -0.002]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.002, 8]} />
              <meshStandardMaterial color="#60a5fa" transparent opacity={0.5} roughness={0.1} />
            </mesh>
            <mesh position={[0.035, 0, -0.002]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.002, 8]} />
              <meshStandardMaterial color="#60a5fa" transparent opacity={0.5} roughness={0.1} />
            </mesh>
          </group>
        )}

        {/* Headset (for Receptionist) */}
        {hasHeadset && (
          <group position={[0, 0.02, 0]}>
            {/* Head band */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.092, 0.006, 8, 24, Math.PI]} />
              <meshStandardMaterial color="#1e2937" roughness={0.8} />
            </mesh>
            {/* Left ear pad */}
            <mesh position={[-0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.015, 12]} />
              <meshStandardMaterial color="#1e2937" />
            </mesh>
            {/* Right ear pad */}
            <mesh position={[0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.015, 12]} />
              <meshStandardMaterial color="#1e2937" />
            </mesh>
            {/* Mic boom */}
            <mesh position={[0.07, -0.04, 0.05]} rotation={[0.4, -0.3, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.09, 6]} />
              <meshStandardMaterial color="#374151" />
            </mesh>
            <mesh position={[0.05, -0.08, 0.08]}>
              <sphereGeometry args={[0.01, 8, 8]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
            </mesh>
          </group>
        )}

        {/* HAIR & CAPS */}
        {role === "doctor" && (
          <group position={[0, 0.038, -0.01]}>
            <mesh castShadow rotation={[0.1, 0, 0]}>
              <cylinderGeometry args={[0.092, 0.096, 0.065, 16]} />
              <meshStandardMaterial color="#10b981" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.032, 0]}>
              <sphereGeometry args={[0.092, 16, 16]} />
              <meshStandardMaterial color="#10b981" roughness={0.7} />
            </mesh>
          </group>
        )}

        {role === "technician" && (
          <group position={[0, 0.038, -0.01]}>
            <mesh castShadow rotation={[0.1, 0, 0]}>
              <cylinderGeometry args={[0.092, 0.096, 0.065, 16]} />
              <meshStandardMaterial color="#6366f1" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.032, 0]}>
              <sphereGeometry args={[0.092, 16, 16]} />
              <meshStandardMaterial color="#6366f1" roughness={0.7} />
            </mesh>
          </group>
        )}

        {role === "receptionist" && (
          <group>
            {/* Main hair cap */}
            <mesh position={[0, 0.02, -0.02]} castShadow>
              <sphereGeometry args={[0.095, 16, 16]} />
              <meshStandardMaterial color={selectedHair} roughness={0.8} />
            </mesh>
            {/* Hair Bun at back */}
            <mesh position={[0, 0.04, -0.095]} castShadow>
              <sphereGeometry args={[0.032, 12, 12]} />
              <meshStandardMaterial color={selectedHair} roughness={0.8} />
            </mesh>
            {/* Front bangs */}
            <mesh position={[-0.04, 0.05, 0.05]} castShadow>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshStandardMaterial color={selectedHair} roughness={0.8} />
            </mesh>
            <mesh position={[0.04, 0.05, 0.05]} castShadow>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshStandardMaterial color={selectedHair} roughness={0.8} />
            </mesh>
          </group>
        )}

        {role === "scientist" && (
          <group>
            <mesh position={[0, 0.03, -0.02]} castShadow>
              <sphereGeometry args={[0.095, 16, 16]} />
              <meshStandardMaterial color={selectedHair} roughness={0.8} />
            </mesh>
            {/* Bangs */}
            {[-0.04, 0, 0.04].map((x, idx) => (
              <mesh key={idx} position={[x, 0.07, 0.035]} castShadow>
                <sphereGeometry args={[0.035, 10, 10]} />
                <meshStandardMaterial color={selectedHair} roughness={0.8} />
              </mesh>
            ))}
          </group>
        )}

        {role === "pharmacist" && (
          <group>
            <mesh position={[0, 0.03, -0.02]} castShadow>
              <sphereGeometry args={[0.095, 16, 16]} />
              <meshStandardMaterial color={selectedHair} roughness={0.8} />
            </mesh>
            {/* Front spikes */}
            {[-0.04, 0, 0.04].map((x, idx) => (
              <mesh key={idx} position={[x, 0.068, 0.03]} castShadow>
                <sphereGeometry args={[0.032, 10, 10]} />
                <meshStandardMaterial color={selectedHair} roughness={0.8} />
              </mesh>
            ))}
          </group>
        )}

        {role === "patient" && (
          <group>
            <mesh position={[0, 0.03, -0.02]} castShadow>
              <sphereGeometry args={[0.095, 16, 16]} />
              <meshStandardMaterial color={selectedHair} roughness={0.8} />
            </mesh>
            {/* Wavy chunks */}
            {[[-0.04, 0.06, 0.04], [0.04, 0.06, 0.04], [0, 0.08, 0.02]].map((pos, idx) => (
              <mesh key={idx} position={pos as [number,number,number]} castShadow>
                <sphereGeometry args={[0.036, 10, 10]} />
                <meshStandardMaterial color={selectedHair} roughness={0.8} />
              </mesh>
            ))}
          </group>
        )}
      </group>

      {/* ==================== TORSO / BODY GROUP ==================== */}
      <group position={[0, 0.22, isSitting ? -0.05 : 0]}>
        {/* Main Torso (smooth cylinder) — más esbelto y alto que la cabeza */}
        <mesh castShadow>
          <cylinderGeometry args={[0.062, 0.075, 0.32, 16]} />
          <meshStandardMaterial color={selectedClothing} roughness={0.6} />
        </mesh>
        {/* Shoulders (rounded capsule) — ~1.7 anchos de cabeza */}
        <mesh castShadow position={[0, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.042, 0.13, 8, 16]} />
          <meshStandardMaterial color={selectedClothing} roughness={0.6} />
        </mesh>

        {/* Lab/Medical Coat (for doctor, scientist, pharmacist) */}
        {["doctor", "scientist", "pharmacist"].includes(role) && (
          <group>
            {/* Coat Body */}
            <mesh position={[0, -0.01, 0]} rotation={[0, -Math.PI * 0.8, 0]} castShadow>
              <cylinderGeometry args={[0.068, 0.082, 0.31, 16, 1, false, 0, Math.PI * 1.6]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
            {/* Left Collar */}
            <mesh position={[-0.035, 0.09, 0.045]} rotation={[0.2, 0.1, -0.4]} castShadow>
              <boxGeometry args={[0.015, 0.1, 0.03]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
            {/* Right Collar */}
            <mesh position={[0.035, 0.09, 0.045]} rotation={[0.2, -0.1, 0.4]} castShadow>
              <boxGeometry args={[0.015, 0.1, 0.03]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
          </group>
        )}

        {/* Stethoscope (for Doctor) */}
        {hasStethoscope && (
          <group position={[0, 0.17, 0.02]}>
            <mesh position={[0, 0.02, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.06, 0.007, 8, 24]} />
              <meshStandardMaterial color="#475569" metalness={0.3} />
            </mesh>
            <mesh position={[-0.03, -0.05, 0.04]} rotation={[0.08, 0, -0.08]}>
              <cylinderGeometry args={[0.005, 0.005, 0.12]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0.03, -0.05, 0.04]} rotation={[0.08, 0, 0.08]}>
              <cylinderGeometry args={[0.005, 0.005, 0.12]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0.022, -0.1, 0.052]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.008, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        )}
      </group>

      {/* ==================== ARMS ==================== */}
      {/* Left Arm Group */}
      <group ref={leftArmRef} position={[-0.095, 0.36, isSitting ? -0.05 : 0]}>
        {/* Sleeve */}
        <mesh position={[0, -0.08, 0]} castShadow>
          <cylinderGeometry args={[0.021, 0.019, 0.16, 12]} />
          <meshStandardMaterial
            color={
              ["doctor", "scientist", "pharmacist"].includes(role)
                ? "#ffffff"
                : selectedClothing
            }
            roughness={0.6}
          />
        </mesh>
        {/* Forearm (capsule) */}
        <mesh position={[0, -0.24, 0]} castShadow>
          <capsuleGeometry args={[0.015, 0.14, 8, 12]} />
          <meshStandardMaterial color={selectedSkin} roughness={0.6} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.36, 0]}>
          <sphereGeometry args={[0.019, 12, 12]} />
          <meshStandardMaterial color={selectedSkin} roughness={0.6} />
        </mesh>
      </group>

      {/* Right Arm Group */}
      <group ref={rightArmRef} position={[0.095, 0.36, isSitting ? -0.05 : 0]}>
        {/* Sleeve */}
        <mesh position={[0, -0.08, 0]} castShadow>
          <cylinderGeometry args={[0.021, 0.019, 0.16, 12]} />
          <meshStandardMaterial
            color={
              ["doctor", "scientist", "pharmacist"].includes(role)
                ? "#ffffff"
                : selectedClothing
            }
            roughness={0.6}
          />
        </mesh>
        {/* Forearm (capsule) */}
        <mesh position={[0, -0.24, 0]} castShadow>
          <capsuleGeometry args={[0.015, 0.14, 8, 12]} />
          <meshStandardMaterial color={selectedSkin} roughness={0.6} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.36, 0]}>
          <sphereGeometry args={[0.019, 12, 12]} />
          <meshStandardMaterial color={selectedSkin} roughness={0.6} />
        </mesh>
      </group>

      {/* ==================== PELVIS / HIPS ==================== */}
      <mesh position={[0, 0.045, isSitting ? -0.05 : 0]} castShadow>
        <cylinderGeometry args={[0.066, 0.056, 0.09, 16]} />
        <meshStandardMaterial color={pantsColor} roughness={0.7} />
      </mesh>

      {/* ==================== LEGS ==================== */}
      {isSitting ? (
        // Sitting Legs: Capsules connecting smoothly
        <group position={[0, 0.06, -0.05]}>
          {/* Left Thigh */}
          <group position={[-0.045, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow position={[0, 0.08, 0]}>
              <capsuleGeometry args={[0.025, 0.13, 8, 12]} />
              <meshStandardMaterial
                color={pantsColor}
                roughness={0.7}
              />
            </mesh>
          </group>
          {/* Left Shin */}
          <group position={[-0.045, 0, 0.16]}>
            <mesh castShadow position={[0, (floorY - 0.06) / 2, 0]}>
              <capsuleGeometry args={[0.024, Math.abs(floorY - 0.06) - 0.05, 8, 12]} />
              <meshStandardMaterial
                color={pantsColor}
                roughness={0.7}
              />
            </mesh>
            {/* Shoe */}
            <mesh position={[0, floorY - 0.06 + 0.018, 0.03]} scale={[1, 0.6, 1.7]} castShadow>
              <sphereGeometry args={[0.026, 12, 12]} />
              <meshStandardMaterial color={role === "patient" ? "#475569" : "#f1f5f9"} roughness={0.5} />
            </mesh>
          </group>

          {/* Right Thigh */}
          <group position={[0.045, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow position={[0, 0.08, 0]}>
              <capsuleGeometry args={[0.025, 0.13, 8, 12]} />
              <meshStandardMaterial
                color={pantsColor}
                roughness={0.7}
              />
            </mesh>
          </group>
          {/* Right Shin */}
          <group position={[0.045, 0, 0.16]}>
            <mesh castShadow position={[0, (floorY - 0.06) / 2, 0]}>
              <capsuleGeometry args={[0.024, Math.abs(floorY - 0.06) - 0.05, 8, 12]} />
              <meshStandardMaterial
                color={pantsColor}
                roughness={0.7}
              />
            </mesh>
            {/* Shoe */}
            <mesh position={[0, floorY - 0.06 + 0.018, 0.03]} scale={[1, 0.6, 1.7]} castShadow>
              <sphereGeometry args={[0.026, 12, 12]} />
              <meshStandardMaterial color={role === "patient" ? "#475569" : "#f1f5f9"} roughness={0.5} />
            </mesh>
          </group>
        </group>
      ) : (
        // Standing Legs: pivotan desde la cadera para el ciclo de caminata
        <group position={[0, 0.06, 0]}>
          {/* Left Leg */}
          <group ref={leftLegRef} position={[-0.042, 0, 0]}>
            <mesh castShadow position={[0, (floorY - 0.06) / 2, 0]}>
              <capsuleGeometry args={[0.026, Math.abs(floorY - 0.06) - 0.052, 8, 12]} />
              <meshStandardMaterial color={pantsColor} roughness={0.7} />
            </mesh>
            <mesh position={[0, floorY - 0.06 + 0.018, 0.03]} scale={[1, 0.6, 1.7]} castShadow>
              <sphereGeometry args={[0.026, 12, 12]} />
              <meshStandardMaterial color={role === "patient" ? "#475569" : "#f1f5f9"} roughness={0.5} />
            </mesh>
          </group>

          {/* Right Leg */}
          <group ref={rightLegRef} position={[0.042, 0, 0]}>
            <mesh castShadow position={[0, (floorY - 0.06) / 2, 0]}>
              <capsuleGeometry args={[0.026, Math.abs(floorY - 0.06) - 0.052, 8, 12]} />
              <meshStandardMaterial color={pantsColor} roughness={0.7} />
            </mesh>
            <mesh position={[0, floorY - 0.06 + 0.018, 0.03]} scale={[1, 0.6, 1.7]} castShadow>
              <sphereGeometry args={[0.026, 12, 12]} />
              <meshStandardMaterial color={role === "patient" ? "#475569" : "#f1f5f9"} roughness={0.5} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}
