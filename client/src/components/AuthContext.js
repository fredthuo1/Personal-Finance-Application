import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // this should be derived from your authentication logic

  const value = {
    isAuthenticated,
    login: () => setIsAuthenticated(true),
    logout: () => setIsAuthenticated(false)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
