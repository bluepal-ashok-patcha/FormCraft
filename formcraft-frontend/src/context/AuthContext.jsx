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

  const login = async (usernameOrEmail, password) => {
    const response = await api.post('/auth/login', { usernameOrEmail, password });
    const { accessToken, refreshToken, username, email, fullName, roles } = response.data;
    
    const userInfo = { username, email, fullName, roles }; 
    
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userInfo));
    
    setUser(userInfo);
    return response;
  };

  const register = async (userData) => {
    return await api.post('/auth/register', userData);
  };

  const verifyRegistration = async (email, otp) => {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('otp', otp);
    return await api.post(`/auth/verify-registration?${params.toString()}`);
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
    return await api.post(`/auth/reset-password?${params.toString()}`);
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
      forgotPassword, 
      resetPassword, 
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
