import { colors } from '@/src/constants/colors';
import { consultationService, CreateAppointmentData } from '@/src/services/consultationService';
import { Pet, petService } from '@/src/services/petService';
import React, { useEffect, useState } from 'react';
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

export default function AgendamentoScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    service_type: '',
    description: '',
    notes: ''
  });

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const petsData = await petService.getPets();
      setPets(petsData);
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus pets');
    }
  };

  const loadAvailableTimeSlots = async (date: string) => {
    try {
      setLoadingTimeSlots(true);
      console.log(`🔄 Carregando horários para nova data: ${date}`);
      
      const slots = await consultationService.getAvailableTimeSlots(date);
      console.log(`📊 Slots disponíveis recebidos para ${date}:`, slots);
      
      setAvailableTimeSlots(slots);
      
      // Se o horário selecionado não está mais disponível, limpa a seleção
      if (formData.start_time && !slots.includes(formData.start_time)) {
        console.log(`⚠️ Horário ${formData.start_time} não está disponível para ${date}, limpando seleção`);
        setFormData(prev => ({ ...prev, start_time: '' }));
        Alert.alert(
          'Horário Indisponível',
          'O horário selecionado não está mais disponível. Por favor, escolha outro.'
        );
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      // Em caso de erro, permite todos os horários
      setAvailableTimeSlots(timeSlots);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  useEffect(() => {
    // Quando uma data for selecionada, busca os horários disponíveis
    if (formData.date) {
      console.log(`📅 Data selecionada mudou para: ${formData.date}`);
      // Limpa os horários disponíveis antes de buscar novos
      setAvailableTimeSlots([]);
      // Limpa o horário selecionado ao mudar de data
      if (formData.start_time) {
        setFormData(prev => ({ ...prev, start_time: '' }));
      }
      loadAvailableTimeSlots(formData.date);
    } else {
      console.log(`🔄 Nenhuma data selecionada, limpando horários`);
      setAvailableTimeSlots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date]);

  const serviceTypes = [
    'Consulta Geral',
    'Vacinação',
    'Exame de Rotina',
    'Emergência',
    'Cirurgia',
    'Dermatologia',
    'Cardiologia',
    'Oftalmologia',
    'Odontologia'
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const getNextBusinessDays = (days: number) => {
    const dates = [];
    const today = new Date();
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + 1); // Começar amanhã

    while (dates.length < days) {
      const dayOfWeek = currentDate.getDay();
      // Pular fins de semana (0 = domingo, 6 = sábado)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const availableDates = getNextBusinessDays(10);

  const handleSchedule = async () => {
    if (!selectedPet) {
      Alert.alert('Erro', 'Selecione um pet');
      return;
    }

    if (!formData.date || !formData.start_time || !formData.service_type) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const appointmentData: CreateAppointmentData = {
        animal_id: selectedPet.id,
        date: formData.date,
        start_time: formData.start_time,
        service_type: formData.service_type,
        description: formData.description,
        notes: formData.notes
      };

      await consultationService.createAppointment(appointmentData);
      
      Alert.alert(
        'Sucesso!',
        'Consulta agendada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpar formulário
              setFormData({
                date: '',
                start_time: '',
                service_type: '',
                description: '',
                notes: ''
              });
              setSelectedPet(null);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      Alert.alert('Erro', 'Não foi possível agendar a consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Agendar Nova Consulta</Text>
        <Text style={styles.subtitle}>Preencha os dados para agendar uma consulta para seu pet</Text>

        {/* Seleção do Pet */}
        <View style={styles.section}>
          <Text style={styles.label}>Pet *</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowPetModal(true)}
          >
            <Text style={[styles.selectorText, !selectedPet && styles.placeholder]}>
              {selectedPet ? selectedPet.name : 'Selecione um pet'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seleção da Data */}
        <View style={styles.section}>
          <Text style={styles.label}>Data *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {availableDates.map((date, index) => {
              const dateString = date.toISOString().split('T')[0];
              const isSelected = formData.date === dateString;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                  onPress={() => setFormData({ ...formData, date: dateString })}
                >
                  <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
                    {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>
                    {date.getDate()}
                  </Text>
                  <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>
                    {date.toLocaleDateString('pt-BR', { month: 'short' })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Seleção do Horário */}
        <View style={styles.section}>
          <Text style={styles.label}>Horário *</Text>
          {!formData.date ? (
            <Text style={styles.infoText}>Selecione uma data primeiro</Text>
          ) : loadingTimeSlots ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Verificando disponibilidade...</Text>
            </View>
          ) : (
            <View style={styles.timeGrid}>
              {timeSlots.map((time) => {
                const isSelected = formData.start_time === time;
                // Verifica se o horário está disponível (se não está na lista, considera disponível como fallback)
                const isAvailable = availableTimeSlots.length > 0 ? availableTimeSlots.includes(time) : true;
                
                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      isSelected && styles.timeSlotSelected,
                      !isAvailable && styles.timeSlotUnavailable
                    ]}
                    onPress={() => {
                      if (isAvailable) {
                        console.log(`⏰ Horário selecionado: ${time} para data ${formData.date}`);
                        setFormData({ ...formData, start_time: time });
                      } else {
                        Alert.alert('Horário Indisponível', 'Este horário já está ocupado. Por favor, escolha outro.');
                      }
                    }}
                    disabled={!isAvailable}
                  >
                    <Text style={[
                      styles.timeText,
                      isSelected && styles.timeTextSelected,
                      !isAvailable && styles.timeTextUnavailable
                    ]}>
                      {time}
                    </Text>
                    {!isAvailable && (
                      <Text style={styles.unavailableLabel}>Ocupado</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Tipo de Serviço */}
        <View style={styles.section}>
          <Text style={styles.label}>Tipo de Consulta *</Text>
          <View style={styles.serviceGrid}>
            {serviceTypes.map((service) => {
              const isSelected = formData.service_type === service;
              return (
                <TouchableOpacity
                  key={service}
                  style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                  onPress={() => setFormData({ ...formData, service_type: service })}
                >
                  <Text style={[styles.serviceText, isSelected && styles.serviceTextSelected]}>
                    {service}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Descreva o motivo da consulta..."
            multiline
            numberOfLines={3}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />
        </View>

        {/* Observações */}
        <View style={styles.section}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Observações adicionais..."
            multiline
            numberOfLines={2}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
          />
        </View>

        {/* Botão de Agendar */}
        <TouchableOpacity
          style={[styles.scheduleButton, loading && styles.buttonDisabled]}
          onPress={handleSchedule}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.scheduleButtonText}>Agendar Consulta</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de Seleção de Pet */}
      <Modal
        visible={showPetModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione um Pet</Text>
              <TouchableOpacity onPress={() => setShowPetModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.petItem}
                  onPress={() => {
                    setSelectedPet(pet);
                    setShowPetModal(false);
                  }}
                >
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petInfo}>{pet.species} • {pet.breed}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  selector: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.white,
  },
  selectorText: {
    fontSize: 16,
    color: colors.black,
  },
  placeholder: {
    color: colors.gray,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  dateCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  dateCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateDay: {
    fontSize: 12,
    color: colors.gray,
    textTransform: 'uppercase',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: 12,
    color: colors.gray,
    textTransform: 'uppercase',
  },
  dateTextSelected: {
    color: colors.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    width: '30%',
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotUnavailable: {
    backgroundColor: colors.lightGray,
    borderColor: colors.gray,
    opacity: 0.5,
  },
  timeText: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
  },
  timeTextSelected: {
    color: colors.white,
  },
  timeTextUnavailable: {
    color: colors.gray,
    textDecorationLine: 'line-through',
  },
  unavailableLabel: {
    fontSize: 10,
    color: colors.error,
    marginTop: 4,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
  },
  serviceCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  serviceText: {
    fontSize: 14,
    color: colors.black,
    textAlign: 'center',
    fontWeight: '500',
  },
  serviceTextSelected: {
    color: colors.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.white,
    textAlignVertical: 'top',
    fontSize: 16,
    minHeight: 80,
  },
  scheduleButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  scheduleButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
  modalClose: {
    fontSize: 24,
    color: colors.gray,
    fontWeight: 'bold',
  },
  modalList: {
    maxHeight: 300,
  },
  petItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  petInfo: {
    fontSize: 14,
    color: colors.gray,
  },
});