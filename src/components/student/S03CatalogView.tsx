import React, { useState } from 'react';
import { Product, ScreenId } from '../../types';
import { formatCents } from '../../services/api';
import { ProductVisual } from '../common/ProductVisual';
import { VoiceSearchButton } from '../common/VoiceSearchButton';
import { AudioButton } from '../common/AudioButton';
import { GlosarioModal } from '../common/GlosarioModal';
import { AyudaModal } from '../common/AyudaModal';
import { Search, ShoppingBag, BookOpen, HelpCircle, ArrowLeft } from 'lucide-react';

interface S03CatalogViewProps {
  products: Product[];
  onNavigate: (screen: ScreenId) => void;
}

export const S03CatalogView: React.FC<S03CatalogViewProps> = ({
  products,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Normalize string for accent-insensitive and case-insensitive search
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // Filter only active products for student screen
  const activeProducts = products.filter((p) => p.active);
  const filteredProducts = activeProducts.filter((p) =>
    normalize(p.name).includes(normalize(searchTerm))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('S01')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Productos disponibles
          </h1>
          <p className="text-base sm:text-lg text-slate-600">
            Selecciona o busca un producto de la tienda.
          </p>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={() => onNavigate('S04')}
          className="min-h-[52px] px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-6 h-6" />
          <span>Atender a un cliente</span>
        </button>
      </div>

      {/* Search & Support Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <label htmlFor="search-product-input" className="sr-only">
            Buscar producto
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="search-product-input"
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

        {/* Voice Search & Aux Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <VoiceSearchButton onTranscript={(text) => setSearchTerm(text)} />

          <button
            type="button"
            onClick={() => setIsGlossaryOpen(true)}
            className="min-h-[48px] px-3.5 py-2 rounded-xl border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>Glosario</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="min-h-[48px] px-3.5 py-2 rounded-xl border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Ayuda</span>
          </button>

          <AudioButton
            textToSpeak="Productos disponibles en la tienda. Puedes buscar por nombre o usar la voz para encontrar lo que el cliente solicita."
            label="Escuchar"
            variant="compact"
          />
        </div>
      </div>

      {/* Results grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-500 px-1">
          <span>Mostrando {filteredProducts.length} producto(s) activos</span>
          {searchTerm && <span>Filtro: “{searchTerm}”</span>}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border-2 border-dashed border-slate-300 text-center space-y-3">
            <p className="text-lg font-bold text-slate-700">
              No se encontraron productos con “{searchTerm}”.
            </p>
            <p className="text-sm text-slate-500">
              Verifica cómo está escrito el nombre o presiona borrar filtro.
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm cursor-pointer"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-3"
              >
                <ProductVisual visualKey={p.visualKey} name={p.name} size="lg" />
                <div className="flex-1 w-full">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">
                    {p.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">{p.id}</div>
                  <div className="mt-2 text-xl font-black text-sky-700 font-mono">
                    {formatCents(p.priceCents)}
                  </div>
                </div>
                <AudioButton
                  textToSpeak={`${p.name}, precio ${formatCents(p.priceCents)}`}
                  label="Escuchar producto"
                  variant="compact"
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support Modals */}
      <GlosarioModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      <AyudaModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};
