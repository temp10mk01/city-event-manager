import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// autentifikavimo konteksto tiekejas
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // atkuriame vartotojo duomenis is localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("klaida atkuriant vartotojo duomenis:", error);
      // istriname sugadintus duomenis
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  // prisijungimo funkcija
  function login(userData, token) {
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      setUser(userData);
    } catch (error) {
      console.error("klaida išsaugant vartotojo duomenis:", error);
      throw new Error("nepavyko išsaugoti prisijungimo duomenu");
    }
  }

  // atsijungimo funkcija
  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  }

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    // authcontext yra komponentu medis, kuris leidzia pasiekti autentifikavimo duomenis ir funkcijas visuose vaiku komponentuose
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// hook autentifikavimo kontekstui gauti
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth turi būti naudojamas AuthProvider viduje");
  }
  return context;
}

// helper funkcija token gavimui
export function getToken() {
  return localStorage.getItem("token");
}
