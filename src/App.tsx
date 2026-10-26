import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  Activity,
  HistoricalResult,
  Product,
  ScreenId,
  StudentProfile,
  User,
} from './types';
import { api } from './services/api';
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

  // Accessibility UI toggles
  const [largeText, setLargeText] = useState(false);
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

  // Sync profile preferences
  useEffect(() => {
    if (profile) {
      if (profile.largeText !== undefined) setLargeText(profile.largeText);
      if (profile.highContrast !== undefined) setHighContrast(profile.highContrast);
    }
  }, [profile]);

  // Active activity (core sales activity ACT-001 by default)
  const currentActivity =
    activities.find((a) => a.id === 'ACT-001') ||
    activities[0] || {
      id: 'ACT-001',
      title: 'Venta en caja: Pedido básico',
      instruction: 'Un cliente solicita 2 jugos y 1 paquete de galletas.',
      lineItems: [
        { productId: 'P002', quantity: 2 },
        { productId: 'P003', quantity: 1 },
      ],
      paymentAmountCents: 500,
      difficulty: 'facil',
      helpLevel: 'high',
      active: true,
      expectedTotalCents: 235,
      expectedChangeCents: 265,
    };

  // Reset exercise state for a fresh sale
  const handleResetSale = () => {
    setSelectedQuantities({});
    setAnsweredTotalCents(null);
    setAnsweredChangeCents(null);
    setSupportsUsedInSession([]);
    setCurrentScreen('S04');
  };

  // Complete sale handler (called when change calculation S06 succeeds)
  const handleSaleSuccess = async (changeCents: number) => {
    setAnsweredChangeCents(changeCents);

    // Build lineItemsSnapshot with current product names and unit prices
    const snapshot = currentActivity.lineItems.map((item: any) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod ? prod.name : item.productId,
        unitPriceCents: prod ? prod.priceCents : 0,
        quantity: item.quantity,
      };
    });

    try {
      await api.saveResult({
        studentId: user?.id || 'anonimo',
        activityId: currentActivity.id,
        lineItemsSnapshot: snapshot,
        totalExpectedCents: currentActivity.expectedTotalCents,
        totalAnsweredCents: answeredTotalCents || currentActivity.expectedTotalCents,
        paymentAmountCents: currentActivity.paymentAmountCents,
        changeExpectedCents: currentActivity.expectedChangeCents,
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
      } ${largeText ? 'text-lg' : 'text-base'}`}
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
        largeText={largeText}
        onToggleLargeText={() => setLargeText(!largeText)}
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
              onNavigate={setCurrentScreen}
              completedSalesCount={results.filter((r) => r.studentId === user?.id).length}
              totalGoal={5}
            />
          </RoleGuard>
        )}

        {currentScreen === 'S02' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            <S02ModuleSelect
              onNavigate={setCurrentScreen}
              onSelectModuleActivity={() => handleResetSale()}
            />
          </RoleGuard>
        )}

        {currentScreen === 'S03' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            <S03CatalogView products={products} onNavigate={setCurrentScreen} />
          </RoleGuard>
        )}

        {currentScreen === 'S04' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            <S04SalesOrder
              activity={currentActivity}
              products={products}
              selectedQuantities={selectedQuantities}
              onUpdateQuantities={setSelectedQuantities}
              onProceedToTotal={() => setCurrentScreen('S05')}
              onNavigate={setCurrentScreen}
            />
          </RoleGuard>
        )}

        {currentScreen === 'S05' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            <S05TotalCalculation
              activity={currentActivity}
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
              activity={currentActivity}
              totalCents={answeredTotalCents || currentActivity.expectedTotalCents}
              paymentCents={currentActivity.paymentAmountCents}
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
              totalCents={answeredTotalCents || currentActivity.expectedTotalCents}
              paymentCents={currentActivity.paymentAmountCents}
              changeCents={answeredChangeCents || currentActivity.expectedChangeCents}
              completedCount={results.filter((r) => r.studentId === user?.id).length}
              totalGoal={5}
              onPracticeAgain={handleResetSale}
              onNavigate={setCurrentScreen}
            />
          </RoleGuard>
        )}

        {currentScreen === 'S08' && (
          <RoleGuard allowedRoles={['student']} onRedirect={setCurrentScreen}>
            <S08StudentProgress
              results={results.filter((r) => r.studentId === user?.id)}
              onNavigate={setCurrentScreen}
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
              onProfileUpdated={() => refreshActivities()}
            />
          </RoleGuard>
        )}

        {currentScreen === 'T04' && (
          <RoleGuard allowedRoles={['teacher']} onRedirect={setCurrentScreen}>
            <T04ActivityLibrary
              activities={activities}
              products={products}
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
