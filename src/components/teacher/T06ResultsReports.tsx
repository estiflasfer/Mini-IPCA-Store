import React, { useState } from 'react';
import { HistoricalResult, ScreenId, User } from '../../types';
import { formatCents } from '../../services/api';
import {
  BarChart3,
  Download,
  Filter,
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Calendar,
  Layers,
} from 'lucide-react';

interface T06ResultsReportsProps {
  results: HistoricalResult[];
  students: User[];
  onNavigate: (screen: ScreenId) => void;
}

export const T06ResultsReports: React.FC<T06ResultsReportsProps> = ({
  results,
  students,
  onNavigate,
}) => {
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState('all');

  const filteredResults = results.filter((r) => {
    if (selectedStudentFilter !== 'all' && r.studentId !== selectedStudentFilter) {
      return false;
    }
    return true;
  });

  const totalCompleted = filteredResults.length;
  const totalCorrect = filteredResults.filter((r) => r.correct).length;
  const accuracy = totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100) : 100;
  const totalSupports = filteredResults.reduce(
    (sum, r) => sum + (r.supportsUsed ? r.supportsUsed.length : 0),
    0
  );

  const handleExportCSV = () => {
    // Generate CSV string with anonymized aliases and price snapshots
    const headers = [
      'ID_Registro',
      'Codigo_Estudiante_Anonimizado',
      'Actividad',
      'Fecha_Completada',
      'Total_Esperado_USD',
      'Total_Ingresado_USD',
      'Pago_Cliente_USD',
      'Cambio_Esperado_USD',
      'Cambio_Ingresado_USD',
      'Intentos',
      'Acierto',
      'Ayudas_Utilizadas',
    ];

    const rows = filteredResults.map((r) => {
      // Find anonymized alias
      const st = students.find((s) => s.id === r.studentId);
      const studentCode = st ? `EST-${st.id.slice(-4)}` : 'EST-001';

      return [
        r.id,
        studentCode,
        r.activityId,
        r.completedAt,
        (r.totalExpectedCents / 100).toFixed(2),
        (r.totalAnsweredCents / 100).toFixed(2),
        (r.paymentAmountCents / 100).toFixed(2),
        (r.changeExpectedCents / 100).toFixed(2),
        (r.changeAnsweredCents / 100).toFixed(2),
        r.attempts,
        r.correct ? 'SI' : 'NO',
        `"${(r.supportsUsed || []).join('; ')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `resumen_ventas_ipca_anonimizado_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('T01')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al panel docente</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Resultados y reportes vocacionales
          </h1>
          <p className="text-base text-slate-600">
            Seguimiento de desempeño formativo con preservación de datos históricos
          </p>
        </div>

        {/* Primary Export Action */}
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={filteredResults.length === 0}
          className="min-h-[50px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-base flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>Exportar resumen anonimizado</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-700">Filtros:</span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-student" className="text-xs font-bold text-slate-600">
            Estudiante:
          </label>
          <select
            id="filter-student"
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <option value="all">Todos los estudiantes</option>
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.displayName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-period" className="text-xs font-bold text-slate-600">
            Periodo:
          </label>
          <select
            id="filter-period"
            value={selectedPeriodFilter}
            onChange={(e) => setSelectedPeriodFilter(e.target.value)}
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <option value="all">Histórico completo</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 text-center">
          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
            Actividades completadas
          </span>
          <span className="text-3xl font-black text-sky-800 font-mono">
            {totalCompleted}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 text-center">
          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
            Tasa de aciertos
          </span>
          <span className="text-3xl font-black text-emerald-700 font-mono">
            {accuracy}%
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 text-center">
          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
            Ayudas y pistas utilizadas
          </span>
          <span className="text-3xl font-black text-amber-700 font-mono">
            {totalSupports}
          </span>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Fecha y Hora</th>
                <th className="py-4 px-6">Estudiante (Alias)</th>
                <th className="py-4 px-6">Actividad</th>
                <th className="py-4 px-6">Total / Cambio (Snapshot)</th>
                <th className="py-4 px-6">Intentos</th>
                <th className="py-4 px-6">Resultado</th>
                <th className="py-4 px-6">Ayudas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No hay registros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredResults.map((r) => {
                  const dateStr = new Date(r.completedAt).toLocaleString('es-ES', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                        {dateStr}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {r.studentName}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {r.activityId}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono text-xs text-slate-700">
                          Total: <strong>{formatCents(r.totalExpectedCents)}</strong>
                        </div>
                        <div className="font-mono text-xs text-sky-700">
                          Cambio: <strong>{formatCents(r.changeExpectedCents)}</strong>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-700">
                        {r.attempts}
                      </td>
                      <td className="py-4 px-6">
                        {r.correct ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Correcto</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>En revisión</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {r.supportsUsed && r.supportsUsed.length > 0 ? (
                          r.supportsUsed.join(', ')
                        ) : (
                          <span className="text-slate-400">Sin ayudas</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
