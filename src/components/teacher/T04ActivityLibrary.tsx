import React, { useState } from 'react';
import { Activity, Product, ScreenId } from '../../types';
import { formatCents, api } from '../../services/api';
import {
  Layers,
  ShoppingBag,
  Binary,
  Calculator,
  Clock,
  Ruler,
  HelpCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Eye,
  Sliders,
} from 'lucide-react';

interface T04ActivityLibraryProps {
  activities: (Activity & {
    expectedTotalCents: number;
    expectedChangeCents: number;
    hasInactiveProduct: boolean;
  })[];
  products: Product[];
  onNavigate: (screen: ScreenId) => void;
  onRefreshActivities: () => void;
}

export const T04ActivityLibrary: React.FC<T04ActivityLibraryProps> = ({
  activities,
  products,
  onNavigate,
  onRefreshActivities,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'venta_caja':
        return ShoppingBag;
      case 'numeracion':
        return Binary;
      case 'operaciones':
        return Calculator;
      case 'tiempo':
        return Clock;
      case 'medidas':
        return Ruler;
      default:
        return HelpCircle;
    }
  };

  const handleUpdateDifficulty = async (activityId: string, newDiff: any) => {
    setIsUpdating(true);
    try {
      await api.updateActivity(activityId, { difficulty: newDiff });
      onRefreshActivities();
    } catch (err: any) {
      alert(`Error al actualizar: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
            Biblioteca de actividades formativas
          </h1>
          <p className="text-base text-slate-600">
            Escenarios de entrenamiento adaptados para el taller y la caja del IPCA
          </p>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.map((act) => {
          const Icon = getModuleIcon(act.type);

          return (
            <div
              key={act.id}
              className={`p-6 rounded-3xl border-2 transition-all bg-white shadow-xs ${
                act.hasInactiveProduct
                  ? 'border-amber-400 bg-amber-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase font-mono">
                        {act.id}
                      </span>
                      <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                        {act.moduleTitle}
                      </span>
                      {act.hasInactiveProduct && (
                        <span className="text-xs font-bold text-amber-900 bg-amber-200/90 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Contiene producto inactivo</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-slate-900">{act.title}</h2>
                    <p className="text-base font-semibold text-slate-700 mt-1">
                      “{act.instruction}”
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 font-mono">
                      <span>
                        Total esperado: <strong>{formatCents(act.expectedTotalCents)}</strong>
                      </span>
                      <span>
                        Pago cliente: <strong>{formatCents(act.paymentAmountCents)}</strong>
                      </span>
                      <span>
                        Cambio esperado: <strong>{formatCents(act.expectedChangeCents)}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 px-2">Dificultad:</span>
                    {(['facil', 'medio', 'avanzado'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleUpdateDifficulty(act.id, d)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                          act.difficulty === d
                            ? 'bg-white text-sky-800 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedActivity(act)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-slate-600" />
                    <span>Detalle</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border-2 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-xl text-slate-900">
                Detalle de {selectedActivity.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl cursor-pointer min-h-[44px] px-2"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <strong>Módulo:</strong> {selectedActivity.moduleTitle}
              </p>
              <p>
                <strong>Instrucción visible:</strong> “{selectedActivity.instruction}”
              </p>
              <div>
                <strong>Productos solicitados en el escenario:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 text-slate-700">
                  {selectedActivity.lineItems.map((item: any, i: number) => {
                    const prod = products.find((p) => p.id === item.productId);
                    return (
                      <li key={i}>
                        {prod ? prod.name : item.productId} — {item.quantity} unidad(es) ({formatCents(prod?.priceCents || 0)} c/u)
                      </li>
                    );
                  })}
                </ul>
              </div>
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                Los totales y cambios se calculan de manera dinámica en función del catálogo activo vigente.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
