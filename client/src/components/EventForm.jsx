import { useState, useEffect } from "react";
import { createEvent, updateEvent, getCategories } from "../services/api.js";

// renginio formos komponentas
export default function EventForm({
  onCreated,
  editingEvent = null,
  onCancel,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    startTime: "",
    endTime: "",
    location: "",
    image: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // kraunamos kategorijos ir uzpildoma forma redagavimui
  useEffect(() => {
    loadCategories();
    if (editingEvent) {
      populateFormForEdit(editingEvent);
    }
  }, [editingEvent]);

  // kategoriju gavimas
  const loadCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error("kategoriju gavimo klaida:", err);
    }
  };

  // formos uzpildymas redagavimui
  const populateFormForEdit = (event) => {
    const formatDateTime = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };

    setForm({
      title: event.title || "",
      description: event.description || "",
      categoryId: event.categoryId || "",
      startTime: formatDateTime(event.startTime),
      endTime: formatDateTime(event.endTime),
      location: event.location || "",
      image: event.image || "",
    });
  };

  // formos lauku keitimo valdymas
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // formos validacija
  const validateForm = () => {
    if (!form.title.trim()) {
      setError("pavadinimas yra privalomas");
      return false;
    }
    if (!form.description.trim()) {
      setError("aprašymas yra privalomas");
      return false;
    }
    if (!form.categoryId) {
      setError("kategorija yra privaloma");
      return false;
    }
    if (!form.startTime) {
      setError("pradžios laikas yra privalomas");
      return false;
    }
    if (!form.location.trim()) {
      setError("vieta yra privaloma");
      return false;
    }
    if (form.endTime && new Date(form.endTime) <= new Date(form.startTime)) {
      setError("pabaigos laikas turi būti vėlesnis už pradžios laiką");
      return false;
    }
    return true;
  };

  // formos pateikimo valdymas
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const eventData = {
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        startTime: form.startTime,
        endTime: form.endTime || null,
        location: form.location.trim(),
        image: form.image.trim() || null,
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        alert("renginys sėkmingai atnaujintas!");
      } else {
        await createEvent(eventData);
        alert(
          "renginys sėkmingai sukurtas! jis bus rodomas po administratoriaus patvirtinimo."
        );
      }

      if (onCreated) onCreated();
      if (onCancel) onCancel();

      // istrinu forma jei neredaguoju
      if (!editingEvent) {
        setForm({
          title: "",
          description: "",
          categoryId: "",
          startTime: "",
          endTime: "",
          location: "",
          image: "",
        });
      }
    } catch (err) {
      console.error("renginio kurimo/atnaujinimo klaida:", err);
      setError(err.response?.data?.error || "nepavyko išsaugoti renginio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-form-container">
      <form onSubmit={handleSubmit} className="event-form">
        <h3>{editingEvent ? "Redaguoti renginį" : "Sukurti naują renginį"}</h3>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Pavadinimas *</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Renginio pavadinimas"
            required
            className="form-input"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Aprašymas *</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Renginio aprašymas"
            rows={4}
            required
            className="form-input"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Kategorija *</label>
          <select
            id="categoryId"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
            className="form-input"
            disabled={loading}
          >
            <option value="">Pasirinkite Kategorija</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startTime">Pradžios Laikas *</label>
            <input
              id="startTime"
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">Pabaigos Laikas</label>
            <input
              id="endTime"
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Vieta *</label>
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="renginio vieta"
            required
            className="form-input"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Nuotrauka (URL)</label>
          <input
            id="image"
            type="url"
            name="image"
            value={form.image}
            onChange={handleChange}
            className="form-input"
            placeholder="nuotraukos url (neprivaloma)"
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "išsaugoma..." : editingEvent ? "Atnaujinti" : "Sukurti"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn-secondary"
            >
              Atšaukti
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
