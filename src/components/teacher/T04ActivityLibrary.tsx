import React, { useState, useEffect } from 'react';
import {
  ALL_TRAINING_MODULES,
  Product,
  ScreenId,
  StudentProfile,
  User,
} from '../../types';
import { api, formatCents } from '../../services/api';
import {
  ShoppingBag,
  Binary,
  Calculator,
  Clock,
  Ruler,
  HelpCircle,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sliders,
  Save,
  BookOpen,
  Info,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';

interface T04ActivityLibraryProps {
  activities?: any[];
  products: Product[];
  students: User[];
  selectedStudentId?: string;
  onSelectStudent?: (studentId: string) => void;
  onNavigate: (screen: ScreenId) => void;
  onRefreshActivities?: () => void;
}

interface ModuleDefinition {
  id: string;
  title: string;
  purpose: string;
  practiceType: string;
  icon: any;
  examples: {
    facil: string;
    facilNote: string;
    medio: string;
    medioNote: string;
    avanzado: string;
    avanzadoNote: string;
  };
  note?: string;
  supports: string[];
}

export const T04ActivityLibrary: React.FC<T04ActivityLibraryProps> = ({
  products,
  students,
  selectedStudentId: propSelectedStudentId,
  onSelectStudent,
  onNavigate,
}) => {
  // Filtrar exclusivamente usuarios con rol de estudiante
  const studentList = students.filter((s) => s.role === 'student');

  // Estado del estudiante seleccionado
  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    if (propSelectedStudentId && studentList.some((s) => s.id === propSelectedStudentId)) {
      return propSelectedStudentId;
    }
    return studentList[0]?.id || 'user_student_1';
  });

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [enabledModules, setEnabledModules] = useState<string[]>([...ALL_TRAINING_MODULES]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedStudent =
    studentList.find((s) => s.id === currentStudentId) || studentList[0];

  // Sincronizar propSelectedStudentId cuando cambia externamente (ej. desde panel o perfiles)
  useEffect(() => {
    if (propSelectedStudentId && propSelectedStudentId !== currentStudentId) {
      setCurrentStudentId(propSelectedStudentId);
    }
  }, [propSelectedStudentId]);

  // Cargar perfil pedagógico del estudiante seleccionado
  useEffect(() => {
    let isMounted = true;
    async function loadStudentProfile() {
      if (!currentStudentId) return;
      setIsLoadingProfile(true);
      setValidationError(null);
      setSaveSuccess(false);

      try {
        const prof = await api.getProfile(currentStudentId);
        if (isMounted) {
          setStudentProfile(prof);
          // Retrocompatibilidad: Si enabledModules no existe, todos los 6 módulos están habilitados
          const activeModules =
            prof && Array.isArray(prof.enabledModules) && prof.enabledModules.length > 0
              ? prof.enabledModules
              : [...ALL_TRAINING_MODULES];
          setEnabledModules(activeModules);
        }
      } catch (err) {
        console.warn('Error al cargar perfil del estudiante en biblioteca:', err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    }

    loadStudentProfile();
    return () => {
      isMounted = false;
    };
  }, [currentStudentId]);

  // Manejar cambio de estudiante en el selector
  const handleStudentChange = (newId: string) => {
    setCurrentStudentId(newId);
    if (onSelectStudent) {
      onSelectStudent(newId);
    }
  };

  // Manejar alternancia de habilitación de módulo
  const handleToggleModule = (moduleId: string) => {
    setValidationError(null);
    setSaveSuccess(false);

    const isCurrentlyEnabled = enabledModules.includes(moduleId);

    if (isCurrentlyEnabled) {
      // Regla estricta: Se debe mantener al menos UN módulo habilitado
      if (enabledModules.length <= 1) {
        setValidationError('Debe mantenerse al menos un módulo habilitado para el estudiante.');
        return;
      }
      setEnabledModules(enabledModules.filter((m) => m !== moduleId));
    } else {
      setEnabledModules([...enabledModules, moduleId]);
    }
  };

  // Guardar configuración en el perfil del estudiante
  const handleSaveModules = async () => {
    if (!selectedStudent) return;

    if (enabledModules.length === 0) {
      setValidationError('Debe mantenerse al menos un módulo habilitado para el estudiante.');
      return;
    }

    setIsSaving(true);
    setValidationError(null);
    try {
      const updated = await api.updateProfile(selectedStudent.id, {
        ...(studentProfile || {}),
        enabledModules,
      });
      setStudentProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setValidationError(`Error al guardar configuración: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Derivar precios representativos del catálogo activo para mantener ejemplos reales
  const activeProds = products.filter((p) => p.active);
  const yogur = activeProds.find((p) => p.name.toLowerCase().includes('yogur')) || { priceCents: 125 };
  const chocolate = activeProds.find((p) => p.name.toLowerCase().includes('chocolate')) || { priceCents: 90 };
  const yogurPrice = formatCents(yogur.priceCents);
  const chocolatePrice = formatCents(chocolate.priceCents);
  const combinedPrice = formatCents(yogur.priceCents + chocolate.priceCents);

  // Definición pedagógica de los 6 módulos formativos
  const MODULES_DATA: ModuleDefinition[] = [
    {
      id: 'venta_caja',
      title: 'Venta y caja',
      purpose:
        'Practicar la atención de pedidos, selección de productos, cálculo del total, recepción del pago y entrega del cambio.',
      practiceType:
        'Pedidos generados dinámicamente a partir de los productos activos de la tienda.',
      icon: ShoppingBag,
      examples: {
        facil: 'El cliente solicita 2 botellas de agua.',
        facilNote: '1 producto distinto; 1–2 unidades.',
        medio: 'El cliente solicita 2 jugos y 1 paquete de galletas.',
        medioNote: '2 productos distintos; 1–3 unidades por producto.',
        avanzado: 'El cliente solicita 2 jugos, 1 yogur y 3 panes.',
        avanzadoNote: '3 productos distintos; 1–4 unidades por producto.',
      },
      note: 'Los pedidos reales se generan dinámicamente según el catálogo activo y el nivel configurado para el estudiante.',
      supports: [
        'Pictogramas',
        'Lectura en voz alta',
        'Pistas paso a paso',
        'Ejemplo guiado',
        'Retroalimentación inmediata',
        'Andamiaje según perfil',
      ],
    },
    {
      id: 'numeracion',
      title: 'Numeración y conteo',
      purpose:
        'Practicar el reconocimiento y conteo de cantidades de productos en situaciones de tienda.',
      practiceType:
        'Conteo interactivo con pictogramas reales y confirmación de cantidades solicitadas.',
      icon: Binary,
      examples: {
        facil: 'Selecciona 2 botellas de agua.',
        facilNote: 'Conteo visual directo de 1 a 3 unidades.',
        medio: 'Cuenta y selecciona 4 unidades del producto solicitado.',
        medioNote: 'Conteo de cantidades intermedias (1 a 5 unidades).',
        avanzado:
          'Identifica y confirma una cantidad mayor dentro de un escenario práctico de inventario o pedido.',
        avanzadoNote: 'Conteo ampliado (4 a 8 unidades) en contexto vocacional.',
      },
      supports: [
        'Pictogramas de productos',
        'Lectura en voz alta',
        'Pistas pedagógicas',
        'Retroalimentación inmediata',
        'Opciones adaptadas (2 o 4)',
      ],
    },
    {
      id: 'operaciones',
      title: 'Operaciones',
      purpose:
        'Practicar sumas y operaciones sencillas utilizando precios reales de los productos.',
      practiceType:
        'Sumas vocacionales de precios vigentes tomados del catálogo activo de la tienda.',
      icon: Calculator,
      examples: {
        facil: `¿Cuánto cuesta 1 yogur? (${yogurPrice})`,
        facilNote: 'Reconocimiento y lectura de precio unitario directo.',
        medio: `Un yogur cuesta ${yogurPrice} y un chocolate ${chocolatePrice}. ¿Cuánto cuestan juntos? (${combinedPrice})`,
        medioNote: 'Suma de dos productos de uso cotidiano.',
        avanzado: 'Calcula el total de varias unidades de productos diferentes.',
        avanzadoNote: 'Operaciones compuestas de multiplicación y suma.',
      },
      note: 'Los precios mostrados en los ejemplos son ilustrativos y se adaptan a los productos activos.',
      supports: [
        'Pictogramas de productos',
        'Lectura en voz alta',
        'Pistas de cálculo',
        'Ejemplo ilustrativo',
        'Retroalimentación inmediata',
      ],
    },
    {
      id: 'tiempo',
      title: 'Tiempo y horarios',
      purpose:
        'Practicar el reconocimiento de horas y secuencias temporales relacionadas con situaciones laborales.',
      practiceType:
        'Identificación de horarios laborales de apertura, refrigerio y turnos de trabajo.',
      icon: Clock,
      examples: {
        facil: 'Selecciona las 08:00.',
        facilNote: 'Lectura directa de hora de apertura de tienda.',
        medio:
          'En esta práctica el turno comienza a las 08:00. Selecciona la hora correcta entre varias opciones.',
        medioNote: 'Identificación de horarios de receso y descanso (ej. 10:30).',
        avanzado:
          'Interpreta una situación sencilla de inicio, pausa o finalización de una actividad laboral.',
        avanzadoNote: 'Cálculo de duración de turnos laborales (ej. 3 horas de turno).',
      },
      note: 'Los horarios mostrados son escenarios de práctica y no corresponden necesariamente al horario oficial del IPCA.',
      supports: [
        'Lectura en voz alta',
        'Pistas pedagógicas',
        'Retroalimentación inmediata',
        'Opciones adaptadas (2 o 4)',
      ],
    },
    {
      id: 'medidas',
      title: 'Medidas',
      purpose:
        'Practicar el reconocimiento de capacidades y medidas sencillas utilizadas en productos de tienda.',
      practiceType:
        'Comparación visual y práctica de envases comerciales y capacidades (mL y L).',
      icon: Ruler,
      examples: {
        facil: 'Selecciona el envase de 1 litro.',
        facilNote: 'Identificación del envase de 1 L con apoyo visual.',
        medio: 'Identifica cuál envase tiene mayor capacidad: 500 mL o 1 L.',
        medioNote: 'Comparación conceptual entre medio litro y un litro.',
        avanzado:
          'Compara varias capacidades o medidas dentro de una situación funcional.',
        avanzadoNote: 'Selección de envases correspondientes a pedidos de clientes.',
      },
      supports: [
        'Pictogramas de botellas y envases',
        'Lectura en voz alta',
        'Pistas pedagógicas',
        'Retroalimentación inmediata',
      ],
    },
    {
      id: 'problemas',
      title: 'Problemas funcionales',
      purpose:
        'Resolver situaciones matemáticas contextualizadas en tareas reales de atención al cliente.',
      practiceType:
        'Problemas contextualizados de compra, pago con billetes y cálculo de cambio.',
      icon: HelpCircle,
      examples: {
        facil: 'Un cliente compra 1 jugo. Identifica cuánto debe pagar.',
        facilNote: 'Cálculo de pago directo con billete cercano.',
        medio: 'Un cliente compra 2 jugos. Calcula el total.',
        medioNote: 'Multiplicación de unidades y determinación del cobro.',
        avanzado:
          'Un cliente compra varios productos, paga con una cantidad determinada y debes calcular el cambio.',
        avanzadoNote: 'Resolución completa de compra en mostrador y vuelto en efectivo.',
      },
      supports: [
        'Pictogramas de productos',
        'Lectura en voz alta',
        'Pistas paso a paso',
        'Retroalimentación inmediata',
      ],
    },
  ];

  const formatDifficultyLabel = (diff?: string) => {
    if (!diff) return 'Fácil';
    const clean = diff.trim().toLowerCase();
    switch (clean) {
      case 'avanzado':
        return 'Avanzado';
      case 'medio':
        return 'Medio';
      case 'facil':
      case 'fácil':
      default:
        return 'Fácil';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Navigation */}
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
            Biblioteca de módulos y escenarios formativos
          </h1>
          <p className="text-base text-slate-600 mt-1">
            Consulta los contenidos de entrenamiento y selecciona los módulos disponibles para cada estudiante.
          </p>
        </div>
      </div>

      {/* Explanatory pedagogical block */}
      <div className="p-4 sm:p-5 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-950 flex items-start gap-3">
        <Info className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm sm:text-base">
          <p className="font-bold">
            Los ejemplos mostrados son ilustrativos. La dificultad real de práctica se configura individualmente en el perfil pedagógico de cada estudiante.
          </p>
          <p className="text-sky-800 text-sm">
            La aplicación genera o adapta las actividades según el nivel y los apoyos configurados para el estudiante.
          </p>
        </div>
      </div>

      {/* Student Selector Card with Read-only Level Reference */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <label
              htmlFor="student-select"
              className="block text-sm font-black text-slate-800 uppercase tracking-wide mb-1.5"
            >
              Estudiante a configurar:
            </label>
            <select
              id="student-select"
              value={currentStudentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full sm:max-w-md min-h-[48px] px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-100 cursor-pointer"
            >
              {studentList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.displayName} ({s.username})
                </option>
              ))}
            </select>
          </div>

          {/* Read-only Active Difficulty Reference */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nivel actual de práctica
              </div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {isLoadingProfile ? (
                  <span className="text-slate-400 font-normal text-sm">Cargando...</span>
                ) : (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-xl font-black text-sm tracking-wide ${
                      studentProfile?.difficultyLevel === 'avanzado'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : studentProfile?.difficultyLevel === 'medio'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {formatDifficultyLabel(studentProfile?.difficultyLevel)}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Configurado en el perfil pedagógico del estudiante.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSelectStudent) onSelectStudent(currentStudentId);
                onNavigate('T03');
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-sky-700 border border-slate-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>Ir a configuración pedagógica</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Action bar to save enabled modules */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs sm:text-sm text-slate-600">
            Módulos habilitados:{' '}
            <strong className="text-slate-900 font-black">{enabledModules.length}</strong> de 6.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveModules}
              disabled={isSaving}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer transition-all"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Guardar configuración de módulos</span>
            </button>
          </div>
        </div>

        {/* Validation and Success Messages */}
        {validationError && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 font-semibold text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {saveSuccess && (
          <div
            role="status"
            className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold text-sm flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Configuración de módulos guardada correctamente para {selectedStudent?.displayName}.</span>
          </div>
        )}
      </div>

      {/* Six Primary Pedagogical Module Cards */}
      <div className="space-y-6">
        {MODULES_DATA.map((mod) => {
          const Icon = mod.icon;
          const isEnabled = enabledModules.includes(mod.id);
          const studentName = selectedStudent?.displayName || 'el estudiante';

          return (
            <div
              key={mod.id}
              className={`p-6 sm:p-7 rounded-3xl border-2 transition-all bg-white shadow-xs ${
                isEnabled
                  ? 'border-slate-200 hover:border-slate-300'
                  : 'border-slate-200 bg-slate-50/60 opacity-80'
              }`}
            >
              {/* Card Header: Module Name, Icon, and Enable/Disable Control */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3.5 rounded-2xl shrink-0 ${
                      isEnabled ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Módulo formativo
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                          isEnabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isEnabled ? 'Habilitado' : 'Deshabilitado'}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                      {mod.title}
                    </h2>
                  </div>
                </div>

                {/* Accessible Toggle Switch */}
                <div className="flex items-center gap-3 self-end sm:self-start bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                  <span className="text-xs sm:text-sm font-bold text-slate-700">
                    {isEnabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    aria-label={`Habilitar módulo ${mod.title} para ${studentName}`}
                    onClick={() => handleToggleModule(mod.id)}
                    className={`relative inline-flex h-8 w-15 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-200 ${
                      isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                        isEnabled ? 'translate-x-7 text-emerald-600' : 'translate-x-0 text-slate-400'
                      }`}
                    >
                      {isEnabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </span>
                  </button>
                </div>
              </div>

              {/* Formative Purpose & Practice Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-sm sm:text-base border-b border-slate-100">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Propósito formativo
                  </span>
                  <p className="font-semibold text-slate-800">{mod.purpose}</p>
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Tipo de práctica
                  </span>
                  <p className="font-medium text-slate-700">{mod.practiceType}</p>
                </div>
              </div>

              {/* Illustrative Examples by Difficulty (Documentation Only - NOT Buttons) */}
              <div className="py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>Ejemplos ilustrativos por nivel (solo informativo)</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    El nivel real se asigna en el perfil
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Fácil */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 inline-block mb-1.5">
                        Ejemplo — Fácil
                      </span>
                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        “{mod.examples.facil}”
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 mt-2 block border-t border-slate-200/60 pt-1.5 font-medium">
                      {mod.examples.facilNote}
                    </span>
                  </div>

                  {/* Medio */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 inline-block mb-1.5">
                        Ejemplo — Medio
                      </span>
                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        “{mod.examples.medio}”
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 mt-2 block border-t border-slate-200/60 pt-1.5 font-medium">
                      {mod.examples.medioNote}
                    </span>
                  </div>

                  {/* Avanzado */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 inline-block mb-1.5">
                        Ejemplo — Avanzado
                      </span>
                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        “{mod.examples.avanzado}”
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 mt-2 block border-t border-slate-200/60 pt-1.5 font-medium">
                      {mod.examples.avanzadoNote}
                    </span>
                  </div>
                </div>

                {mod.note && (
                  <p className="text-xs text-slate-500 italic mt-2">
                    * Nota: {mod.note}
                  </p>
                )}
              </div>

              {/* Available Supports Section */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 mr-1">
                  Apoyos disponibles:
                </span>
                {mod.supports.map((sup, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {sup}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
