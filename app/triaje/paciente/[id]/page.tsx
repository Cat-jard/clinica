import { notFound } from 'next/navigation';
import VitalSignsForm from '@/components/triaje/VitalSignsForm';
import { PacienteEspera } from '@/lib/vitals';

const MOCK_PACIENTES: PacienteEspera[] = [
  { id: '1', ticket: 'T-001', nombre: 'Carlos Rodríguez',   dni: '34567890', fechaNac: '1978-11-08', horaLlegada: '08:05', motivo: 'Dolor abdominal agudo'    },
  { id: '2', ticket: 'T-002', nombre: 'Ana Fernández Díaz', dni: '45678901', fechaNac: '1995-01-30', horaLlegada: '08:42', motivo: 'Dificultad para respirar' },
  { id: '3', ticket: 'T-003', nombre: 'Pedro Martínez',     dni: '56789012', fechaNac: '1982-06-14', horaLlegada: '09:10', motivo: 'Cefalea intensa'           },
];

export default async function TriajePacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paciente = MOCK_PACIENTES.find((p) => p.id === id);
  if (!paciente) notFound();

  return <VitalSignsForm paciente={paciente} />;
}
