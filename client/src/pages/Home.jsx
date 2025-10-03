import React, { useState, useEffect } from "react";
import { getEvents, getCategories, rateEvent } from "../services/api";
import { useAuth } from "../services/auth";
import EventCard from "../components/EventCard";

// pagrindinis puslapis su renginiu sarasku
export default function Home() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  // gaunami renginiai
  const fetchEvents = async (categoryFilter = "") => {
    try {
      setLoading(true);
      const params = { approved: "true" };
      if (categoryFilter) {
        params.category = categoryFilter;
      }

      const eventsData = await getEvents(params);
      setEvents(eventsData);
    } catch (err) {
      console.error("renginiu gavimo klaida:", err);
      setError("nepavyko gauti renginiu");
    } finally {
      setLoading(false);
    }
  };

  // gaunamos kategorijos
  const fetchCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error("kategoriju gavimo klaida:", err);
    }
  };

  // inicializuojami duomenys
  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  // kategoriju filtravimas
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchEvents(categoryId);
  };

  // renginio ivertinimas
  const handleRate = async (eventId, score, comment = null) => {
    if (!user) {
      alert("Norėdami įvertinti renginį turite prisijungti");
      return;
    }

    try {
      await rateEvent(eventId, score, comment);
      fetchEvents(selectedCategory); // atnaujinu renginiu sarasa
      alert("Ačiū už jūsų įvertinimą!");
    } catch (err) {
      console.error("Įvertinimo klaida:", err);
      alert(err.response?.data?.error || "Nepavyko ivertinti renginio");
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Miesto Renginiai</h1>
        <p>Atraskite Ir Dalyvaukite Įdomiuose Renginiuose Jūsų Mieste!</p>
      </header>

      <div className="filters">
        <label htmlFor="category-filter">Filtruoti Pagal Kategorija:</label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="category-filter"
        >
          <option value="">Visos Kategorijos</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({category._count?.events || 0})
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Kraunami Renginiai...</div>}

      {!loading &&
        (events.length === 0 ? (
          <div className="no-events">
            <p>Renginiu Nerasta</p>
            {selectedCategory && (
              <button
                onClick={() => handleCategoryChange("")}
                className="btn-secondary"
              >
                Rodyti Visus Renginius
              </button>
            )}
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRate={handleRate}
                showRating={!!user}
              />
            ))}
          </div>
        ))}
    </div>
  );
}
