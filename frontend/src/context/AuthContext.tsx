import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (details: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.auth.getProfile();
          setUser(res.profile);
        } catch (error) {
          console.error('Error restoring session:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(credentials);
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (details: any) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(details);
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.getProfile();
      setUser(res.profile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
