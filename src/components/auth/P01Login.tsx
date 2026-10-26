import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ScreenId } from '../../types';
import { Store, Eye, EyeOff, LogIn, AlertCircle, Users } from 'lucide-react';

interface P01LoginProps {
  onSuccess: (screen: ScreenId) => void;
}

export const P01Login: React.FC<P01LoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Usuario o contraseña incorrectos. Intenta nuevamente.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(username.trim(), password.trim());
      // Automatic role redirection based on trusted server metadata
      if (user.role === 'student') {
        onSuccess('S01');
      } else if (user.role === 'teacher') {
        onSuccess('T01');
      } else if (user.role === 'technical_admin') {
        onSuccess('A01');
      } else {
        onSuccess('S01');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Usuario o contraseña incorrectos. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemoUsername = (loginUser: string) => {
    setUsername(loginUser);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 px-4">
      <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-sky-600 px-6 py-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-3 flex items-center justify-center backdrop-blur-xs border border-white/20">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Mini-IPCA Store</h1>
          <p className="text-sky-100 text-sm mt-1">Formación vocacional en atención y caja</p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
            Iniciar sesión
          </h2>

          {errorMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 p-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-800 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="text-sm font-semibold">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username / Email field */}
            <div>
              <label
                htmlFor="username-input"
                className="block text-base font-bold text-slate-800 mb-1.5"
              >
                Usuario o correo
              </label>
              <input
                id="username-input"
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej. estudiante.demo"
                className="w-full min-h-[48px] px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 text-base focus:border-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password-input"
                  className="block text-base font-bold text-slate-800"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer min-h-[36px] px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showPassword ? 'Ocultar' : 'Mostrar contraseña'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 text-base focus:border-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
                  required
                />
              </div>
            </div>

            {/* Primary Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[52px] px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

          {/* Institutional Demo Account Identifiers (No passwords exposed) */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Cuentas de evaluación (seleccionar usuario)</span>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSelectDemoUsername('estudiante.demo')}
                className="w-full text-left p-3 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 transition-colors flex items-center justify-between cursor-pointer min-h-[48px]"
              >
                <div>
                  <div className="text-sm font-bold text-sky-950">Estudiante Demo (Carlos)</div>
                  <div className="text-xs text-sky-700 font-mono">estudiante.demo</div>
                </div>
                <span className="text-xs font-semibold bg-sky-200 text-sky-900 px-2.5 py-1 rounded-lg">
                  Vendedor
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoUsername('docente.demo')}
                className="w-full text-left p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 transition-colors flex items-center justify-between cursor-pointer min-h-[48px]"
              >
                <div>
                  <div className="text-sm font-bold text-emerald-950">Docente Demo (Prof. María)</div>
                  <div className="text-xs text-emerald-700 font-mono">docente.demo</div>
                </div>
                <span className="text-xs font-semibold bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-lg">
                  Docente
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoUsername('admin.demo')}
                className="w-full text-left p-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 transition-colors flex items-center justify-between cursor-pointer min-h-[48px]"
              >
                <div>
                  <div className="text-sm font-bold text-purple-950">Admin Demo (Ing. Roberto)</div>
                  <div className="text-xs text-purple-700 font-mono">admin.demo</div>
                </div>
                <span className="text-xs font-semibold bg-purple-200 text-purple-900 px-2.5 py-1 rounded-lg">
                  Admin
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
