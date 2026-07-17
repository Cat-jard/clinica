import type { Metadata } from 'next';
import { Geist, Inter, Poppins } from 'next/font/google';
import Script from 'next/script';
import { ToastProvider } from '@/context/ToastContext';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

/* Fuentes de la landing pública (VitalCare) */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vitalcare.example.com'),
  title: {
    default: 'VitalCare | Clínica Médica Premium - Tu salud, nuestra prioridad',
    template: '%s | VitalCare',
  },
  description:
    'Centro médico moderno con más de 15 especialidades, doctores certificados, laboratorio clínico, radiología y emergencias 24/7. Agenda tu cita hoy.',
  keywords: [
    'clínica médica',
    'salud',
    'doctores',
    'especialidades',
    'cita médica',
    'consulta médica',
    'emergencias 24/7',
    'laboratorio clínico',
    'radiología',
    'farmacia',
  ],
  openGraph: {
    title: 'VitalCare | Clínica Médica Premium',
    description:
      'Tu salud, nuestra prioridad. Centro médico con más de 15 especialidades, tecnología de vanguardia y emergencias 24/7.',
    type: 'website',
    locale: 'es_ES',
    siteName: 'VitalCare',
    images: [
      {
        url: '/images/clinic-reception.jpg',
        width: 1600,
        height: 893,
        alt: 'Recepción de la clínica VitalCare',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VitalCare | Clínica Médica Premium',
    description:
      'Tu salud, nuestra prioridad. Más de 15 especialidades y emergencias 24/7.',
    images: ['/images/clinic-reception.jpg'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geist.variable} ${inter.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Aplica el tema guardado (o el del sistema) antes del primer render
            para evitar el destello de tema incorrecto en la landing */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
