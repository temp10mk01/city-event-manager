import React from "react";
import { Routes, Route, useNavigate } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyEvents from "./pages/MyEvents";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./services/auth.jsx";

// pagrindinis aplikacijos komponentas
function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <RequireAdmin>
                <Dashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/myevents"
            element={
              <RequireAuth>
                <MyEvents />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </AuthProvider>
  );
}

// komponentas reikalaujantis autentifikavimo
function RequireAuth({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  return user ? children : null;
}

// komponentas reikalaujantis administratoriaus teisiu
function RequireAdmin({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // jei nera user, nukreipia i login
  React.useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;
  if (user.role !== "ADMIN") {
    return (
      <div className="error-message">neturite administratoriaus teisiu</div>
    );
  }
  return children;
}

export default App;
