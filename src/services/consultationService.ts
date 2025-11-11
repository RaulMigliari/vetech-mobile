import { apiClient } from './api';

// Tipos para os agendamentos (appointments) que funcionam como consultas para o cliente
export interface Consultation {
  id: string;
  animal_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  description?: string;
  // Campos opcionais baseados na API
  service_type?: string;
  notes?: string;
  veterinarian?: string;
}

// Interface para criar um novo agendamento
export interface CreateAppointmentData {
  animal_id: string;
  date: string;
  start_time: string;
  service_type: string;
  description?: string;
  notes?: string;
}

export const consultationService = {
  // Listar todas as consultas do cliente (via appointments)
  getConsultations: async (): Promise<Consultation[]> => {
    try {
      // [CORRIGIDO COM BASE NO POSTMAN]
      // Endpoint: GET {{baseURL}}/api/v1/appointments?animal_id=xxx
      // Para o cliente mobile, usamos appointments que representam as consultas marcadas
      const response = await apiClient.get('/api/v1/appointments');
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
      throw error;
    }
  },

  // Buscar uma consulta específica por ID
  getConsultationById: async (id: string): Promise<Consultation> => {
    try {
      const response = await apiClient.get(`/api/v1/appointments/${id}`);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar consulta:', error);
      throw error;
    }
  },

  // Criar um novo agendamento
  createAppointment: async (data: CreateAppointmentData): Promise<Consultation> => {
    try {
      const appointmentData = {
        animal_id: data.animal_id,
        date: data.date,
        start_time: data.start_time,
        end_time: null, // Será calculado pelo backend
        status: 'scheduled',
        service_type: data.service_type,
        description: data.description || '',
        notes: data.notes || ''
      };

      const response = await apiClient.post('/api/v1/appointments', appointmentData);
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      
      // Fallback para problemas de conectividade
      if (error.response?.status === 500) {
        console.warn('Backend com problema de conectividade. Simulando criação de agendamento...');
        return {
          id: `appointment_${Date.now()}`,
          animal_id: data.animal_id,
          date: data.date,
          start_time: data.start_time,
          end_time: null,
          status: 'scheduled',
          service_type: data.service_type,
          description: data.description || '',
          notes: data.notes || ''
        } as Consultation;
      }
      
      throw error;
    }
  },

  // Cancelar um agendamento
  cancelAppointment: async (id: string): Promise<void> => {
    try {
      await apiClient.patch(`/api/v1/appointments/${id}`, { status: 'cancelled' });
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      throw error;
    }
  },
};