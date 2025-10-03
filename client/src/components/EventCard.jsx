import React, { useState } from "react";
import RatingStars from "./Rating";

// renginio kortelės komponentas
export default function EventCard({
  event,
  onRate,
  showRating = true,
  showActions = false,
  onEdit,
  onDelete,
}) {
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // renginio datos formatavimas
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("lt-LT", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ivertinimo pateikimas
  const handleSubmitRating = () => {
    if (onRate) {
      onRate(event.id, rating, comment.trim() || null);
      setShowRatingForm(false);
      setComment("");
      setRating(5);
    }
  };

  return (
    <div className="event-card">
      {event.image && (
        <img src={event.image} alt={event.title} className="event-image" />
      )}

      <div className="event-content">
        <div className="event-header">
          <h3 className="event-title">{event.title}</h3>
          {event.category && (
            <span className="event-category">{event.category.name}</span>
          )}
        </div>

        <p className="event-description">{event.description}</p>

        <div className="event-details">
          <div className="event-location">📍 {event.location}</div>
          <div className="event-time">
            🕒 {formatDate(event.startTime)}
            {event.endTime && ` - ${formatDate(event.endTime)}`}
          </div>
          {event.author && (
            <div className="event-author">👤 autorius: {event.author.name}</div>
          )}
        </div>

        {showRating && (
          // ivertinimo blokas
          <div className="event-rating">
            <RatingStars value={event.averageRating || 0} readOnly={true} />
            <span className="rating-info">
              {event.averageRating
                ? `${event.averageRating.toFixed(1)} (${
                    event.ratingCount
                  } įvertinimu)`
                : "nėra įvertinimų..."}
            </span>

            {onRate && !showRatingForm && (
              <button
                onClick={() => setShowRatingForm(true)}
                className="btn-small"
              >
                Įvertinti
              </button>
            )}

            {showRatingForm && (
              // ivertinimo forma
              <div className="rating-form">
                <div className="rating-input">
                  <label>Jūsų įvertinimas:</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} žvaigždė{num > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="komentaras (neprivalomas)"
                  className="comment-input"
                />

                <div className="rating-buttons">
                  <button onClick={handleSubmitRating} className="btn-primary">
                    Pateikti
                  </button>
                  <button
                    onClick={() => setShowRatingForm(false)}
                    className="btn-secondary"
                  >
                    Atšaukti
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showActions && (
          // veiksmu mygtukai
          <div className="event-actions">
            {onEdit && (
              <button onClick={() => onEdit(event)} className="btn-edit">
                Redaguoti
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm("ar tikrai norite ištrinti šį renginį?")) {
                    onDelete(event.id);
                  }
                }}
                className="btn-delete"
              >
                Ištrinti
              </button>
            )}
          </div>
        )}

        {!event.approved && (
          // patvirtinimo statusas
          <div className="approval-status">⏳ Laukia patvirtinimo</div>
        )}
      </div>
    </div>
  );
}
