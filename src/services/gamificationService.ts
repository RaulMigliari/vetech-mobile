import { apiClient } from './api';

// Interfaces
export interface Meta {
  id: string;
  clinic_id: string;
  descricao: string;
  tipo: 'atividade' | 'alimentacao' | 'peso' | 'consulta';
  quantidade: number;
  unidade: string;
  periodo: 'diario' | 'semanal' | 'mensal';
  pontos_recompensa: number;
  status: 'ativa' | 'inativa';
  created_at?: string;
  updated_at?: string;
}

export interface Pontuacao {
  id: string;
  animal_id: string;
  meta_id: string;
  meta_descricao?: string;
  atividade_realizada_id?: string | null;
  pontos_obtidos: number;
  data: string;
  descricao: string;
  created_at: string;
}

export interface Recompensa {
  id: string;
  nome: string;
  pontos_necessarios: number;
  tipo: string;
  descricao: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecompensaResgatada {
  id: string;
  animal_id: string;
  recompensa_id: string;
  recompensa_nome?: string;
  pontos_gastos: number;
  codigo_verificacao: string;
  data_resgate: string;
  data_expiracao?: string;
  status: 'ativo' | 'usado' | 'expirado';
  observacoes?: string;
  created_at: string;
}

export interface ProgressoMeta {
  meta_id: string;
  descricao: string;
  progresso_atual: number;
  meta_total: number;
  percentual: number;
  status: 'em_andamento' | 'concluida';
}

export interface Estatisticas {
  pontos_totais: number;
  pontos_periodo: number;
  pontos_disponiveis: number;
  recompensas_resgatadas: number;
  metas_concluidas: number;
  metas_em_andamento: number;
  progresso_metas: ProgressoMeta[];
  historico_pontos: { data: string; pontos: number }[];
}

export const gamificationService = {
  // Metas
  getMetas: async (filters?: {
    tipo?: string;
    status?: string;
    periodo?: string;
  }): Promise<Meta[]> => {
    try {
      console.log('🎯 Buscando metas de gamificação...');
      const params = new URLSearchParams();
      if (filters?.tipo) params.append('tipo', filters.tipo);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.periodo) params.append('periodo', filters.periodo);
      
      const url = `/api/v1/gamificacao/metas${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<Meta[]>(url);
      console.log(`✅ ${response.data.length} metas encontradas`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar metas:', error);
      return [];
    }
  },

  // Pontuações
  getPontuacoes: async (
    animalId: string,
    filters?: {
      data_inicio?: string;
      data_fim?: string;
      meta_id?: string;
    }
  ): Promise<Pontuacao[]> => {
    try {
      console.log(`📊 Buscando histórico de pontuações do animal ${animalId}...`);
      const params = new URLSearchParams();
      if (filters?.data_inicio) params.append('data_inicio', filters.data_inicio);
      if (filters?.data_fim) params.append('data_fim', filters.data_fim);
      if (filters?.meta_id) params.append('meta_id', filters.meta_id);
      
      const url = `/api/v1/animals/${animalId}/gamificacao/pontuacoes${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<Pontuacao[]>(url);
      console.log(`✅ ${response.data.length} pontuações encontradas`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar pontuações:', error);
      return [];
    }
  },

  // Recompensas disponíveis
  getRecompensas: async (filters?: {
    tipo?: string;
    pontos_min?: number;
    pontos_max?: number;
  }): Promise<Recompensa[]> => {
    try {
      console.log('🎁 Buscando recompensas disponíveis...');
      const params = new URLSearchParams();
      if (filters?.tipo) params.append('tipo', filters.tipo);
      if (filters?.pontos_min) params.append('pontos_min', filters.pontos_min.toString());
      if (filters?.pontos_max) params.append('pontos_max', filters.pontos_max.toString());
      
      const url = `/api/v1/gamificacao/recompensas${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<Recompensa[]>(url);
      console.log(`✅ ${response.data.length} recompensas disponíveis`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar recompensas:', error);
      return [];
    }
  },

  // Resgatar recompensa
  resgatarRecompensa: async (
    animalId: string,
    recompensaId: string,
    observacoes?: string
  ): Promise<RecompensaResgatada | null> => {
    try {
      console.log(`🎉 Resgatando recompensa ${recompensaId} para animal ${animalId}...`);
      const response = await apiClient.post<RecompensaResgatada>(
        `/api/v1/animals/${animalId}/gamificacao/recompensas`,
        {
          recompensa_id: recompensaId,
          observacoes,
        }
      );
      console.log('✅ Recompensa resgatada com sucesso!');
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao resgatar recompensa:', error);
      throw error;
    }
  },

  // Recompensas resgatadas
  getRecompensasResgatadas: async (
    animalId: string,
    status?: string
  ): Promise<RecompensaResgatada[]> => {
    try {
      console.log(`🎫 Buscando recompensas resgatadas do animal ${animalId}...`);
      const url = `/api/v1/animals/${animalId}/gamificacao/recompensas${status ? `?status=${status}` : ''}`;
      const response = await apiClient.get<RecompensaResgatada[]>(url);
      console.log(`✅ ${response.data.length} recompensas resgatadas`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar recompensas resgatadas:', error);
      return [];
    }
  },

  // Estatísticas
  getEstatisticas: async (
    animalId: string,
    periodo?: 'semanal' | 'mensal' | 'trimestral'
  ): Promise<Estatisticas | null> => {
    try {
      console.log(`📈 Buscando estatísticas de gamificação do animal ${animalId}...`);
      const url = `/api/v1/animals/${animalId}/gamificacao/estatisticas${periodo ? `?periodo=${periodo}` : ''}`;
      const response = await apiClient.get<Estatisticas>(url);
      console.log('✅ Estatísticas obtidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return null;
    }
  },

  // Ranking (se disponível)
  getRanking: async (periodo?: 'semanal' | 'mensal' | 'anual'): Promise<any[]> => {
    try {
      console.log('🏆 Buscando ranking de pontuações...');
      const url = `/api/v1/gamificacao/ranking${periodo ? `?periodo=${periodo}` : ''}`;
      const response = await apiClient.get<any[]>(url);
      console.log(`✅ ${response.data.length} posições no ranking`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar ranking:', error);
      return [];
    }
  },
};
