import { useEffect, useState } from "react";
import { getEvents, deleteEvent } from "../services/api.js";
import { useAuth } from "../services/auth";
import EventForm from "../components/EventForm.jsx";
import EventCard from "../components/EventCard.jsx";

// vartotojo renginiu puslapis
export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  // renginiu gavimas
  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      // filtruojami tik vartotojo renginiai
      const userEvents = data.filter((event) => event.author.id === user?.id);
      setEvents(userEvents);
    } catch (err) {
      console.error("renginiu gavimo klaida:", err);
      setError("nepavyko gauti renginiu");
    } finally {
      setLoading(false);
    }
  };

  // pradiniai duomenys
  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  // renginio salinimas
  const handleDelete = async (eventId) => {
    try {
      await deleteEvent(eventId);
      alert("renginys sėkmingai ištrintas!");
      loadEvents();
    } catch (err) {
      console.error("renginio šalinimo klaida:", err);
      alert(err.response?.data?.error || "nepavyko ištrinti renginio");
    }
  };

  // renginio redagavimas
  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  // formos uzverimas
  const handleFormClose = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  // renginiu atnaujinimas po kurimo/redagavimo
  const handleEventCreated = () => {
    loadEvents();
    handleFormClose();
  };

  if (!user) {
    return (
      <div className="container">
        <div className="error-message">
          Turite prisijungti, kad galėtumėte matyti savo renginius
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Mano Renginiai</h1>
        {showForm ? (
          ""
        ) : (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            Sukurti Renginį
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <EventForm
          onCreated={handleEventCreated}
          editingEvent={editingEvent}
          onCancel={handleFormClose}
        />
      )}

      {loading && <div className="loading">Kraunami Renginiai...</div>}

      {!loading && events.length === 0 && !showForm && (
        <div className="no-events">
          <h3>Neturite Sukurtų Renginių</h3>
          <p>Sukurkite Savo Pirmą Renginį Paspausdami Mygtuką Viršuje!</p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              showRating={false}
              showActions={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {events.length > 0 && (
        <div className="events-summary">
          <p>Iš Viso Renginių: {events.length}</p>
          <p>
            Patvirtintų: {events.filter((e) => e.approved).length} | Laukiančių
            Patvirtinimo: {events.filter((e) => !e.approved).length}
          </p>
        </div>
      )}
    </div>
  );
}
