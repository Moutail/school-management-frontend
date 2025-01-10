// src/contexts/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);  // Renommé de currentUser à user
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);  // Ajout de l'état loading

    const login = async (newToken, userData) => {
        setLoading(true);
        try {
            if (!newToken || !userData) {
                throw new Error('Token et données utilisateur requis');
            }

            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);  // Utilisation de setUser au lieu de setCurrentUser
            return true;
        } catch (error) {
            console.error('Erreur de login:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,  // Changé de currentUser à user
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
};

export default AuthContext;