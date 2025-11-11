import { colors } from '@/src/constants/colors';
import { Consultation, consultationService } from '@/src/services/consultationService';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ConsultasScreen() {
  const [consultas, setConsultas] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Carrega as consultas quando a tela é aberta
  useEffect(() => {
    loadConsultas();
  }, []);

  const loadConsultas = async () => {
    try {
      console.log('📅 Carregando consultas...');
      const consultasData = await consultationService.getConsultations();
      setConsultas(consultasData);
      console.log('✅ Consultas carregadas:', consultasData.length);
    } catch (error) {
      console.error('❌ Erro ao carregar consultas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as consultas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadConsultas();
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string | null | undefined) => {
    // Verifica se o horário existe e não é null/undefined
    if (!timeString) {
      return '--:--';
    }
    // Assume que o horário vem no formato "HH:MM:SS" ou "HH:MM"
    return timeString.substring(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return colors.primary;
      case 'completed':
        return colors.secondary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const renderConsultaItem = ({ item }: { item: Consultation }) => (
    <TouchableOpacity
      style={styles.consultaCard}
      onPress={() => {
        Alert.alert(
          'Detalhes da Consulta',
          `Data: ${formatDate(item.date)}\nHorário: ${formatTime(item.start_time)} - ${formatTime(item.end_time)}\nStatus: ${getStatusText(item.status)}\nDescrição: ${item.description || 'Consulta veterinária'}\n${item.notes ? `Observações: ${item.notes}` : ''}`
        );
      }}
    >
      <View style={styles.consultaHeader}>
        <Text style={styles.consultaDate}>{formatDate(item.date)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.consultaTime}>
        {formatTime(item.start_time)} - {formatTime(item.end_time)}
      </Text>
      
      {item.description && (
        <Text style={styles.consultaType}>{item.description}</Text>
      )}
      
      {item.veterinarian && (
        <Text style={styles.consultaVet}>Dr(a). {item.veterinarian}</Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando consultas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Consultas</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => Alert.alert('Info', 'Funcionalidade de agendamento em desenvolvimento')}
        >
          <Text style={styles.addButtonText}>+ Agendar</Text>
        </TouchableOpacity>
      </View>

      {consultas.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Nenhuma consulta agendada</Text>
            <Text style={styles.emptyText}>
              Você ainda não tem consultas marcadas.
            </Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Info', 'Funcionalidade de agendamento em desenvolvimento')}
            >
              <Text style={styles.actionButtonText}>Agendar Primeira Consulta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={consultas}
          keyExtractor={(item) => item.id}
          renderItem={renderConsultaItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  consultaCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  consultaDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  consultaTime: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  consultaType: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  consultaVet: {
    fontSize: 14,
    color: colors.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});