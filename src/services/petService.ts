import { apiClient } from './api';

// Tipos para os pets/animais
export interface Pet {
  id: string;
  name: string;
  species: string; // "Cachorro", "Gato", etc.
  breed?: string;
  age?: number;
  weight?: number;
  medical_history?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePetRequest {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  medical_history?: string;
}

export interface UpdatePetRequest {
  name?: string;
  species?: string;
  breed?: string;
  age?: number;
  weight?: number;
  medical_history?: string;
}

export const petService = {
  // Listar todos os pets do cliente
  getPets: async (): Promise<Pet[]> => {
    try {
      // [BASEADO NO POSTMAN - ASSUMINDO ENDPOINT]
      // Pode ser /api/v1/client/animals ou /api/v1/animals
      const response = await apiClient.get('/api/v1/animals');
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      throw error;
    }
  },

  // Buscar um pet específico por ID
  getPetById: async (id: string): Promise<Pet> => {
    try {
      const response = await apiClient.get(`/api/v1/animals/${id}`);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pet:', error);
      throw error;
    }
  },

  // Criar um novo pet
  createPet: async (data: CreatePetRequest): Promise<Pet> => {
    try {
      // [CONFIGURADO COM BASE NO POSTMAN]
      // Endpoint: POST {{baseURL}}/api/v1/animals
      // Body: {
      //   "name": "Rex",
      //   "species": "Cachorro",
      //   "breed": "Labrador",
      //   "age": 5,
      //   "weight": 25.5,
      //   "medical_history": "Animal saudável com vacinas em dia."
      // }
      const response = await apiClient.post('/api/v1/animals', data);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pet:', error);
      throw error;
    }
  },

  // Atualizar dados de um pet
  updatePet: async (id: string, data: UpdatePetRequest): Promise<Pet> => {
    try {
      const response = await apiClient.put(`/api/v1/animals/${id}`, data);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar pet:', error);
      throw error;
    }
  },

  // Deletar um pet
  deletePet: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/animals/${id}`);
    } catch (error) {
      console.error('Erro ao deletar pet:', error);
      throw error;
    }
  },
};