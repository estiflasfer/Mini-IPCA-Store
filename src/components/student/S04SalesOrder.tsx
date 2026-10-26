import React, { useState } from 'react';
import { Activity, Product, ScreenId } from '../../types';
import { formatCents } from '../../services/api';
import { ProductVisual } from '../common/ProductVisual';
import { VoiceSearchButton } from '../common/VoiceSearchButton';
import { AudioButton } from '../common/AudioButton';
import { FrasesUtilesModal } from '../common/FrasesUtilesModal';
import { AyudaModal } from '../common/AyudaModal';
import {
  Search,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  HelpCircle,
  Pause,
  Lightbulb,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface S04SalesOrderProps {
  activity: Activity & { expectedTotalCents: number; expectedChangeCents: number };
  products: Product[];
  selectedQuantities: Record<string, number>;
  onUpdateQuantities: (quantities: Record<string, number>) => void;
  onProceedToTotal: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const S04SalesOrder: React.FC<S04SalesOrderProps> = ({
  activity,
  products,
  selectedQuantities,
  onUpdateQuantities,
  onProceedToTotal,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFrasesModal, setShowFrasesModal] = useState(false);
  const [showAyudaModal, setShowAyudaModal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // Filter only active products
  const activeProducts = products.filter((p) => p.active);
  const filteredProducts = activeProducts.filter((p) =>
    normalize(p.name).includes(normalize(searchTerm))
  );

  const handleQuantityChange = (productId: string, delta: number) => {
    const current = selectedQuantities[productId] || 0;
    const next = Math.max(0, current + delta);
    const updated = {
      ...selectedQuantities,
      [productId]: next,
    };
    onUpdateQuantities(updated);
    setValidationError(null);
  };

  const handleValidateOrder = () => {
    setValidationError(null);

    // Verify against activity line items
    let isMatch = true;
    let mismatchDetails: string[] = [];

    // Check requested items
    for (const req of activity.lineItems) {
      const selectedQty = selectedQuantities[req.productId] || 0;
      const productObj = products.find((p) => p.id === req.productId);
      const prodName = productObj ? productObj.name : req.productId;

      if (selectedQty !== req.quantity) {
        isMatch = false;
        mismatchDetails.push(`${prodName}: solicitó ${req.quantity}, pusiste ${selectedQty}`);
      }
    }

    // Check if extra products were selected
    for (const [pId, qty] of Object.entries(selectedQuantities)) {
      if (qty > 0 && !activity.lineItems.some((l) => l.productId === pId)) {
        isMatch = false;
        const extraProd = products.find((p) => p.id === pId);
        mismatchDetails.push(`${extraProd?.name || pId} no fue solicitado en este pedido.`);
      }
    }

    if (!isMatch) {
      setValidationError(
        'Revisa los productos seleccionados: ' +
          mismatchDetails.join('. ') +
          '. Ajusta las cantidades con los botones + y − e intenta de nuevo.'
      );
      return;
    }

    // Passed!
    onProceedToTotal();
  };

  // Build order summary list
  const selectedEntries = Object.entries(selectedQuantities).filter(([_, qty]) => qty > 0);
  const totalItemCount = selectedEntries.reduce((sum, [_, q]) => sum + q, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Client Request Banner - MUST STAY PROMINENT AND VISIBLE */}
      <div className="bg-amber-50 rounded-3xl p-5 sm:p-7 border-3 border-amber-300 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-block text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full mb-1">
                Pedido del cliente en el mostrador
              </span>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                “{activity.instruction}”
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <AudioButton
              textToSpeak={`El cliente solicita: ${activity.instruction}`}
              label="Escuchar pedido"
              variant="primary"
            />
          </div>
        </div>
      </div>

      {/* Supports Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFrasesModal(true)}
            className="min-h-[48px] px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-sky-200"
          >
            <MessageSquare className="w-5 h-5 text-sky-700" />
            <span>Frases útiles</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className={`min-h-[48px] px-4 py-2 rounded-xl border font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-4 ${
              showHint
                ? 'bg-amber-100 border-amber-400 text-amber-900 focus:ring-amber-200'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 focus:ring-slate-200'
            }`}
          >
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <span>{showHint ? 'Ocultar pista' : 'Pista'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAyudaModal(true)}
            className="min-h-[48px] px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            <HelpCircle className="w-5 h-5 text-slate-600" />
            <span>Pedir ayuda</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('S01')}
          className="min-h-[48px] px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Pause className="w-4 h-4" />
          <span>Pausar</span>
        </button>
      </div>

      {/* Optional Hint Box */}
      {showHint && (
        <div
          role="note"
          aria-live="polite"
          className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3"
        >
          <Lightbulb className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-base mb-0.5">Pista para registrar el pedido:</h3>
            <p className="text-base text-amber-900">
              Observa con atención: el cliente pidió 2 jugos y 1 paquete de galletas. Busca cada producto en la lista y presiona el botón (+) hasta que el número sea igual al pedido.
            </p>
          </div>
          <AudioButton
            textToSpeak="Pista: Observa con atención: el cliente pidió 2 jugos y 1 paquete de galletas. Busca cada producto en la lista y presiona el botón más hasta que el número sea igual al pedido."
            label="Escuchar pista"
            variant="compact"
          />
        </div>
      )}

      {/* Validation Error Feedback */}
      {validationError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3"
        >
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-base">Revisa las cantidades seleccionadas</h3>
            <p className="text-base text-rose-800 mt-1">{validationError}</p>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-rose-700 font-bold hover:underline px-2 py-1 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Two-column layout: Search & Products + Current Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Selection (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <label htmlFor="search-order-input" className="sr-only">
                Buscar producto
              </label>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="search-order-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar producto (ej. jugo, galletas)..."
                className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-900 text-base focus:border-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-100"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer min-h-[48px] px-2"
                  aria-label="Borrar búsqueda"
                >
                  ×
                </button>
              )}
            </div>
            <VoiceSearchButton onTranscript={(txt) => setSearchTerm(txt)} />
          </div>

          {/* Product cards */}
          <div className="space-y-3">
            {filteredProducts.map((p) => {
              const qty = selectedQuantities[p.id] || 0;
              const isSelected = qty > 0;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <ProductVisual visualKey={p.visualKey} name={p.name} size="md" />
                    <div className="truncate">
                      <h4 className="font-bold text-lg text-slate-900 truncate">{p.name}</h4>
                      <p className="text-base font-black text-sky-700 font-mono">
                        {formatCents(p.priceCents)} c/u
                      </p>
                    </div>
                  </div>

                  {/* Quantity controls (- / qty / +) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(p.id, -1)}
                      disabled={qty === 0}
                      className="min-w-[48px] min-h-[48px] rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-slate-200 transition-colors cursor-pointer"
                      aria-label={`Restar una unidad de ${p.name}. Cantidad actual: ${qty}`}
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    <span
                      className="w-12 text-center text-2xl font-black text-slate-900 font-mono"
                      aria-label={`${qty} unidades de ${p.name}`}
                    >
                      {qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleQuantityChange(p.id, 1)}
                      className="min-w-[48px] min-h-[48px] rounded-xl border-2 border-sky-600 bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center font-bold focus:outline-none focus:ring-4 focus:ring-sky-200 transition-colors cursor-pointer"
                      aria-label={`Agregar una unidad de ${p.name}. Cantidad actual: ${qty}`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Current Order Summary (1 col) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-900">Resumen del pedido</h3>
              <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {totalItemCount} producto(s)
              </span>
            </div>

            {selectedEntries.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <p className="text-base font-semibold">Ningún producto seleccionado</p>
                <p className="text-xs">Usa los botones (+) para registrar los productos pedidos</p>
              </div>
            ) : (
              <div className="py-4 space-y-3">
                {selectedEntries.map(([productId, quantity]) => {
                  const prod = products.find((p) => p.id === productId);
                  if (!prod) return null;
                  const subtotal = prod.priceCents * quantity;

                  return (
                    <div
                      key={productId}
                      className="flex items-center justify-between text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <ProductVisual visualKey={prod.visualKey} name={prod.name} size="sm" />
                        <div>
                          <span className="font-bold text-base block">{prod.name}</span>
                          <span className="text-xs text-slate-500">
                            {quantity} × {formatCents(prod.priceCents)}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-base font-mono text-slate-900">
                        {formatCents(subtotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Primary Confirm button */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <button
              type="button"
              onClick={handleValidateOrder}
              disabled={totalItemCount === 0}
              className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all cursor-pointer"
            >
              <CheckCircle className="w-6 h-6" />
              <span>Confirmar productos</span>
            </button>
            <p className="text-xs text-slate-500 text-center">
              Paso siguiente: calcular el total de la venta
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FrasesUtilesModal
        isOpen={showFrasesModal}
        onClose={() => setShowFrasesModal(false)}
      />
      <AyudaModal
        isOpen={showAyudaModal}
        onClose={() => setShowAyudaModal(false)}
      />
    </div>
  );
};
