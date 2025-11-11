// Utilitários para extrair dados do JWT token

export interface JWTPayload {
  sub: string;
  email: string;
  user_metadata?: {
    name?: string;
    phone?: string;
    role?: string;
    animal_id?: string;
    clinic_id?: string;
    email_verified?: boolean;
    temporary_password?: boolean;
  };
  exp: number;
  iat: number;
}

export function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    // JWT é dividido em 3 partes separadas por ponto
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token JWT inválido: formato incorreto');
      return null;
    }

    // A segunda parte é o payload (base64 encoded)
    const payload = parts[1];
    
    // Decodifica de base64 com suporte a UTF-8
    // Substitui caracteres especiais do base64url
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Adiciona padding se necessário
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    
    // Decodifica com suporte a UTF-8
    const decodedPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    // Parse do JSON
    const parsedPayload: JWTPayload = JSON.parse(decodedPayload);
    
    console.log('🔍 Token decodificado:', {
      sub: parsedPayload.sub,
      email: parsedPayload.email,
      user_metadata: parsedPayload.user_metadata,
    });
    
    return parsedPayload;
  } catch (error) {
    console.error('❌ Erro ao decodificar token JWT:', error);
    return null;
  }
}

export function extractUserDataFromToken(token: string) {
  const payload = decodeJWTPayload(token);
  
  if (!payload) {
    return null;
  }

  return {
    id: payload.sub,
    nome: payload.user_metadata?.name || 'Usuário',
    email: payload.email,
    telefone: payload.user_metadata?.phone || '',
    role: payload.user_metadata?.role || 'tutor',
    animal_id: payload.user_metadata?.animal_id,
    clinic_id: payload.user_metadata?.clinic_id,
  };
}