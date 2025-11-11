import { apiClient } from './api';

// Tipos para os agendamentos
export interface AppointmentRequest {
  id?: string;
  animal_id: string;
  service_type: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  priority: 'low' | 'normal' | 'high';
  status?: 'pending' | 'approved' | 'rejected';
}

export interface CreateAppointmentRequest {
  animal_id: string;
  service_type: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  priority: 'low' | 'normal' | 'high';
}

export const appointmentService = {
  // Criar uma nova solicitação de agendamento
  createAppointmentRequest: async (data: CreateAppointmentRequest): Promise<AppointmentRequest> => {
    try {
      // [CONFIGURADO COM BASE NO POSTMAN]
      // Endpoint: POST {{baseURL}}/api/client/appointment-requests/
      // Body: {
      //   "animal_id": "c7020821-b8fe-4608-9f7f-2bad17877ca4",
      //   "service_type": "Consulta veterinária",
      //   "date": "2025-11-15",
      //   "start_time": "14:00:00",
      //   "end_time": "15:00:00",
      //   "notes": "Animal com sintomas de gripe",
      //   "priority": "normal"
      // }
      const response = await apiClient.post('/api/client/appointment-requests/', data);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao criar solicitação de agendamento:', error);
      throw error;
    }
  },

  // Listar todas as solicitações de agendamento do cliente
  getAppointmentRequests: async (): Promise<AppointmentRequest[]> => {
    try {
      // [CONFIGURADO COM BASE NO POSTMAN]
      // Endpoint: GET {{baseURL}}/api/client/appointment-requests/
      // Headers: Authorization automaticamente adicionado
      const response = await apiClient.get('/api/client/appointment-requests/');
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar solicitações de agendamento:', error);
      throw error;
    }
  },

  // Cancelar uma solicitação de agendamento
  cancelAppointmentRequest: async (id: string): Promise<void> => {
    try {
      // Assumindo que existe um endpoint para cancelar
      await apiClient.delete(`/api/client/appointment-requests/${id}/`);
    } catch (error) {
      console.error('Erro ao cancelar solicitação:', error);
      throw error;
    }
  },
};