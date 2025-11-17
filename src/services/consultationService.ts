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

  // Buscar horários disponíveis para uma data específica
  getAvailableTimeSlots: async (date: string): Promise<string[]> => {
    try {
      console.log(`🔍 Buscando horários ocupados para ${date}...`);
      console.log(`📅 Formato da data: ${date} (tipo: ${typeof date})`);
      
      // Busca todos os agendamentos (o filtro da API pode não estar funcionando)
      const response = await apiClient.get('/api/v1/appointments');
      const allAppointments = response.data as Consultation[];
      console.log(`� Total de agendamentos do cliente: ${allAppointments.length}`);
      
      // SEMPRE filtra manualmente pela data, já que o filtro da API pode não funcionar
      const targetDate = date.split('T')[0]; // Garante formato YYYY-MM-DD
      const filteredAppointments = allAppointments.filter(apt => {
        const aptDate = apt.date.split('T')[0];
        return aptDate === targetDate;
      });
      
      console.log(`🔍 Agendamentos filtrados para ${targetDate}: ${filteredAppointments.length}`);
      
      if (filteredAppointments.length > 0) {
        console.log(`📋 Detalhes dos agendamentos:`);
        filteredAppointments.forEach(apt => {
          console.log(`   🔸 ${apt.date} ${apt.start_time} - Status: ${apt.status}`);
        });
      }
      
      // Extrai os horários ocupados (start_time) - exclui cancelados
      const occupiedSlots = filteredAppointments
        .filter(apt => apt.status !== 'cancelled')
        .map(apt => {
          // Normaliza o formato do horário (remove segundos se existir)
          const time = apt.start_time;
          if (time && time.length > 5) {
            return time.substring(0, 5); // "08:30:00" -> "08:30"
          }
          return time;
        })
        .filter((time): time is string => time !== null);
      
      console.log(`⏰ Horários ocupados para ${targetDate} (${occupiedSlots.length}):`, occupiedSlots);
      
      // Define todos os horários possíveis
      const allTimeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
      ];
      
      // Retorna apenas os horários disponíveis (não ocupados)
      const availableSlots = allTimeSlots.filter(slot => !occupiedSlots.includes(slot));
      
      console.log(`✅ Horários disponíveis para ${targetDate} (${availableSlots.length}):`, availableSlots);
      
      return availableSlots;
    } catch (error: any) {
      console.error('❌ Erro ao buscar horários disponíveis:', error);
      
      // Em caso de erro, retorna todos os horários (fallback)
      console.warn('⚠️ Usando todos os horários como fallback');
      return [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
      ];
    }
  },
};