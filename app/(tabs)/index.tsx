import { colors } from '@/src/constants/colors';
import { useAuth } from '@/src/contexts/AuthContext';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await logout();
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
      action: () => Alert.alert('Info', 'Funcionalidade em desenvolvimento'),
      color: colors.primary,
    },
    {
      title: 'Ver Consultas',
      subtitle: 'Consultas agendadas',
      action: () => Alert.alert('Info', 'Use a aba Consultas para ver suas consultas'),
      color: colors.secondary,
    },
    {
      title: 'Meus Pets',
      subtitle: 'Gerencie seus animais',
      action: () => Alert.alert('Info', 'Use a aba Pets para gerenciar seus animais'),
      color: colors.primary,
    },
    {
      title: 'Dieta com IA',
      subtitle: 'Sugestões personalizadas',
      action: () => Alert.alert('Info', 'Use a aba Dieta IA para análises personalizadas'),
      color: colors.secondary,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header de boas-vindas */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {user?.nome || 'Usuário'}! 👋</Text>
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
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resumo de informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              🐕 Pets cadastrados: --
            </Text>
            <Text style={styles.summaryText}>
              📅 Próxima consulta: --
            </Text>
            <Text style={styles.summaryText}>
              🏥 Última visita: --
            </Text>
          </View>
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
