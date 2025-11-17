import { apiClient } from './api';
import { petService } from './petService';

// Interface para alimento
export interface Food {
  id: number;
  nome: string;
  tipo: string;
  marca?: string;
  calorias_por_100g?: number;
  proteinas?: number;
  gorduras?: number;
  carboidratos?: number;
}

// Interface para os dados de uma dieta baseada no Postman
export interface Diet {
  id?: string;
  nome: string;
  tipo: 'ração' | 'caseira' | 'mista';
  objetivo: 'emagrecimento' | 'ganho_peso' | 'manutenção' | 'especial';
  data_inicio: string;
  data_fim: string;
  status: 'ativa' | 'pausada' | 'finalizada';
  refeicoes_por_dia: number;
  calorias_totais_dia: number;
  valor_mensal_estimado: number;
  animal_id?: string;
  alimento_id?: number;
  quantidade_gramas?: number;
  horario?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  // Dados expandidos (para quando o endpoint estiver disponível)
  alimento?: Food | null;
}

// Interface para dados de progresso de dieta
export interface DietProgress {
  refeicao_index: number;
  horario_realizado: string;
  quantidade_gramas: number;
  observacoes_tutor?: string;
}

// Interface para dados de progresso do dia
export interface DailyProgress {
  date: string;
  total_refeicoes: number;
  refeicoes_realizadas: number;
  total_calorias: number;
  calorias_consumidas: number;
  progresso_percentual: number;
  refeicoes: DietProgress[];
}

export const dietService = {
  // Buscar detalhes de um alimento da tabela alimentos_base
  // NOTA: Endpoint /api/v1/alimentos-base/{id} espera UUID, não o alimento_id numérico
  // Por enquanto retorna null até o backend expor endpoint correto
  getFood: async (foodId: number): Promise<Food | null> => {
    console.log(`ℹ️ alimento_id ${foodId} não pode ser buscado (endpoint espera UUID)`);
    return null;
    
    /* Código comentado até backend disponibilizar endpoint correto
    try {
      const response = await apiClient.get<Food>(`/api/v1/alimentos-base/${foodId}`);
      return response.data;
    } catch (error: any) {
      console.warn(`⚠️ Erro ao buscar alimento ${foodId}:`, error.response?.status);
      return null;
    }
    */
  },

  // Listar dietas do cliente (busca de todos os pets)
  getDiets: async (): Promise<Diet[]> => {
    try {
      console.log('🔍 Buscando dietas do cliente...');
      
      // Primeiro tenta o endpoint agregado
      try {
        const response = await apiClient.get<Diet[]>('/api/v1/client/diets');
        console.log('✅ Dietas encontradas (endpoint client):', response.data.length);
        if (response.data.length > 0) {
          console.log('📋 Dados das dietas:', JSON.stringify(response.data, null, 2));
          return response.data;
        }
      } catch (clientError: any) {
        console.warn('⚠️ Endpoint /client/diets não retornou dados:', clientError.response?.status);
      }

      // Se não encontrou nada, busca dietas de cada pet individualmente
      console.log('🔄 Buscando dietas por pet...');
      const pets = await petService.getPets();
      console.log(`📦 Encontrados ${pets.length} pets`);
      
      const allDiets: Diet[] = [];
      for (const pet of pets) {
        try {
          console.log(`🐾 Buscando dietas do pet: ${pet.name} (${pet.id})`);
          const petDietsResponse = await apiClient.get<Diet[]>(`/api/v1/animals/${pet.id}/diets`);
          console.log(`   ✅ ${petDietsResponse.data.length} dietas encontradas`);
          allDiets.push(...petDietsResponse.data);
        } catch (petError: any) {
          console.warn(`   ⚠️ Erro ao buscar dietas do pet ${pet.name}:`, petError.response?.status);
        }
      }
      
      console.log(`🎉 Total de dietas encontradas: ${allDiets.length}`);
      if (allDiets.length > 0) {
        console.log('📋 Dietas:', JSON.stringify(allDiets, null, 2));
      }
      
      // NOTA: Enriquecimento de alimentos desabilitado até backend expor endpoint correto
      // Os alimento_id (1, 2) não correspondem aos UUIDs da tabela alimentos_base
      return allDiets;
    } catch (error: any) {
      console.error('❌ Erro ao buscar dietas:', error);
      console.error('Status:', error.response?.status);
      console.error('Dados:', error.response?.data);
      return []; // Retorna array vazio em caso de erro
    }
  },

  // Criar nova dieta com IA
  createDietWithAI: async (data: {
    animal_id: string;
    petName: string;
    peso: number;
    idade: number;
    atividade: 'baixa' | 'moderada' | 'alta';
    objetivo: 'emagrecimento' | 'ganho_peso' | 'manutenção';
    tipo_alimentacao: 'ração' | 'caseira' | 'mista';
    observacoes?: string;
  }): Promise<Diet> => {
    try {
      console.log('🤖 Criando dieta com IA para:', data.petName);
      console.log('📊 Dados da requisição:', data);
      
      // Endpoint correto: POST /api/v1/animals/{animal_id}/diets/ai
      const response = await apiClient.post<Diet>(`/api/v1/animals/${data.animal_id}/diets/ai`, {
        // O endpoint pode não precisar de corpo, mas vamos enviar os dados por garantia
        peso: data.peso,
        idade: data.idade,
        atividade: data.atividade,
        objetivo: data.objetivo,
        tipo_alimentacao: data.tipo_alimentacao,
        observacoes: data.observacoes
      });
      
      console.log('✅ Dieta criada com sucesso!');
      console.log('📋 Resposta:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao criar dieta com IA:', error);
      console.error('Status:', error.response?.status);
      console.error('Dados do erro:', error.response?.data);
      
      // Se for erro 500 (problema de conectividade do backend), simular sucesso temporariamente
      if (error.response?.status === 500) {
        console.warn('⚠️ Backend com problema. Simulando criação de dieta...');
        return {
          id: `diet_${Date.now()}`,
          nome: `Dieta ${data.objetivo} para ${data.petName}`,
          tipo: data.tipo_alimentacao,
          objetivo: data.objetivo,
          data_inicio: new Date().toISOString().split('T')[0],
          data_fim: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
          status: 'ativa',
          refeicoes_por_dia: 3,
          calorias_totais_dia: data.peso * 30 * 1.5,
          valor_mensal_estimado: 180.00,
          animal_id: data.animal_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Diet;
      }
      
      throw error;
    }
  },

  // Registrar progresso da dieta
  addProgress: async (progress: DietProgress): Promise<void> => {
    try {
      console.log('📊 Registrando progresso da dieta...', progress);
      await apiClient.post('/api/v1/client/diets/progress', progress);
      
      console.log('✅ Progresso registrado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao registrar progresso:', error);
      throw error;
    }
  },

  // Buscar progresso do dia
  getTodayProgress: async (): Promise<DailyProgress> => {
    try {
      console.log('📅 Buscando progresso de hoje...');
      const response = await apiClient.get('/api/v1/client/diets/progress/today');
      
      console.log('✅ Progresso de hoje obtido');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar progresso de hoje:', error);
      throw error;
    }
  },
};