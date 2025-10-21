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
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  peso?: number;
  // Adicione outros campos conforme sua API
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