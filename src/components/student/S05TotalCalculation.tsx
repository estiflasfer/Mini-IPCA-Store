import React, { useState } from 'react';
import { Activity, Product, ScreenId, StudentProfile } from '../../types';
import { formatCents } from '../../services/api';
import { ProductVisual } from '../common/ProductVisual';
import { AudioButton } from '../common/AudioButton';
import { FrasesUtilesModal } from '../common/FrasesUtilesModal';
import {
  Calculator,
  Lightbulb,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';

interface S05TotalCalculationProps {
  activity: any;
  products: Product[];
  selectedQuantities: Record<string, number>;
  profile?: StudentProfile | null;
  onSuccessTotal: (totalAnsweredCents: number) => void;
  onNavigate: (screen: ScreenId) => void;
  onBackToOrder: () => void;
}

export const S05TotalCalculation: React.FC<S05TotalCalculationProps> = ({
  activity,
  products,
  selectedQuantities,
  profile,
  onSuccessTotal,
  onNavigate,
  onBackToOrder,
}) => {
  // Dynamically calculate the real expected total using snapshot prices if present
  const itemsBreakdown = Object.entries(selectedQuantities)
    .filter(([_, qty]) => qty > 0)
    .map(([productId, quantity]) => {
      const snapItem = (activity as any)?.lineItems?.find((i: any) => i.productId === productId);
      const prod = products.find((p) => p.id === productId);
      const unitPriceCents = snapItem?.unitPriceCents ?? (prod ? prod.priceCents : 0);
      const subtotalCents = unitPriceCents * quantity;
      return {
        productId,
        name: snapItem?.productName || prod?.name || productId,
        visualKey: snapItem?.visualKey || prod?.visualKey || 'default',
        quantity,
        unitPriceCents,
        subtotalCents,
      };
    });

  const expectedTotalCents =
    (activity as any)?.totalExpectedCents ??
    itemsBreakdown.reduce((sum, item) => sum + item.subtotalCents, 0);

  // Generate dynamic distractor options based on expectedTotalCents and difficulty
  const choiceCount = profile?.choiceCount === 2 ? 2 : 4;
  const difficulty = (activity as any)?.difficulty || profile?.difficultyLevel || 'facil';

  const generateChoices = (): number[] => {
    const correct = expectedTotalCents;
    if (choiceCount === 2) {
      const step = difficulty === 'facil' ? 50 : difficulty === 'medio' ? 25 : 15;
      const wrong = Math.max(10, correct > step ? correct - step : correct + step);
      return [correct, wrong].sort((a, b) => a - b);
    }

    // 4 options: vary distractor step by difficulty
    let distractors: number[];
    if (difficulty === 'facil') {
      // Amplia separación para menor carga cognitiva
      distractors = [
        Math.max(10, correct - 100),
        Math.max(10, correct - 50),
        correct + 50,
        correct + 100,
      ].filter((c) => c !== correct);
    } else if (difficulty === 'medio') {
      // Separación moderada (25¢ - 50¢)
      distractors = [
        Math.max(10, correct - 50),
        Math.max(10, correct - 25),
        correct + 25,
        correct + 50,
        correct + 75,
      ].filter((c) => c !== correct);
    } else {
      // Avanzado: distractores sutiles que evalúan cálculo exacto (10¢ - 20¢)
      distractors = [
        Math.max(10, correct - 25),
        Math.max(10, correct - 10),
        correct + 10,
        correct + 15,
        correct + 25,
      ].filter((c) => c !== correct);
    }

    const set = Array.from(new Set([correct, ...distractors]));
    while (set.length < 4) {
      set.push(correct + set.length * 25);
    }
    return set.slice(0, 4).sort((a, b) => a - b);
  };

  const [choices] = useState<number[]>(generateChoices);
  const [selectedCents, setSelectedCents] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [showFrases, setShowFrases] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleCheckTotal = () => {
    if (selectedCents === null) return;

    setAttempts((prev) => prev + 1);

    if (selectedCents === expectedTotalCents) {
      setErrorFeedback(null);
      onSuccessTotal(selectedCents);
    } else {
      setErrorFeedback(
        `Ese no es el total correcto. El valor seleccionado fue ${formatCents(
          selectedCents
        )}. Revisa la suma de cada producto o consulta la pista.`
      );
    }
  };

  const firstItem = itemsBreakdown[0];
  const dynamicHint =
    (activity as any)?.hintText ||
    (firstItem
      ? `Primero calcula cuánto cuestan los ${firstItem.quantity} ${firstItem.name.toLowerCase()} (${firstItem.quantity} × ${formatCents(firstItem.unitPriceCents)} = ${formatCents(firstItem.subtotalCents)}). Luego suma los demás productos.`
      : 'Multiplica la cantidad de cada producto por su precio unitario y suma los subtotales.');

  const dynamicExample =
    (activity as any)?.exampleText ||
    (firstItem
      ? `${firstItem.quantity} ${firstItem.quantity === 1 ? 'unidad' : 'unidades'} de ${firstItem.name} a ${formatCents(firstItem.unitPriceCents)} c/u = ${formatCents(firstItem.subtotalCents)}.`
      : 'Suma el precio de cada producto del pedido.');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBackToOrder}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la selección de productos</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
              Paso 2 de 3: Total de la venta
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Cálculo del total de la venta
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFrases(true)}
            className="min-h-[48px] px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 font-bold text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-sky-700" />
            <span>Frases útiles</span>
          </button>
          <AudioButton
            textToSpeak={`Calcula el total de la venta. Productos seleccionados: ${itemsBreakdown.map(i => `${i.name}, ${i.quantity} unidades, subtotal ${formatCents(i.subtotalCents)}`).join('. ')}. ¿Cuál es el total de la venta?`}
            label="Escuchar detalle"
          />
        </div>
      </div>

      {/* Section: Productos seleccionados */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-2 pb-3 border-b border-slate-100">
          <Calculator className="w-5 h-5 text-sky-600" />
          <span>Productos seleccionados</span>
        </h2>

        <div className="space-y-3">
          {itemsBreakdown.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800"
            >
              <div className="flex items-center gap-3">
                <ProductVisual visualKey={item.visualKey} name={item.name} size="md" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {item.name} ({item.quantity})
                  </h3>
                  <p className="text-sm text-slate-600 font-mono">
                    {formatCents(item.unitPriceCents)} × {item.quantity}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 block">Subtotal</span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {formatCents(item.subtotalCents)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-sky-50/80 rounded-3xl p-6 sm:p-8 border-3 border-sky-300 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-200/80 px-3 py-1 rounded-full">
            Pregunta al vendedor
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            ¿Cuál es el total de la venta?
          </h2>
          <p className="text-base text-slate-600">
            Suma los valores de todos los productos del pedido y elige la respuesta correcta.
          </p>
        </div>

        {/* Choice buttons (dynamic according to current prices!) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {choices.map((cents) => {
            const isSelected = selectedCents === cents;
            return (
              <button
                key={cents}
                type="button"
                onClick={() => {
                  setSelectedCents(cents);
                  setErrorFeedback(null);
                }}
                className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl font-black text-2xl font-mono border-3 transition-all flex flex-col items-center justify-center cursor-pointer focus:outline-none focus:ring-4 ${
                  isSelected
                    ? 'bg-sky-600 border-sky-700 text-white shadow-lg scale-102 focus:ring-sky-300'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-sky-400 focus:ring-sky-200 shadow-xs'
                }`}
                aria-pressed={isSelected}
                aria-label={`Opción de total: ${formatCents(cents)}`}
              >
                <span>{formatCents(cents)}</span>
                {isSelected && (
                  <span className="text-xs font-bold uppercase tracking-wider mt-1 text-sky-100">
                    Seleccionado
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Supports Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className={`min-h-[48px] px-4 py-2 rounded-xl border-2 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors ${
              showHint
                ? 'bg-amber-100 border-amber-400 text-amber-900'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <span>{showHint ? 'Ocultar pista' : 'Pista'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExample(!showExample)}
            className={`min-h-[48px] px-4 py-2 rounded-xl border-2 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors ${
              showExample
                ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>{showExample ? 'Ocultar ejemplo' : 'Ejemplo'}</span>
          </button>

          <AudioButton
            textToSpeak={`Pista: ${dynamicHint}. Ejemplo: ${dynamicExample}`}
            label="Escuchar apoyos"
          />
        </div>

        {/* Dynamic Hint box */}
        {showHint && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-base block mb-0.5">Pista pedagógica:</span>
              <p className="text-base text-amber-900">{dynamicHint}</p>
            </div>
          </div>
        )}

        {/* Dynamic Example box */}
        {showExample && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-base block mb-0.5">Ejemplo guiado:</span>
              <p className="text-base text-emerald-900">{dynamicExample}</p>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {errorFeedback && (
          <div
            role="alert"
            aria-live="polite"
            className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3"
          >
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-base block">Revisa este paso</span>
              <p className="text-base text-rose-800 mt-1">{errorFeedback}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowHint(true);
                setShowExample(true);
              }}
              className="text-xs font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg border border-rose-300 cursor-pointer"
            >
              Ver ayudas
            </button>
          </div>
        )}

        {/* Primary CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCheckTotal}
            disabled={selectedCents === null}
            className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg sm:text-xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all cursor-pointer"
          >
            <CheckCircle className="w-6 h-6" />
            <span>Comprobar total</span>
            <ArrowRight className="w-6 h-6 ml-auto" />
          </button>
        </div>
      </div>

      <FrasesUtilesModal isOpen={showFrases} onClose={() => setShowFrases(false)} />
    </div>
  );
};
