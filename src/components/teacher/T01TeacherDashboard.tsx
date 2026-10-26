import React, { useState } from 'react';
import { ScreenId, User, HistoricalResult } from '../../types';
import {
  Users,
  Layers,
  ShoppingBag,
  BarChart3,
  CheckCircle2,
  Clock,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

interface T01TeacherDashboardProps {
  students: User[];
  results: HistoricalResult[];
  onNavigate: (screen: ScreenId) => void;
  onSelectStudentForProfile: (studentId: string) => void;
}

export const T01TeacherDashboard: React.FC<T01TeacherDashboardProps> = ({
  students,
  results,
  onNavigate,
  onSelectStudentForProfile,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || 'user_student_1'
  );

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const studentResults = results.filter((r) => r.studentId === selectedStudentId);

  // Metrics
  const completedSales = studentResults.length;
  const correctCount = studentResults.filter((r) => r.correct).length;
  const accuracyRate = completedSales > 0 ? Math.round((correctCount / completedSales) * 100) : 100;
  const lastActivity = studentResults[0] ? `Actividad ${studentResults[0].activityId}` : 'Ninguna';
  const totalSupportsUsed = studentResults.reduce((acc, r) => acc + (r.supportsUsed?.length || 0), 0);
  const avgTimeDisplay = completedSales > 0 ? '1 min 45 s (orientativo)' : 'Sin datos';

  const navCards = [
    {
      title: 'Perfiles de estudiantes',
      description: 'Configuración personalizada de apoyos, andamiaje pedagógico y permisos.',
      icon: Users,
      badge: `${students.length} estudiantes`,
      screen: 'T02' as ScreenId,
      color: 'sky',
    },
    {
      title: 'Actividades y niveles',
      description: 'Biblioteca de escenarios formativos: venta, conteo, operaciones y medidas.',
      icon: Layers,
      badge: '6 módulos',
      screen: 'T04' as ScreenId,
      color: 'blue',
    },
    {
      title: 'Productos y stock',
      description: 'Gestión de catálogo: edición de precios y activación/desactivación de disponibilidad.',
      icon: ShoppingBag,
      badge: 'Disponibilidad activa',
      screen: 'T05' as ScreenId,
      color: 'amber',
    },
    {
      title: 'Resultados y reportes',
      description: 'Historial detallado de intentos, uso de apoyos y exportación anonimizada en CSV.',
      icon: BarChart3,
      badge: `${results.length} registros`,
      screen: 'T06' as ScreenId,
      color: 'emerald',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Taller de Práctica Vocacional
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Panel del docente
          </h1>
          <p className="text-base text-slate-600">
            Monitoreo pedagógico y configuración de apoyos para la autonomía laboral
          </p>
        </div>

        {/* Student Selector */}
        <div className="bg-white p-2.5 rounded-2xl border-2 border-slate-200 flex items-center gap-3">
          <label htmlFor="student-selector" className="text-sm font-bold text-slate-700 shrink-0">
            Seleccionar estudiante:
          </label>
          <select
            id="student-selector"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.displayName} ({st.username})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold uppercase">Ventas completadas</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {completedSales}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase">Aciertos</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
            {accuracyRate}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase">Última actividad</span>
          </div>
          <span className="text-base font-bold text-slate-800 truncate block">
            {lastActivity}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold uppercase">Ayudas utilizadas</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
            {totalSupportsUsed}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase">Tiempo promedio</span>
          </div>
          <span className="text-xs font-bold text-slate-700 block">
            {avgTimeDisplay}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Sin límite temporal</span>
        </div>
      </div>

      {/* Main Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {navCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.screen}
              className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {card.badge}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">{card.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {card.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (card.screen === 'T02' || card.screen === 'T03') {
                      onSelectStudentForProfile(selectedStudentId);
                    }
                    onNavigate(card.screen);
                  }}
                  className="min-h-[48px] px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center gap-2 transition-colors focus:outline-none focus:ring-4 focus:ring-sky-200 cursor-pointer ml-auto"
                >
                  <span>Abrir {card.title.toLowerCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
