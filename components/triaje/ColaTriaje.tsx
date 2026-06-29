'use client';

import { useRouter } from 'next/navigation';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { PacienteEspera } from '@/lib/vitals';
import { calcAge } from '@/lib/format';

interface Props {
  pacientes: PacienteEspera[];
}

export default function ColaTriaje({ pacientes }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-800">Cola de Triaje</h2>
        </div>
        <span className="text-xs text-gray-400">{pacientes.length} esperando</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50/50">
          <tr>
            {['Ticket', 'Paciente', 'Edad', 'Llegó', 'Motivo', 'Acción'].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {pacientes.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No hay pacientes en espera.</td>
            </tr>
          )}
          {pacientes.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p.ticket}</span>
              </td>
              <td className="px-5 py-3 font-medium text-gray-800">{p.nombre}</td>
              <td className="px-5 py-3 text-gray-500 text-xs">{calcAge(p.fechaNac)} años</td>
              <td className="px-5 py-3 text-gray-500">{p.horaLlegada}</td>
              <td className="px-5 py-3 text-gray-500 text-xs max-w-[200px] truncate">{p.motivo}</td>
              <td className="px-5 py-3">
                <button
                  onClick={() => router.push(`/triaje/paciente/${p.id}`)}
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <ArrowRight size={12} /> Iniciar Triaje
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
