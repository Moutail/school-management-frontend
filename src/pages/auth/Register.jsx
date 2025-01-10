// Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phoneNumber: '',
    username: '',
    class: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName) newErrors.lastName = 'Le nom est requis';
    if (!formData.email) newErrors.email = 'L\'email est requis';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    if (formData.password.length < 8) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Validation spécifique pour les étudiants
    if (formData.role === 'student') {
        if (!formData.class || formData.class === '') {
            newErrors.class = 'La classe est requise pour les étudiants';
        }
    }

    // Génération du username pour validation
    const username = formData.email ? formData.email.split('@')[0].toLowerCase() : '';
    if (!username) {
        newErrors.email = 'L\'email est requis pour générer le nom d\'utilisateur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Construction du username à partir de l'email
    const username = formData.email.split('@')[0].toLowerCase();
    
    // Construction de l'objet data avec tous les champs nécessaires
    const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        username: username, // Ajout explicite du username
        class: formData.role === 'student' ? formData.class : null // Pour les non-étudiants, envoyer null
    };

    console.log('Données envoyées:', dataToSend);

    setIsLoading(true);
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(dataToSend)
        });

        const data = await response.json();
        console.log('Réponse complète:', data);

        if (!response.ok) {
            if (data.errors) {
                // Création d'un objet d'erreurs à partir du tableau
                const errorMessages = {};
                data.errors.forEach(error => {
                    errorMessages[error.field] = error.message || error;
                });
                setErrors(errorMessages);
                throw new Error(Object.values(errorMessages).join(', '));
            }
            throw new Error(data.message || 'L\'inscription a échoué');
        }

        navigate('/login', {
            state: { message: 'Inscription réussie. Vous pouvez maintenant vous connecter.' }
        });
    } catch (error) {
        console.error('Erreur complète:', error);
        setErrors(prev => ({
            ...prev,
            submit: error.message
        }));
    } finally {
        setIsLoading(false);
    }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="bg-white p-3 rounded-full inline-block shadow-md mb-4">
            <img 
              src="/api/placeholder/48/48"
              alt="Ecolenuage Logo"
              className="h-12 w-12"
            />
          </div>
          <h1 className="text-3xl font-bold text-blue-800">Ecolenuage</h1>
          <p className="text-gray-600 mt-2">Créez votre compte pour accéder à votre espace éducatif</p>
        </div>
   
        <Card className="shadow-xl border-2 border-blue-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 py-6">
            <CardTitle className="text-center text-white text-2xl">
              Inscription
            </CardTitle>
          </CardHeader>
   
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grille Nom/Prénom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Prénom
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 ${
                        errors.firstName ? 'border-red-300' : 'border-blue-100'
                      } rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                      transition-all duration-200`}
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
   
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Nom
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 ${
                        errors.lastName ? 'border-red-300' : 'border-blue-100'
                      } rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                      transition-all duration-200`}
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
   
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Email académique
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${
                      errors.email ? 'border-red-300' : 'border-blue-100'
                    } rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                    transition-all duration-200`}
                    placeholder="prenom.nom@ecolenuage.fr"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
   
              {/* Rôle */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Je suis
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl
                           focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                           transition-all duration-200 bg-white"
                >
                  <option value="student">👨‍🎓 Étudiant</option>
                  <option value="professor">👨‍🏫 Professeur</option>
                  <option value="parent">👨‍👧 Parent</option>
                </select>
              </div>
   
              {/* Classe (pour les étudiants) */}
              {formData.role === 'student' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Classe
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 ${
                      errors.class ? 'border-red-300' : 'border-blue-100'
                    } rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                    transition-all duration-200 bg-white`}
                  >
                    <option value="">Sélectionnez votre classe</option>
                    <option value="6e">📚 6e</option>
                    <option value="5e">📚 5e</option>
                    <option value="4e">📚 4e</option>
                    <option value="3e">📚 3e</option>
                  </select>
                  {errors.class && (
                    <p className="text-red-500 text-xs mt-1">{errors.class}</p>
                  )}
                </div>
              )}
   
              {/* Téléphone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Téléphone
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl
                             focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                             transition-all duration-200"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
   
              {/* Mots de passe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-blue-500" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 ${
                        errors.password ? 'border-red-300' : 'border-blue-100'
                      } rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                      transition-all duration-200`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
   
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-blue-500" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-blue-100'
                      } rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                      transition-all duration-200`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
   
              {/* Message d'erreur général */}
              {errors.submit && (
                <Alert type="error" className="mt-4">
                  {errors.submit}
                </Alert>
              )}
   
              {/* Bouton d'inscription */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl
                         transform hover:scale-[1.02] transition-all duration-200
                         font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Inscription en cours...
                  </div>
                ) : (
                  "Créer mon compte"
                )}
              </Button>
   
              {/* Lien de connexion */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Déjà inscrit ?{' '}
                <a 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline
                           transition-colors duration-200"
                >
                  Se connecter
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
   
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          © 2024 Ecolenuage - Tous droits réservés
        </div>
      </div>
    </div>
   );
};

export default Register;