import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role, ScreenId } from '../../types';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles?: Role[];
  requireCatalogPermission?: boolean;
  onRedirect: (screen: ScreenId) => void;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  requireCatalogPermission,
  onRedirect,
  children,
}) => {
  const { user, isLoading, canManageCatalog } = useAuth();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setDenied(true);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      setDenied(true);
      return;
    }

    if (requireCatalogPermission && !canManageCatalog) {
      setDenied(true);
      return;
    }

    setDenied(false);
  }, [user, isLoading, allowedRoles, requireCatalogPermission, canManageCatalog]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-600 border-t-transparent" />
      </div>
    );
  }

  if (denied || !user) {
    const defaultScreen: ScreenId = !user
      ? 'P01'
      : user.role === 'student'
      ? 'S01'
      : user.role === 'teacher'
      ? 'T01'
      : 'A01';

    return (
      <div className="max-w-lg mx-auto my-12 p-6 sm:p-8 bg-white border-2 border-rose-200 rounded-2xl shadow-lg text-center" role="alert">
        <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Acceso restringido</h2>
        <p className="text-base text-slate-600 mb-6">
          No dispones de los permisos necesarios para ingresar a esta sección del sistema.
        </p>
        <button
          type="button"
          onClick={() => onRedirect(defaultScreen)}
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-base focus:outline-none focus:ring-4 focus:ring-sky-300 transition-colors cursor-pointer"
        >
          <span>Ir a mi área autorizada</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
