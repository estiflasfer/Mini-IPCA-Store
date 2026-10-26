import React from 'react';

interface ProductVisualProps {
  visualKey: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  visualKey,
  name,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
    xl: 'w-28 h-28 text-5xl',
  };

  const getVisual = () => {
    switch (visualKey.toLowerCase()) {
      case 'water':
      case 'agua':
        return (
          <div className="flex flex-col items-center justify-center text-sky-600 bg-sky-50 rounded-xl p-2 border border-sky-100 shadow-sm w-full h-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4/5 h-4/5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5s-6 6.5-6 11.5a6 6 0 1012 0c0-5-6-11.5-6-11.5z" fill="#e0f2fe" />
              <path strokeLinecap="round" d="M9 14a3 3 0 003 3" />
            </svg>
          </div>
        );
      case 'juice':
      case 'jugo':
        return (
          <div className="flex flex-col items-center justify-center text-amber-600 bg-amber-50 rounded-xl p-2 border border-amber-100 shadow-sm w-full h-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4/5 h-4/5">
              <rect x="6" y="7" width="12" height="15" rx="2" fill="#fef3c7" />
              <path strokeLinecap="round" d="M10 7V2l4 3" />
              <circle cx="12" cy="14" r="2.5" fill="#f59e0b" />
            </svg>
          </div>
        );
      case 'cookies':
      case 'galletas':
        return (
          <div className="flex flex-col items-center justify-center text-orange-700 bg-orange-50 rounded-xl p-2 border border-orange-100 shadow-sm w-full h-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4/5 h-4/5">
              <circle cx="12" cy="12" r="9" fill="#ffedd5" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="15" cy="10" r="1.3" fill="currentColor" />
              <circle cx="10" cy="15" r="1.3" fill="currentColor" />
              <circle cx="14" cy="15" r="1.3" fill="currentColor" />
            </svg>
          </div>
        );
      case 'yogurt':
      case 'yogur':
        return (
          <div className="flex flex-col items-center justify-center text-pink-600 bg-pink-50 rounded-xl p-2 border border-pink-100 shadow-sm w-full h-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4/5 h-4/5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 6h10l-1.5 14H8.5L7 6z" fill="#fce7f3" />
              <path strokeLinecap="round" d="M6 6h12M10 2v4" />
              <path strokeLinecap="round" d="M9.5 12c1.5 1 3.5 1 5 0" />
            </svg>
          </div>
        );
      case 'milk':
      case 'leche':
        return (
          <div className="flex flex-col items-center justify-center text-blue-600 bg-blue-50 rounded-xl p-2 border border-blue-100 shadow-sm w-full h-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4/5 h-4/5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8l-1-4H9L8 8z" fill="#dbeafe" />
              <rect x="7" y="8" width="10" height="13" rx="1.5" fill="#eff6ff" />
              <path strokeLinecap="round" d="M10 13h4M12 11v4" />
            </svg>
          </div>
        );
      case 'bread':
      case 'pan':
        return (
          <div className="flex flex-col items-center justify-center text-yellow-700 bg-yellow-50 rounded-xl p-2 border border-yellow-100 shadow-sm w-full h-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4/5 h-4/5">
              <ellipse cx="12" cy="12" rx="9" ry="6" fill="#fef9c3" />
              <path strokeLinecap="round" d="M9 10c.5 1.5 1 2.5 1 3M14 10c-.5 1.5-1 2.5-1 3" />
            </svg>
          </div>
        );
      case 'chocolate':
        return (
          <div className="flex flex-col items-center justify-center text-amber-900 bg-amber-100/70 rounded-xl p-2 border border-amber-200 shadow-sm w-full h-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4/5 h-4/5">
              <rect x="6" y="4" width="12" height="16" rx="2" fill="#78350f" fillOpacity="0.2" />
              <path strokeLinecap="round" d="M6 10h12M6 15h12M12 4v16" />
            </svg>
          </div>
        );
      case 'chips':
      case 'papas fritas':
        return (
          <div className="flex flex-col items-center justify-center text-amber-600 bg-amber-50 rounded-xl p-2 border border-amber-100 shadow-sm w-full h-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4/5 h-4/5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 9l1.5 12h7L17 9H7z" fill="#fef3c7" />
              <path strokeLinecap="round" d="M9 9V5M12 9V3M15 9V6" />
            </svg>
          </div>
        );
      case 'candy':
      case 'caramelo':
        return (
          <div className="flex flex-col items-center justify-center text-rose-600 bg-rose-50 rounded-xl p-2 border border-rose-100 shadow-sm w-full h-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4/5 h-4/5">
              <circle cx="12" cy="12" r="5" fill="#ffe4e6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.5L3 17v-4l4.5 1.5zM16.5 9.5L21 7v4l-4.5-1.5z" />
            </svg>
          </div>
        );
      case 'tuna':
      case 'atún':
        return (
          <div className="flex flex-col items-center justify-center text-cyan-700 bg-cyan-50 rounded-xl p-2 border border-cyan-100 shadow-sm w-full h-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4/5 h-4/5">
              <ellipse cx="12" cy="7" rx="8" ry="3.5" fill="#cffafe" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 1.93 3.58 3.5 8 3.5s8-1.57 8-3.5V7" />
              <ellipse cx="12" cy="17" rx="8" ry="3.5" fill="#e0f2fe" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center text-slate-600 bg-slate-100 rounded-xl p-2 border border-slate-200 shadow-sm w-full h-full font-semibold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4/5 h-4/5">
              <rect x="4" y="4" width="16" height="16" rx="3" />
              <path d="M9 12h6M12 9v6" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}
      aria-label={`Pictograma de ${name}`}
      role="img"
    >
      {getVisual()}
    </div>
  );
};
