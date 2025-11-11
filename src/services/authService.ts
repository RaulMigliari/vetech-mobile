import { LoginForm, LoginResponse } from '../types';
import { apiClient } from './api';

export const authService = {
  // Função para fazer login (usando dual-login para funcionar tanto com clínica quanto tutor)
  login: async (credentials: LoginForm): Promise<LoginResponse> => {
    try {
      // Baseado no Postman: POST {{baseURL}}/api/v1/auth/dual-login
      // Body: { "email": "teste@teste.com", "password": "senha123" }
      const response = await apiClient.post('/api/v1/auth/dual-login', {
        email: credentials.email,
        password: credentials.senha, // API usa "password", não "senha"
      });

      // DEBUG: Log da resposta completa para entender a estrutura
      console.log('🔍 Resposta completa do login:', JSON.stringify(response.data, null, 2));

      // Tentar diferentes estruturas de resposta possíveis
      let token, user;
      
      if (response.data.access_token) {
        // Estrutura do Supabase
        token = response.data.access_token;
        user = response.data.user;
      } else if (response.data.token) {
        // Estrutura simples com token
        token = response.data.token;
        user = response.data.user;
      } else if (response.data.data) {
        // Resposta aninhada em "data"
        token = response.data.data.access_token || response.data.data.token;
        user = response.data.data.user;
      } else {
        // Verificar se a resposta inteira é o token
        token = response.data;
        user = null;
      }

      console.log('🔑 Token extraído:', token);
      console.log('👤 User extraído:', JSON.stringify(user, null, 2));

      if (!token) {
        throw new Error('Token não encontrado na resposta da API');
      }
      
      return {
        token,
        user: user ? {
          id: user.id || user.sub || 'unknown',
          nome: user.user_metadata?.name || user.name || user.email || 'Usuário',
          email: user.email || credentials.email,
          telefone: user.user_metadata?.phone || user.phone,
        } : {
          id: 'temp',
          nome: 'Usuário',
          email: credentials.email,
        }
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  // Função para obter perfil do usuário (valida token e retorna dados)
  getProfile: async (): Promise<any> => {
    try {
      // Baseado no Postman: GET {{baseURL}}/api/v1/client/profile/
      // Headers: Authorization automaticamente adicionado
      const response = await apiClient.get('/api/v1/client/profile/');
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  },

  // Função para validar se o token ainda é válido
  validateToken: async (): Promise<boolean> => {
    try {
      // Usa o endpoint de profile para validar o token
      await authService.getProfile();
      return true;
    } catch (error) {
      console.error('Token inválido:', error);
      return false;
    }
  },

  // Função para logout
  logout: async (): Promise<void> => {
    try {
      // Baseado no Postman: POST {{baseURL}}/api/v1/auth/logout
      await apiClient.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
      // Não fazer throw aqui, pois logout local sempre deve funcionar
    }
  },
};