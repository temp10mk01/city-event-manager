import React, { useState, useEffect } from "react";
import {
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getCategories,
  createCategory,
  getUsers,
  updateUserRole,
  getAdminStats,
} from "../services/api";

// administratoriaus valdymo pultkas
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("events");
  const [pendingEvents, setPendingEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  // duomenu gavimas pagal aktyvu taba
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // bendru duomenu gavimas
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      // visada krauname statistikos duoments
      const statsData = await getAdminStats();
      setStats(statsData);

      // krauname duomenis pagal taba
      switch (activeTab) {
        case "events":
          const eventsData = await getPendingEvents();
          setPendingEvents(eventsData);
          break;
        case "categories":
          const categoriesData = await getCategories();
          setCategories(categoriesData);
          break;
        case "users":
          const usersData = await getUsers();
          setUsers(usersData);
          break;
      }
    } catch (err) {
      console.error("duomenu gavimo klaida:", err);
      setError("nepavyko gauti duomenu");
    } finally {
      setLoading(false);
    }
  };

  // renginio patvirtinimas
  const handleApproveEvent = async (id) => {
    try {
      await approveEvent(id);
      alert("renginys patvirtintas!");
      loadData();
    } catch (err) {
      console.error("patvirtinimo klaida:", err);
      alert(err.response?.data?.error || "nepavyko patvirtinti renginio");
    }
  };

  // renginio atmetimas
  const handleRejectEvent = async (id) => {
    try {
      await rejectEvent(id);
      setPendingEvents(pendingEvents.filter((event) => event.id !== id));
      alert("renginys atmestas!");
    } catch (err) {
      console.error("atmetimo klaida:", err);
      alert(err.response?.data?.error || "nepavyko atmesti renginio");
    }
  };

  // kategorijos kurimas
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await createCategory(newCategoryName.trim());
      setNewCategoryName("");
      alert("kategorija sukurta!");
      loadData();
    } catch (err) {
      console.error("kategorijos kurimo klaida:", err);
      alert(err.response?.data?.error || "nepavyko sukurti kategorijos");
    }
  };

  // vartotojo vaidmens keitimas
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      alert("vartotojo vaidmuo pakeistas!");
      loadData();
    } catch (err) {
      console.error("vaidmens keitimo klaida:", err);
      alert(err.response?.data?.error || "nepavyko pakeisti vaidmens");
    }
  };

  // datos formatavimas
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("lt-LT", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="dashboard-container">
      <h1>Administravimo Pultas</h1>

      <div className="stats">
        <div className="stat">
          <h3>Vartotojai</h3>
          <div className="stat-number">{stats.totalUsers || 0}</div>
        </div>
        <div className="stat">
          <h3>Visi Renginiai</h3>
          <div className="stat-number">{stats.totalEvents || 0}</div>
        </div>
        <div className="stat">
          <h3>Patvirtinti</h3>
          <div className="stat-number">{stats.approvedEvents || 0}</div>
        </div>
        <div className="stat">
          <h3>Laukiantys Patvirtinimo</h3>
          <div className="stat-number">{stats.pendingEvents || 0}</div>
        </div>
        <div className="stat">
          <h3>Kategorijos</h3>
          <div className="stat-number">{stats.totalCategories || 0}</div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          Laukiantys Renginiai ({stats.pendingEvents || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          Kategorijos
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Vartotojai
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Kraunama...</div>}

      {activeTab === "events" && !loading && (
        // laukiantys renginiai
        <div className="events-section">
          {pendingEvents.length === 0 ? (
            <div className="no-data">Nera laukiančių patvirtinimo renginių</div>
          ) : (
            <div className="pending-events">
              {pendingEvents.map((event) => (
                <div key={event.id} className="pending-event-card">
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    <div className="event-meta">
                      <span>📍 {event.location}</span>
                      <span>🕒 {formatDate(event.startTime)}</span>
                      <span>👤 {event.author.name}</span>
                      <span>🏷️ {event.category.name}</span>
                    </div>
                  </div>
                  <div className="event-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApproveEvent(event.id)}
                    >
                      Patvirtinti
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleRejectEvent(event.id)}
                    >
                      Atmesti
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "categories" && !loading && (
        // kategorijos
        <div className="categories-section">
          <form onSubmit={handleCreateCategory} className="category-form">
            <h3>Sukurti Nauja Kategorija</h3>
            <div className="form-group">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Kategorijos pavadinimas..."
                className="form-input"
                required
              />
              <button type="submit" className="btn-primary">
                Sukurti
              </button>
            </div>
          </form>

          <div className="categories-list">
            <h3>Esamos Kategorijos</h3>
            {categories.length === 0 ? (
              <div className="no-data">Nėra sukurtų kategorijų</div>
            ) : (
              <div className="categories-grid">
                {categories.map((category) => (
                  <div key={category.id} className="category-card">
                    <h4>{category.name}</h4>
                    <span className="event-count">
                      {category._count?.events || 0} Rengin
                      {category._count?.events <= 1 ? "ys" : "iai"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "users" && !loading && (
        // vartotoju valdymas
        <div className="users-section">
          <h3>Vartotoju Valdymas</h3>
          {users.length === 0 ? (
            <div className="no-data">Nėra vartotojų</div>
          ) : (
            <table className="users-table">
              <tr className="table-header">
                <td>Vardas</td>
                <td>El. Paštas</td>
                <td>Vaidmuo</td>
                <td>Renginiai</td>
                <td>Registracijos Data</td>
                <td>Veiksmai</td>
              </tr>
              {users.map((user) => (
                <tr key={user.id} className="table-row">
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td className={`role ${user.role.toLowerCase()}`}>
                    {user.role}
                  </td>
                  <td>{user._count?.events || 0}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </table>
          )}
        </div>
      )}
    </div>
  );
}
