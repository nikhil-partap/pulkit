import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const COOKIE_NAME = 'kairos_user';
const COOKIE_DAYS = 7;

function setCookie(name, value, days = COOKIE_DAYS) {
  try {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (err) {
    console.error('Error setting cookie:', err);
  }
}

function getCookie(name) {
  try {
    const cookieString = document.cookie || '';
    const match = cookieString
      .split('; ')
      .find((row) => row.startsWith(`${name}=`));
    if (match) {
      return decodeURIComponent(match.split('=')[1]);
    }
  } catch (err) {
    console.error('Error reading cookie:', err);
  }
  return null;
}

function deleteCookie(name) {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  } catch (err) {
    console.error('Error deleting cookie:', err);
  }
}

function loadInitialUser() {
  try {
    const cookieData = getCookie(COOKIE_NAME);
    if (cookieData) {
      return JSON.parse(cookieData);
    }
    const localData = localStorage.getItem(COOKIE_NAME);
    if (localData) {
      return JSON.parse(localData);
    }
  } catch (err) {
    console.error('Error loading initial user:', err);
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadInitialUser);

  const login = (userData) => {
    setUser(userData);
    const serialized = JSON.stringify(userData);
    setCookie(COOKIE_NAME, serialized, COOKIE_DAYS);
    try {
      localStorage.setItem(COOKIE_NAME, serialized);
    } catch {}
  };

  const logout = () => {
    setUser(null);
    deleteCookie(COOKIE_NAME);
    try {
      localStorage.removeItem(COOKIE_NAME);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
