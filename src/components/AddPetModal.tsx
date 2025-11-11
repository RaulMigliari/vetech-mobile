import { colors } from '@/src/constants/colors';
import { CreatePetRequest, Pet, petService } from '@/src/services/petService';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface AddPetModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPet?: Pet | null;
}

export default function AddPetModal({ visible, onClose, onSuccess, editingPet }: AddPetModalProps) {
  const [formData, setFormData] = useState({
    name: editingPet?.name || '',
    species: editingPet?.species || '',
    breed: editingPet?.breed || '',
    age: editingPet?.age?.toString() || '',
    weight: editingPet?.weight?.toString() || '',
    medical_history: editingPet?.medical_history || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      species: '',
      breed: '',
      age: '',
      weight: '',
      medical_history: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome do pet é obrigatório');
      return false;
    }

    if (!formData.species.trim()) {
      Alert.alert('Erro', 'Espécie do pet é obrigatória');
      return false;
    }

    if (formData.age && isNaN(Number(formData.age))) {
      Alert.alert('Erro', 'Idade deve ser um número válido');
      return false;
    }

    if (formData.weight && isNaN(Number(formData.weight))) {
      Alert.alert('Erro', 'Peso deve ser um número válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const petData: CreatePetRequest = {
        name: formData.name.trim(),
        species: formData.species.trim(),
        breed: formData.breed.trim() || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        medical_history: formData.medical_history.trim() || undefined,
      };

      if (editingPet) {
        // Atualizar pet existente
        await petService.updatePet(editingPet.id, petData);
        Alert.alert('Sucesso', `${petData.name} foi atualizado com sucesso!`);
      } else {
        // Criar novo pet
        await petService.createPet(petData);
        Alert.alert('Sucesso', `${petData.name} foi cadastrado com sucesso!`);
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar pet:', error);
      Alert.alert(
        'Erro',
        editingPet 
          ? 'Não foi possível atualizar o pet. Tente novamente.'
          : 'Não foi possível cadastrar o pet. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const speciesOptions = [
    'Cachorro',
    'Gato',
    'Pássaro',
    'Peixe',
    'Hamster',
    'Coelho',
    'Tartaruga',
    'Outro',
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingPet ? 'Editar Pet' : 'Adicionar Pet'}
          </Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.saveButton}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Pet *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Rex, Mimi, Bolt..."
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Espécie *</Text>
              <View style={styles.speciesContainer}>
                {speciesOptions.map((species) => (
                  <TouchableOpacity
                    key={species}
                    style={[
                      styles.speciesButton,
                      formData.species === species && styles.speciesButtonSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, species })}
                    disabled={isLoading}
                  >
                    <Text
                      style={[
                        styles.speciesButtonText,
                        formData.species === species && styles.speciesButtonTextSelected,
                      ]}
                    >
                      {species}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Raça</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Labrador, Persa, Canário..."
                value={formData.breed}
                onChangeText={(text) => setFormData({ ...formData, breed: text })}
                editable={!isLoading}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Idade (anos)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 3"
                  value={formData.age}
                  onChangeText={(text) => setFormData({ ...formData, age: text })}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 15.5"
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Histórico Médico</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descreva condições médicas, vacinas, cirurgias..."
                value={formData.medical_history}
                onChangeText={(text) => setFormData({ ...formData, medical_history: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isLoading}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.gray,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  saveButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
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
  textArea: {
    height: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  speciesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speciesButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  speciesButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  speciesButtonText: {
    fontSize: 14,
    color: colors.gray,
  },
  speciesButtonTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
});