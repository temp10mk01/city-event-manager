import React, { useState } from "react";

// zvaigzdziu ivertinimo komponentas
export default function RatingStars({ value = 0, onRate, readOnly = false, size = "normal" }) {
  const [hovered, setHovered] = useState(0);
  const stars = [1, 2, 3, 4, 5];

  // stiliaus objektas pagal parametrus
  const getStarStyle = (star) => {
    const isActive = star <= (hovered || value);
    const baseSize = size === "small" ? "1rem" : size === "large" ? "1.5rem" : "1.2rem";
    
    return {
      cursor: readOnly ? "default" : "pointer",
      color: isActive ? "#facc15" : "#e5e7eb",
      fontSize: baseSize,
      marginRight: "2px",
      transition: "color 0.2s ease",
    };
  };

  return (
    <div className={`rating-stars ${readOnly ? 'readonly' : 'interactive'}`}>
      {stars.map((star) => (
        <span
          key={star}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => !readOnly && onRate && onRate(star)}
          style={getStarStyle(star)}
          title={readOnly ? 
            `įvertinimas: ${value.toFixed(1)} iš 5` : 
            `įvertinti ${star} žvaigždę${star > 1 ? 's' : ''}`
          }
        >
          ★
        </span>
      ))}
      {readOnly && value > 0 && (
        <span className="rating-text">
          ({value.toFixed(1)})
        </span>
      )}
    </div>
  );
}
