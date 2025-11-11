import { colors } from '@/src/constants/colors';
import { healthService, HealthSummary } from '@/src/services/healthService';
import { Pet, petService } from '@/src/services/petService';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HistoricoScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [healthData, setHealthData] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPets = async () => {
    try {
      const petsData = await petService.getPets();
      setPets(petsData);
      if (petsData.length > 0 && !selectedPet) {
        setSelectedPet(petsData[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus pets');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthHistory = async (petId: string) => {
    try {
      setLoading(true);
      const history = await healthService.getHealthHistory(petId);
      setHealthData(history);
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
      
      // Fallback para erro 500
      if (error.response?.status === 500) {
        console.warn('Backend com problema. Mostrando dados básicos...');
        const pet = pets.find(p => p.id === petId);
        if (pet) {
          setHealthData({
            pet: pet,
            currentWeight: pet.weight || 0,
            activeDiets: [],
            recentEntries: [],
            weightHistory: []
          });
        }
      } else {
        Alert.alert('Erro', 'Não foi possível carregar o histórico de saúde');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPet) {
      loadHealthHistory(selectedPet.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPet]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPets();
    if (selectedPet) {
      await loadHealthHistory(selectedPet.id);
    }
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'consulta':
        return '🏥';
      case 'dieta':
        return '🍽️';
      case 'peso':
        return '⚖️';
      case 'observacao':
        return '📝';
      default:
        return '📋';
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'consulta':
        return colors.info;
      case 'dieta':
        return colors.success;
      case 'peso':
        return colors.warning;
      case 'observacao':
        return colors.gray;
      default:
        return colors.primary;
    }
  };

  if (loading && !healthData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  if (pets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>🐾</Text>
        <Text style={styles.emptyTitle}>Nenhum pet cadastrado</Text>
        <Text style={styles.emptyText}>Cadastre um pet para ver seu histórico de saúde</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* Seleção de Pet */}
      <View style={styles.petSelector}>
        <Text style={styles.sectionTitle}>Selecione o Pet</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petList}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={[
                styles.petCard,
                selectedPet?.id === pet.id && styles.petCardSelected
              ]}
              onPress={() => setSelectedPet(pet)}
            >
              <Text style={styles.petEmoji}>
                {pet.species === 'Cachorro' ? '🐕' : pet.species === 'Gato' ? '🐈' : '🐾'}
              </Text>
              <Text style={[
                styles.petName,
                selectedPet?.id === pet.id && styles.petNameSelected
              ]}>
                {pet.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {healthData && (
        <>
          {/* Resumo do Pet */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Informações Gerais</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Espécie</Text>
                <Text style={styles.summaryValue}>{healthData.pet.species}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Raça</Text>
                <Text style={styles.summaryValue}>{healthData.pet.breed}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Idade</Text>
                <Text style={styles.summaryValue}>{healthData.pet.age} anos</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Peso Atual</Text>
                <Text style={styles.summaryValue}>{healthData.currentWeight} kg</Text>
              </View>
            </View>
          </View>

          {/* Histórico Médico */}
          {healthData.pet.medical_history && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Histórico Médico</Text>
              <View style={styles.historyCard}>
                <Text style={styles.historyIcon}>📋</Text>
                <Text style={styles.historyText}>{healthData.pet.medical_history}</Text>
              </View>
            </View>
          )}

          {/* Dietas Ativas */}
          {healthData.activeDiets.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dietas Ativas</Text>
              {healthData.activeDiets.map((diet) => (
                <View key={diet.id} style={styles.dietCard}>
                  <View style={styles.dietHeader}>
                    <Text style={styles.dietIcon}>🍽️</Text>
                    <View style={styles.dietInfo}>
                      <Text style={styles.dietName}>{diet.nome}</Text>
                      <Text style={styles.dietDetails}>
                        {diet.calorias_totais_dia} cal/dia • {diet.refeicoes_por_dia} refeições
                      </Text>
                    </View>
                  </View>
                  <View style={styles.dietDates}>
                    <Text style={styles.dietDate}>Início: {formatDate(diet.data_inicio)}</Text>
                    <Text style={styles.dietDate}>Fim: {formatDate(diet.data_fim)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Timeline de Eventos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histórico de Eventos</Text>
            {healthData.recentEntries.length > 0 ? (
              <View style={styles.timeline}>
                {healthData.recentEntries.map((entry, index) => (
                  <View key={entry.id} style={styles.timelineItem}>
                    <View style={styles.timelineMarker}>
                      <View 
                        style={[
                          styles.timelineDot,
                          { backgroundColor: getEntryColor(entry.type) }
                        ]}
                      />
                      {index < healthData.recentEntries.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineCard}>
                        <View style={styles.timelineHeader}>
                          <Text style={styles.timelineIcon}>{getEntryIcon(entry.type)}</Text>
                          <View style={styles.timelineHeaderText}>
                            <Text style={styles.timelineTitle}>{entry.title}</Text>
                            <Text style={styles.timelineDate}>{formatDate(entry.date)}</Text>
                          </View>
                        </View>
                        <Text style={styles.timelineDescription}>{entry.description}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyTimeline}>
                <Text style={styles.emptyTimelineIcon}>📋</Text>
                <Text style={styles.emptyTimelineText}>
                  Nenhum evento registrado ainda
                </Text>
              </View>
            )}
          </View>

          {/* Gráfico de Peso (Simulado) */}
          {healthData.weightHistory.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Evolução de Peso</Text>
              <View style={styles.weightCard}>
                <Text style={styles.weightIcon}>⚖️</Text>
                <Text style={styles.weightTitle}>Últimos {healthData.weightHistory.length} registros</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weightList}>
                  {healthData.weightHistory.map((entry, index) => (
                    <View key={index} style={styles.weightItem}>
                      <Text style={styles.weightValue}>{entry.weight} kg</Text>
                      <Text style={styles.weightDate}>
                        {new Date(entry.date).toLocaleDateString('pt-BR', { month: 'short' })}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.gray,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
  petSelector: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  petList: {
    marginTop: 12,
  },
  petCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petCardSelected: {
    backgroundColor: colors.primaryOverlay,
    borderColor: colors.primary,
  },
  petEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  petNameSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  summaryCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
  },
  dietCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dietHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dietIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dietInfo: {
    flex: 1,
  },
  dietName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  dietDetails: {
    fontSize: 14,
    color: colors.gray,
  },
  dietDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dietDate: {
    fontSize: 12,
    color: colors.gray,
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  timelineHeaderText: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: colors.gray,
  },
  timelineDescription: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
  },
  emptyTimeline: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  emptyTimelineIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTimelineText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
  weightCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weightIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  weightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  weightList: {
    flexDirection: 'row',
  },
  weightItem: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  weightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  weightDate: {
    fontSize: 12,
    color: colors.gray,
  },
});
