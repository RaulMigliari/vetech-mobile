import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se já existe um token salvo quando o app inicia
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      console.log('🔍 AuthContext: Verificando dados salvos...');
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      
      console.log('📱 Dados no AsyncStorage - Token:', !!storedToken, 'User:', !!storedUser);
      
      if (storedToken && storedUser) {
        console.log('✅ AuthContext: Restaurando sessão...');
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        console.log('❌ AuthContext: Nenhum dado salvo encontrado');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.log('❌ Erro ao verificar autenticação:', error);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (authToken: string, userData: User) => {
    try {
      console.log('🔐 AuthContext: Salvando token e dados do usuário...');
      console.log('🔑 Token:', authToken ? 'Presente' : 'Ausente');
      console.log('👤 User data:', JSON.stringify(userData, null, 2));
      
      // Salva o token e dados do usuário
      await AsyncStorage.setItem('userToken', authToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      setToken(authToken);
      setUser(userData);
      
      console.log('✅ AuthContext: Login concluído, isAuthenticated:', !!(authToken && userData));
    } catch (error) {
      console.log('❌ AuthContext: Erro ao fazer login:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 AuthContext: Iniciando logout...');
    try {
      // Chama a API de logout primeiro
      await authService.logout();
      console.log('✅ AuthContext: API de logout bem-sucedida');
    } catch (error) {
      console.log('❌ AuthContext: Erro na API de logout:', error);
      // Continua com logout local mesmo se API falhar
    }
    
    try {
      // Remove token e dados do usuário localmente
      console.log('🗑️ AuthContext: Removendo dados do AsyncStorage...');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // Verifica se os dados foram realmente removidos
      const checkToken = await AsyncStorage.getItem('userToken');
      const checkUser = await AsyncStorage.getItem('userData');
      console.log('🔍 AuthContext: Verificação após remoção - Token:', checkToken, 'User:', checkUser);
      
      console.log('🔄 AuthContext: Definindo estado como null...');
      setToken(null);
      setUser(null);
      
      console.log('✅ AuthContext: Logout concluído');
    } catch (error) {
      console.log('❌ AuthContext: Erro ao fazer logout local:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}