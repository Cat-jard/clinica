"use client";

import dynamic from "next/dynamic";
import { MotionConfig } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Services from "@/components/landing/Services";
import Specialties from "@/components/landing/Specialties";
import FacilityBanner from "@/components/landing/FacilityBanner";
import Doctors from "@/components/landing/Doctors";
import Testimonials from "@/components/landing/Testimonials";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";
import EcgDivider from "@/components/landing/EcgDivider";

/* Lazy load the 3D hero for better initial page performance */
const Hero3D = dynamic(() => import("@/components/landing/Hero3D"), {
  ssr: false,
  loading: () => (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-[#0b1220] dark:via-gray-900 dark:to-[#0b1220]">
      <div className="text-center">
        <div className="relative mb-6 inline-block">
          <div className="loading-spinner" />
        </div>
        <p className="text-sm text-gray-500 font-medium animate-pulse">
          Cargando experiencia 3D...
        </p>
      </div>
    </section>
  ),
});

export default function Home() {
  return (
    /* reducedMotion="user": framer-motion desactiva sus animaciones
       cuando el usuario tiene "reducir movimiento" activado */
    <MotionConfig reducedMotion="user">
    <main className="flex-1 bg-white text-gray-800 dark:bg-[#0b1220] dark:text-gray-100 font-[family-name:var(--font-inter)]">
      <Navbar />
      <Hero3D />
      <EcgDivider />
      <Services />
      <EcgDivider />
      <Specialties />
      <FacilityBanner />
      <EcgDivider />
      <Doctors />
      <EcgDivider />
      <Testimonials />
      <EcgDivider />
      <Contact />
      <Footer />
    </main>
    </MotionConfig>
  );
}
