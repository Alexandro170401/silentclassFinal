import React, { createContext, useState, useEffect } from 'react';

// Crear el contexto de autenticación
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Cargar el usuario desde localStorage cuando la aplicación se monta
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    // Verificar si el valor de storedUser es válido antes de intentar parsearlo
    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing JSON from localStorage", error);
        setUser(null); // Limpiar el estado del usuario si hay un error al parsear
      }
    }
  }, []);

  // Función para iniciar sesión
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
