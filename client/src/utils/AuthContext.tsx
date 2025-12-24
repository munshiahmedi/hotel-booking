import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AuthService, 
  LoginCredentials, 
  RegisterData, 
  LoginResponse, 
  RegisterResponse 
} from '../services/authService';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (userData: RegisterData) => Promise<RegisterResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount and page refresh
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await AuthService.login(credentials);
      setUser(response.user);
      setToken(response.token);
      return response;
    } catch (error) {
      // Clear any partial auth state on error
      setUser(null);
      setToken(null);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await AuthService.register(userData);
      setUser(response.user);
      setToken(response.token);
      return response;
    } catch (error) {
      // Clear any partial auth state on error
      setUser(null);
      setToken(null);
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
