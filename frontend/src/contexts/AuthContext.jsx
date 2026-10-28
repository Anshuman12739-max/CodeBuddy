import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { aiService } from '../services/aiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState({
    provider: 'ollama',
    model: 'gemma3:1b',
    isHealthy: true,
    checked: false
  });

  const checkAIHealth = async () => {
    try {
      const res = await aiService.getAIHealth();
      if (res.data) {
        setAiStatus({
          provider: res.data.provider,
          model: res.data.model,
          isHealthy: res.data.isHealthy,
          checked: true
        });
      }
    } catch (err) {
      setAiStatus(prev => ({
        ...prev,
        isHealthy: false,
        error: err.message,
        checked: true
      }));
    }
  };

  const loadUser = async () => {
    const token = localStorage.getItem('codebuddy_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getCurrentUser();
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.warn('Failed to restore session:', err.message);
      // If local dev session cached in storage
      const stored = localStorage.getItem('codebuddy_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    checkAIHealth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    await loadUser();
    return res;
  };

  const register = async (email, password, displayName) => {
    const res = await authService.register(email, password, displayName);
    await loadUser();
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        aiStatus,
        login,
        register,
        logout,
        refreshUser: loadUser,
        refreshAIStatus: checkAIHealth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
