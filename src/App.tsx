import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  Activity,
  HistoricalResult,
  Product,
  ScreenId,
  StudentProfile,
  User,
  GeneratedSalesOrder,
  TextSizeLevel,
} from './types';
import { api } from './services/api';
import { generateSalesOrder } from './services/salesGenerator';
import { AppNavbar } from './components/layout/AppNavbar';
import { RoleGuard } from './components/common/RoleGuard';

// Screens
import { P01Login } from './components/auth/P01Login';
import { S01StudentHome } from './components/student/S01StudentHome';
import { S02ModuleSelect } from './components/student/S02ModuleSelect';
import { S03CatalogView } from './components/student/S03CatalogView';
import { S04SalesOrder } from './components/student/S04SalesOrder';
import { S05TotalCalculation } from './components/student/S05TotalCalculation';
import { S06ChangeCalculation } from './components/student/S06ChangeCalculation';
import { S07FeedbackClosure } from './components/student/S07FeedbackClosure';
import { S08StudentProgress } from './components/student/S08StudentProgress';
import { ModulePractice, ModuleType } from './components/student/ModulePractice';

import { T01TeacherDashboard } from './components/teacher/T01TeacherDashboard';
import { T02StudentProfiles } from './components/teacher/T02StudentProfiles';
import { T03SupportsConfig } from './components/teacher/T03SupportsConfig';
import { T04ActivityLibrary } from './components/teacher/T04ActivityLibrary';
import { T05ProductStock } from './components/teacher/T05ProductStock';
import { T06ResultsReports } from './components/teacher/T06ResultsReports';

import { A01TechnicalPanel } from './components/admin/A01TechnicalPanel';
import { A02UserManagement } from './components/admin/A02UserManagement';

function MainApp() {
  const { user, profile, isStudent, isTeacher, isAdmin, canManageCatalog } = useAuth();

  // Screen navigation state
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('P01');

  // Shared application data
  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [results, setResults] = useState<HistoricalResult[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedStudentIdForProfile, setSelectedStudentIdForProfile] = useState<string>('user_student_1');
  const [profileUpdateTrigger, setProfileUpdateTrigger] = useState(0);

  // Accessibility UI scale (3-step bounded scale: 100%, 120%, 140%)
  const [textSize, setTextSize] = useState<TextSizeLevel>(() => {
    try {
      const saved = localStorage.getItem('mini_ipca_text_size');
      if (saved === 'large' || saved === 'extraLarge' || saved === 'normal') {
        return saved as TextSizeLevel;
      }
    } catch {
      // ignore
    }
    return 'normal';
  });
  const [highContrast, setHighContrast] = useState(false);

  // Active sales training exercise state
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [answeredTotalCents, setAnsweredTotalCents] = useState<number | null>(null);
  const [answeredChangeCents, setAnsweredChangeCents] = useState<number | null>(null);
  const [supportsUsedInSession, setSupportsUsedInSession] = useState<string[]>([]);

  // Refresh shared data from API
  const refreshProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.warn('Error al cargar productos:', err);
    }
  };

  const refreshActivities = async () => {
    try {
      const data = await api.getActivities();
      setActivities(data);
    } catch (err) {
      console.warn('Error al cargar actividades:', err);
    }
  };

  const refreshResults = async () => {
    try {
      const data = await api.getResults();
      setResults(data);
    } catch (err) {
      console.warn('Error al cargar resultados:', err);
    }
  };

  const refreshUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.warn('Error al cargar usuarios:', err);
    }
  };

  useEffect(() => {
    refreshProducts();
    refreshActivities();
  }, []);

  useEffect(() => {
    if (user) {
      refreshResults();
      if (isTeacher || isAdmin) {
        refreshUsers();
      }
    }
  }, [user]);

  // Root font-size scaling effect across entire application
  useEffect(() => {
    const percentMap: Record<TextSizeLevel, string> = {
      normal: '100%',
      large: '120%',
      extraLarge: '140%',
    };
    document.documentElement.style.fontSize = percentMap[textSize];
    document.documentElement.setAttribute('data-text-size', textSize);
    try {
      localStorage.setItem('mini_ipca_text_size', textSize);
    } catch {
      // ignore
    }
  }, [textSize]);

  const handleIncreaseTextSize = () => {
    setTextSize((prev) => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'extraLarge';
      return prev;
    });
  };

  const handleDecreaseTextSize = () => {
    setTextSize((prev) => {
      if (prev === 'extraLarge') return 'large';
      if (prev === 'large') return 'normal';
      return prev;
    });
  };

  // Sync profile preferences
  useEffect(() => {
    if (profile) {
      if (profile.largeText && textSize === 'normal') {
        setTextSize('large');
      }
      if (profile.highContrast !== undefined) {
        setHighContrast(profile.highContrast);
      }
    }
  }, [profile]);

  // Controlled dynamic sales order state
  const [currentSalesOrder, setCurrentSalesOrder] = useState<GeneratedSalesOrder | null>(null);
  const [activeModuleType, setActiveModuleType] = useState<ModuleType>('numeracion');

  const getOrInitSalesOrder = (): GeneratedSalesOrder => {
    if (currentSalesOrder) return currentSalesOrder;
    const initial = generateSalesOrder(products, profile?.difficultyLevel || 'facil');
    setCurrentSalesOrder(initial);
    return initial;
  };

  // Helper to check if a specific module is enabled for the current student
  const isModuleEnabled = (modType: string): boolean => {
    if (
      !profile?.enabledModules ||
      !Array.isArray(profile.enabledModules) ||
      profile.enabledModules.length === 0
    ) {
      return true; // Backward compatibility: all modules enabled if undefined or empty
    }
    return profile.enabledModules.includes(modType);
  };

  // Generate a NEW sales order at the student's current configured difficulty
  const handleStartNewSale = () => {
    if (!isModuleEnabled('venta_caja')) {
      setCurrentScreen('S02');
      return;
    }
    const freshOrder = generateSalesOrder(products, profile?.difficultyLevel || 'facil');
    setCurrentSalesOrder(freshOrder);
    setSelectedQuantities({});
    setAnsweredTotalCents(null);
    setAnsweredChangeCents(null);
    setSupportsUsedInSession([]);
    setCurrentScreen('S04');
  };

  // Intentar nuevamente: preserves EXACT same products, quantities, prices, total, payment, change, difficulty, generatedOrderId
  const handleRetrySameSale = () => {
    setSelectedQuantities({});
    setAnsweredTotalCents(null);
    setAnsweredChangeCents(null);
    setCurrentScreen('S04');
  };

  // Complete sale handler (called when change calculation S06 succeeds)
  const handleSaleSuccess = async (changeCents: number) => {
    setAnsweredChangeCents(changeCents);
    const order = currentSalesOrder || getOrInitSalesOrder();

    // Snapshot of items with prices at exercise generation time
    const snapshot = order.lineItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
    }));

    try {
      await api.saveResult({
        studentId: user?.id || 'anonimo',
        activityId: order.generatedOrderId,
        moduleType: 'venta_caja',
        activityType: 'venta_caja',
        difficulty: order.difficulty,
        generatedOrderId: order.generatedOrderId,
        lineItemsSnapshot: snapshot,
        totalExpectedCents: order.totalExpectedCents,
        totalAnsweredCents: answeredTotalCents || order.totalExpectedCents,
        paymentAmountCents: order.paymentAmountCents,
        changeExpectedCents: order.changeExpectedCents,
        changeAnsweredCents: changeCents,
        attempts: 1,
        correct: true,
        supportsUsed: supportsUsedInSession,
      });
      await refreshResults();
    } catch (err) {
      console.warn('Error al guardar resultado de venta:', err);
    }

    setCurrentScreen('S07');
  };

  // Role routing enforcement
  useEffect(() => {
    if (!user && currentScreen !== 'P01') {
      setCurrentScreen('P01');
    }
  }, [user]);

  const studentsList = users.filter((u) => u.role === 'student');

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-sky-200 transition-colors ${
        highContrast ? 'bg-slate-100 text-slate-950' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-white">
              Mini-IPCA Store • Formación Vocacional
            </span>
            <span className="hidden md:inline text-slate-400">
              | El estudiante aprende el rol de vendedor/dependiente en la tienda del IPCA
            </span>
          </div>
          <span className="bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-300 font-mono text-[11px]">
            v2.0 POC
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <AppNavbar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        textSize={textSize}
        onIncreaseTextSize={handleIncreaseTextSize}
        onDecreaseTextSize={handleDecreaseTextSize}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* P01 — Inicio de sesión */}
        {currentScreen === 'P01' && (
          <P01Login
            onSuccess={(targetScreen) => {
              setCurrentScreen(targetScreen);
              refreshProducts();
              refreshActivities();
              refreshResults();
            }}
          />
        )}

        {/* STUDENT SCREENS */}
        {currentScreen === 'S01' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            <S01StudentHome
              onNavigate={(screen) => {
                if (screen === 'S04') {
                  if (!currentSalesOrder) {
                    handleStartNewSale();
                  } else {
                    setCurrentScreen('S04');
                  }
                } else {
                  setCurrentScreen(screen);
                }
              }}
              completedSalesCount={results.filter((r) => r.studentId === user?.id).length}
              totalGoal={5}
            />
          </RoleGuard>
        )}

        {currentScreen === 'S02' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            <S02ModuleSelect
              profile={profile}
              onNavigate={setCurrentScreen}
              onSelectModuleActivity={(modType) => {
                if (!isModuleEnabled(modType)) {
                  setCurrentScreen('S02');
                  return;
                }
                if (modType === 'venta_caja') {
                  handleStartNewSale();
                } else {
                  setActiveModuleType(modType as ModuleType);
                  setCurrentScreen('S_MODULE');
                }
              }}
            />
          </RoleGuard>
        )}

        {currentScreen === 'S_MODULE' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            {!isModuleEnabled(activeModuleType) ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
                <p className="font-bold text-slate-800 text-lg">
                  Este módulo no está habilitado actualmente para tu usuario.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentScreen('S02')}
                  className="mt-4 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Volver a módulos de entrenamiento
                </button>
              </div>
            ) : (
              <ModulePractice
                moduleType={activeModuleType}
                profile={profile}
                products={products}
                onNavigate={setCurrentScreen}
                onSaveResult={async (resultData) => {
                  await api.saveResult({
                    studentId: user?.id || 'anonimo',
                    ...resultData,
                  });
                  await refreshResults();
                }}
              />
            )}
          </RoleGuard>
        )}

        {currentScreen === 'S03' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            <S03CatalogView products={products} onNavigate={setCurrentScreen} />
          </RoleGuard>
        )}

        {currentScreen === 'S04' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            {!isModuleEnabled('venta_caja') ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
                <p className="font-bold text-slate-800 text-lg">
                  El módulo de Venta y caja no está habilitado actualmente para tu usuario.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentScreen('S02')}
                  className="mt-4 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Volver a módulos de entrenamiento
                </button>
              </div>
            ) : (
              <S04SalesOrder
                activity={currentSalesOrder || getOrInitSalesOrder()}
                products={products}
                selectedQuantities={selectedQuantities}
                onUpdateQuantities={setSelectedQuantities}
                onProceedToTotal={() => setCurrentScreen('S05')}
                onNavigate={setCurrentScreen}
              />
            )}
          </RoleGuard>
        )}

        {currentScreen === 'S05' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            <S05TotalCalculation
              activity={currentSalesOrder || getOrInitSalesOrder()}
              products={products}
              selectedQuantities={selectedQuantities}
              profile={profile}
              onSuccessTotal={(totalCents) => {
                setAnsweredTotalCents(totalCents);
                setCurrentScreen('S06');
              }}
              onNavigate={setCurrentScreen}
              onBackToOrder={() => setCurrentScreen('S04')}
            />
          </RoleGuard>
        )}

        {currentScreen === 'S06' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            <S06ChangeCalculation
              activity={currentSalesOrder || getOrInitSalesOrder()}
              totalCents={
                answeredTotalCents || (currentSalesOrder || getOrInitSalesOrder()).totalExpectedCents
              }
              paymentCents={(currentSalesOrder || getOrInitSalesOrder()).paymentAmountCents}
              profile={profile}
              onSuccessChange={handleSaleSuccess}
              onNavigate={setCurrentScreen}
              onBackToTotal={() => setCurrentScreen('S05')}
            />
          </RoleGuard>
        )}

        {currentScreen === 'S07' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            <S07FeedbackClosure
              totalCents={
                answeredTotalCents || (currentSalesOrder || getOrInitSalesOrder()).totalExpectedCents
              }
              paymentCents={(currentSalesOrder || getOrInitSalesOrder()).paymentAmountCents}
              changeCents={
                answeredChangeCents || (currentSalesOrder || getOrInitSalesOrder()).changeExpectedCents
              }
              completedCount={results.filter((r) => r.studentId === user?.id).length}
              totalGoal={5}
              onPracticeAgain={handleStartNewSale}
              onNavigate={setCurrentScreen}
            />
          </RoleGuard>
        )}

        {currentScreen === 'S08' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            <S08StudentProgress
              results={results.filter((r) => r.studentId === user?.id)}
              onNavigate={(screen) => {
                if (screen === 'S04') {
                  handleStartNewSale();
                } else {
                  setCurrentScreen(screen);
                }
              }}
            />
          </RoleGuard>
        )}

        {/* TEACHER SCREENS */}
        {currentScreen === 'T01' && (
          <RoleGuard allowedRoles={['teacher']} onRedirect={setCurrentScreen}>
            <T01TeacherDashboard
              students={studentsList.length > 0 ? studentsList : users}
              results={results}
              onNavigate={setCurrentScreen}
              onSelectStudentForProfile={setSelectedStudentIdForProfile}
            />
          </RoleGuard>
        )}

        {currentScreen === 'T02' && (
          <RoleGuard allowedRoles={['teacher']} onRedirect={setCurrentScreen}>
            <T02StudentProfiles
              students={studentsList.length > 0 ? studentsList : users}
              results={results}
              onNavigate={setCurrentScreen}
              onSelectStudentForProfile={setSelectedStudentIdForProfile}
              onRefreshUsers={refreshUsers}
            />
          </RoleGuard>
        )}

        {currentScreen === 'T03' && (
          <RoleGuard allowedRoles={['teacher', 'technical_admin']} onRedirect={setCurrentScreen}>
            <T03SupportsConfig
              studentId={selectedStudentIdForProfile}
              students={studentsList.length > 0 ? studentsList : users}
              onNavigate={setCurrentScreen}
              onProfileUpdated={() => {
                setProfileUpdateTrigger((t) => t + 1);
                refreshActivities();
              }}
            />
          </RoleGuard>
        )}

        {currentScreen === 'T04' && (
          <RoleGuard allowedRoles={['teacher']} onRedirect={setCurrentScreen}>
            <T04ActivityLibrary
              key={`${selectedStudentIdForProfile}_${profileUpdateTrigger}`}
              activities={activities}
              products={products}
              students={studentsList.length > 0 ? studentsList : users.filter((u) => u.role === 'student')}
              selectedStudentId={selectedStudentIdForProfile}
              onSelectStudent={setSelectedStudentIdForProfile}
              onNavigate={setCurrentScreen}
              onRefreshActivities={refreshActivities}
            />
          </RoleGuard>
        )}

        {currentScreen === 'T05' && (
          <RoleGuard
            allowedRoles={['teacher', 'technical_admin', 'student']}
            requireCatalogPermission={true}
            onRedirect={setCurrentScreen}
          >
            <T05ProductStock
              products={products}
              onNavigate={setCurrentScreen}
              onRefreshProducts={() => {
                refreshProducts();
                refreshActivities();
              }}
            />
          </RoleGuard>
        )}

        {currentScreen === 'T06' && (
          <RoleGuard allowedRoles={['teacher', 'technical_admin']} onRedirect={setCurrentScreen}>
            <T06ResultsReports
              results={results}
              students={studentsList.length > 0 ? studentsList : users}
              onNavigate={setCurrentScreen}
            />
          </RoleGuard>
        )}

        {/* TECHNICAL ADMIN SCREENS */}
        {currentScreen === 'A01' && (
          <RoleGuard allowedRoles={['technical_admin']} onRedirect={setCurrentScreen}>
            <A01TechnicalPanel
              onNavigate={setCurrentScreen}
              onDataReset={() => {
                refreshProducts();
                refreshActivities();
                refreshResults();
                refreshUsers();
              }}
            />
          </RoleGuard>
        )}

        {currentScreen === 'A02' && (
          <RoleGuard allowedRoles={['technical_admin']} onRedirect={setCurrentScreen}>
            <A02UserManagement
              users={users}
              onNavigate={setCurrentScreen}
              onRefreshUsers={refreshUsers}
            />
          </RoleGuard>
        )}
      </main>

      {/* Footer with vocational training clarity */}
      <footer className="bg-white border-t border-slate-200 py-5 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>Mini-IPCA Store</strong> — Capacitación vocacional adaptada: el estudiante aprende el rol de vendedor/dependiente.
          </p>
          <p className="text-slate-400">
            Interfaces de baja carga cognitiva • Objetivos de autonomía laboral y empleo con apoyo
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
