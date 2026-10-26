import React from 'react';
import { BookOpen, X } from 'lucide-react';
import { AudioButton } from './AudioButton';

interface GlosarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GLOSSARY_TERMS = [
  {
    term: 'Venta',
    definition: 'Es cuando entregas los productos que el cliente eligió a cambio de dinero.',
  },
  {
    term: 'Total',
    definition: 'Es la suma de los precios de todos los productos que el cliente va a comprar.',
  },
  {
    term: 'Pago del cliente',
    definition: 'Es la cantidad de dinero (monedas o billetes) que el cliente te entrega para pagar.',
  },
  {
    term: 'Cambio / Vuelto',
    definition: 'Es el dinero que le devuelves al cliente cuando paga con un valor mayor al total.',
  },
  {
    term: 'Cliente',
    definition: 'La persona que se acerca a la tienda del IPCA para solicitar y comprar productos.',
  },
  {
    term: 'Caja',
    definition: 'El lugar y puesto de trabajo donde el dependiente atiende y cobra las ventas.',
  },
];

export const GlosarioModal: React.FC<GlosarioModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glosario-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 sm:p-5 bg-sky-50 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 id="glosario-title" className="text-xl font-bold text-slate-900">
                Glosario de la tienda
              </h2>
              <p className="text-sm text-slate-600">Palabras clave del trabajo de vendedor</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[48px] min-h-[48px] p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-slate-300 cursor-pointer"
            aria-label="Cerrar glosario"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {GLOSSARY_TERMS.map((item, index) => (
            <div key={index} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-slate-900">{item.term}</span>
                <AudioButton
                  textToSpeak={`${item.term}. ${item.definition}`}
                  label="Escuchar definición"
                  variant="compact"
                />
              </div>
              <p className="text-base text-slate-700 mt-1">{item.definition}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-base transition-colors focus:outline-none focus:ring-4 focus:ring-sky-300 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
