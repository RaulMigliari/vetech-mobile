import { colors } from '@/src/constants/colors';
import {
    Estatisticas,
    gamificationService,
    ProgressoMeta,
    Recompensa,
    RecompensaResgatada,
} from '@/src/services/gamificationService';
import { Pet, petService } from '@/src/services/petService';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PetComEstatisticas {
  pet: Pet;
  estatisticas: Estatisticas | null;
}

export default function RecompensasScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [estatisticasGerais, setEstatisticasGerais] = useState<PetComEstatisticas[]>([]);
  const [pontuacaoTotal, setPontuacaoTotal] = useState({
    pontos_totais: 0,
    pontos_disponiveis: 0,
    pontos_periodo: 0,
  });
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);
  const [recompensasResgatadas, setRecompensasResgatadas] = useState<RecompensaResgatada[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalRecompensaVisible, setModalRecompensaVisible] = useState(false);
  const [recompensaSelecionada, setRecompensaSelecionada] = useState<Recompensa | null>(null);

  const loadPets = React.useCallback(async () => {
    try {
      const petsData = await petService.getPets();
      setPets(petsData);
      if (petsData.length > 0 && !selectedPet) {
        setSelectedPet(petsData[0]);
      }

      // Carregar estatísticas de todos os pets
      if (petsData.length > 0) {
        loadEstatisticasGerais(petsData);
      }
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
    }
  }, [selectedPet]);

  const loadEstatisticasGerais = async (petsData: Pet[]) => {
    try {
      console.log('📊 Carregando estatísticas gerais de todos os pets...');
      
      // Buscar estatísticas de todos os pets em paralelo
      const estatisticasPromises = petsData.map(async (pet) => {
        const stats = await gamificationService.getEstatisticas(pet.id, 'mensal');
        return { pet, estatisticas: stats };
      });

      const todasEstatisticas = await Promise.all(estatisticasPromises);
      setEstatisticasGerais(todasEstatisticas);

      // Calcular pontuação total
      const totais = todasEstatisticas.reduce(
        (acc, { estatisticas }) => ({
          pontos_totais: acc.pontos_totais + (estatisticas?.pontos_totais || 0),
          pontos_disponiveis: acc.pontos_disponiveis + (estatisticas?.pontos_disponiveis || 0),
          pontos_periodo: acc.pontos_periodo + (estatisticas?.pontos_periodo || 0),
        }),
        { pontos_totais: 0, pontos_disponiveis: 0, pontos_periodo: 0 }
      );

      setPontuacaoTotal(totais);
      console.log('✅ Pontuação total calculada:', totais);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas gerais:', error);
    }
  };

  const loadData = React.useCallback(async () => {
    if (!selectedPet) return;

    try {
      setIsLoading(true);
      const [stats, recomp, resgatadas] = await Promise.all([
        gamificationService.getEstatisticas(selectedPet.id, 'mensal'),
        gamificationService.getRecompensas(),
        gamificationService.getRecompensasResgatadas(selectedPet.id, 'ativo'),
      ]);

      setEstatisticas(stats);
      setRecompensas(recomp);
      setRecompensasResgatadas(resgatadas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados de gamificação.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPet]);

  React.useEffect(() => {
    loadPets();
  }, [loadPets]);

  React.useEffect(() => {
    if (selectedPet) {
      loadData();
    }
  }, [selectedPet, loadData]);

  const handleResgatarRecompensa = async () => {
    if (!selectedPet || !recompensaSelecionada) return;

    try {
      setIsLoading(true);
      await gamificationService.resgatarRecompensa(
        selectedPet.id,
        recompensaSelecionada.id
      );

      Alert.alert(
        'Sucesso! 🎉',
        `Recompensa "${recompensaSelecionada.nome}" resgatada com sucesso! Confira o código na seção "Minhas Recompensas".`
      );

      setModalRecompensaVisible(false);
      setRecompensaSelecionada(null);
      loadData(); // Recarregar dados
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.detail || 'Não foi possível resgatar a recompensa. Verifique se você tem pontos suficientes.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderPetSelector = () => (
    <View style={styles.petSelectorContainer}>
      <Text style={styles.petSelectorLabel}>Selecione o Pet:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            style={[
              styles.petOption,
              selectedPet?.id === pet.id && styles.petOptionSelected,
            ]}
            onPress={() => setSelectedPet(pet)}
          >
            <Text
              style={[
                styles.petOptionText,
                selectedPet?.id === pet.id && styles.petOptionTextSelected,
              ]}
            >
              {pet.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPontuacaoGeralCard = () => (
    <View style={styles.pontuacaoGeralCard}>
      <View style={styles.pontuacaoGeralHeader}>
        <Text style={styles.pontuacaoGeralIcon}>🏆</Text>
        <View style={styles.pontuacaoGeralInfo}>
          <Text style={styles.pontuacaoGeralLabel}>Pontuação Total Geral</Text>
          <Text style={styles.pontuacaoGeralValor}>
            {pontuacaoTotal.pontos_totais}
          </Text>
          <Text style={styles.pontuacaoGeralSubtitulo}>
            {pets.length} {pets.length === 1 ? 'pet' : 'pets'}
          </Text>
        </View>
      </View>

      <View style={styles.pontuacaoGeralStats}>
        <View style={styles.pontuacaoGeralStat}>
          <Text style={styles.pontuacaoGeralStatLabel}>💰 Disponíveis</Text>
          <Text style={styles.pontuacaoGeralStatValor}>
            {pontuacaoTotal.pontos_disponiveis}
          </Text>
        </View>
        <View style={styles.pontuacaoGeralStat}>
          <Text style={styles.pontuacaoGeralStatLabel}>📅 Este Mês</Text>
          <Text style={styles.pontuacaoGeralStatValor}>
            {pontuacaoTotal.pontos_periodo}
          </Text>
        </View>
      </View>

      {/* Lista de pontos por pet */}
      {estatisticasGerais.length > 0 && (
        <View style={styles.pontosPorPetContainer}>
          <Text style={styles.pontosPorPetTitulo}>Pontos por Pet:</Text>
          {estatisticasGerais.map(({ pet, estatisticas }) => (
            <View key={pet.id} style={styles.pontosPorPetItem}>
              <Text style={styles.pontosPorPetNome}>
                {pet.name}
              </Text>
              <Text style={styles.pontosPorPetValor}>
                {estatisticas?.pontos_totais || 0} pts
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderPontuacaoCard = () => (
    <View style={styles.pontuacaoCard}>
      <View style={styles.pontuacaoHeader}>
        <Text style={styles.pontuacaoIcon}>🐾</Text>
        <View style={styles.pontuacaoInfo}>
          <Text style={styles.pontuacaoLabel}>
            Pontos de {selectedPet?.name}
          </Text>
          <Text style={styles.pontuacaoValor}>
            {estatisticas?.pontos_disponiveis || 0}
          </Text>
        </View>
      </View>
      <View style={styles.pontuacaoStats}>
        <View style={styles.pontuacaoStat}>
          <Text style={styles.pontuacaoStatLabel}>Total Acumulado</Text>
          <Text style={styles.pontuacaoStatValor}>
            {estatisticas?.pontos_totais || 0}
          </Text>
        </View>
        <View style={styles.pontuacaoStat}>
          <Text style={styles.pontuacaoStatLabel}>Este Mês</Text>
          <Text style={styles.pontuacaoStatValor}>
            {estatisticas?.pontos_periodo || 0}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderMetaCard = ({ item }: { item: ProgressoMeta }) => (
    <View style={styles.metaCard}>
      <View style={styles.metaHeader}>
        <Text style={styles.metaDescricao}>{item.descricao}</Text>
        <Text style={styles.metaPercentual}>{item.percentual}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBarFill, { width: `${item.percentual}%` }]}
        />
      </View>
      <Text style={styles.metaProgresso}>
        {item.progresso_atual} / {item.meta_total}
      </Text>
    </View>
  );

  const renderRecompensaCard = ({ item }: { item: Recompensa }) => {
    const podeResgatar =
      (estatisticas?.pontos_disponiveis || 0) >= item.pontos_necessarios;

    return (
      <TouchableOpacity
        style={[styles.recompensaCard, !podeResgatar && styles.recompensaCardDisabled]}
        onPress={() => {
          if (podeResgatar) {
            setRecompensaSelecionada(item);
            setModalRecompensaVisible(true);
          }
        }}
        disabled={!podeResgatar}
      >
        <View style={styles.recompensaIconContainer}>
          <Text style={styles.recompensaIcon}>🎁</Text>
        </View>
        <View style={styles.recompensaInfo}>
          <Text style={styles.recompensaNome}>{item.nome}</Text>
          <Text style={styles.recompensaDescricao}>{item.descricao}</Text>
          <View style={styles.recompensaPontosContainer}>
            <Text style={styles.recompensaPontos}>
              {item.pontos_necessarios} pontos
            </Text>
            {!podeResgatar && (
              <Text style={styles.recompensaIndisponivel}>
                Pontos insuficientes
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecompensaResgatadaCard = ({ item }: { item: RecompensaResgatada }) => (
    <View style={styles.resgatadaCard}>
      <View style={styles.resgatadaHeader}>
        <Text style={styles.resgatadaNome}>{item.recompensa_nome || 'Recompensa'}</Text>
        <View style={[styles.resgatadaStatusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.resgatadaStatusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.resgatadaCodigoContainer}>
        <Text style={styles.resgatadaCodigoLabel}>Código:</Text>
        <Text style={styles.resgatadaCodigo}>{item.codigo_verificacao}</Text>
      </View>
      {item.data_expiracao && (
        <Text style={styles.resgatadaExpiracao}>
          Válido até: {new Date(item.data_expiracao).toLocaleDateString('pt-BR')}
        </Text>
      )}
      {item.observacoes && (
        <Text style={styles.resgatadaObservacoes}>{item.observacoes}</Text>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return colors.primary;
      case 'usado':
        return colors.success;
      case 'expirado':
        return colors.gray;
      default:
        return colors.gray;
    }
  };

  if (!selectedPet) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Adicione um pet para começar a acumular pontos! 🐾
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Pontuação Geral (todos os pets) */}
        {pets.length > 0 && renderPontuacaoGeralCard()}

        {renderPetSelector()}

        {isLoading && !estatisticas ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Carregando recompensas...</Text>
          </View>
        ) : (
          <>
            {renderPontuacaoCard()}

            {/* Metas em Progresso */}
            {estatisticas && estatisticas.progresso_metas.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Suas Metas</Text>
                <FlatList
                  data={estatisticas.progresso_metas}
                  renderItem={renderMetaCard}
                  keyExtractor={(item) => item.meta_id}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Recompensas Disponíveis */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎁 Recompensas Disponíveis</Text>
              {recompensas.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhuma recompensa disponível no momento.
                </Text>
              ) : (
                <FlatList
                  data={recompensas}
                  renderItem={renderRecompensaCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </View>

            {/* Recompensas Resgatadas */}
            {recompensasResgatadas.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎫 Minhas Recompensas</Text>
                <FlatList
                  data={recompensasResgatadas}
                  renderItem={renderRecompensaResgatadaCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal de Confirmação de Resgate */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalRecompensaVisible}
        onRequestClose={() => setModalRecompensaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Resgatar Recompensa?</Text>
            {recompensaSelecionada && (
              <>
                <Text style={styles.modalRecompensaNome}>
                  {recompensaSelecionada.nome}
                </Text>
                <Text style={styles.modalRecompensaDescricao}>
                  {recompensaSelecionada.descricao}
                </Text>
                <View style={styles.modalPontosInfo}>
                  <Text style={styles.modalPontosLabel}>Custo:</Text>
                  <Text style={styles.modalPontosValor}>
                    {recompensaSelecionada.pontos_necessarios} pontos
                  </Text>
                </View>
                <View style={styles.modalPontosInfo}>
                  <Text style={styles.modalPontosLabel}>Saldo após resgate:</Text>
                  <Text style={styles.modalPontosValor}>
                    {(estatisticas?.pontos_disponiveis || 0) -
                      recompensaSelecionada.pontos_necessarios}{' '}
                    pontos
                  </Text>
                </View>
              </>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalRecompensaVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleResgatarRecompensa}
                disabled={isLoading}
              >
                <Text style={styles.modalConfirmButtonText}>
                  {isLoading ? 'Resgatando...' : 'Confirmar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 12,
  },
  // Pet Selector
  petSelectorContainer: {
    marginBottom: 20,
  },
  petSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 8,
  },
  petOption: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  petOptionSelected: {
    backgroundColor: colors.primary,
  },
  petOptionText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
  },
  petOptionTextSelected: {
    color: colors.white,
  },
  // Pontuação Geral Card
  pontuacaoGeralCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  pontuacaoGeralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pontuacaoGeralIcon: {
    fontSize: 56,
    marginRight: 16,
  },
  pontuacaoGeralInfo: {
    flex: 1,
  },
  pontuacaoGeralLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 4,
    fontWeight: '600',
  },
  pontuacaoGeralValor: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.white,
  },
  pontuacaoGeralSubtitulo: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  pontuacaoGeralStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
  },
  pontuacaoGeralStat: {
    alignItems: 'center',
  },
  pontuacaoGeralStatLabel: {
    fontSize: 13,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 6,
    fontWeight: '500',
  },
  pontuacaoGeralStatValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  pontosPorPetContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
  },
  pontosPorPetTitulo: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.9,
  },
  pontosPorPetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  pontosPorPetNome: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  pontosPorPetValor: {
    fontSize: 14,
    color: colors.white,
    fontWeight: 'bold',
  },
  // Pontuação Card
  pontuacaoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pontuacaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pontuacaoIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  pontuacaoInfo: {
    flex: 1,
  },
  pontuacaoLabel: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  pontuacaoValor: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  pontuacaoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  pontuacaoStat: {
    alignItems: 'center',
  },
  pontuacaoStatLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  pontuacaoStatValor: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.darkGray,
  },
  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 12,
  },
  // Meta Card
  metaCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaDescricao: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
  },
  metaPercentual: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  metaProgresso: {
    fontSize: 12,
    color: colors.gray,
  },
  // Recompensa Card
  recompensaCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recompensaCardDisabled: {
    opacity: 0.6,
  },
  recompensaIconContainer: {
    justifyContent: 'center',
    marginRight: 16,
  },
  recompensaIcon: {
    fontSize: 40,
  },
  recompensaInfo: {
    flex: 1,
  },
  recompensaNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 4,
  },
  recompensaDescricao: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 8,
  },
  recompensaPontosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recompensaPontos: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  recompensaIndisponivel: {
    fontSize: 12,
    color: colors.error,
  },
  // Recompensa Resgatada Card
  resgatadaCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resgatadaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resgatadaNome: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  resgatadaStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resgatadaStatusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  resgatadaCodigoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resgatadaCodigoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    marginRight: 8,
  },
  resgatadaCodigo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
  },
  resgatadaExpiracao: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  resgatadaObservacoes: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalRecompensaNome: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalRecompensaDescricao: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalPontosInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalPontosLabel: {
    fontSize: 14,
    color: colors.gray,
  },
  modalPontosValor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
  },
  modalConfirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
