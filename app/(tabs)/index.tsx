import { colors } from '@/src/constants/colors';
import { useAuth } from '@/src/contexts/AuthContext';
import { consultationService } from '@/src/services/consultationService';
import { petService } from '@/src/services/petService';
import { profileService } from '@/src/services/profileService';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface DashboardData {
  totalPets: number;
  nextConsultation: string | null;
  lastVisit: string | null;
}

export default function HomeScreen() {
  const { user, logout, login } = useAuth();
  const [userName, setUserName] = useState(user?.nome || 'Usuário');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalPets: 0,
    nextConsultation: null,
    lastVisit: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = React.useCallback(async () => {
    try {
      console.log('👤 INDEX: Carregando perfil do usuário...');
      const profile = await profileService.getProfile();
      console.log('✅ INDEX: Perfil carregado:', profile);
      
      if (profile.name && profile.name !== 'Usuário') {
        setUserName(profile.name);
        
        // Atualiza também o contexto se necessário
        if (user && profile.name !== user.nome) {
          console.log('🔄 INDEX: Atualizando nome no contexto...');
          const updatedUser = { ...user, nome: profile.name };
          // Não precisa do token pois já está logado
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
            await login(token, updatedUser);
          }
        }
      }
    } catch (error) {
      console.error('❌ INDEX: Erro ao carregar perfil:', error);
      // Mantém o nome do contexto se falhar
      setUserName(user?.nome || 'Usuário');
    }
  }, [user, login]);

  const loadDashboardData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Busca pets
      const pets = await petService.getPets();
      
      // Busca consultas
      const consultations = await consultationService.getConsultations();
      
      // Processa próxima consulta (consultas futuras)
      const now = new Date();
      const futureConsultations = consultations
        .filter(c => new Date(c.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Processa última visita (consultas passadas)
      const pastConsultations = consultations
        .filter(c => new Date(c.date) <= now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setDashboardData({
        totalPets: pets.length,
        nextConsultation: futureConsultations.length > 0 
          ? formatDate(futureConsultations[0].date)
          : null,
        lastVisit: pastConsultations.length > 0 
          ? formatDate(pastConsultations[0].date)
          : null,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboardData();
    loadUserProfile();
  }, [loadDashboardData, loadUserProfile]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleLogout = () => {
    console.log('🔘 INDEX: Botão de logout foi clicado!');
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            console.log('🚪 INDEX: Usuário confirmou logout, iniciando...');
            await logout();
            console.log('✅ INDEX: Logout concluído, forçando navegação...');
            router.replace('/login');
          }
        },
      ]
    );
  };

  const quickActions = [
    {
      title: 'Agendar Consulta',
      subtitle: 'Marque uma consulta para seu pet',
      action: () => router.push('/(tabs)/agendamento'),
      icon: '📅',
      color: colors.primary,
    },
    {
      title: 'Ver Consultas',
      subtitle: 'Consultas agendadas',
      action: () => router.push('/(tabs)/consultas'),
      icon: '🏥',
      color: colors.secondary,
    },
    {
      title: 'Meus Pets',
      subtitle: 'Gerencie seus animais',
      action: () => router.push('/(tabs)/pets'),
      icon: '🐾',
      color: colors.primary,
    },
    {
      title: 'Dieta com IA',
      subtitle: 'Sugestões personalizadas',
      action: () => router.push('/(tabs)/dieta'),
      icon: '🤖',
      color: colors.secondary,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header de boas-vindas */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {userName}! 👋</Text>
          <Text style={styles.subtitle}>
            Bem-vindo de volta ao VeTech
          </Text>
        </View>

        {/* Cards de ações rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.action}
              >
                <View style={styles.actionContent}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resumo de informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Carregando dados...</Text>
            </View>
          ) : (
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryIcon}>🐕</Text>
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryLabel}>Pets cadastrados</Text>
                  <Text style={styles.summaryValue}>
                    {dashboardData.totalPets > 0 ? dashboardData.totalPets : 'Nenhum'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryIcon}>📅</Text>
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryLabel}>Próxima consulta</Text>
                  <Text style={styles.summaryValue}>
                    {dashboardData.nextConsultation || 'Nenhuma agendada'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryIcon}>🏥</Text>
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryLabel}>Última visita</Text>
                  <Text style={styles.summaryValue}>
                    {dashboardData.lastVisit || 'Nenhum registro'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Botão de logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.gray,
  },
  loadingContainer: {
    backgroundColor: colors.white,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray,
  },
  summaryCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  summaryIcon: {
    fontSize: 24,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 8,
  },
  summaryText: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: colors.error,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
