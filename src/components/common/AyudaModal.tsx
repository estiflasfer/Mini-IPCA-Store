import React from 'react';
import { HelpCircle, X, CheckCircle, Search, DollarSign, ArrowRight } from 'lucide-react';
import { AudioButton } from './AudioButton';

interface AyudaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AyudaModal: React.FC<AyudaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      icon: Search,
      title: '1. Lee o escucha el pedido del cliente',
      description: 'Presta atención a los nombres de los productos y a cuántas unidades solicita.',
    },
    {
      num: 2,
      icon: CheckCircle,
      title: '2. Busca y selecciona los productos',
      description: 'Escribe el nombre en el buscador o usa la voz. Presiona + para agregar unidades.',
    },
    {
      num: 3,
      icon: DollarSign,
      title: '3. Calcula el total de la venta',
      description: 'Multiplica o suma el valor de cada producto. Usa la pista si tienes dudas.',
    },
    {
      num: 4,
      icon: ArrowRight,
      title: '4. Calcula y entrega el cambio',
      description: 'Resta el total de la venta del dinero que el cliente te entregó.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ayuda-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 sm:p-5 bg-sky-50 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 id="ayuda-title" className="text-xl font-bold text-slate-900">
                Guía de atención en caja
              </h2>
              <p className="text-sm text-slate-600">Pasos para atender al cliente con calma</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[48px] min-h-[48px] p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-slate-300 cursor-pointer"
            aria-label="Cerrar ventana de ayuda"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-lg shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-sky-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900">{st.title}</h3>
                    <AudioButton
                      textToSpeak={`${st.title}. ${st.description}`}
                      label="Escuchar paso"
                      variant="compact"
                    />
                  </div>
                  <p className="text-base text-slate-700 mt-1">{st.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-base transition-colors focus:outline-none focus:ring-4 focus:ring-sky-300 cursor-pointer"
          >
            Continuar con la venta
          </button>
        </div>
      </div>
    </div>
  );
};
