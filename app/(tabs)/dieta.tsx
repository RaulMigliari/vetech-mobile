import { colors } from '@/src/constants/colors';
import { Diet, dietService } from '@/src/services/dietService';
import { Pet, petService } from '@/src/services/petService';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Interface local para o formulário
interface DietFormData {
  animal_id: string;
  petName: string;
  peso: number;
  idade: number;
  atividade: 'baixa' | 'moderada' | 'alta';
  objetivo: 'emagrecimento' | 'ganho_peso' | 'manutenção';
  tipo_alimentacao: 'ração' | 'caseira' | 'mista';
  observacoes: string;
}

export default function DietaScreen() {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<DietFormData>({
    animal_id: '',
    petName: '',
    peso: 0,
    idade: 0,
    atividade: 'moderada',
    objetivo: 'manutenção',
    tipo_alimentacao: 'ração',
    observacoes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [dietsData, petsData] = await Promise.all([
        dietService.getDiets(),
        petService.getPets(),
      ]);
      setDiets(dietsData);
      setPets(petsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDiet = async () => {
    try {
      if (!formData.animal_id) {
        Alert.alert('Atenção', 'Por favor, selecione um pet.');
        return;
      }

      if (formData.peso <= 0 || formData.idade <= 0) {
        Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      setIsLoading(true);
      await dietService.createDietWithAI(formData);
      
      Alert.alert('Sucesso', 'Dieta criada com sucesso!');
      setModalVisible(false);
      resetForm();
      loadData(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao criar dieta:', error);
      Alert.alert('Erro', 'Não foi possível criar a dieta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      animal_id: '',
      petName: '',
      peso: 0,
      idade: 0,
      atividade: 'moderada',
      objetivo: 'manutenção',
      tipo_alimentacao: 'ração',
      observacoes: '',
    });
  };

  const renderDietCard = ({ item }: { item: Diet }) => (
    <View style={styles.dietCard}>
      <View style={styles.dietHeader}>
        <Text style={styles.dietName}>{item.nome}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.dietObjective}>Objetivo: {item.objetivo}</Text>
      <Text style={styles.dietInfo}>Tipo: {item.tipo}</Text>
      
      {/* Informações de Alimentação */}
      {(item.alimento || item.alimento_id) && (
        <View style={styles.foodSection}>
          <Text style={styles.foodTitle}>🍖 Informações de Alimentação</Text>
          
          {item.alimento ? (
            <>
              <Text style={styles.foodName}>{item.alimento.nome}</Text>
              {item.alimento.tipo && (
                <Text style={styles.foodDetail}>Tipo: {item.alimento.tipo}</Text>
              )}
              {item.alimento.marca && (
                <Text style={styles.foodDetail}>Marca: {item.alimento.marca}</Text>
              )}
              {item.quantidade_gramas && (
                <Text style={styles.foodDetail}>Quantidade: {item.quantidade_gramas}g por refeição</Text>
              )}
              {item.horario && (
                <Text style={styles.foodDetail}>Horário(s): {item.horario}</Text>
              )}
              {item.alimento.calorias_por_100g && (
                <Text style={styles.foodDetail}>
                  {item.alimento.calorias_por_100g} kcal/100g
                </Text>
              )}
              {item.alimento.proteinas && (
                <Text style={styles.foodDetail}>Proteínas: {item.alimento.proteinas}g/100g</Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.foodDetail}>Alimento ID: {item.alimento_id}</Text>
              {item.quantidade_gramas && (
                <Text style={styles.foodDetail}>Quantidade: {item.quantidade_gramas}g por refeição</Text>
              )}
              {item.horario && (
                <Text style={styles.foodDetail}>Horário(s): {item.horario}</Text>
              )}
            </>
          )}
        </View>
      )}
      
      <Text style={styles.dietInfo}>Refeições/dia: {item.refeicoes_por_dia}</Text>
      <Text style={styles.dietInfo}>Calorias/dia: {item.calorias_totais_dia} kcal</Text>
      
      {item.data_inicio && item.data_fim && (
        <View style={styles.periodSection}>
          <Text style={styles.periodText}>
            📅 {new Date(item.data_inicio).toLocaleDateString('pt-BR')} até {new Date(item.data_fim).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      )}
      
      {item.observacoes && (
        <Text style={styles.dietNotes}>💡 {item.observacoes}</Text>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return colors.primary;
      case 'pausada': return colors.warning;
      case 'finalizada': return colors.gray;
      default: return colors.gray;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Dieta com IA</Text>
        
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            Nossa inteligência artificial analisa as características do seu pet 
            e sugere a dieta ideal para ele.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🤖</Text>
          <Text style={styles.featureTitle}>IA Veterinária</Text>
          <Text style={styles.featureText}>
            Sugestões personalizadas baseadas na idade, peso, raça e atividade do seu pet.
          </Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setModalVisible(true)}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>
              {isLoading ? 'Carregando...' : 'Criar Nova Dieta'}
            </Text>
          </TouchableOpacity>
        </View>

        {diets.length > 0 && (
          <View style={styles.dietsSection}>
            <Text style={styles.sectionTitle}>Suas Dietas</Text>
            <FlatList
              data={diets}
              renderItem={renderDietCard}
              keyExtractor={(item) => item.id || Math.random().toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {isLoading && diets.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Carregando dietas...</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal para criar nova dieta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nova Dieta com IA</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {/* Seleção de Pet */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Pet *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {pets.map((pet) => (
                      <TouchableOpacity
                        key={pet.id}
                        style={[
                          styles.petOption,
                          formData.animal_id === pet.id && styles.petOptionSelected
                        ]}
                        onPress={() => setFormData(prev => ({ 
                          ...prev, 
                          animal_id: pet.id,
                          petName: pet.name || 'Pet sem nome'
                        }))}
                      >
                        <Text style={[
                          styles.petOptionText,
                          formData.animal_id === pet.id && styles.petOptionTextSelected
                        ]}>
                          {pet.name || 'Pet sem nome'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Peso */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Peso (kg) *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.peso > 0 ? formData.peso.toString() : ''}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, peso: parseFloat(text) || 0 }))}
                    placeholder="Ex: 25.5"
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.gray}
                  />
                </View>

                {/* Idade */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Idade (anos) *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.idade > 0 ? formData.idade.toString() : ''}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, idade: parseInt(text) || 0 }))}
                    placeholder="Ex: 5"
                    keyboardType="number-pad"
                    placeholderTextColor={colors.gray}
                  />
                </View>

                {/* Atividade Física */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nível de Atividade</Text>
                  <View style={styles.optionsRow}>
                    {[
                      { key: 'baixa', label: 'Baixa' },
                      { key: 'moderada', label: 'Moderada' },
                      { key: 'alta', label: 'Alta' }
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.key}
                        style={[
                          styles.optionButton,
                          formData.atividade === option.key && styles.optionButtonSelected
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, atividade: option.key as any }))}
                      >
                        <Text style={[
                          styles.optionButtonText,
                          formData.atividade === option.key && styles.optionButtonTextSelected
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Objetivo */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Objetivo</Text>
                  <View style={styles.optionsRow}>
                    {[
                      { key: 'emagrecimento', label: 'Emagrecimento' },
                      { key: 'ganho_peso', label: 'Ganho de Peso' },
                      { key: 'manutenção', label: 'Manutenção' }
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.key}
                        style={[
                          styles.optionButton,
                          formData.objetivo === option.key && styles.optionButtonSelected
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, objetivo: option.key as any }))}
                      >
                        <Text style={[
                          styles.optionButtonText,
                          formData.objetivo === option.key && styles.optionButtonTextSelected
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Tipo de Alimentação */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tipo de Alimentação</Text>
                  <View style={styles.optionsRow}>
                    {[
                      { key: 'ração', label: 'Ração' },
                      { key: 'caseira', label: 'Caseira' },
                      { key: 'mista', label: 'Mista' }
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.key}
                        style={[
                          styles.optionButton,
                          formData.tipo_alimentacao === option.key && styles.optionButtonSelected
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, tipo_alimentacao: option.key as any }))}
                      >
                        <Text style={[
                          styles.optionButtonText,
                          formData.tipo_alimentacao === option.key && styles.optionButtonTextSelected
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Observações */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Observações</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.observacoes}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, observacoes: text }))}
                    placeholder="Ex: Preferências alimentares, restrições médicas, alergias..."
                    multiline
                    numberOfLines={4}
                    placeholderTextColor={colors.gray}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.createButton, isLoading && styles.createButtonDisabled]}
                  onPress={handleCreateDiet}
                  disabled={isLoading}
                >
                  <Text style={styles.createButtonText}>
                    {isLoading ? 'Criando...' : 'Criar Dieta'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 20,
  },
  description: {
    backgroundColor: colors.primaryOverlay,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featureCard: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Novos estilos para dietas
  dietsSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 16,
  },
  dietCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dietHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dietName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dietObjective: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  dietInfo: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  dietNotes: {
    fontSize: 14,
    color: colors.darkGray,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  foodSection: {
    backgroundColor: colors.primaryOverlay,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  foodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 4,
  },
  foodDetail: {
    fontSize: 13,
    color: colors.gray,
    marginBottom: 2,
  },
  periodSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  periodText: {
    fontSize: 13,
    color: colors.gray,
    fontStyle: 'italic',
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
  // Estilos do modal
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
    width: '95%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  modalCloseButton: {
    fontSize: 24,
    color: colors.gray,
    fontWeight: '300',
  },
  modalBody: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.darkGray,
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: colors.white,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
  },
  createButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  createButtonDisabled: {
    backgroundColor: colors.gray,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});