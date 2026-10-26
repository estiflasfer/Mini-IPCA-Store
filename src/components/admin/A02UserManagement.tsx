import React, { useState } from 'react';
import { User, ScreenId, Role } from '../../types';
import { api } from '../../services/api';
import {
  Users,
  UserPlus,
  Power,
  Shield,
  KeyRound,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Lock,
} from 'lucide-react';

interface A02UserManagementProps {
  users: User[];
  onNavigate: (screen: ScreenId) => void;
  onRefreshUsers: () => void;
}

export const A02UserManagement: React.FC<A02UserManagementProps> = ({
  users,
  onNavigate,
  onRefreshUsers,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formRole, setFormRole] = useState<Role>('student');
  const [formManageCatalog, setFormManageCatalog] = useState(false);

  const handleOpenCreate = () => {
    setFormUsername('');
    setFormEmail('');
    setFormDisplayName('');
    setFormRole('student');
    setFormManageCatalog(false);
    setIsCreating(true);
    setErrorMessage(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      !formUsername.trim() ||
      !formEmail.trim() ||
      !formDisplayName.trim()
    ) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createUser({
        username: formUsername.trim().toLowerCase(),
        email: formEmail.trim().toLowerCase(),
        displayName: formDisplayName.trim(),
        role: formRole,
        permissions: formManageCatalog ? ['manage_catalog'] : [],
        active: true,
      });

      setSuccessMessage(`Usuario “${formDisplayName}” creado correctamente.`);
      setIsCreating(false);
      onRefreshUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al crear usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await api.updateUser(user.id, { active: !user.active });
      onRefreshUsers();
      setSuccessMessage(
        `Cuenta de “${user.displayName}” ${!user.active ? 'activada' : 'desactivada'}.`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleToggleCatalogPermission = async (user: User) => {
    const hasPermission = user.permissions.includes('manage_catalog');
    const updated = hasPermission
      ? user.permissions.filter((p) => p !== 'manage_catalog')
      : [...user.permissions, 'manage_catalog'];

    try {
      await api.updateUser(user.id, { permissions: updated });
      onRefreshUsers();
      setSuccessMessage(
        `Permiso de catálogo ${hasPermission ? 'revocado a' : 'concedido a'} “${user.displayName}”.`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'student':
        return 'Estudiante (Vendedor)';
      case 'teacher':
        return 'Docente';
      case 'technical_admin':
        return 'Administrador Técnico';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('A01')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al panel técnico</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Usuarios y roles institucionales
          </h1>
          <p className="text-base text-slate-600">
            Administración de credenciales, roles y permisos de acceso del sistema IPCA
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="min-h-[50px] px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          <span>Crear nuevo usuario</span>
        </button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-center gap-3 font-semibold"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Usuario / Alias</th>
                <th className="py-4 px-6">Identificador (Login)</th>
                <th className="py-4 px-6">Rol asignado</th>
                <th className="py-4 px-6">Permisos especiales</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.map((u) => {
                const hasCatalog = u.permissions.includes('manage_catalog');

                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      !u.active ? 'opacity-50 bg-slate-50' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-base text-slate-900">{u.displayName}</div>
                      <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-700">
                      {u.username}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          u.role === 'student'
                            ? 'bg-sky-100 text-sky-800'
                            : u.role === 'teacher'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {hasCatalog ? (
                        <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Gestionar catálogo</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Sin permisos extra</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {u.active ? (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          Activo
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.role === 'student' && (
                          <button
                            type="button"
                            onClick={() => handleToggleCatalogPermission(u)}
                            className="min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
                            title="Alternar permiso de gestión de catálogo"
                          >
                            {hasCatalog ? 'Revocar catálogo' : 'Dar catálogo'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          className={`min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                            u.active
                              ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                              : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{u.active ? 'Desactivar' : 'Activar'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-xl text-slate-900">Crear nuevo usuario</h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl cursor-pointer min-h-[44px] px-2"
              >
                ×
              </button>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl font-medium"
              >
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre visible / Alias
                </label>
                <input
                  type="text"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="ej. Juan P. (Estudiante)"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-slate-900 focus:border-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Usuario de acceso (Login)
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="ej. juan.demo"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-slate-900 font-mono focus:border-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo electrónico institucional
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ej. juan@ipca.edu"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-slate-900 focus:border-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rol del usuario (únicos permitidos)
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as Role)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:border-purple-600 focus:outline-none cursor-pointer"
                >
                  <option value="student">Estudiante (Vendedor en formación)</option>
                  <option value="teacher">Docente</option>
                  <option value="technical_admin">Administrador Técnico</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formManageCatalog}
                    onChange={(e) => setFormManageCatalog(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-slate-400 text-purple-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Conceder permiso de gestión de catálogo (`manage_catalog`)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[44px] px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  {isSubmitting ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
