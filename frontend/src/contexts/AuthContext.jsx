import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('airindex_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('airindex_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
          localStorage.setItem('airindex_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { access_token, user: loggedUser } = res.data;
    setToken(access_token);
    setUser(loggedUser);
    localStorage.setItem('airindex_token', access_token);
    localStorage.setItem('airindex_user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    return res.data;
  };

  const verifyOtp = async (email, otp, purpose = 'EMAIL_VERIFICATION') => {
    const res = await authApi.verifyOtp({ email, otp, purpose });
    const { access_token, user: verifiedUser } = res.data;
    setToken(access_token);
    setUser(verifiedUser);
    localStorage.setItem('airindex_token', access_token);
    localStorage.setItem('airindex_user', JSON.stringify(verifiedUser));
    return verifiedUser;
  };

  const resendOtp = async (email, purpose = 'EMAIL_VERIFICATION') => {
    const res = await authApi.sendOtp({ email, purpose });
    return res.data;
  };

  const googleLogin = async (credential) => {
    const res = await authApi.googleAuth(credential);
    const { access_token, user: googleUser } = res.data;
    setToken(access_token);
    setUser(googleUser);
    localStorage.setItem('airindex_token', access_token);
    localStorage.setItem('airindex_user', JSON.stringify(googleUser));
    return googleUser;
  };

  const forgotPassword = async (email) => {
    const res = await authApi.forgotPassword({ email });
    return res.data;
  };

  const verifyResetOtp = async (email, otp) => {
    const res = await authApi.verifyResetOtp({ email, otp, purpose: 'PASSWORD_RESET' });
    return res.data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const res = await authApi.resetPassword({ email, otp, new_password: newPassword });
    return res.data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('airindex_token');
    localStorage.removeItem('airindex_user');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    verifyOtp,
    resendOtp,
    googleLogin,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
