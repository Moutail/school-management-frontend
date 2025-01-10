import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

// Vérifier l'environnement
const isDevelopment = import.meta.env.MODE === 'development';

// Slices
const authSlice = {
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    }
  }
};

const uiSlice = {
  name: 'ui',
  initialState: {
    theme: localStorage.getItem('theme') || 'light',
    sidebarCollapsed: false,
    notifications: []
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        ...action.payload,
        id: Date.now(), // Ajouter un ID unique
        timestamp: new Date().toISOString()
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    }
  }
};

const dataSlice = {
  name: 'data',
  initialState: {
    courses: [],
    users: [],
    documents: [],
    loading: {},
    error: {},
    lastUpdated: {}
  },
  reducers: {
    setData: (state, action) => {
      const { key, data } = action.payload;
      state[key] = data;
      state.lastUpdated[key] = new Date().toISOString();
    },
    setLoading: (state, action) => {
      const { key, isLoading } = action.payload;
      state.loading[key] = isLoading;
    },
    setError: (state, action) => {
      const { key, error } = action.payload;
      state.error[key] = error;
    },
    updateItem: (state, action) => {
      const { key, id, data } = action.payload;
      const index = state[key].findIndex(item => item.id === id);
      if (index !== -1) {
        state[key][index] = { 
          ...state[key][index], 
          ...data,
          updatedAt: new Date().toISOString()
        };
      }
    },
    addItem: (state, action) => {
      const { key, data } = action.payload;
      state[key].push({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    },
    removeItem: (state, action) => {
      const { key, id } = action.payload;
      state[key] = state[key].filter(item => item.id !== id);
    },
    clearErrors: (state) => {
      state.error = {};
    }
  }
};

// Création des reducers avec validation des actions
const createReducer = (slice) => {
  const { name, initialState, reducers } = slice;
  return {
    name,
    reducer: (state = initialState, action) => {
      const reducer = reducers[action.type];
      if (!reducer) return state;

      try {
        return reducer(state, action);
      } catch (error) {
        console.error(`Error in reducer ${name}:`, error);
        return state;
      }
    }
  };
};

// Combinaison des reducers
const rootReducer = combineReducers({
  auth: createReducer(authSlice).reducer,
  ui: createReducer(uiSlice).reducer,
  data: createReducer(dataSlice).reducer
});

// Middleware de journalisation amélioré
const loggerMiddleware = (store) => (next) => (action) => {
  if (isDevelopment) {
    const startTime = performance.now();
    console.group(action.type);
    console.info('Previous State:', store.getState());
    console.info('Action:', action);
    
    const result = next(action);
    
    const endTime = performance.now();
    console.info('Next State:', store.getState());
    console.info(`Action took ${(endTime - startTime).toFixed(2)}ms`);
    console.groupEnd();
    return result;
  }
  return next(action);
};

// Configuration du store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginSuccess']
      },
    }).concat(loggerMiddleware),
  devTools: isDevelopment
});

// Action creators avec validation des payloads
export const authActions = {
  loginStart: () => ({ type: 'auth/loginStart' }),
  loginSuccess: (payload) => {
    if (!payload?.user || !payload?.token) {
      throw new Error('Invalid login payload');
    }
    return { type: 'auth/loginSuccess', payload };
  },
  loginFailure: (payload) => ({ type: 'auth/loginFailure', payload }),
  logout: () => ({ type: 'auth/logout' }),
  updateUser: (payload) => ({ type: 'auth/updateUser', payload })
};

export const uiActions = {
  toggleTheme: () => ({ type: 'ui/toggleTheme' }),
  toggleSidebar: () => ({ type: 'ui/toggleSidebar' }),
  addNotification: (payload) => {
    if (!payload?.message) {
      throw new Error('Notification must have a message');
    }
    return { type: 'ui/addNotification', payload };
  },
  removeNotification: (id) => ({ type: 'ui/removeNotification', payload: id }),
  clearAllNotifications: () => ({ type: 'ui/clearAllNotifications' })
};

export const dataActions = {
  setData: (key, data) => ({ 
    type: 'data/setData', 
    payload: { key, data } 
  }),
  setLoading: (key, isLoading) => ({ 
    type: 'data/setLoading', 
    payload: { key, isLoading } 
  }),
  setError: (key, error) => ({ 
    type: 'data/setError', 
    payload: { key, error } 
  }),
  updateItem: (key, id, data) => {
    if (!key || !id || !data) {
      throw new Error('Missing required parameters for updateItem');
    }
    return { 
      type: 'data/updateItem', 
      payload: { key, id, data } 
    };
  },
  addItem: (key, data) => {
    if (!key || !data) {
      throw new Error('Missing required parameters for addItem');
    }
    return { 
      type: 'data/addItem', 
      payload: { key, data } 
    };
  },
  removeItem: (key, id) => ({ 
    type: 'data/removeItem', 
    payload: { key, id } 
  }),
  clearErrors: () => ({ type: 'data/clearErrors' })
};

// Sélecteurs avancés avec mémoisation
const createCachedSelector = (selector) => {
  let lastArgs = null;
  let lastResult = null;

  return (...args) => {
    if (lastArgs && args.every((arg, index) => arg === lastArgs[index])) {
      return lastResult;
    }
    lastArgs = args;
    lastResult = selector(...args);
    return lastResult;
  };
};

export const selectors = {
  auth: {
    getUser: (state) => state.auth.user,
    getToken: (state) => state.auth.token,
    isAuthenticated: (state) => !!state.auth.token,
    isLoading: (state) => state.auth.loading,
    getError: (state) => state.auth.error
  },
  ui: {
    getTheme: (state) => state.ui.theme,
    isSidebarCollapsed: (state) => state.ui.sidebarCollapsed,
    getNotifications: createCachedSelector((state) => state.ui.notifications)
  },
  data: {
    getData: (key) => createCachedSelector((state) => state.data[key]),
    isLoading: (key) => (state) => state.data.loading[key],
    getError: (key) => (state) => state.data.error[key],
    getLastUpdated: (key) => (state) => state.data.lastUpdated[key]
  }
};

export default store;