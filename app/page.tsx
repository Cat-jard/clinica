import Link from 'next/link';
import {
  ClipboardList, HeartPulse, Stethoscope, FlaskConical, ScanLine,
  Building2, ServerCog, UserRound, ArrowRight,
} from 'lucide-react';

const ROLES = [
  { nombre: 'Recepción / Admisión', href: '/recepcionista', Icon: ClipboardList, desc: 'Registro de pacientes, citas y cola de espera.',            color: 'text-gray-700',   bg: 'bg-gray-100'   },
  { nombre: 'Enfermería / Triaje',  href: '/triaje',         Icon: HeartPulse,    desc: 'Signos vitales y clasificación de prioridad.',          color: 'text-pink-600',   bg: 'bg-pink-50'    },
  { nombre: 'Médico',               href: '/medico',         Icon: Stethoscope,   desc: 'Historia clínica, diagnósticos CIE-10 y recetas.',       color: 'text-blue-600',   bg: 'bg-blue-50'    },
  { nombre: 'Laboratorio Clínico',  href: '/laboratorio',    Icon: FlaskConical,  desc: 'Muestras, resultados y control de calidad.',            color: 'text-purple-600', bg: 'bg-purple-50'  },
  { nombre: 'Médico Radiólogo',     href: '/radiologo',      Icon: ScanLine,      desc: 'Visor DICOM e informes radiológicos.',                  color: 'text-indigo-600', bg: 'bg-indigo-50'  },
  { nombre: 'Administración',       href: '/admin',          Icon: Building2,     desc: 'Dashboard ejecutivo, usuarios, camas y finanzas.',       color: 'text-amber-600',  bg: 'bg-amber-50'   },
  { nombre: 'Soporte Técnico / TI', href: '/soporte',        Icon: ServerCog,     desc: 'Monitoreo, incidencias, backups y logs.',               color: 'text-slate-600',  bg: 'bg-slate-100'  },
  { nombre: 'Portal del Paciente',  href: '/portal',         Icon: UserRound,     desc: 'Vista del paciente: citas, resultados y mensajes.',      color: 'text-teal-600',   bg: 'bg-teal-50'    },
];

export default function RootPage() {
  return (
    <div className="min-h-screen bg-[#f0f0f5] flex flex-col">
      {/* Encabezado */}
      <header className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600">
            <HeartPulse size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">SIHCE — Sistema de Historia Clínica Electrónica</h1>
            <p className="text-xs text-gray-500">Demo · Selecciona un rol para visualizar su módulo</p>
          </div>
        </div>
      </header>

      {/* Grid de roles */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Selecciona tu rol</h2>
          <p className="text-sm text-gray-500 mt-1">Cada rol abre su propio módulo. Podrás volver a esta pantalla con “Cerrar Sesión”.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map(({ nombre, href, Icon, desc, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                  <Icon size={24} className={color} />
                </div>
                <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{nombre}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Pie */}
      <footer className="px-6 py-5 text-center">
        <p className="text-xs text-gray-400">
          SIHCE · Cumplimiento NTS N°139-MINSA · Ley 30024 (RENHICE) · Ley 29733 · Demo de frontend
        </p>
      </footer>
    </div>
  );
}
