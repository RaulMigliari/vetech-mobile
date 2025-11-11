import { apiClient } from './api';
import { Consultation } from './consultationService';
import { Diet } from './dietService';
import { Pet } from './petService';

// Interface para entrada de histórico médico
export interface MedicalHistoryEntry {
  id: string;
  animal_id: string;
  date: string;
  type: 'consulta' | 'peso' | 'dieta' | 'observacao';
  title: string;
  description: string;
  details?: any;
  created_at: string;
}

// Interface para dados consolidados de saúde
export interface HealthSummary {
  pet: Pet;
  currentWeight: number;
  lastConsultation?: Consultation;
  activeDiets: Diet[];
  recentEntries: MedicalHistoryEntry[];
  weightHistory: WeightEntry[];
}

// Interface para histórico de peso
export interface WeightEntry {
  date: string;
  weight: number;
  notes?: string;
}

export const healthService = {
  // Obter histórico completo de saúde de um pet
  getHealthHistory: async (animalId: string): Promise<HealthSummary> => {
    try {
      // Buscar dados básicos do pet
      const pet = await apiClient.get<Pet>(`/api/v1/animals/${animalId}`);
      
      // Buscar consultas do pet
      const consultationsResponse = await apiClient.get<Consultation[]>(
        `/api/v1/consultations?animal_id=${animalId}`
      );
      
      // Buscar dietas do cliente (todas)
      const dietsResponse = await apiClient.get<Diet[]>('/api/v1/client/diets');
      const petDiets = dietsResponse.data.filter(diet => diet.animal_id === animalId);
      
      // Montar entradas do histórico médico
      const entries: MedicalHistoryEntry[] = [];
      
      // Adicionar consultas ao histórico
      consultationsResponse.data.forEach(consultation => {
        entries.push({
          id: `consultation-${consultation.id}`,
          animal_id: animalId,
          date: consultation.date,
          type: 'consulta',
          title: 'Consulta Veterinária',
          description: consultation.description || 'Consulta realizada',
          details: consultation,
          created_at: consultation.date
        });
      });
      
      // Adicionar dietas ao histórico
      petDiets.forEach(diet => {
        entries.push({
          id: `diet-${diet.id}`,
          animal_id: animalId,
          date: diet.created_at || diet.data_inicio,
          type: 'dieta',
          title: diet.nome,
          description: `Dieta ${diet.objetivo} - ${diet.calorias_totais_dia} cal/dia`,
          details: diet,
          created_at: diet.created_at || diet.data_inicio
        });
      });
      
      // Simular histórico de peso (baseado no peso atual + variações)
      const weightHistory = generateWeightHistory(pet.data.weight || 0);
      
      // Ordenar entradas por data (mais recentes primeiro)
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return {
        pet: pet.data,
        currentWeight: pet.data.weight || 0,
        lastConsultation: consultationsResponse.data[0],
        activeDiets: petDiets.filter(diet => diet.status === 'ativa'),
        recentEntries: entries.slice(0, 10), // Últimas 10 entradas
        weightHistory
      };
    } catch (error) {
      console.error('Erro ao buscar histórico de saúde:', error);
      throw error;
    }
  },

  // Adicionar observação manual ao histórico
  addObservation: async (animalId: string, observation: {
    title: string;
    description: string;
    date?: string;
  }): Promise<MedicalHistoryEntry> => {
    try {
      // Como não há endpoint específico, vamos simular e armazenar localmente
      const entry: MedicalHistoryEntry = {
        id: `obs-${Date.now()}`,
        animal_id: animalId,
        date: observation.date || new Date().toISOString(),
        type: 'observacao',
        title: observation.title,
        description: observation.description,
        created_at: new Date().toISOString()
      };
      
      // Em um app real, isso seria salvo no backend
      // Por enquanto, apenas retornar a entrada criada
      return entry;
    } catch (error) {
      console.error('Erro ao adicionar observação:', error);
      throw error;
    }
  },

  // Atualizar peso do pet
  updateWeight: async (animalId: string, newWeight: number, notes?: string): Promise<void> => {
    try {
      await apiClient.patch(`/api/v1/animals/${animalId}`, {
        weight: newWeight
      });
    } catch (error) {
      console.error('Erro ao atualizar peso:', error);
      throw error;
    }
  },

  // Buscar histórico médico completo (todas as entradas)
  getFullMedicalHistory: async (animalId: string): Promise<MedicalHistoryEntry[]> => {
    try {
      const healthSummary = await healthService.getHealthHistory(animalId);
      return healthSummary.recentEntries; // Por enquanto retorna as recentes
    } catch (error) {
      console.error('Erro ao buscar histórico médico completo:', error);
      throw error;
    }
  }
};

// Função auxiliar para gerar histórico de peso simulado
function generateWeightHistory(currentWeight: number): WeightEntry[] {
  const history: WeightEntry[] = [];
  const months = 6; // Últimos 6 meses
  
  for (let i = months; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    // Simular pequenas variações no peso (±0.5kg)
    const variation = (Math.random() - 0.5) * 1; // -0.5 a +0.5 kg
    const weight = Math.max(0.5, currentWeight + variation);
    
    history.push({
      date: date.toISOString().split('T')[0],
      weight: Math.round(weight * 10) / 10, // 1 casa decimal
      notes: i === 0 ? 'Peso atual' : undefined
    });
  }
  
  return history;
}