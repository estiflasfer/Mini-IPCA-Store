import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ScreenId } from '../../types';
import { Store, LogOut, User as UserIcon, Type, Eye } from 'lucide-react';

interface AppNavbarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  largeText: boolean;
  onToggleLargeText: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  currentScreen,
  onNavigate,
  largeText,
  onToggleLargeText,
  highContrast,
  onToggleHighContrast,
}) => {
  const { user, logout, isStudent, isTeacher, isAdmin, canManageCatalog } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('P01');
  };

  const getRoleBadge = () => {
    if (isStudent) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
          Vendedor en formación
        </span>
      );
    }
    if (isTeacher) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Docente
        </span>
      );
    }
    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          Administrador Técnico
        </span>
      );
    }
    return null;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (!user) onNavigate('P01');
              else if (isStudent) onNavigate('S01');
              else if (isTeacher) onNavigate('T01');
              else onNavigate('A01');
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus:ring-4 focus:ring-sky-200 rounded-xl p-1 cursor-pointer"
            aria-label="Ir al inicio de Mini-IPCA Store"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm group-hover:bg-sky-700 transition-colors">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                Mini-IPCA Store
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:block">
                Tienda de Práctica Vocacional
              </span>
            </div>
          </button>
        </div>

        {/* User Status & Navigation Actions */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Accessibility helpers */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={onToggleLargeText}
                className={`min-h-[40px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  largeText ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Alternar texto grande"
                aria-pressed={largeText}
              >
                <Type className="w-4 h-4" />
                <span>Texto +</span>
              </button>
              <button
                type="button"
                onClick={onToggleHighContrast}
                className={`min-h-[40px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  highContrast ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Alternar alto contraste"
                aria-pressed={highContrast}
              >
                <Eye className="w-4 h-4" />
                <span>Contraste</span>
              </button>
            </div>

            {/* Role & Name */}
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-bold text-slate-800 leading-tight">
                {user.displayName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {getRoleBadge()}
                {isStudent && user.permissions.includes('manage_catalog') && (
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    Catálogo habilitado
                  </span>
                )}
              </div>
            </div>

            {/* Quick role-specific nav */}
            {isStudent && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('S01')}
                  className={`min-h-[48px] px-3.5 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    currentScreen === 'S01' ? 'bg-sky-100 text-sky-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Inicio
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('S08')}
                  className={`min-h-[48px] px-3.5 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    currentScreen === 'S08' ? 'bg-sky-100 text-sky-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Mi progreso
                </button>
                {canManageCatalog && (
                  <button
                    type="button"
                    onClick={() => onNavigate('T05')}
                    className={`min-h-[48px] px-3.5 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200`}
                  >
                    Gestionar productos
                  </button>
                )}
              </div>
            )}

            {isTeacher && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('T01')}
                  className={`min-h-[48px] px-3.5 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    currentScreen === 'T01' ? 'bg-sky-100 text-sky-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Panel Docente
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('T05')}
                  className={`min-h-[48px] px-3.5 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    currentScreen === 'T05' ? 'bg-sky-100 text-sky-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Productos
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('T06')}
                  className={`min-h-[48px] px-3.5 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    currentScreen === 'T06' ? 'bg-sky-100 text-sky-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Reportes
                </button>
              </div>
            )}

            {isAdmin && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('A01')}
                  className={`min-h-[48px] px-3.5 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    currentScreen === 'A01' ? 'bg-purple-100 text-purple-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Estado Técnico
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('A02')}
                  className={`min-h-[48px] px-3.5 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    currentScreen === 'A02' ? 'bg-purple-100 text-purple-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Usuarios y Roles
                </button>
              </div>
            )}

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="min-w-[48px] min-h-[48px] px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 font-medium text-sm flex items-center gap-2 transition-colors focus:outline-none focus:ring-4 focus:ring-rose-200 cursor-pointer"
              title="Cerrar sesión actual"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-500 font-medium">
            Acceso institucional IPCA
          </div>
        )}
      </div>
    </header>
  );
};
