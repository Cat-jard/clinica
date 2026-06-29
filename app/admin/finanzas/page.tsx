'use client';

import { useState } from 'react';
import { Wallet, Download, Eye, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { MOCK_FACTURAS, ESTADO_FACTURA_CONFIG, formatSoles } from '@/lib/admin';

export default function FinanzasPage() {
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const pagadas    = MOCK_FACTURAS.filter(f => f.estado === 'Pagado');
  const pendientes = MOCK_FACTURAS.filter(f => f.estado === 'Pendiente' || f.estado === 'Vencido');
  const ingresoMes = pagadas.reduce((s, f) => s + f.monto, 0);
  const porCobrar  = pendientes.reduce((s, f) => s + f.monto, 0);

  const deudaPorAseguradora = ['SIS', 'EsSalud', 'EPS'].map(a => ({
    aseguradora: a,
    monto: pendientes.filter(f => f.aseguradora === a).reduce((s, f) => s + f.monto, 0),
  }));

  const cards = [
    { label: 'Ingresos (Hoy)',     value: formatSoles(12450),     Icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Ingresos (Mes)',     value: formatSoles(ingresoMes),Icon: Wallet,     color: 'text-blue-600',  bg: 'bg-blue-50'  },
    { label: 'Cuentas por Cobrar', value: formatSoles(porCobrar), Icon: AlertCircle,color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pagos Recibidos',    value: formatSoles(ingresoMes),Icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Wallet size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Gestión Financiera</h1>
            <p className="text-xs text-gray-500">Facturación y cobranzas · Formato S/. (estándar peruano)</p>
          </div>
        </div>
        <button
          onClick={() => showToast('✓ Reporte financiero exportado')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Download size={14} /> Exportar Reporte
        </button>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Deuda por aseguradora */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm font-semibold text-gray-800 mb-4">Deuda por Aseguradora</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {deudaPorAseguradora.map(d => (
            <div key={d.aseguradora} className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500">{d.aseguradora}</p>
              <p className="text-base font-bold text-amber-600 mt-1">{formatSoles(d.monto)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">Facturas</p>
          <span className="text-xs text-gray-400">{MOCK_FACTURAS.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 font-medium">
                <th className="px-5 py-3 text-left">Nº Factura</th>
                <th className="px-5 py-3 text-left">Paciente</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Aseguradora</th>
                <th className="px-5 py-3 text-right">Monto</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Vencimiento</th>
                <th className="px-5 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_FACTURAS.map(f => (
                <tr key={f.id} className={`hover:bg-gray-50/50 transition-colors ${f.estado === 'Vencido' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3 font-mono font-semibold text-blue-700">{f.nroFactura}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{f.paciente}</td>
                  <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{f.aseguradora}</td>
                  <td className="px-5 py-3 text-right font-bold text-gray-800">{formatSoles(f.monto)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ESTADO_FACTURA_CONFIG[f.estado].className}`}>{f.estado}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-500 hidden lg:table-cell">{f.fechaVencimiento}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye size={11} /> Ver
                      </button>
                      {(f.estado === 'Pendiente' || f.estado === 'Vencido') && (
                        <button
                          onClick={() => showToast('✓ Pago registrado')}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <CreditCard size={11} /> Registrar Pago
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
