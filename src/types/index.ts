// Tipos básicos que vamos usar no app

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  // Adicione outros campos conforme sua API
}

export interface Pet {
  id: string;
  name: string; // Baseado na API: "name": "Rex"
  species: string; // Baseado na API: "species": "Cachorro"
  breed?: string; // Baseado na API: "breed": "Labrador"
  age?: number; // Baseado na API: "age": 5
  weight?: number; // Baseado na API: "weight": 25.5
  medical_history?: string; // Baseado na API
  // Manter compatibilidade com nomes em português
  nome?: string;
  especie?: string;
  raca?: string;
  idade?: number;
  peso?: number;
}

export interface Consulta {
  id: string;
  data: string;
  hora: string;
  veterinario: string;
  pet: Pet;
  status: 'agendada' | 'concluida' | 'cancelada';
  // Adicione outros campos conforme sua API
}

export interface LoginResponse {
  token: string;
  user: User;
  // Ajuste conforme a resposta da sua API
}

// Tipos para formulários
export interface LoginForm {
  email: string;
  senha: string;
}

export interface DietaForm {
  petId: string;
  peso: number;
  idade: number;
  atividade: 'baixa' | 'moderada' | 'alta';
  // Adicione outros campos conforme necessário
}