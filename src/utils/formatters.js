// Formats de date
export const dateFormatters = {
    // Format court : 01/01/2024
    shortDate: (date) => {
      return new Date(date).toLocaleDateString('fr-FR');
    },
  
    // Format long : 1 janvier 2024
    longDate: (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },
  
    // Format avec heure : 01/01/2024 14:30
    dateTime: (date) => {
      return new Date(date).toLocaleString('fr-FR');
    },
  
    // Format relatif : il y a 2 heures, hier, etc.
    relativeTime: (date) => {
      const now = new Date();
      const diff = now - new Date(date);
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
  
      if (days > 7) {
        return dateFormatters.shortDate(date);
      } else if (days > 1) {
        return `il y a ${days} jours`;
      } else if (days === 1) {
        return 'hier';
      } else if (hours > 0) {
        return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
      } else if (minutes > 0) {
        return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
      } else {
        return 'à l\'instant';
      }
    }
  };
  
  // Formats de nombres
  export const numberFormatters = {
    // Format monétaire : 1 234,56 €
    currency: (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    },
  
    // Format décimal : 1 234,56
    decimal: (number, decimals = 2) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(number);
    },
  
    // Format pourcentage : 12,34%
    percentage: (number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'percent',
        minimumFractionDigits: 2
      }).format(number / 100);
    },
  
    // Format taille fichier : 1.23 MB
    fileSize: (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }
  };
  
  // Formats de texte
  export const textFormatters = {
    // Capitaliser la première lettre
    capitalize: (text) => {
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
  
    // Tronquer le texte avec ellipsis
    truncate: (text, length = 50) => {
      if (!text) return '';
      if (text.length <= length) return text;
      return text.slice(0, length) + '...';
    },
  
    // Formatter un nom complet
    fullName: (firstName, lastName) => {
      return `${textFormatters.capitalize(firstName)} ${lastName.toUpperCase()}`;
    },
  
    // Formatter un numéro de téléphone
    phoneNumber: (number) => {
      if (!number) return '';
      // Format: +33 6 12 34 56 78
      const cleaned = ('' + number).replace(/\D/g, '');
      const match = cleaned.match(/^(?:(?:\+|00)33|0)([1-9])(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        const intlCode = match[0].startsWith('0') ? '+33 ' : '';
        return `${intlCode}${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
      }
      return number;
    }
  };
  
  // Formatters spécifiques à l'application
  export const appFormatters = {
    // Status de présence
    attendanceStatus: (status) => {
      const statusMap = {
        present: 'Présent',
        absent: 'Absent',
        late: 'En retard',
        excused: 'Excusé'
      };
      return statusMap[status] || status;
    },
  
    // Type de document
    documentType: (type) => {
      const typeMap = {
        course: 'Cours',
        exercise: 'Exercice',
        exam: 'Examen',
        other: 'Autre'
      };
      return typeMap[type] || type;
    },
  
    // Rôle utilisateur
    userRole: (role) => {
      const roleMap = {
        admin: 'Administrateur',
        professor: 'Professeur',
        student: 'Étudiant',
        parent: 'Parent'
      };
      return roleMap[role] || role;
    }
  };
  
  export default {
    date: dateFormatters,
    number: numberFormatters,
    text: textFormatters,
    app: appFormatters
  };