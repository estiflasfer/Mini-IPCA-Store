import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile } from '../types';
import { api } from '../services/api';
import { auth, onAuthStateChanged } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  updateProfileLocally: (profile: StudentProfile) => void;
  updateUserLocally: (user: User) => void;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  canManageCatalog: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshMe = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      if (data.profile) setProfile(data.profile);
    } catch (err) {
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Firebase Auth is the single source of truth for session persistence.
    // onAuthStateChanged restores the user automatically after browser reload.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const data = await api.getMe();
          setUser(data.user);
          if (data.profile) setProfile(data.profile);
        } catch (err) {
          console.warn('Error al sincronizar datos del usuario con el backend:', err);
          setUser(null);
          setProfile(null);
        }
      } else {
        // In local development, check if dev session was initiated
        if (import.meta.env.DEV && sessionStorage.getItem('mini_ipca_dev_email')) {
          try {
            const data = await api.getMe();
            setUser(data.user);
            if (data.profile) setProfile(data.profile);
          } catch {
            setUser(null);
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const session = await api.login(username, password);
      setUser(session.user);
      if (session.profile) {
        setProfile(session.profile);
      }
      return session.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } finally {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
    }
  };

  const updateProfileLocally = (newProfile: StudentProfile) => {
    setProfile(newProfile);
  };

  const updateUserLocally = (newUser: User) => {
    setUser(newUser);
  };

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'technical_admin';
  const canManageCatalog =
    Boolean(isTeacher || isAdmin || (isStudent && user?.permissions.includes('manage_catalog')));

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        login,
        logout,
        refreshMe,
        updateProfileLocally,
        updateUserLocally,
        isStudent,
        isTeacher,
        isAdmin,
        canManageCatalog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
