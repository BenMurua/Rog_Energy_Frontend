import React from "react";
import "./PredictionInfoSidebar.css";

export default function PredictionInfoSidebar({ predictionDate }) {
  return (
    <div className="prediction-info-sidebar">
      <div className="prediction-info-content">
        <p className="prediction-date-text">{predictionDate}</p>
      </div>
    </div>
  );
}
