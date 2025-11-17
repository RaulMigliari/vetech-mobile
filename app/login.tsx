import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../src/constants/colors';
import { useAuth } from '../src/contexts/AuthContext';
import { authService } from '../src/services/authService';
import { profileService } from '../src/services/profileService';

export default function LoginScreen() {
  // Estados para controlar o formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hook do contexto de autenticação
  const { login } = useAuth();

  // Função para validar o formulário
  const validateForm = (): boolean => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu email');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, digite um email válido');
      return false;
    }

    if (!senha.trim()) {
      Alert.alert('Erro', 'Por favor, digite sua senha');
      return false;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  // Função principal de login
  const handleLogin = async () => {
    // Valida o formulário primeiro
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Chama o serviço de login
      console.log('🚀 Iniciando login com:', { email, senha: '***' });
      const response = await authService.login({ email, senha });
      console.log('✅ Login bem-sucedido, resposta:', response);

      // Busca o perfil completo do usuário para obter o nome correto
      try {
        console.log('👤 Buscando perfil completo do usuário...');
        const profile = await profileService.getProfile();
        console.log('✅ Perfil obtido:', profile);
        
        // Atualiza os dados do usuário com o nome correto do perfil
        const updatedUser = {
          ...response.user,
          nome: profile.name || response.user.nome,
          telefone: profile.phone || response.user.telefone,
        };
        
        // Salva os dados atualizados no contexto
        console.log('💾 Salvando dados atualizados no contexto...', updatedUser);
        await login(response.token, updatedUser);
      } catch (profileError) {
        console.log('⚠️ Erro ao buscar perfil, usando dados do login:', profileError);
        // Se falhar ao buscar o perfil, usa os dados do login mesmo
        await login(response.token, response.user);
      }

      console.log('✅ Dados salvos no contexto');

      // Redireciona para a tela principal (vamos criar depois)
      console.log('🔄 Redirecionando para /(tabs)...');
      router.replace('/(tabs)');
      console.log('✅ Redirecionamento executado');
      
    } catch (error: any) {
      // Trata diferentes tipos de erro
      let errorMessage = 'Erro ao fazer login. Tente novamente.';

      if (error.response?.status === 401) {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuário não encontrado';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }

      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>VeTech</Text>
          <Text style={styles.subtitle}>Cuidando do seu pet com tecnologia</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Links auxiliares */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => Alert.alert('Info', 'Funcionalidade em desenvolvimento')}>
            <Text style={styles.linkText}>Esqueci minha senha</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => Alert.alert('Info', 'Funcionalidade em desenvolvimento')}>
            <Text style={styles.linkText}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.gray,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: 16,
  },
  linkText: {
    color: colors.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});