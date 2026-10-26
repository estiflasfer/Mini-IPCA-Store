import React, { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import { api } from '../../services/api';
import {
  Server,
  Database,
  ShieldCheck,
  Cpu,
  RotateCcw,
  Users,
  CheckCircle2,
  HardDrive,
  Info,
  ArrowRight,
} from 'lucide-react';

interface A01TechnicalPanelProps {
  onNavigate: (screen: ScreenId) => void;
  onDataReset: () => void;
}

export const A01TechnicalPanel: React.FC<A01TechnicalPanelProps> = ({
  onNavigate,
  onDataReset,
}) => {
  const [statusData, setStatusData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const data = await api.getSystemStatus();
        setStatusData(data);
      } catch (err) {
        console.warn('Error al obtener estado técnico:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStatus();
  }, []);

  const handleResetData = async () => {
    if (
      !confirm(
        '¿Deseas restaurar la base de datos a sus valores iniciales de demostración? Esto reinicializará los 10 productos y usuarios de prueba.'
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      await api.resetDemoData();
      onDataReset();
      setResetMessage('Datos de demostración restaurados correctamente.');
      setTimeout(() => setResetMessage(null), 3000);
    } catch (err: any) {
      alert(`Error al restaurar: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
            Infraestructura y Servicios
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Panel del Administrador Técnico
          </h1>
          <p className="text-base text-slate-600">
            Monitoreo del sistema, persistencia y gestión de seguridad institucional
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('A02')}
          className="min-h-[50px] px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Users className="w-5 h-5" />
          <span>Usuarios y roles</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {resetMessage && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-center gap-3 font-semibold"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Operativo
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Servidor y API Node.js</h2>
          <p className="text-sm text-slate-600">
            Runtime Express con enrutamiento seguro de tokens y control de roles por endpoint.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <HardDrive className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
              Portátil LAN / Cloud
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Capa de Persistencia</h2>
          <p className="text-sm text-slate-600">
            {statusData?.persistenceProvider || 'IPCA Storage Repository (JSON / LAN Ready)'}. Totalmente desacoplada de React.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
              Activo
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Autenticación</h2>
          <p className="text-sm text-slate-600">
            Sesiones cifradas con verificación de cuentas activas y rechazo por defecto.
          </p>
        </div>
      </div>

      {/* Target Architecture & LAN Migration Note */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Arquitectura objetivo y migración LAN en IPCA
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Diseño preparado para funcionamiento autónomo sin Internet
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-700 space-y-2">
          <p className="font-semibold text-slate-900">
            Flujo de despliegue local institucional:
          </p>
          <div className="font-mono text-xs bg-slate-900 text-emerald-400 p-3 rounded-xl overflow-x-auto">
            Dispositivos / Tablets → Wi-Fi / LAN IPCA → Servidor Node.js Local (Puerto 3000) → Base de datos IPCA
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Las reglas de negocio y cálculos no residen en el cliente React. Toda la persistencia
            está aislada en repositorios de backend, lo que permite migrar este prototipo a SQLite,
            PostgreSQL o Firestore institucional sin modificar las vistas de los estudiantes.
          </p>
        </div>
      </div>

      {/* Testing Utilities */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Utilidades de evaluación y prueba de concepto
          </h2>
          <p className="text-sm text-slate-600">
            Restaura los 10 productos requeridos con sus precios iniciales y las 3 cuentas demo.
          </p>
        </div>

        <button
          type="button"
          disabled={isResetting}
          onClick={handleResetData}
          className="min-h-[48px] px-5 py-2.5 rounded-xl border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
          <span>{isResetting ? 'Restaurando...' : 'Restaurar datos demo iniciales'}</span>
        </button>
      </div>
    </div>
  );
};
