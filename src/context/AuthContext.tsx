import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, Role } from '../types';
import { api, getStoredToken, clearStoredSession } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshMe = async () => {
    try {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setUser(null);
        setProfile(null);
        setToken(null);
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      if (data.profile) setProfile(data.profile);
      setToken(storedToken);
    } catch (err) {
      console.warn('Sesión no válida o expirada:', err);
      clearStoredSession();
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const session = await api.login(username, password);
      setUser(session.user);
      setToken(session.token);
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
      setToken(null);
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
        token,
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
