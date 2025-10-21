import { LoginForm, LoginResponse } from '../types';
import { apiClient } from './api';

export const authService = {
  // Função para fazer login
  login: async (credentials: LoginForm): Promise<LoginResponse> => {
    try {
      // [TODO: API AQUI]
      // Endpoint: (ex: '/auth/login' ou '/login')
      // Método: POST
      // Body (JSON): { email: string, senha: string } ou { email: string, password: string }
      // Resposta Esperada: { token: string, user: { id, nome, email, ... } }
      //
      // SUBSTITUA '/login' pelo endpoint correto do seu Postman
      // AJUSTE o corpo da requisição conforme sua API (senha vs password)
      const response = await apiClient.post('/login', {
        email: credentials.email,
        senha: credentials.senha, // ou password: credentials.senha
      });

      // Retorna os dados da resposta
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  // Função para validar se o token ainda é válido
  validateToken: async (): Promise<boolean> => {
    try {
      // [TODO: API AQUI]
      // Endpoint: (ex: '/auth/validate' ou '/me')
      // Método: GET
      // Headers: Authorization já é adicionado automaticamente
      // Resposta Esperada: dados do usuário ou status de sucesso
      //
      const response = await apiClient.get('/me'); // ou '/auth/validate'
      
      return response.status === 200;
    } catch (error) {
      console.error('Token inválido:', error);
      return false;
    }
  },
};