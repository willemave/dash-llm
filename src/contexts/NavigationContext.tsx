import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type NavigationRoute = 'home' | 'sales' | 'account' | 'reports';

interface NavigationContextType {
  currentRoute: NavigationRoute;
  navigateTo: (route: NavigationRoute) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute>('home');
  const navigate = useNavigate();

  const navigateTo = (route: NavigationRoute) => {
    setCurrentRoute(route);
    navigate(`/${route === 'home' ? '' : route}`);
  };

  return (
    <NavigationContext.Provider value={{ currentRoute, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};