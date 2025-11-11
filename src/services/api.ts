import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// [TODO: API AQUI]
// Base URL: Cole aqui a URL base do seu backend
// Exemplo: 'https://api.veterinaria.com' ou 'http://localhost:3000'
const BASE_URL = 'http://192.168.15.157:8000';

// Cliente principal do Axios
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: function (status) {
    return status >= 200 && status < 300; // Aceita respostas de 200 a 299
  }
});

// Interceptor para adicionar automaticamente o token em todas as requisições
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Busca o token salvo no AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Adiciona o token no header Authorization
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Erro ao buscar token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
apiClient.interceptors.response.use(
  (response) => {
    // Se a resposta for bem-sucedida, apenas retorna os dados
    return response;
  },
  async (error) => {
    // Se o token expirou (status 401), limpa o token salvo
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      // Aqui você pode redirecionar para login, mas faremos isso mais tarde
    }
    return Promise.reject(error);
  }
);