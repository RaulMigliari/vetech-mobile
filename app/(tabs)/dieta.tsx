import { colors } from '@/src/constants/colors';
import { CreateDietData, Diet, dietService } from '@/src/services/dietService';
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

export default function DietaScreen() {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<CreateDietData>({
    animal_id: '',
    peso_atual: 0,
    peso_ideal: 0,
    idade: 0,
    atividade_fisica: 'moderada',
    preferencias_alimentares: '',
    restricoes_medicas: '',
    objetivo: 'manutenção',
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

      if (formData.peso_atual <= 0 || formData.peso_ideal <= 0 || formData.idade <= 0) {
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
      peso_atual: 0,
      peso_ideal: 0,
      idade: 0,
      atividade_fisica: 'moderada',
      preferencias_alimentares: '',
      restricoes_medicas: '',
      objetivo: 'manutenção',
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
      <Text style={styles.dietInfo}>Refeições/dia: {item.refeicoes_por_dia}</Text>
      <Text style={styles.dietInfo}>Calorias/dia: {item.calorias_totais_dia}</Text>
      
      {item.observacoes && (
        <Text style={styles.dietNotes}>{item.observacoes}</Text>
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
                        onPress={() => setFormData(prev => ({ ...prev, animal_id: pet.id }))}
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

                {/* Peso Atual */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Peso Atual (kg) *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.peso_atual.toString()}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, peso_atual: parseFloat(text) || 0 }))}
                    placeholder="Ex: 25.5"
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.gray}
                  />
                </View>

                {/* Peso Ideal */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Peso Ideal (kg) *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.peso_ideal.toString()}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, peso_ideal: parseFloat(text) || 0 }))}
                    placeholder="Ex: 20.0"
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.gray}
                  />
                </View>

                {/* Idade */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Idade (anos) *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.idade.toString()}
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
                          formData.atividade_fisica === option.key && styles.optionButtonSelected
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, atividade_fisica: option.key as any }))}
                      >
                        <Text style={[
                          styles.optionButtonText,
                          formData.atividade_fisica === option.key && styles.optionButtonTextSelected
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
                      { key: 'manutenção', label: 'Manutenção' },
                      { key: 'especial', label: 'Especial' }
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

                {/* Preferências Alimentares */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Preferências Alimentares</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.preferencias_alimentares}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, preferencias_alimentares: text }))}
                    placeholder="Ex: Gosta de frango, não gosta de vegetais verdes..."
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={colors.gray}
                  />
                </View>

                {/* Restrições Médicas */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Restrições Médicas</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.restricoes_medicas}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, restricoes_medicas: text }))}
                    placeholder="Ex: Alergia a grãos, problemas renais..."
                    multiline
                    numberOfLines={3}
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