import { ALL_TRAINING_MODULES, ScreenId, StudentProfile } from '../../types';
import {
  ShoppingBag,
  Binary,
  Calculator,
  Clock,
  Ruler,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { AudioButton } from '../common/AudioButton';

interface S02ModuleSelectProps {
  profile?: StudentProfile | null;
  onNavigate: (screen: ScreenId) => void;
  onSelectModuleActivity?: (moduleType: string) => void;
}

interface ModuleInfo {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: any;
  status: 'completo' | 'disponible' | 'proximo';
  isPrimary?: boolean;
}

const MODULES: ModuleInfo[] = [
  {
    id: 'mod-1',
    type: 'venta_caja',
    title: 'Venta y caja',
    description: 'Atención a clientes, registro de productos del pedido, cálculo del total y entrega de cambio.',
    icon: ShoppingBag,
    status: 'disponible',
    isPrimary: true,
  },
  {
    id: 'mod-2',
    type: 'numeracion',
    title: 'Numeración y conteo',
    description: 'Identificación de precios, conteo de unidades de productos y reconocimiento de monedas.',
    icon: Binary,
    status: 'disponible',
  },
  {
    id: 'mod-3',
    type: 'operaciones',
    title: 'Operaciones',
    description: 'Cálculo de sumas y restas con dinero en situaciones reales del mostrador de ventas.',
    icon: Calculator,
    status: 'disponible',
  },
  {
    id: 'mod-4',
    type: 'tiempo',
    title: 'Tiempo y horarios',
    description: 'Lectura de horarios de apertura, receso, refrigerio y tiempos de atención en la tienda.',
    icon: Clock,
    status: 'disponible',
  },
  {
    id: 'mod-5',
    type: 'medidas',
    title: 'Medidas',
    description: 'Reconocimiento de tamaños, pesos y capacidades de botellas, paquetes y envases.',
    icon: Ruler,
    status: 'disponible',
  },
  {
    id: 'mod-6',
    type: 'problemas',
    title: 'Problemas funcionales',
    description: 'Resolución de pedidos combinados y situaciones prácticas de atención al cliente.',
    icon: HelpCircle,
    status: 'disponible',
  },
];

export const S02ModuleSelect: React.FC<S02ModuleSelectProps> = ({
  profile,
  onNavigate,
  onSelectModuleActivity,
}) => {
  // Retrocompatibilidad: Si enabledModules no está definido, se muestran los 6 módulos
  const enabledModuleTypes: readonly string[] = profile?.enabledModules ?? ALL_TRAINING_MODULES;
  const visibleModules = MODULES.filter((m) => enabledModuleTypes.includes(m.type));

  const handleSelect = (mod: ModuleInfo) => {
    if (onSelectModuleActivity) {
      onSelectModuleActivity(mod.type);
    }
    if (mod.type === 'venta_caja') {
      onNavigate('S04');
    } else {
      onNavigate('S_MODULE');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('S01')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Módulos de entrenamiento
          </h1>
          <p className="text-base text-slate-600">
            Elige el área de práctica para desarrollar tus habilidades laborales en la tienda
          </p>
        </div>

        <AudioButton
          textToSpeak="Módulos de entrenamiento. Elige el área de práctica: Venta y caja, Numeración y conteo, Operaciones, Tiempo y horarios, Medidas, o Problemas funcionales."
          label="Escuchar módulos"
        />
      </div>

      {/* Grid of enabled training modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {visibleModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                mod.isPrimary
                  ? 'bg-sky-50/80 border-sky-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      mod.isPrimary ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  {mod.isPrimary && (
                    <span className="text-xs font-bold px-3 py-1 bg-sky-200 text-sky-900 rounded-full">
                      Módulo principal
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {mod.title}
                </h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                <AudioButton
                  textToSpeak={`${mod.title}. ${mod.description}`}
                  label="Escuchar"
                  variant="compact"
                />
                <button
                  type="button"
                  onClick={() => handleSelect(mod)}
                  className={`min-h-[48px] px-5 py-2.5 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer transition-colors focus:outline-none focus:ring-4 ${
                    mod.isPrimary
                      ? 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-200 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-300'
                  }`}
                >
                  <span>Practicar módulo</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
