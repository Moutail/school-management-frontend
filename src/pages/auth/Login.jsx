// Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
      email: '',
      password: '',
      rememberMe: false
    });
  
    const API_URL = import.meta.env.VITE_API_URL;

    const getRedirectPath = (role) => {
        switch (role) {
          case 'student':
            return '/student';  // Route index utilisée
          case 'professor':
            return '/professor';  // Route index utilisée
          case 'parent':
            return '/student/parent';  // Sous-route de student
          case 'major':
            return '/major';  // Route index utilisée
          default:
            return '/';
        }
      };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
      
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password
            })
          });
      
          const data = await response.json();
          console.log('Réponse du serveur:', data);
      
          if (!response.ok) {
            throw new Error(data.message || 'Identifiants invalides');
          }
      
          if (!data.data?.token || !data.data?.user) {
            throw new Error('Réponse du serveur invalide');
          }
      
          // Attendez explicitement que le login soit terminé
          await login(data.data.token, data.data.user);
          
          const redirectPath = getRedirectPath(data.data.user.role);
          console.log('Navigation vers:', redirectPath);
          
          // Ajoutez un délai pour voir si cela aide
          setTimeout(() => {
            navigate(redirectPath);
          }, 100);
      
        } catch (error) {
          console.error('Erreur complète:', error);
          setError(error.message || 'Erreur de connexion');
        } finally {
          setIsLoading(false);
        }
      };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="bg-white p-3 rounded-full inline-block shadow-md mb-4">
            <img 
              src="/api/placeholder/48/48"  // Remplacez par votre logo
              alt="Ecolenuage Logo"
              className="h-12 w-12"
            />
          </div>
          <h1 className="text-3xl font-bold text-blue-800">Ecolenuage</h1>
          <p className="text-gray-600 mt-2">Votre espace éducatif numérique</p>
        </div>
   
        <Card className="shadow-xl border-2 border-blue-100 overflow-hidden">
          {/* En-tête de la carte */}
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 py-6">
            <CardTitle className="text-center text-white text-2xl">
              Connexion à votre espace
            </CardTitle>
          </CardHeader>
   
          <CardContent className="p-8">
            {error && (
              <Alert 
                type="error" 
                message={error}
                className="mb-6"
              />
            )}
   
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-500" aria-hidden="true" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl
                             focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                             transition-all duration-200"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>
   
              {/* Mot de passe */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-500" aria-hidden="true" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl
                             focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                             transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>
   
              {/* Options de connexion */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-blue-200 rounded
                             transition-colors duration-200"
                  />
                  <label className="ml-2 text-sm text-gray-600">
                    Se souvenir de moi
                  </label>
                </div>
                <a 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline
                           transition-colors duration-200"
                >
                  Mot de passe oublié?
                </a>
              </div>
   
              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl
                         transform hover:scale-[1.02] transition-all duration-200
                         font-medium text-sm shadow-md hover:shadow-lg"
                loading={isLoading}
              >
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
   
              {/* Lien d'inscription */}
              <p className="text-center text-sm text-gray-600 pt-4">
                Pas encore de compte?{' '}
                <a 
                  href="/register" 
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline
                           transition-colors duration-200"
                >
                  S&apos;inscrire
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

export default Login;