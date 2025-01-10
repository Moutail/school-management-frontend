import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, BookOpen, Calendar, FileText,
  ChevronRight, Bell, Layers, ClipboardList,
  Book, CheckSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isCollapsed, setIsCollapsed, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getMenuItems = () => {
    // Menus spécifiques par rôle
    const roleSpecificItems = {
      student: [
        { 
          icon: Home, 
          label: 'Dashboard',
          path: '/student'
        },
        { 
          icon: BookOpen, 
          label: 'Cours',
          path: '/student/courses'
        },
        { 
          icon: Calendar, 
          label: 'Emploi du temps',
          path: '/student/schedule'
        },
        { 
          icon: ClipboardList, 
          label: 'Présences',
          path: '/student/attendance'
        },
        { 
          icon: FileText, 
          label: 'Documents',
          path: '/student/documents'
        }
      ],
      professor: [
        { 
          icon: Home, 
          label: 'Dashboard',
          path: '/professor'
        },
        { 
          icon: Book, 
          label: 'Gestion des cours',
          path: '/professor/courses'
        },
        { 
          icon: CheckSquare, 
          label: 'Gestion présences',
          path: '/professor/attendance'
        }
      ],
      major: [
        { 
          icon: Home, 
          label: 'Dashboard',
          path: '/major'
        },
        { 
          icon: Layers, 
          label: 'Gestion des classes',
          path: '/major/class-management'
        },
        { 
          icon: Bell, 
          label: 'Activités',
          path: '/major/activities'
        }
      ],
      parent: [
        { 
          icon: Home, 
          label: 'Dashboard',
          path: '/student/parent'
        }
      ]
    };

    return user?.role ? roleSpecificItems[user.role.toLowerCase()] || [] : [];
  };


  const menuItems = getMenuItems();
  const isActive = (path) => location.pathname === path;

  const SchoolLogo = ({ className }) => (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex items-center justify-center bg-white p-2 rounded-lg shadow-md">
        <svg
          viewBox="0 0 32 32"
          className="h-8 w-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base du livre */}
          <path
            d="M4 8C4 6.89543 4.89543 6 6 6H26C27.1046 6 28 6.89543 28 8V24C28 25.1046 27.1046 26 26 26H6C4.89543 26 4 25.1046 4 24V8Z"
            fill="#3B82F6" // blue-500
          />
          {/* Pages du livre */}
          <path
            d="M7 10C7 9.44772 7.44772 9 8 9H24C24.5523 9 25 9.44772 25 10V22C25 22.5523 24.5523 23 24 23H8C7.44772 23 7 22.5523 7 22V10Z"
            fill="white"
          />
          {/* Nuage */}
          <path
            d="M14 12C11.7909 12 10 13.7909 10 16C10 18.2091 11.7909 20 14 20H20C21.6569 20 23 18.6569 23 17C23 15.3431 21.6569 14 20 14C19.7348 14 19.4784 14.0403 19.2372 14.1164C18.7352 12.8871 17.4829 12 16 12H14Z"
            fill="#60A5FA" // blue-400
          />
        </svg>
      </div>
    </div>
  );
  
  SchoolLogo.propTypes = {
    className: PropTypes.string
  }

  return (
    <>
      {/* Sidebar */}
      <div 
        className={`
          bg-blue-50 dark:bg-gray-800 min-h-screen transition-all duration-300 fixed
          ${isCollapsed ? 'w-20' : 'w-72'} left-0 top-0 z-30
          border-r-4 border-blue-200 dark:border-gray-700
          md:relative md:min-h-screen
          ${isCollapsed ? 'translate-x-0' : 'translate-x-0'}
          transform transition-transform duration-300 ease-in-out
        `}
      >
        {/* En-tête */}
        <div className="p-4 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-400">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <SchoolLogo />
            {!isCollapsed && (
                <span className="ml-3 font-bold text-xl text-white">
                Ecolenuage
                </span>
            )}
            </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-full bg-blue-500 hover:bg-blue-400 transition-colors"
            aria-label={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
          >
            <ChevronRight 
              className={`h-5 w-5 text-white transition-transform
                ${isCollapsed ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>

        {/* Menu Items avec style cahier d'école */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-5rem)]"
             style={{
               background: 'repeating-linear-gradient(transparent, transparent 27px, #e5e7eb 28px)',
               backgroundPosition: '0 10px',
               paddingTop: '10px'
             }}>
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center p-3 rounded-lg transition-all duration-200
                group relative border-2
                ${isActive(item.path) 
                  ? 'bg-white border-blue-300 text-blue-600 shadow-md transform scale-105' 
                  : 'bg-transparent border-transparent hover:bg-white hover:border-blue-200'}
              `}
              aria-label={item.label}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <item.icon 
                className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}
                  ${isActive(item.path) ? 'text-blue-600' : 'text-gray-600'}
                `} 
              />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              
              {/* Tooltip amélioré */}
              {isCollapsed && (
                <div className="
                  absolute left-full ml-3 px-3 py-2 bg-white text-gray-800
                  rounded-lg shadow-lg border-2 border-blue-200
                  opacity-0 group-hover:opacity-100 transition-opacity
                  pointer-events-none whitespace-nowrap z-50
                ">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="absolute bottom-0 w-full p-3 bg-blue-100 dark:bg-gray-700 text-center">
            <span className="text-sm text-blue-600 dark:text-blue-300">v1.0.0</span>
          </div>
        )}
      </div>

      {/* Main content wrapper pour éviter le chevauchement */}
      <main 
        className={`
          min-h-screen bg-gray-50
          ${isCollapsed ? 'ml-20' : 'ml-7'}
          transition-all duration-300 ease-in-out
        `}
      >
        {children}
      </main>
    </>
  );
};

Sidebar.propTypes = {
    isCollapsed: PropTypes.bool.isRequired,
    setIsCollapsed: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired
  };

export default Sidebar;