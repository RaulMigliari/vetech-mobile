import { colors } from '@/src/constants/colors';
import { useAuth } from '@/src/contexts/AuthContext';
import { ClientProfile, profileService, UpdateProfileData } from '@/src/services/profileService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.gray,
  },
  optionsSection: {
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: colors.gray,
  },
  optionArrow: {
    fontSize: 24,
    color: colors.gray,
    fontWeight: '300',
  },
  logoutButton: {
    backgroundColor: colors.error,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
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
    width: '90%',
    maxWidth: 400,
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
    marginBottom: 16,
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
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    tutor_name: '',
    phone: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      console.log('👤 Carregando perfil do cliente...');
      
      try {
        const profileData = await profileService.getProfile();
        setProfile(profileData);
        
        setEditForm({
          tutor_name: profileData.name || user?.nome || '',
          phone: profileData.phone || user?.telefone || ''
        });
        
        console.log('✅ Perfil carregado:', profileData);
      } catch {
        console.log('⚠️ Erro na API, usando dados do contexto de auth');
        // Fallback: usar dados do contexto de autenticação
        const fallbackProfile: ClientProfile = {
          id: user?.id || 'temp-id',
          name: user?.nome || 'Usuário', 
          email: user?.email || 'email@exemplo.com',
          phone: user?.telefone || ''
        };
        
        setProfile(fallbackProfile);
        setEditForm({
          tutor_name: fallbackProfile.name,
          phone: fallbackProfile.phone
        });
        
        console.log('✅ Usando dados do contexto:', fallbackProfile);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      const updateData: UpdateProfileData = {};
      
      if (editForm.tutor_name && editForm.tutor_name !== profile?.name) {
        updateData.tutor_name = editForm.tutor_name;
      }
      if (editForm.phone && editForm.phone !== profile?.phone) {
        updateData.phone = editForm.phone;
      }

      if (Object.keys(updateData).length === 0) {
        Alert.alert('Aviso', 'Nenhuma alteração foi detectada.');
        setEditModalVisible(false);
        return;
      }

      console.log('💾 Salvando alterações:', updateData);
      const updatedProfile = await profileService.updateProfile(updateData);
      
      setProfile(updatedProfile);
      setEditModalVisible(false);
      
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      console.log('✅ Perfil atualizado');
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = () => {
    if (profile) {
      setEditForm({
        tutor_name: profile.name || '',
        phone: profile.phone || ''
      });
      setEditModalVisible(true);
    }
  };

  const handleLogout = () => {
    console.log('🔘 PERFIL: Botão de logout foi clicado!');
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            console.log('🚪 PERFIL: Usuário confirmou logout, iniciando...');
            await logout();
            console.log('✅ PERFIL: Logout concluído, forçando navegação...');
            router.replace('/login');
          }
        },
      ]
    );
  };

  const profileOptions = [
    {
      title: 'Editar Perfil',
      subtitle: 'Alterar dados pessoais',
      action: openEditModal,
    },
    {
      title: 'Notificações',
      subtitle: 'Configurar alertas',
      action: () => Alert.alert('Info', 'Funcionalidade em desenvolvimento'),
    },
    {
      title: 'Histórico',
      subtitle: 'Ver histórico completo',
      action: () => Alert.alert('Info', 'Funcionalidade em desenvolvimento'),
    },
    {
      title: 'Suporte',
      subtitle: 'Ajuda e contato',
      action: () => Alert.alert('Info', 'Funcionalidade em desenvolvimento'),
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile?.name || user?.nome)?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{profile?.name || user?.nome || 'Usuário'}</Text>
            <Text style={styles.userEmail}>{profile?.email || user?.email || 'email@exemplo.com'}</Text>
          </View>

          <View style={styles.optionsSection}>
            {profileOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionCard}
                onPress={option.action}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.tutor_name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, tutor_name: text }))}
                  placeholder="Seu nome completo"
                  placeholderTextColor={colors.gray}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor={colors.gray}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}