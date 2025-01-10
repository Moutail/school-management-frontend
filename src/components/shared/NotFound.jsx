// src/components/shared/NotFound.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getHomeRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'student':
        return '/student';
      case 'professor':
        return '/professor';
      case 'parent':
        return '/student/parent';
      case 'major':
        return '/major';
      default:
        return '/login';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">Page non trouvée</h2>
        <p className="text-gray-500 mt-2 mb-6">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <button
          onClick={() => navigate(getHomeRoute())}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default NotFound;