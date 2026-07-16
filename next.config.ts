import type { NextConfig } from "next";

// Nota: Next quedó fijado en 16.2.4 — en 16.2.9 hay una regresión que rompe
// la medición del canvas de react-three-fiber (la landing 3D quedaba en 300x150).
const nextConfig: NextConfig = {
  reactCompiler: true,
  // Necesario para que react-three-fiber dimensione bien el canvas 3D de la landing
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};

export default nextConfig;
