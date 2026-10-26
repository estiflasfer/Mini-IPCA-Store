import React from 'react';
import { MessageSquare, X, Volume2 } from 'lucide-react';
import { AudioButton } from './AudioButton';

interface FrasesUtilesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VOCATIONAL_PHRASES = [
  { text: 'Buenos días.', context: 'Saludo inicial cordial al recibir al cliente en caja' },
  { text: '¿Me puede repetir el pedido?', context: 'Para verificar productos si no escuchaste bien' },
  { text: 'Un momento, por favor.', context: 'Para pedir paciencia mientras buscas los productos' },
  { text: 'El total es…', context: 'Para indicar el valor total de la compra' },
  { text: 'Usted paga con…', context: 'Para confirmar el billete o moneda recibido' },
  { text: 'Su cambio es…', context: 'Para entregar las monedas o billetes de vuelto' },
  { text: 'Gracias por su compra.', context: 'Despedida cordial al finalizar la atención' },
  { text: 'Necesito ayuda.', context: 'Para llamar al docente o tutor si tienes dudas' },
  { text: 'Terminé.', context: 'Para indicar que la atención fue concluida con éxito' },
];

export const FrasesUtilesModal: React.FC<FrasesUtilesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="frases-utiles-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-sky-50 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 id="frases-utiles-title" className="text-xl font-bold text-slate-900">
                Frases útiles para atender
              </h2>
              <p className="text-sm text-slate-600">
                Apoyo de comunicación para hablar con el cliente en la tienda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[48px] min-h-[48px] p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-slate-300 cursor-pointer"
            aria-label="Cerrar ventana de frases útiles"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 divide-y divide-slate-100">
          {VOCATIONAL_PHRASES.map((item, index) => (
            <div
              key={index}
              className="pt-3 first:pt-0 flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
            >
              <div className="flex-1">
                <p className="text-lg font-bold text-slate-900">
                  “{item.text}”
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.context}
                </p>
              </div>
              <AudioButton
                textToSpeak={item.text}
                label="Escuchar frase"
                variant="compact"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-base transition-colors focus:outline-none focus:ring-4 focus:ring-sky-300 cursor-pointer"
          >
            Volver a la venta
          </button>
        </div>
      </div>
    </div>
  );
};
