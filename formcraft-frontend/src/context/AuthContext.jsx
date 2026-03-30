import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const saveAuthData = (data) => {
    const { accessToken, refreshToken, username, email, fullName, roles } = data;
    const userInfo = { username, email, fullName, roles };
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const login = async (usernameOrEmail, password) => {
    const response = await api.post('/auth/login', { usernameOrEmail, password });
    saveAuthData(response.data);
    return response;
  };

  const register = async (userData) => {
    return await api.post('/auth/register', userData);
  };

  const verifyRegistration = async (email, otp) => {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('otp', otp);
    const response = await api.post(`/auth/verify-registration?${params.toString()}`);
    saveAuthData(response.data);
    return response;
  };

  const resendVerification = async (email) => {
    const params = new URLSearchParams();
    params.append('email', email);
    return await api.post(`/auth/resend-verification?${params.toString()}`);
  };

  const forgotPassword = async (identity) => {
    const params = new URLSearchParams();
    params.append('identity', identity);
    return await api.post(`/auth/forgot-password?${params.toString()}`);
  };

  const resetPassword = async (identity, otp, newPassword) => {
    const params = new URLSearchParams();
    params.append('identity', identity);
    params.append('otp', otp);
    params.append('newPassword', newPassword);
    const response = await api.post(`/auth/reset-password?${params.toString()}`);
    saveAuthData(response.data);
    return response;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      verifyRegistration, 
      resendVerification,
      forgotPassword, 
      resetPassword, 
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
