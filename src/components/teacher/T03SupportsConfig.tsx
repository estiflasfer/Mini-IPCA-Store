import React, { useState, useEffect } from 'react';
import { ScreenId, StudentProfile, User } from '../../types';
import { api } from '../../services/api';
import {
  Sliders,
  Save,
  Eye,
  ArrowLeft,
  Check,
  AlertCircle,
  HelpCircle,
  Volume2,
  Image as ImageIcon,
  MessageSquare,
  Type,
  SunMedium,
} from 'lucide-react';

interface T03SupportsConfigProps {
  studentId: string;
  students: User[];
  onNavigate: (screen: ScreenId) => void;
  onProfileUpdated: (updated: StudentProfile) => void;
}

export const T03SupportsConfig: React.FC<T03SupportsConfigProps> = ({
  studentId,
  students,
  onNavigate,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const student = students.find((s) => s.id === studentId) || students[0];

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const p = await api.getProfile(studentId);
        setProfile(p);
      } catch (err) {
        console.warn('Error cargando perfil:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [studentId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await api.updateProfile(studentId, profile);
      onProfileUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error al guardar configuración: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            Configuración de apoyos pedagógicos
          </h1>
          <p className="text-base text-slate-600">
            Estudiante: <span className="font-bold text-slate-800">{student?.displayName}</span>
          </p>
        </div>

        {/* Preview button */}
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="min-h-[48px] px-5 py-2.5 rounded-xl border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center gap-2 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-sky-600" />
          <span>Vista previa de apoyos</span>
        </button>
      </div>

      {saveSuccess && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-center gap-3"
        >
          <Check className="w-5 h-5 text-emerald-600" />
          <span className="font-bold">Configuración pedagógica guardada con éxito.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Dificultad y opciones */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xs space-y-5">
          <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-600" />
            <span>Nivel y opciones de respuesta</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="difficulty-select" className="block text-sm font-bold text-slate-800 mb-1.5">
                Nivel de dificultad
              </label>
              <select
                id="difficulty-select"
                value={profile.difficultyLevel}
                onChange={(e) =>
                  setProfile({ ...profile, difficultyLevel: e.target.value as any })
                }
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-slate-50 font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-100 cursor-pointer"
              >
                <option value="facil">Fácil (Exactamente 1 producto, 1-2 unidades)</option>
                <option value="medio">Medio (Exactamente 2 productos, 1-3 unidades c/u)</option>
                <option value="avanzado">Avanzado (Exactamente 3 productos, 1-4 unidades c/u)</option>
              </select>
            </div>

            <div>
              <label htmlFor="choice-count-select" className="block text-sm font-bold text-slate-800 mb-1.5">
                Número de opciones en preguntas
              </label>
              <select
                id="choice-count-select"
                value={profile.choiceCount}
                onChange={(e) =>
                  setProfile({ ...profile, choiceCount: Number(e.target.value) as 2 | 4 })
                }
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-slate-50 font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-100 cursor-pointer"
              >
                <option value={2}>2 opciones (menor carga cognitiva)</option>
                <option value={4}>4 opciones (estándar de práctica)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Nivel de andamiaje */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
            Nivel de andamiaje instruccional
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { val: 'high', title: 'Alto (más apoyo)', desc: 'Pistas y ejemplos siempre destacados.' },
              { val: 'medium', title: 'Medio', desc: 'Apoyos guiados bajo demanda del estudiante.' },
              { val: 'low', title: 'Bajo (más autonomía)', desc: 'Prioriza resolución independiente.' },
            ].map((scaff) => {
              const active = profile.scaffoldingLevel === scaff.val;
              return (
                <button
                  key={scaff.val}
                  type="button"
                  onClick={() => setProfile({ ...profile, scaffoldingLevel: scaff.val as any })}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    active
                      ? 'border-sky-600 bg-sky-50 text-sky-950 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-base mb-1">{scaff.title}</div>
                  <div className="text-xs text-slate-600">{scaff.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 3: Ayudas y apoyos UDL */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
            Ayudas y apoyos didácticos
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200">
              <input
                type="checkbox"
                checked={profile.showHint}
                onChange={(e) => setProfile({ ...profile, showHint: e.target.checked })}
                className="w-5 h-5 rounded-md border-2 border-slate-400 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span className="font-bold text-base text-slate-800">Mostrar pista en cálculos</span>
            </label>

            <label className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200">
              <input
                type="checkbox"
                checked={profile.showExample}
                onChange={(e) => setProfile({ ...profile, showExample: e.target.checked })}
                className="w-5 h-5 rounded-md border-2 border-slate-400 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span className="font-bold text-base text-slate-800">Mostrar ejemplo guiado</span>
            </label>

            <label className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200">
              <input
                type="checkbox"
                checked={profile.textToSpeechEnabled}
                onChange={(e) => setProfile({ ...profile, textToSpeechEnabled: e.target.checked })}
                className="w-5 h-5 rounded-md border-2 border-slate-400 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span className="font-bold text-base text-slate-800">
                Lectura en voz alta de instrucciones (TTS)
              </span>
            </label>

            <label className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200">
              <input
                type="checkbox"
                checked={profile.pictogramsEnabled}
                onChange={(e) => setProfile({ ...profile, pictogramsEnabled: e.target.checked })}
                className="w-5 h-5 rounded-md border-2 border-slate-400 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span className="font-bold text-base text-slate-800">
                Pictogramas y representaciones visuales
              </span>
            </label>

            <label className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200">
              <input
                type="checkbox"
                checked={profile.socialSupportsEnabled}
                onChange={(e) => setProfile({ ...profile, socialSupportsEnabled: e.target.checked })}
                className="w-5 h-5 rounded-md border-2 border-slate-400 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span className="font-bold text-base text-slate-800">
                Apoyos de comunicación y habilidades sociales (Frases útiles)
              </span>
            </label>
          </div>
        </div>

        {/* Card 4: Visualización / Accesibilidad */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Accesibilidad / visualización</h2>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
              La accesibilidad base siempre está activa.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.largeText}
                onChange={(e) => setProfile({ ...profile, largeText: e.target.checked })}
                className="w-5 h-5 rounded-md border-2 border-slate-400 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-base text-slate-900 block">Texto grande</span>
                <span className="text-xs text-slate-500">Aumenta tamaño tipográfico en botones y preguntas</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.highContrast}
                onChange={(e) => setProfile({ ...profile, highContrast: e.target.checked })}
                className="w-5 h-5 rounded-md border-2 border-slate-400 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-base text-slate-900 block">Contraste alto</span>
                <span className="text-xs text-slate-500">Bordes intensificados y fondos neutros</span>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="min-h-[52px] px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base flex items-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Guardando...' : 'Guardar configuración'}</span>
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border-2 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-sky-600" />
                <span>Vista previa de configuración para {student?.displayName}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="min-h-[44px] px-2 text-slate-400 hover:text-slate-700 font-bold text-xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p>
                <strong>Dificultad:</strong> {profile.difficultyLevel}
              </p>
              <p>
                <strong>Opciones de respuesta:</strong> {profile.choiceCount} opciones en botones
              </p>
              <p>
                <strong>Nivel de andamiaje:</strong> {profile.scaffoldingLevel}
              </p>
              <p>
                <strong>Pistas habilitadas:</strong> {profile.showHint ? 'Sí' : 'No'}
              </p>
              <p>
                <strong>Ejemplos habilitados:</strong> {profile.showExample ? 'Sí' : 'No'}
              </p>
              <p>
                <strong>Texto en voz alta (TTS):</strong> {profile.textToSpeechEnabled ? 'Sí' : 'No'}
              </p>
              <p>
                <strong>Frases útiles activas:</strong> {profile.socialSupportsEnabled ? 'Sí' : 'No'}
              </p>
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                * Nota pedagógica: Esta vista previa es de solo lectura y no modifica el progreso real del estudiante.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-base cursor-pointer hover:bg-sky-700"
              >
                Cerrar vista previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
