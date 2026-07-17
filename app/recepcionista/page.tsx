'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import StatCard from '@/components/StatCard';
import PatientQueue from '@/components/PatientQueue';
import AppointmentTimeline from '@/components/AppointmentTimeline';
import UpcomingAppointments from '@/components/UpcomingAppointments';
import OurSpecialist from '@/components/OurSpecialist';
import { resumenCitas } from '@/lib/citas';
import { obtenerColaTriaje, listarPacientes } from '@/lib/recepcion';

export default function RecepcionistaDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    citasHoy: 0,
    espera: 0,
    atendidos: 0,
    nuevos: 0
  });

  async function fetchDashboardStats() {
    try {
      const citasSummary = await resumenCitas();
      const cola = await obtenerColaTriaje();
      const patients = await listarPacientes();

      const todayStr = new Date().toLocaleDateString('en-CA');
      const nuevosRegistros = patients.filter(p => p.createdAt && p.createdAt.startsWith(todayStr)).length;

      setStats({
        citasHoy: (citasSummary.programadas || 0) + (citasSummary.atendidas || 0),
        espera: cola.filter(c => c.estado === 'EN_ESPERA' || c.estado === 'PENDIENTE').length,
        atendidos: citasSummary.atendidas || 0,
        nuevos: nuevosRegistros || patients.length
      });
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { title: 'Citas de Hoy',        value: String(stats.citasHoy),   badge: '+10%', comparison: 'vs ayer', data: [4,3,5,3,4,5,4,stats.citasHoy] },
    { title: 'Pacientes en Espera', value: String(stats.espera),     badge: '+5%',  comparison: 'vs ayer', data: [2,3,2,4,3,3,4,stats.espera] },
    { title: 'Pacientes Atendidos', value: String(stats.atendidos),  badge: '+20%', comparison: 'vs ayer', data: [2,3,2,4,3,5,4,stats.atendidos] },
    { title: 'Nuevos Registros',    value: String(stats.nuevos),     badge: '+15%', comparison: 'vs ayer', data: [1,2,1,3,2,3,3,stats.nuevos] },
  ];

  return (
    <div className="space-y-4">

      {/* Row 1: Overview + 4 KPIs */}
      <div className="grid grid-cols-5 gap-4 items-start">
        <div className="flex flex-col justify-between h-full pt-1">
          <div>
            <h1 className="text-5xl font-black text-gray-900 leading-tight tracking-tight mb-1">Overview</h1>
            <p className="text-sm text-gray-400">Resumen del día — Recepción</p>
          </div>
          <div className="mt-6">
            <button onClick={fetchDashboardStats} className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              Hoy <ChevronDown size={14} />
            </button>
          </div>
        </div>
        {statCards.map((card) => <StatCard key={card.title} {...card} />)}
      </div>

      {/* Row 2: Cola + Timeline de citas */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 5fr' }}>
        <PatientQueue />
        <AppointmentTimeline />
      </div>

      {/* Row 3: Próximas citas + Médicos en turno */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <UpcomingAppointments />
        <OurSpecialist />
      </div>

    </div>
  );
}
