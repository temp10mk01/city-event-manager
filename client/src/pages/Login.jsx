import { useState } from "react";
import { useNavigate } from "react-router";
import { loginUser } from "../services/api";
import { useAuth } from "../services/auth";

// prisijungimo komponentas
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // formos pateikimo valdymas
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // validacija
    if (!email.trim() || !password.trim()) {
      setError("visi laukai yra privalomi");
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser({ email: email.trim(), password });
      login(data.user, data.token);
      
      // nukreipiame i atitinkama puslapi pagal vaidmeni
      if (data.user.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("prisijungimo klaida:", err);
      setError(err.response?.data?.error || "prisijungimas nepavyko");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Prisijungimas</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="el. paštas"
          required
          disabled={loading}
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="slaptažodis"
          required
          disabled={loading}
        />
        
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "prijungiama..." : "prisijungti"}
        </button>
        
        <p className="auth-switch">
          Neturite paskyros? <a href="/register">Registruotis</a>
        </p>
      </form>
    </div>
  );
}
