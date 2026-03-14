import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { getStoredSession } from '../services/storageService';
import { getCurrentUser, logout as authLogout, type AuthResponse, type CurrentUserResponse } from '../services/authService';
import { getNotifications, markAsRead as apiMarkAsRead, getNotificationWebSocketUrl, type Notification as ApiNotification } from '../services/notificationService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  read?: boolean;
  userEmail?: string;
  createdAt?: string;
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  isLoading: boolean;
  notifications: Notification[];
  mousePosition: { x: number; y: number };
  scrollPosition: number;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  ui: UIState;
}

// Actions
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_MOUSE_POSITION'; payload: { x: number; y: number } }
  | { type: 'SET_SCROLL_POSITION'; payload: number }
  | { type: 'LOGOUT' };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  ui: {
    theme: 'light',
    sidebarOpen: false,
    isLoading: false,
    notifications: [],
    mousePosition: { x: 0, y: 0 },
    scrollPosition: 0
  }
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_THEME':
      return { ...state, ui: { ...state.ui, theme: action.payload } };
    case 'TOGGLE_SIDEBAR':
      return { ...state, ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } };
    case 'SET_SIDEBAR':
      return { ...state, ui: { ...state.ui, sidebarOpen: action.payload } };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, action.payload]
        }
      };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: action.payload
        }
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.map(n => 
            n.id === action.payload ? { ...n, read: true } : n
          )
        }
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload)
        }
      };
    case 'SET_MOUSE_POSITION':
      return {
        ...state,
        ui: { ...state.ui, mousePosition: action.payload }
      };
    case 'SET_SCROLL_POSITION':
      return {
        ...state,
        ui: { ...state.ui, scrollPosition: action.payload }
      };
    case 'LOGOUT':
      return {
        ...initialState,
        ui: { ...initialState.ui, theme: state.ui.theme }
      };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (auth: AuthResponse) => void;
  logout: () => void;
  notify: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize auth from stored session
  useEffect(() => {
    const initAuth = async () => {
      const storedSession = getStoredSession();
      if (!storedSession) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        const user = await getCurrentUser();
        dispatch({ type: 'SET_USER', payload: user as unknown as User });
      } catch {
        // Session invalid
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    void initAuth();
  }, []);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      dispatch({ type: 'SET_MOUSE_POSITION', payload: { x: e.clientX, y: e.clientY } });
    };

    const handleScroll = () => {
      dispatch({ type: 'SET_SCROLL_POSITION', payload: window.scrollY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Auto-remove notifications
  useEffect(() => {
    state.ui.notifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
        }, notification.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [state.ui.notifications]);

  // WebSocket Connection
  useEffect(() => {
    if (!state.isAuthenticated || !state.user) return;

    // Fetch initial notifications
    const fetchInitial = async () => {
      try {
        const data = await getNotifications();
        dispatch({ type: 'SET_NOTIFICATIONS', payload: data as unknown as Notification[] });
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    void fetchInitial();

    // Setup WebSocket
    const stompClient = new Client({
      brokerURL: getNotificationWebSocketUrl().startsWith('ws') ? getNotificationWebSocketUrl() : undefined,
      webSocketFactory: () => new SockJS(getNotificationWebSocketUrl().replace('ws:', 'http:').replace('wss:', 'https:')),
      connectHeaders: {
        // Typically JWT would go in a specific header or as a query param if using raw WS
      },
      debug: (str) => {
        // console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log('Connected to Notification WebSocket');
      // Subscribe to user-specific queue
      stompClient.subscribe(`/user/${state.user?.email}/queue/notifications`, (message) => {
        const notification = JSON.parse(message.body) as Notification;
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
        
        // Browser Notification if permitted
        if ('Notification' in window && window.Notification.permission === 'granted') {
          new window.Notification('ExploreMate', { body: notification.message });
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [state.isAuthenticated, state.user?.email]);

  const login = useCallback((auth: AuthResponse) => {
    dispatch({
      type: 'SET_USER',
      payload: {
        id: auth.userId,
        name: auth.name,
        email: auth.email,
        role: auth.role,
      } as User,
    });
  }, []);

  const logout = useCallback(() => {
    authLogout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const notify = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { ...notification, id }
    });
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    // Local first for snappy UI
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    try {
      // Backend sync
      await apiMarkAsRead(id);
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      login,
      logout,
      notify,
      removeNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Selectors
export const useUser = () => useApp().state.user;
export const useIsAuthenticated = () => useApp().state.isAuthenticated;
export const useTheme = () => useApp().state.ui.theme;
export const useNotifications = () => useApp().state.ui.notifications;
export const useMousePosition = () => useApp().state.ui.mousePosition;
export const useScrollPosition = () => useApp().state.ui.scrollPosition;

// Action helpers
export const useToggleTheme = () => {
  const { dispatch, state } = useApp();
  return () => {
    dispatch({ type: 'SET_THEME', payload: state.ui.theme === 'light' ? 'dark' : 'light' });
  };
};

export const useToggleSidebar = () => {
  const { dispatch } = useApp();
  return () => dispatch({ type: 'TOGGLE_SIDEBAR' });
};

export default AppContext;
