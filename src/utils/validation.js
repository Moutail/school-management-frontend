// Validations de base
export const isRequired = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'Ce champ est requis';
    }
    return null;
  };
  
  export const isEmail = (value) => {
    if (!value) return null;
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(value)) {
      return 'Email invalide';
    }
    return null;
  };
  
  // utils/validators.js

/**
 * Valide les numéros de téléphone pour la France, le Canada et le Togo
 * France: +33 X XX XX XX XX ou 0X XX XX XX XX
 * Canada: +1 XXX XXX XXXX
 * Togo: +228 XX XX XX XX
 */
export const isPhoneNumber = (value) => {
    if (!value) return null;
  
    // Supprime tous les espaces pour la validation
    const cleanNumber = value.replace(/\s+/g, '');
  
    const phoneRegexPatterns = {
      // France: +33XXXXXXXXX ou 0XXXXXXXXX
      fr: /^(?:\+33|0)[1-9]\d{8}$/,
      
      // Canada: +1XXXXXXXXXX
      ca: /^(?:\+?1)?[2-9]\d{9}$/,
      
      // Togo: +228XXXXXXXX
      tg: /^(?:\+228)[0-9]{8}$/
    };
  
    // Vérifie si le numéro correspond à l'un des formats
    const isValid = Object.values(phoneRegexPatterns).some(regex => 
      regex.test(cleanNumber)
    );
  
    if (!isValid) {
      return 'Numéro de téléphone invalide. Formats acceptés : \n' +
             '- France : +33 6 12 34 56 78 ou 06 12 34 56 78\n' +
             '- Canada : +1 234 567 8900\n' +
             '- Togo : +228 12 34 56 78';
    }
  
    return null;
  };
  
  /**
   * Formate le numéro de téléphone selon son format
   */
  export const formatPhoneNumber = (value) => {
    if (!value) return '';
  
    // Supprime tous les caractères non numériques sauf le +
    const cleanNumber = value.replace(/[^\d+]/g, '');
  
    // Détecte le pays en fonction du préfixe
    if (cleanNumber.startsWith('+33') || cleanNumber.startsWith('0')) {
      // Format français
      if (cleanNumber.startsWith('0')) {
        return cleanNumber.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
      }
      return cleanNumber.replace(/(\+33)(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '+33 $2 $3 $4 $5 $6');
    } 
    else if (cleanNumber.startsWith('+1')) {
      // Format canadien
      return cleanNumber.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '+1 $2 $3 $4');
    } 
    else if (cleanNumber.startsWith('+228')) {
      // Format togolais
      return cleanNumber.replace(/(\+228)(\d{2})(\d{2})(\d{2})(\d{2})/, '+228 $2 $3 $4 $5');
    }
  
    return cleanNumber;
  };
  
  /**
   * Normalise un numéro de téléphone pour le stockage
   */
  export const normalizePhoneNumber = (value) => {
    if (!value) return null;
    return value.replace(/\s+/g, '');
  };
  
  export const minLength = (min) => (value) => {
    if (!value) return null;
    if (value.length < min) {
      return `Minimum ${min} caractères requis`;
    }
    return null;
  };
  
  export const maxLength = (max) => (value) => {
    if (!value) return null;
    if (value.length > max) {
      return `Maximum ${max} caractères autorisés`;
    }
    return null;
  };
  
  // Validation des formulaires
  export const validateForm = (values, validations) => {
    const errors = {};
    
    Object.keys(validations).forEach(field => {
      const value = values[field];
      const fieldValidations = validations[field];
  
      fieldValidations.forEach(validation => {
        const error = validation(value);
        if (error) {
          errors[field] = error;
        }
      });
    });
  
    return errors;
  };
  
  // Schémas de validation pour différentes entités
  export const validationSchemas = {
    login: {
      email: [isRequired, isEmail],
      password: [isRequired, minLength(6)]
    },
  
    register: {
      firstName: [isRequired, minLength(2)],
      lastName: [isRequired, minLength(2)],
      email: [isRequired, isEmail],
      password: [isRequired, minLength(8)],
      phoneNumber: [isPhoneNumber]
    },
  
    course: {
      title: [isRequired, minLength(3)],
      code: [isRequired, (value) => {
        if (!value) return null;
        if (!/^[A-Z]{3}[0-9]{3}$/.test(value)) {
          return 'Format invalide (ex: MAT101)';
        }
        return null;
      }],
      description: [maxLength(500)]
    },
  
    document: {
      title: [isRequired, minLength(3)],
      type: [isRequired],
      file: [(file) => {
        if (!file) return 'Fichier requis';
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          return 'Le fichier est trop volumineux (max 10MB)';
        }
        return null;
      }]
    }
  };
  
  // Validation des dates
  export const dateValidations = {
    isValidDate: (date) => {
      return date instanceof Date && !isNaN(date);
    },
  
    isPastDate: (date) => {
      if (!date) return null;
      if (new Date(date) > new Date()) {
        return 'La date doit être dans le passé';
      }
      return null;
    },
  
    isFutureDate: (date) => {
      if (!date) return null;
      if (new Date(date) < new Date()) {
        return 'La date doit être dans le futur';
      }
      return null;
    },
  
    isDateBetween: (startDate, endDate) => {
      return (date) => {
        if (!date) return null;
        const checkDate = new Date(date);
        if (checkDate < new Date(startDate) || checkDate > new Date(endDate)) {
          return `La date doit être entre ${startDate} et ${endDate}`;
        }
        return null;
      };
    }
  };
  
  // Validations spécifiques pour l'application
  export const appValidations = {
    attendance: {
      validateAttendanceRecord: (record) => {
        const errors = {};
        
        if (!record.studentId) {
          errors.studentId = 'Étudiant requis';
        }
        
        if (!record.date) {
          errors.date = 'Date requise';
        } else if (new Date(record.date) > new Date()) {
          errors.date = 'La date ne peut pas être dans le futur';
        }
        
        if (!['present', 'absent', 'late'].includes(record.status)) {
          errors.status = 'Statut invalide';
        }
  
        return errors;
      }
    },
  
    schedule: {
      validateTimeSlot: (slot) => {
        const errors = {};
        
        if (!slot.startTime || !slot.endTime) {
          errors.time = 'Heures de début et de fin requises';
        } else if (slot.startTime >= slot.endTime) {
          errors.time = "L'heure de fin doit être après l'heure de début";
        }
        
        if (!slot.room) {
          errors.room = 'Salle requise';
        }
  
        return errors;
      }
    }
  };
  
  export default {
    isRequired,
    isEmail,
    isPhoneNumber,
    minLength,
    maxLength,
    validateForm,
    validationSchemas,
    dateValidations,
    appValidations
  };