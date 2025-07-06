import { useState, useCallback } from 'react';
import { validateTurkishPhoneNumber } from '../utils/calendarUtils';

export const useFormValidation = () => {
  const [formErrors, setFormErrors] = useState({
    appointmentType: false,
    selectedService: false,
    participantNames: [],
    participantPhones: []
  });

  const [phoneErrors, setPhoneErrors] = useState([]);

  // Telefon numarası validasyonu
  const validatePhone = useCallback((index, value) => {
    const newPhoneErrors = [...phoneErrors];
    
    if (value && !validateTurkishPhoneNumber(value)) {
      newPhoneErrors[index] = "Telefon 0 ile başlamalı ve 05XX XXX XX XX formatında olmalıdır";
    } else {
      newPhoneErrors[index] = "";
    }
    
    setPhoneErrors(newPhoneErrors);
    return !newPhoneErrors[index];
  }, [phoneErrors]);

  // Form validasyonu
  const validateForm = useCallback((formData) => {
    const { appointmentType, selectedService, participantNames, participantPhones, filteredServices } = formData;
    
    let isValid = true;
    const errors = {
      appointmentType: false,
      selectedService: false,
      participantNames: Array(participantNames.length).fill(false),
      participantPhones: Array(participantPhones.length).fill(false)
    };

    // Randevu tipi kontrolü
    if (!appointmentType) {
      errors.appointmentType = true;
      isValid = false;
    }

    // Hizmet seçimi kontrolü
    if (appointmentType && filteredServices.length > 0 && !selectedService) {
      errors.selectedService = true;
      isValid = false;
    }

    // Katılımcı isim kontrolü
    participantNames.forEach((name, index) => {
      if (!name || name.trim() === '') {
        errors.participantNames[index] = true;
        isValid = false;
      }
    });

    // Telefon numarası kontrolü
    participantPhones.forEach((phone, index) => {
      if (!phone || !validateTurkishPhoneNumber(phone)) {
        errors.participantPhones[index] = true;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  }, []);

  // Specific field error clearing
  const clearError = useCallback((fieldName, index = null) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      
      if (index !== null && Array.isArray(newErrors[fieldName])) {
        newErrors[fieldName][index] = false;
      } else {
        newErrors[fieldName] = false;
      }
      
      return newErrors;
    });
  }, []);

  // Reset all errors
  const resetErrors = useCallback(() => {
    setFormErrors({
      appointmentType: false,
      selectedService: false,
      participantNames: [],
      participantPhones: []
    });
    setPhoneErrors([]);
  }, []);

  // Initialize errors for participant count
  const initializeParticipantErrors = useCallback((count) => {
    setFormErrors(prev => ({
      ...prev,
      participantNames: Array(count).fill(false),
      participantPhones: Array(count).fill(false)
    }));
    setPhoneErrors(Array(count).fill(""));
  }, []);

  return {
    formErrors,
    phoneErrors,
    validateForm,
    validatePhone,
    clearError,
    resetErrors,
    initializeParticipantErrors,
    setPhoneErrors,
  };
}; 