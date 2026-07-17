'use client';

import { useState, useEffect } from 'react';
import { BedDouble, PlusCircle } from 'lucide-react';
import CamaDetalleModal from '@/components/admin/CamaDetalleModal';
import type { Cama } from '@/lib/admin';
import { SERVICIOS, ESTADO_CAMA_CONFIG, ocupacionPorServicio } from '@/lib/admin';
import { listCamasApi, crearCamaApi } from '@/lib/hospitalizacion';

export default function CamasPage() {
  const [servicio, setServicio] = useState(SERVICIOS[0]);
  const [camaSel, setCamaSel]   = useState<Cama | null>(null);
  const [allCamas, setAllCamas] = useState<Cama[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCamaNum, setNewCamaNum] = useState('');
  const [newCamaServicio, setNewCamaServicio] = useState(SERVICIOS[0]);
  const [errorCrear, setErrorCrear] = useState('');

  async function handleCreateCama(e: React.FormEvent) {
    e.preventDefault();
    if (!newCamaNum.trim()) return;
    setErrorCrear('');
    try {
      await crearCamaApi(newCamaNum.trim(), newCamaServicio);
      setNewCamaNum('');
      setShowAddForm(false);
      await fetchCamas();
    } catch (err: any) {
      console.error(err);
      setErrorCrear(err.message || 'Error al crear la cama');
    }
  }

  async function fetchCamas() {
    setLoading(true);
    try {
      const data = await listCamasApi();
      setAllCamas(data);
    } catch (err) {
      console.error('Error fetching camas:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCamas();
  }, []);

  async function handleSeedDemo() {
    setLoading(true);
    try {
      const defaultBeds = [
        { numero: '101', servicio: 'Medicina Interna' },
        { numero: '102', servicio: 'Medicina Interna' },
        { numero: '103', servicio: 'Medicina Interna' },
        { numero: '104', servicio: 'Medicina Interna' },
        { numero: '201', servicio: 'Cirugía' },
        { numero: '202', servicio: 'Cirugía' },
        { numero: '301', servicio: 'Pediatría' },
        { numero: '302', servicio: 'Pediatría' },
        { numero: '401', servicio: 'UCI' },
        { numero: '402', servicio: 'UCI' },
        { numero: '501', servicio: 'Ginecología' },
        { numero: '601', servicio: 'Emergencia' },
        { numero: '602', servicio: 'Emergencia' },
      ];
      for (const bed of defaultBeds) {
        await crearCamaApi(bed.numero, bed.servicio);
      }
      const data = await listCamasApi();
      setAllCamas(data);
    } catch (err) {
      console.error('Error seeding camas:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter beds for the selected service
  const camasServicio = allCamas.filter(c => c.servicio === servicio);
  
  // Compute occupation stats dynamically
  const ocupacion = ocupacionPorServicio(allCamas);

  // Available services list based on loaded beds
  const activeServices = SERVICIOS.filter(s => allCamas.some(c => c.servicio === s));
  const finalActiveServices = activeServices.length > 0 ? activeServices : SERVICIOS;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <BedDouble size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Gestión de Camas y Ocupación</h1>
            <p className="text-xs text-gray-500">Capacidad hospitalaria en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNewCamaServicio(servicio);
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle size={14} /> Agregar Cama
          </button>

          {allCamas.length === 0 && !loading && (
            <button
              onClick={handleSeedDemo}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <PlusCircle size={14} /> Inicializar Camas Demo
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateCama} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="text-sm font-semibold text-gray-800">Registrar Nueva Cama Hospitalaria</div>
          <div className="flex gap-3 flex-wrap items-end">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-gray-500">Número de Cama</label>
              <input
                type="text"
                placeholder="Ej. 105"
                value={newCamaNum}
                onChange={e => setNewCamaNum(e.target.value)}
                className="px-3 py-1.5 border border-gray-205 rounded-xl text-xs w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-gray-500">Servicio / Pabellón</label>
              <select
                value={newCamaServicio}
                onChange={e => setNewCamaServicio(e.target.value)}
                className="px-3 py-1.5 border border-gray-205 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button type="submit" className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-all h-8">
              Guardar Cama
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all h-8">
              Cancelar
            </button>
          </div>
          {errorCrear && <p className="text-red-500 text-[11px]">{errorCrear}</p>}
        </form>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-sm text-gray-400 border border-gray-100">
          Cargando camas hospitalarias…
        </div>
      ) : allCamas.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-sm text-gray-400 border border-gray-100 space-y-3">
          <p>No se encontraron camas registradas en el sistema.</p>
          <button
            onClick={handleSeedDemo}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all inline-block"
          >
            Inicializar Camas Demo
          </button>
        </div>
      ) : (
        <>
          {/* Mapa de camas */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <select value={servicio} onChange={e => setServicio(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {/* Leyenda */}
              <div className="flex gap-3 flex-wrap">
                {Object.entries(ESTADO_CAMA_CONFIG).map(([estado, cfg]) => (
                  <div key={estado} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {camasServicio.map(cama => {
                const cfg = ESTADO_CAMA_CONFIG[cama.estado] || ESTADO_CAMA_CONFIG['Disponible'];
                return (
                  <button
                    key={cama.id}
                    onClick={() => setCamaSel(cama)}
                    className={`aspect-square rounded-xl border-2 ${cfg.card} flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform`}
                  >
                    <BedDouble size={18} className="text-gray-500" />
                    <span className="text-[10px] font-bold text-gray-700">{cama.numero}</span>
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  </button>
                );
              })}
              {camasServicio.length === 0 && (
                <div className="col-span-full py-6 text-center text-xs text-gray-400">
                  No hay camas registradas para el servicio de {servicio}.
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas de ocupación */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-800">Estadísticas de Ocupación por Servicio</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-50 text-gray-400 font-medium font-mono">
                    <th className="px-5 py-3 text-left">Servicio</th>
                    <th className="px-5 py-3 text-center">Total</th>
                    <th className="px-5 py-3 text-center">Ocupadas</th>
                    <th className="px-5 py-3 text-center">Disponibles</th>
                    <th className="px-5 py-3 text-left">% Ocupación</th>
                    <th className="px-5 py-3 text-center hidden md:table-cell">En Espera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ocupacion.map(o => {
                    const pct = o.total > 0 ? Math.round((o.ocupadas / o.total) * 100) : 0;
                    const disponibles = o.total - o.ocupadas;
                    return (
                      <tr key={o.servicio} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-800">{o.servicio}</td>
                        <td className="px-5 py-3 text-center text-gray-600">{o.total}</td>
                        <td className="px-5 py-3 text-center font-semibold text-red-600">{o.ocupadas}</td>
                        <td className="px-5 py-3 text-center font-semibold text-green-600">{disponibles}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                              <div className={`h-full rounded-full ${pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-gray-600 font-medium w-9">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center hidden md:table-cell">
                          {o.enEspera > 0 ? <span className="text-amber-600 font-semibold">{o.enEspera}</span> : <span className="text-gray-400">0</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {camaSel && (
        <CamaDetalleModal
          cama={camaSel}
          onClose={() => setCamaSel(null)}
          onSuccess={fetchCamas}
        />
      )}
    </div>
  );
}
