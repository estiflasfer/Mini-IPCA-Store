import React, { useState, useEffect } from 'react';
import { Product, ScreenId, StudentProfile, DifficultyLevel } from '../../types';
import { formatCents } from '../../services/api';
import { ProductVisual } from '../common/ProductVisual';
import { AudioButton } from '../common/AudioButton';
import {
  Binary,
  Calculator,
  Clock,
  Ruler,
  HelpCircle,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Lightbulb,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export type ModuleType =
  | 'numeracion'
  | 'operaciones'
  | 'tiempo'
  | 'medidas'
  | 'problemas';

interface ModulePracticeProps {
  moduleType: ModuleType;
  profile?: StudentProfile | null;
  products: Product[];
  onNavigate: (screen: ScreenId) => void;
  onSaveResult: (resultData: any) => Promise<void>;
}

interface QuestionExercise {
  id: string;
  moduleType: ModuleType;
  title: string;
  scenarioText: string;
  audioPrompt: string;
  hintText: string;
  exampleText?: string;
  visualItems?: { visualKey: string; name: string; label?: string }[];
  options: { id: string; label: string; isCorrect: boolean }[];
  difficulty: DifficultyLevel;
  metadata?: any;
}

export const ModulePractice: React.FC<ModulePracticeProps> = ({
  moduleType,
  profile,
  products,
  onNavigate,
  onSaveResult,
}) => {
  const difficulty: DifficultyLevel = profile?.difficultyLevel || 'facil';
  const choiceCount = profile?.choiceCount === 2 ? 2 : 4;
  const activeProducts = products.filter((p) => p.active);

  // Generador de ejercicios según el módulo seleccionado
  const createExercise = (): QuestionExercise => {
    const exerciseId = `ACT-${moduleType.toUpperCase()}-${Date.now()}`;
    const p1 = activeProducts[0] || { id: 'P001', name: 'Agua', priceCents: 50, visualKey: 'water' };
    const p2 = activeProducts[1] || { id: 'P002', name: 'Jugo', priceCents: 80, visualKey: 'juice' };
    const p3 = activeProducts[2] || { id: 'P003', name: 'Galletas', priceCents: 75, visualKey: 'cookies' };

    switch (moduleType) {
      // -----------------------------------------------------------------
      // MODULO 2: NUMERACIÓN Y CONTEO
      // -----------------------------------------------------------------
      case 'numeracion': {
        const prod = activeProducts[Math.floor(Math.random() * activeProducts.length)] || p1;
        let targetQty = 3;
        if (difficulty === 'facil') {
          targetQty = Math.floor(Math.random() * 3) + 1; // 1 a 3
        } else if (difficulty === 'medio') {
          targetQty = Math.floor(Math.random() * 5) + 1; // 1 a 5
        } else {
          targetQty = Math.floor(Math.random() * 5) + 4; // 4 a 8
        }

        const scenarioText = `Un cliente solicita ${targetQty} ${targetQty === 1 ? 'unidad' : 'unidades'} de ${prod.name}. Selecciona la cantidad solicitada.`;
        const audioPrompt = `El cliente solicita ${targetQty} unidades de ${prod.name}. Selecciona la cantidad correcta.`;
        const hintText = `Cuenta con calma: el cliente pidió exactamente ${targetQty} unidades de ${prod.name}.`;

        // Generar distractores cercanos
        const distractors = [targetQty + 1, Math.max(1, targetQty - 1), targetQty + 2]
          .filter((n) => n !== targetQty);
        const uniqueOptions = Array.from(new Set([targetQty, ...distractors])).slice(0, choiceCount);
        uniqueOptions.sort((a, b) => a - b);

        return {
          id: exerciseId,
          moduleType,
          title: 'Numeración y conteo de productos',
          scenarioText,
          audioPrompt,
          hintText,
          visualItems: [{ visualKey: prod.visualKey, name: prod.name, label: `${targetQty} unidades` }],
          options: uniqueOptions.map((qty) => ({
            id: `opt-${qty}`,
            label: `${qty} ${qty === 1 ? 'unidad' : 'unidades'}`,
            isCorrect: qty === targetQty,
          })),
          difficulty,
          metadata: { targetQty, productId: prod.id },
        };
      }

      // -----------------------------------------------------------------
      // MODULO 3: OPERACIONES CON DINERO
      // -----------------------------------------------------------------
      case 'operaciones': {
        const prodA = activeProducts[0] || p1;
        const prodB = activeProducts[1] || p2;
        const totalCents = prodA.priceCents + prodB.priceCents;

        const scenarioText = `Un cliente compra 1 ${prodA.name.toLowerCase()} (${formatCents(prodA.priceCents)}) y 1 ${prodB.name.toLowerCase()} (${formatCents(prodB.priceCents)}). ¿Cuánto debe cobrar en total?`;
        const audioPrompt = `Un ${prodA.name} cuesta ${formatCents(prodA.priceCents)} y un ${prodB.name} cuesta ${formatCents(prodB.priceCents)}. ¿Cuánto cuestan juntos?`;
        const hintText = `Suma el valor de ambos productos: ${formatCents(prodA.priceCents)} más ${formatCents(prodB.priceCents)}.`;
        const exampleText = `Ejemplo: $0,50 + $0,80 = $1,30.`;

        const distractors = [
          Math.max(10, totalCents - 30),
          totalCents + 20,
          totalCents + 50,
        ].filter((c) => c !== totalCents);

        const optionsCents = Array.from(new Set([totalCents, ...distractors])).slice(0, choiceCount);
        optionsCents.sort((a, b) => a - b);

        return {
          id: exerciseId,
          moduleType,
          title: 'Operaciones de caja y sumas de precios',
          scenarioText,
          audioPrompt,
          hintText,
          exampleText,
          visualItems: [
            { visualKey: prodA.visualKey, name: prodA.name, label: formatCents(prodA.priceCents) },
            { visualKey: prodB.visualKey, name: prodB.name, label: formatCents(prodB.priceCents) },
          ],
          options: optionsCents.map((cents) => ({
            id: `opt-${cents}`,
            label: formatCents(cents),
            isCorrect: cents === totalCents,
          })),
          difficulty,
          metadata: { totalCents },
        };
      }

      // -----------------------------------------------------------------
      // MODULO 4: TIEMPO Y HORARIOS
      // -----------------------------------------------------------------
      case 'tiempo': {
        let correctTime = '08:00';
        let scenarioText = '';
        let optionsList: string[] = [];

        if (difficulty === 'facil') {
          correctTime = '08:00';
          scenarioText = 'En esta actividad de práctica, el turno matutino de la tienda comienza a las 08:00. Selecciona la hora correcta de inicio.';
          optionsList = choiceCount === 2 ? ['08:00', '10:00'] : ['07:00', '08:00', '09:00', '10:00'];
        } else if (difficulty === 'medio') {
          correctTime = '10:30';
          scenarioText = 'En esta actividad de práctica, el receso para refrigerio en la tienda es a las 10:30. Selecciona la hora indicada.';
          optionsList = choiceCount === 2 ? ['10:00', '10:30'] : ['09:30', '10:00', '10:30', '11:00'];
        } else {
          correctTime = '11:00';
          scenarioText = 'En esta actividad de práctica, la tienda abre a las 08:00 y la atención matutina dura 3 horas. ¿A qué hora finaliza el turno?';
          optionsList = choiceCount === 2 ? ['10:00', '11:00'] : ['09:00', '10:00', '11:00', '12:00'];
        }

        const audioPrompt = `${scenarioText} ¿Cuál es la hora indicada?`;
        const hintText = 'Lee detenidamente la hora señalada en el enunciado del ejercicio.';

        return {
          id: exerciseId,
          moduleType,
          title: 'Tiempo y horarios de la tienda',
          scenarioText,
          audioPrompt,
          hintText,
          options: optionsList.map((time) => ({
            id: `opt-${time}`,
            label: time,
            isCorrect: time === correctTime,
          })),
          difficulty,
          metadata: { correctTime },
        };
      }

      // -----------------------------------------------------------------
      // MODULO 5: MEDIDAS Y CAPACIDADES
      // -----------------------------------------------------------------
      case 'medidas': {
        let question = 'Un cliente solicita una botella de 1 litro de agua. Selecciona el envase correcto.';
        let correctLabel = '1 L';
        let optionsLabels = ['250 mL', '500 mL', '1 L', '2 L'];

        if (difficulty === 'facil') {
          question = 'Un cliente solicita una botella de 1 litro de agua. Selecciona el envase de 1 L.';
          correctLabel = '1 L';
          optionsLabels = choiceCount === 2 ? ['500 mL', '1 L'] : ['250 mL', '500 mL', '1 L', '2 L'];
        } else if (difficulty === 'medio') {
          question = '¿Cuál de los siguientes envases tiene mayor capacidad para almacenar líquido?';
          correctLabel = '1 L';
          optionsLabels = choiceCount === 2 ? ['250 mL', '1 L'] : ['250 mL', '500 mL', '750 mL', '1 L'];
        } else {
          question = 'Un cliente desea 500 mL de agua. Selecciona el envase correspondiente a medio litro.';
          correctLabel = '500 mL';
          optionsLabels = choiceCount === 2 ? ['500 mL', '1 L'] : ['250 mL', '500 mL', '1 L', '1.5 L'];
        }

        return {
          id: exerciseId,
          moduleType,
          title: 'Medidas y capacidades de productos',
          scenarioText: question,
          audioPrompt: question,
          hintText: 'Recuerda: 1 litro (1 L) es igual a 1000 mililitros (1000 mL) y tiene mayor capacidad que 500 mL.',
          visualItems: [{ visualKey: 'water', name: 'Agua', label: 'Capacidad' }],
          options: optionsLabels.slice(0, choiceCount).map((lbl) => ({
            id: `opt-${lbl}`,
            label: lbl,
            isCorrect: lbl === correctLabel,
          })),
          difficulty,
          metadata: { correctLabel },
        };
      }

      // -----------------------------------------------------------------
      // MODULO 6: PROBLEMAS FUNCIONALES DE TIENDA
      // -----------------------------------------------------------------
      case 'problemas':
      default: {
        const prod = activeProducts[0] || p1;
        const qty = difficulty === 'facil' ? 2 : difficulty === 'medio' ? 2 : 3;
        const unitPrice = prod.priceCents;
        const total = unitPrice * qty;
        // Pago redondeado hacia arriba al siguiente dólar
        const payment = Math.ceil(total / 100) * 100;
        const changeExpected = payment - total;

        const scenarioText = `Un cliente compra ${qty} unidades de ${prod.name.toLowerCase()} a ${formatCents(unitPrice)} cada una. Paga con un billete de ${formatCents(payment)}. ¿Cuánto cambio debe recibir?`;
        const audioPrompt = `${scenarioText}`;
        const hintText = `Paso 1: Calcula el total (${qty} × ${formatCents(unitPrice)} = ${formatCents(total)}). Paso 2: Resta el total del dinero entregado (${formatCents(payment)} − ${formatCents(total)} = ${formatCents(changeExpected)}).`;

        const distractors = [
          Math.max(10, changeExpected - 25),
          changeExpected + 20,
          changeExpected + 50,
        ].filter((c) => c !== changeExpected);

        const optionsCents = Array.from(new Set([changeExpected, ...distractors])).slice(0, choiceCount);
        optionsCents.sort((a, b) => a - b);

        return {
          id: exerciseId,
          moduleType: 'problemas',
          title: 'Problemas funcionales de venta y cambio',
          scenarioText,
          audioPrompt,
          hintText,
          visualItems: [
            { visualKey: prod.visualKey, name: prod.name, label: `${qty} × ${formatCents(unitPrice)}` },
          ],
          options: optionsCents.map((cents) => ({
            id: `opt-${cents}`,
            label: formatCents(cents),
            isCorrect: cents === changeExpected,
          })),
          difficulty,
          metadata: { changeExpected, total, payment },
        };
      }
    }
  };

  // Estado del ejercicio actual (se mantiene estable en rerenders y reintentos)
  const [currentExercise, setCurrentExercise] = useState<QuestionExercise>(createExercise);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // Manejador de comprobación de respuesta
  const handleVerifyAnswer = async () => {
    if (!selectedOptionId) return;

    const chosen = currentExercise.options.find((o) => o.id === selectedOptionId);
    if (!chosen) return;

    if (chosen.isCorrect) {
      setFeedback({
        isCorrect: true,
        message: '¡Muy bien! Resolviste correctamente esta actividad.',
      });
      setIsCompleted(true);

      // Persistir resultado
      try {
        await onSaveResult({
          activityId: currentExercise.id,
          moduleType: currentExercise.moduleType,
          activityType: currentExercise.moduleType,
          difficulty: currentExercise.difficulty,
          lineItemsSnapshot: [],
          totalExpectedCents: currentExercise.metadata?.total || 0,
          totalAnsweredCents: currentExercise.metadata?.total || 0,
          paymentAmountCents: currentExercise.metadata?.payment || 0,
          changeExpectedCents: currentExercise.metadata?.changeExpected || 0,
          changeAnsweredCents: currentExercise.metadata?.changeExpected || 0,
          attempts,
          correct: true,
          supportsUsed: showHint ? ['pista'] : [],
        });
      } catch (err) {
        console.warn('Error guardando resultado de módulo:', err);
      }
    } else {
      setAttempts((prev) => prev + 1);
      setFeedback({
        isCorrect: false,
        message: 'Revisa tu respuesta y vuelve a intentarlo con calma.',
      });
    }
  };

  // Reintentar el MISMO ejercicio exactamente (preservando datos y estado)
  const handleRetrySame = () => {
    setSelectedOptionId(null);
    setFeedback(null);
  };

  // Generar NUEVO ejercicio con la misma dificultad configurada
  const handleNewExercise = () => {
    setCurrentExercise(createExercise());
    setSelectedOptionId(null);
    setFeedback(null);
    setShowHint(false);
    setShowExample(false);
    setAttempts(1);
    setIsCompleted(false);
  };

  const getModuleIcon = () => {
    switch (moduleType) {
      case 'numeracion':
        return <Binary className="w-8 h-8 text-sky-600" />;
      case 'operaciones':
        return <Calculator className="w-8 h-8 text-emerald-600" />;
      case 'tiempo':
        return <Clock className="w-8 h-8 text-amber-600" />;
      case 'medidas':
        return <Ruler className="w-8 h-8 text-purple-600" />;
      case 'problemas':
      default:
        return <HelpCircle className="w-8 h-8 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('S02')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a módulos de entrenamiento</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-sky-900">
              Módulo: {currentExercise.title}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 uppercase">
              Nivel: {difficulty}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {currentExercise.title}
          </h1>
        </div>

        <AudioButton
          textToSpeak={currentExercise.audioPrompt}
          label="Escuchar actividad"
          variant="primary"
        />
      </div>

      {/* Main Exercise Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-6">
        {/* Scenario description banner */}
        <div className="bg-sky-50/80 rounded-2xl p-5 border border-sky-200 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
            {getModuleIcon()}
          </div>
          <div className="flex-1">
            <span className="text-xs font-black uppercase tracking-wider text-sky-800 block mb-1">
              Situación práctica de la tienda
            </span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              “{currentExercise.scenarioText}”
            </p>
          </div>
        </div>

        {/* Visual product support if present */}
        {currentExercise.visualItems && currentExercise.visualItems.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4 py-2">
            {currentExercise.visualItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200"
              >
                <ProductVisual visualKey={item.visualKey} name={item.name} size="md" />
                <div>
                  <span className="font-bold text-base text-slate-900 block">{item.name}</span>
                  {item.label && (
                    <span className="text-xs font-semibold text-sky-700 font-mono block">
                      {item.label}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Options Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide text-center">
            Selecciona la respuesta correcta:
          </h2>
          <div className={`grid gap-4 ${choiceCount === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {currentExercise.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isCompleted}
                  onClick={() => {
                    setSelectedOptionId(opt.id);
                    setFeedback(null);
                  }}
                  className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl font-black text-xl border-3 transition-all flex flex-col items-center justify-center cursor-pointer focus:outline-none focus:ring-4 ${
                    isSelected
                      ? 'bg-sky-600 border-sky-700 text-white shadow-md scale-102 focus:ring-sky-200'
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-sky-300 focus:ring-sky-100 shadow-xs'
                  } ${isCompleted ? 'opacity-90' : ''}`}
                  aria-pressed={isSelected}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <span className="text-xs font-bold uppercase tracking-wider mt-1 text-sky-100">
                      Seleccionado
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Supports Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {profile?.showHint !== false && (
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
          )}

          {currentExercise.exampleText && profile?.showExample !== false && (
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
          )}
        </div>

        {/* Dynamic Hint box */}
        {showHint && (
          <div
            role="note"
            className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3"
          >
            <Lightbulb className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-base block mb-0.5">Pista pedagógica:</span>
              <p className="text-base text-amber-900">{currentExercise.hintText}</p>
            </div>
            <AudioButton
              textToSpeak={`Pista: ${currentExercise.hintText}`}
              label="Escuchar pista"
              variant="compact"
            />
          </div>
        )}

        {/* Dynamic Example box */}
        {showExample && currentExercise.exampleText && (
          <div
            role="note"
            className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-start gap-3"
          >
            <BookOpen className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-base block mb-0.5">Ejemplo guiado:</span>
              <p className="text-base text-emerald-900">{currentExercise.exampleText}</p>
            </div>
            <AudioButton
              textToSpeak={`Ejemplo: ${currentExercise.exampleText}`}
              label="Escuchar ejemplo"
              variant="compact"
            />
          </div>
        )}

        {/* Immediate Feedback */}
        {feedback && (
          <div
            role="alert"
            aria-live="polite"
            className={`p-5 rounded-2xl border-2 flex items-start gap-3 ${
              feedback.isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            {feedback.isCorrect ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-base">
                {feedback.isCorrect ? '¡Excelente trabajo!' : 'Inténtalo de nuevo'}
              </h3>
              <p className="text-base mt-0.5">{feedback.message}</p>
            </div>
            {!feedback.isCorrect && (
              <button
                type="button"
                onClick={handleRetrySame}
                className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-sm cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Intentar nuevamente</span>
              </button>
            )}
          </div>
        )}

        {/* Primary Action Button */}
        <div className="pt-2">
          {!isCompleted ? (
            <button
              type="button"
              onClick={handleVerifyAnswer}
              disabled={!selectedOptionId}
              className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all cursor-pointer"
            >
              <CheckCircle className="w-6 h-6" />
              <span>Comprobar respuesta</span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleNewExercise}
                className="flex-1 min-h-[56px] px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Practicar otra actividad</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('S02')}
                className="min-h-[56px] px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Volver a módulos</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
