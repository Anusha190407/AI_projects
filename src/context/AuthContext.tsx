import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  company: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  quickDemoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'usr_demo_01',
  email: 'operations.lead@tiruppurtextiles.com',
  name: 'Anusha Raman',
  role: 'VP of Global Supply Chain',
  company: 'Tiruppur Apparel Consortium'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('chaintwin_user');
      return saved ? JSON.parse(saved) : DEMO_USER;
    } catch {
      return DEMO_USER;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('chaintwin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chaintwin_user');
    }
  }, [user]);

  const login = async (email: string) => {
    const loggedUser: User = {
      id: 'usr_' + Date.now(),
      email,
      name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
      role: 'Supply Chain Operations Manager',
      company: 'Tiruppur Apparel Consortium'
    };
    setUser(loggedUser);
    return true;
  };

  const signup = async (name: string, email: string) => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      email,
      name,
      role: 'Supply Chain Analyst',
      company: 'Tiruppur Apparel Consortium'
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const quickDemoLogin = () => {
    setUser(DEMO_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        quickDemoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

