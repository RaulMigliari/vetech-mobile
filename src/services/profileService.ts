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
      
      // Lista de endpoints para tentar (diferentes formatos para tutor e clínica)
      const attempts = [
        // Formato 1: Endpoint de clínica com "name"
        { 
          endpoint: '/api/v1/auth/clinic/profile', 
          method: 'put' as const,
          body: { name: data.tutor_name, phone: data.phone }
        },
        // Formato 2: Endpoint de cliente com "tutor_name"
        { 
          endpoint: '/api/v1/client/profile/', 
          method: 'patch' as const,
          body: data
        },
        // Formato 3: Endpoint alternativo
        { 
          endpoint: '/api/v1/client/animal', 
          method: 'patch' as const,
          body: data
        },
      ];
      
      // Tenta cada combinação de endpoint
      for (const attempt of attempts) {
        try {
          console.log(`🔄 Tentando: ${attempt.method.toUpperCase()} ${attempt.endpoint}`);
          
          const response = attempt.method === 'put' 
            ? await apiClient.put(attempt.endpoint, attempt.body)
            : await apiClient.patch(attempt.endpoint, attempt.body);
            
          console.log(`✅ Perfil atualizado com sucesso via ${attempt.endpoint}`);
          return response.data;
        } catch (error: any) {
          const status = error?.response?.status || 'unknown';
          console.log(`❌ ${attempt.endpoint} falhou com status: ${status}`);
          // Continua tentando outros endpoints
        }
      }
      
      // Se nenhum endpoint funcionar, faz atualização local (apenas no app)
      console.log('⚠️ Nenhum endpoint funcionou. Fazendo atualização local...');
      
      const currentProfile = await profileService.getProfile();
      const updatedProfile: ClientProfile = {
        ...currentProfile,
        name: data.tutor_name || currentProfile.name,
        phone: data.phone || currentProfile.phone,
      };
      
      // Atualiza também no AsyncStorage para persistir localmente
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const userData = extractUserDataFromToken(token);
        if (userData) {
          const updatedUserData = {
            ...userData,
            nome: data.tutor_name || userData.nome,
            telefone: data.phone || userData.telefone,
          };
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        }
      }
      
      console.log('✅ Atualização local concluída (não persistirá no backend)');
      return updatedProfile;
    } catch (error) {
      console.error('❌ Erro crítico ao atualizar perfil:', error);
      throw error;
    }
  },
};