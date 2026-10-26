import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ScreenId } from '../../types';
import { ShoppingBag, ArrowRight, CheckCircle2, Award, BookOpen, Layers } from 'lucide-react';
import { AudioButton } from '../common/AudioButton';

interface S01StudentHomeProps {
  onNavigate: (screen: ScreenId) => void;
  completedSalesCount: number;
  totalGoal: number;
}

export const S01StudentHome: React.FC<S01StudentHomeProps> = ({
  onNavigate,
  completedSalesCount,
  totalGoal = 3,
}) => {
  const { user } = useAuth();

  const objectiveText =
    'Atender al cliente, calcular el total y entregar el cambio correctamente.';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Welcome Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-bold uppercase tracking-wide mb-3">
            <span>Puesto de trabajo: Tienda IPCA</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Entrenamiento como vendedor/dependiente
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-2 max-w-2xl">
            Bienvenido/a, <span className="font-bold text-slate-800">{user?.displayName || 'Estudiante'}</span>.
            Aquí aprendes a atender a las personas, registrar productos y manejar la caja de la tienda.
          </p>
        </div>
      </div>

      {/* Objetivo del día */}
      <div className="bg-sky-50 rounded-3xl p-6 sm:p-8 border-2 border-sky-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-600 animate-pulse" />
              <h2 className="text-lg font-black text-sky-950 uppercase tracking-wide">
                Objetivo del día
              </h2>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              “{objectiveText}”
            </p>
          </div>
          <div className="shrink-0">
            <AudioButton
              textToSpeak={`Objetivo del día: ${objectiveText}`}
              label="Escuchar objetivo"
              variant="primary"
            />
          </div>
        </div>
      </div>

      {/* Mi progreso */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>Mi progreso en ventas</span>
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('S08')}
            className="text-sm font-bold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer min-h-[44px] px-2 flex items-center"
          >
            Ver detalle completo
          </button>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-semibold text-slate-700">
              Ventas de entrenamiento completadas
            </span>
            <span className="text-lg font-black text-slate-900 font-mono">
              {completedSalesCount} de {totalGoal}
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="w-full bg-slate-200 rounded-full h-4 overflow-hidden"
            role="progressbar"
            aria-valuenow={completedSalesCount}
            aria-valuemin={0}
            aria-valuemax={totalGoal}
            aria-label={`Progreso de ventas: ${completedSalesCount} de ${totalGoal}`}
          >
            <div
              className="bg-sky-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (completedSalesCount / totalGoal) * 100)}%` }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => onNavigate('S04')}
            className="flex-1 min-h-[56px] px-6 py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-6 h-6" />
            <span>{completedSalesCount > 0 ? 'Continuar entrenamiento' : 'Iniciar entrenamiento'}</span>
            <ArrowRight className="w-6 h-6 ml-auto" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('S02')}
            className="min-h-[56px] px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all cursor-pointer"
          >
            <Layers className="w-5 h-5 text-slate-600" />
            <span>Ver otros módulos</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('S03')}
            className="min-h-[56px] px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-slate-600" />
            <span>Ver productos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
