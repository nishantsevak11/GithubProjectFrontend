import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkAuthStatus, logoutUser } from '@/services/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await checkAuthStatus();
      setUser(response.data);
    } catch (error) {
      console.error('Authentication check failed:', error);
      // If the token is invalid, remove it
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  useEffect(() => {
    checkUser();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    refreshUser: checkUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
