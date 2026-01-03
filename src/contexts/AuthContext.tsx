import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';

interface LinkItem {
  title: string;
  url: string;
  icon?: string;
  active: boolean;
}

interface PrivacySettings {
  showPhone: boolean;
  showAddress: boolean;
  showPostalCode: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  privacy?: PrivacySettings;
  links?: LinkItem[];
  tenant?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, businessName?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تأخیر کوچک برای اطمینان از load شدن localStorage
    const initAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const storedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (storedToken) {
        setToken(storedToken);
      }

      if (storedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse user:', e);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Login attempt:', email);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      console.log('Login response:', data);
      const accessToken = data.data.tokens.accessToken;
      const userData = data.data.user;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(accessToken);
      setUser(userData);
      console.log('Login successful, user set:', userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, businessName?: string) => {
    // اگر نام کسب‌وکار وارد شده باشد، از API ثبت‌نام مجموعه استفاده می‌کنیم
    const endpoint = businessName ? '/tenants/register' : '/auth/register';
    
    // If businessName is provided, we don't send role (backend handles it as tenant_admin)
    // If businessName is NOT provided, we explicitly send role: 'client' to avoid backend defaulting to 'tenant_admin'
    const payload = businessName 
      ? { name, email, password, businessName } 
      : { name, email, password, role: 'client' };
    
    const { data } = await api.post(endpoint, payload);
    
    if (data.data.tokens) {
      const accessToken = data.data.tokens.accessToken;
      const userData = data.data.user;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(accessToken);
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      if (data.success) {
        const updatedUser = data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
