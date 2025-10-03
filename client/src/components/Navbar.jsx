import React from "react";
import { Link } from "react-router";
import { useAuth } from "../services/auth.jsx";

// navigacijos komponentas
export default function Navbar() {
  const { user, logout } = useAuth();
  
  // atsijungimo funkcija su patvirtinimu
  const handleLogout = () => {
    if (window.confirm("ar tikrai norite atsijungti?")) {
      logout();
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Citify</Link>
      <div className="nav-links">
        {user ? (
          <>
            {user.role === "ADMIN" && (
              <Link to="/dashboard" className="admin-link">
                Administravimas
              </Link>
            )}
            <Link to="/myevents">Mano Renginiai</Link>
            <span className="user-info">{user.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              Atsijungti
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Prisijungti</Link>
            <Link to="/register">Registruotis</Link>
          </>
        )}
      </div>
    </nav>
  );
}
