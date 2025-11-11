import AsyncStorage from '@react-native-async-storage/async-storage';
import { extractUserDataFromToken } from '../utils/tokenUtils';
import { apiClient } from './api';

// Interface para os dados do perfil do cliente
export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  // Campos adicionais que podem vir da API
  created_at?: string;
  updated_at?: string;
}

// Interface para atualização do perfil
export interface UpdateProfileData {
  tutor_name?: string;
  phone?: string;
}

export const profileService = {
  // Buscar dados do perfil do cliente logado
  getProfile: async (): Promise<ClientProfile> => {
    try {
      console.log('👤 Buscando perfil do cliente...');
      
      // Primeiro tenta o endpoint de profile
      try {
        const response = await apiClient.get('/api/v1/client/profile/');
        console.log('✅ Perfil obtido com sucesso via API');
        return response.data;
      } catch {
        console.log('⚠️ Endpoint profile não disponível, extraindo dados do token');
        
        // Extrai dados do token JWT
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const userData = extractUserDataFromToken(token);
          if (userData) {
            console.log('✅ Dados extraídos do token JWT');
            return {
              id: userData.id,
              name: userData.nome,
              email: userData.email,
              phone: userData.telefone,
            };
          }
        }
        
        console.log('⚠️ Usando estrutura de dados padrão');
        // Fallback: retorna estrutura básica
        return {
          id: 'temp-id',
          name: 'Usuário',
          email: 'email@exemplo.com',
          phone: '',
        };
      }
    } catch (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      throw error;
    }
  },

  // Atualizar dados do perfil do cliente
  updateProfile: async (data: UpdateProfileData): Promise<ClientProfile> => {
    try {
      console.log('📝 Atualizando perfil do cliente...', data);
      
      // Endpoint correto da documentação: PUT /api/v1/auth/clinic/profile
      // Converte tutor_name para name que é o que a API espera
      const requestBody = {
        name: data.tutor_name,
        phone: data.phone,
      };
      
      const response = await apiClient.put('/api/v1/auth/clinic/profile', requestBody);
      console.log('✅ Perfil atualizado com sucesso');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      throw error;
    }
  },
};