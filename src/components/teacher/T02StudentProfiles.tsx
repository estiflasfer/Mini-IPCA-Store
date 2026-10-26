import React, { useState } from 'react';
import { ScreenId, User, HistoricalResult } from '../../types';
import { api } from '../../services/api';
import {
  Users,
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  ArrowLeft,
  KeyRound,
  Shield,
  Sliders,
} from 'lucide-react';

interface T02StudentProfilesProps {
  students: User[];
  results: HistoricalResult[];
  onNavigate: (screen: ScreenId) => void;
  onSelectStudentForProfile: (studentId: string) => void;
  onRefreshUsers: () => void;
}

export const T02StudentProfiles: React.FC<T02StudentProfilesProps> = ({
  students,
  results,
  onNavigate,
  onSelectStudentForProfile,
  onRefreshUsers,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleCatalogPermission = async (student: User) => {
    setLoadingId(student.id);
    try {
      const hasPermission = student.permissions.includes('manage_catalog');
      const updatedPermissions = hasPermission
        ? student.permissions.filter((p) => p !== 'manage_catalog')
        : [...student.permissions, 'manage_catalog'];

      await api.updateUser(student.id, { permissions: updatedPermissions });
      onRefreshUsers();
    } catch (err: any) {
      alert(`Error al actualizar permiso: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('T01')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al panel docente</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Perfiles de estudiantes
          </h1>
          <p className="text-base text-slate-600">
            Administración pedagógica y asignación de permisos especiales
          </p>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-4">
        {students.map((student) => {
          const studentResults = results.filter((r) => r.studentId === student.id);
          const hasCatalogPermission = student.permissions.includes('manage_catalog');
          const isUpdating = loadingId === student.id;

          return (
            <div
              key={student.id}
              className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-lg">
                    {student.displayName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {student.displayName}
                    </h2>
                    <span className="text-xs font-mono text-slate-500">
                      Identificador: {student.username}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm pt-2">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold">
                    Actividades completadas: {studentResults.length}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold">
                    Rol: Vendedor / dependiente
                  </span>
                  {hasCatalogPermission ? (
                    <span className="bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Gestionar catálogo: ACTIVO</span>
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-medium">
                      Gestionar catálogo: Inactivo
                    </span>
                  )}
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Manage catalog toggle */}
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleToggleCatalogPermission(student)}
                  className={`min-h-[48px] px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors flex items-center gap-2 cursor-pointer ${
                    hasCatalogPermission
                      ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Permitir o revocar acceso a la gestión de productos"
                >
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>
                    {hasCatalogPermission ? 'Revocar catálogo' : 'Habilitar catálogo'}
                  </span>
                </button>

                {/* Configure Profile / Supports */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectStudentForProfile(student.id);
                    onNavigate('T03');
                  }}
                  className="min-h-[48px] px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Configurar apoyos</span>
                </button>

                {/* View Results */}
                <button
                  type="button"
                  onClick={() => onNavigate('T06')}
                  className="min-h-[48px] px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-slate-600" />
                  <span>Ver resultados</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
