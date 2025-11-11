import AddPetModal from '@/src/components/AddPetModal';
import { colors } from '@/src/constants/colors';
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

export default function PetsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  // Carregar pets quando a tela é montada
  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      console.log('🐕 Carregando pets...');
      const petsData = await petService.getPets();
      console.log('✅ Pets carregados:', petsData);
      setPets(petsData);
    } catch (error) {
      console.error('❌ Erro ao carregar pets:', error);
      Alert.alert(
        'Erro', 
        'Não foi possível carregar seus pets. Verifique sua conexão.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPets();
    setIsRefreshing(false);
  };

  const handleAddPet = () => {
    setEditingPet(null);
    setIsModalVisible(true);
  };

  const handlePetPress = (pet: Pet) => {
    Alert.alert(
      pet.name,
      `Espécie: ${pet.species}\nRaça: ${pet.breed || 'Não informada'}\nIdade: ${pet.age ? `${pet.age} anos` : 'Não informada'}\nPeso: ${pet.weight ? `${pet.weight}kg` : 'Não informado'}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', onPress: () => handleEditPet(pet) },
        { text: 'Excluir', style: 'destructive', onPress: () => handleDeletePet(pet) },
      ]
    );
  };

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setIsModalVisible(true);
  };

  const handleDeletePet = (pet: Pet) => {
    Alert.alert(
      'Excluir Pet',
      `Tem certeza que deseja excluir ${pet.name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await petService.deletePet(pet.id);
              Alert.alert('Sucesso', `${pet.name} foi excluído com sucesso.`);
              await loadPets(); // Recarrega a lista
            } catch (error) {
              console.error('Erro ao excluir pet:', error);
              Alert.alert('Erro', 'Não foi possível excluir o pet.');
            }
          },
        },
      ]
    );
  };

  const renderPetCard = (pet: Pet) => {
    const getSpeciesIcon = (species: string) => {
      const lower = species.toLowerCase();
      if (lower.includes('cach') || lower.includes('dog')) return '🐕';
      if (lower.includes('gat') || lower.includes('cat')) return '🐱';
      if (lower.includes('pass') || lower.includes('bird')) return '🐦';
      if (lower.includes('peix') || lower.includes('fish')) return '🐠';
      return '🐾';
    };

    return (
      <TouchableOpacity
        key={pet.id}
        style={styles.petCard}
        onPress={() => handlePetPress(pet)}
      >
        <View style={styles.petHeader}>
          <Text style={styles.petIcon}>{getSpeciesIcon(pet.species)}</Text>
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petSpecies}>{pet.species}</Text>
          </View>
          <View style={styles.petDetails}>
            {pet.age && (
              <Text style={styles.petDetailText}>{pet.age} anos</Text>
            )}
            {pet.weight && (
              <Text style={styles.petDetailText}>{pet.weight}kg</Text>
            )}
          </View>
        </View>
        
        {pet.breed && (
          <Text style={styles.petBreed}>Raça: {pet.breed}</Text>
        )}
        
        {pet.medical_history && (
          <Text style={styles.petHistory} numberOfLines={2}>
            {pet.medical_history}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🐕</Text>
      <Text style={styles.emptyTitle}>Nenhum pet cadastrado</Text>
      <Text style={styles.emptyText}>
        Adicione seus pets para acompanhar a saúde deles.
      </Text>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={handleAddPet}
      >
        <Text style={styles.actionButtonText}>Adicionar Pet</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando seus pets...</Text>
        </View>
      );
    }

    if (pets.length === 0) {
      return renderEmptyState();
    }

    return (
      <View style={styles.petsContainer}>
        <View style={styles.header}>
          <Text style={styles.petsCount}>
            {pets.length} {pets.length === 1 ? 'pet cadastrado' : 'pets cadastrados'}
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPet}
          >
            <Text style={styles.addButtonText}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>
        
        {pets.map(renderPetCard)}
      </View>
    );
  };

  return (
    <>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.content}>
          {renderContent()}
        </View>
      </ScrollView>

      <AddPetModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          loadPets(); // Recarrega a lista
        }}
        editingPet={editingPet}
      />
    </>
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.gray,
  },
  petsContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  petsCount: {
    fontSize: 16,
    color: colors.gray,
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
  petCard: {
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
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  petIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 2,
  },
  petSpecies: {
    fontSize: 14,
    color: colors.gray,
  },
  petDetails: {
    alignItems: 'flex-end',
  },
  petDetailText: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 4,
  },
  petHistory: {
    fontSize: 14,
    color: colors.gray,
    fontStyle: 'italic',
  },
  emptyState: {
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