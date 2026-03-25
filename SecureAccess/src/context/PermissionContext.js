import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ROLES, hasPermission as checkPermission } from '../utils/permissions';
import axios from 'axios';

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const [authState, setAuthState] = useState(null); // { user, token, role }

  useEffect(() => {
    if (!axios || !axios.interceptors) {
      console.error('Axios is not properly defined in PermissionContext');
      return;
    }
    
    const interceptor = axios.interceptors.request.use(config => {
      if (authState?.token) {
        config.headers['Authorization'] = `Bearer ${authState.token}`;
      }
      // Keep x-user-role for backward compatibility if needed, 
      // though JWT should be preferred now
      if (authState?.role) {
        config.headers['x-user-role'] = authState.role;
      }
      return config;
    });

    return () => axios.interceptors.request.eject(interceptor);
  }, [authState]);

  const hasPermission = useCallback((permission) => {
    if (!authState) return false;
    return checkPermission(authState.role, permission);
  }, [authState]);

  const logout = useCallback(() => {
    setAuthState(null);
  }, []);

  const value = {
    user: authState?.user || null,
    userRole: authState?.role || null,
    isAuthenticated: !!authState,
    setAuthState,
    logout,
    hasPermission,
    isAdmin: authState?.role === ROLES.SUPER_ADMIN || authState?.role === ROLES.ADMINISTRATOR,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
