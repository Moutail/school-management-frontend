import React from 'react';
import PropTypes from 'prop-types';
import { Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { uiActions, selectors } from '../../store/store';

const Header = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const theme = useSelector(selectors.ui.getTheme);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const toggleTheme = () => {
    dispatch(uiActions.toggleTheme());
    document.documentElement.classList.toggle('dark');
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 lg:px-6 flex justify-between items-center max-w-[1920px] mx-auto">
        {/* Menu et recherche */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="hidden md:flex items-center relative">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2.5 w-72 rounded-full border border-gray-200 dark:border-gray-600 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-gray-100 text-sm
                         transition-all duration-300 ease-in-out
                         placeholder-gray-400 dark:placeholder-gray-500"
                aria-label="Search"
              />
            </div>
          </div>
        </div>

        {/* Actions et profil */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button 
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative
                     transition-all duration-200 ease-in-out group"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 rounded-full text-xs text-white 
                         flex items-center justify-center font-medium
                         transform transition-transform group-hover:scale-110">
              3
            </span>
          </button>

          {/* Thème */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
            )}
          </button>

          {/* Profil */}
          <div className="relative profile-menu">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700
                       transition-all duration-200"
              aria-expanded={showProfileMenu}
              aria-haspopup="true"
            >
              <div className="relative">
                <img
                  src={user?.avatar || "/api/placeholder/32/32"}
                  alt={`Profile de ${user?.name || 'Utilisateur'}`}
                  className="h-9 w-9 rounded-full border-2 border-gray-200 dark:border-gray-600"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {user?.name || "Utilisateur"}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role || "Rôle"}
                </p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                           border border-gray-100 dark:border-gray-700 transform transition-all duration-200">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.email}</p>
                </div>
                <a
                  href="/profile"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                
                  <span className="mr-2">👤</span> Profil
                </a>
                <a
                  href="/settings"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                
                  <span className="mr-2">⚙️</span> Paramètres
                </a>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="mr-2">🚪</span> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired
};

export default Header;