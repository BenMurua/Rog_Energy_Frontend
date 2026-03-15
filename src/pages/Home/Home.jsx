// src/pages/Home/Home.js

import "./Home.css";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { RoutesValues } from "../../models/RoutesValues.js";
import { useRef } from "react";

const Home = () => {
  const { t } = useTranslation();
  const gridRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!gridRef.current) return;
    const { left, width } = gridRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    
    // Si el ratón está en el 20% izquierdo, scrollea a la izquierda
    // Si está en el 20% derecho, scrollea a la derecha
    const edgeSize = width * 0.2;
    const maxScrollSpeed = 15;

    if (x < edgeSize) {
      // Ratón a la izquierda: velocidad proporcional a lo cerca que esté del borde
      const speed = maxScrollSpeed * (1 - x / edgeSize);
      gridRef.current.scrollBy({ left: -speed, behavior: "auto" });
    } else if (x > width - edgeSize) {
      // Ratón a la derecha
      const speed = maxScrollSpeed * (1 - (width - x) / edgeSize);
      gridRef.current.scrollBy({ left: speed, behavior: "auto" });
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            {t("home.title")}{" "}
            <span className="highlight-omie">{t("home.omie_highlight")}</span>
          </h1>
          <p className="hero-subtitle">{t("home.subtitle")}</p>
          <NavLink to={RoutesValues.prediction} className="cta-button">
            {t("home.cta_explore")}
          </NavLink>
        </div>
      </section>

      {/* BESS Focus Box with SVG Graphic */}
      <section className="bess-focus-section">
        <div className="bess-focus-box">
          <div className="bess-graphic-container">
            <svg viewBox="0 0 200 120" className="bess-animated-graphic" xmlns="http://www.w3.org/2000/svg">
              {/* Contorno Batería */}
              <rect x="20" y="30" width="140" height="60" rx="8" fill="none" stroke="var(--text)" strokeWidth="4" />
              <rect x="160" y="45" width="10" height="30" rx="3" fill="var(--text)" />
              {/* Cargas de batería animadas */}
              <rect className="bess-charge b1" x="30" y="40" width="30" height="40" rx="4" fill="var(--secondary)" />
              <rect className="bess-charge b2" x="65" y="40" width="30" height="40" rx="4" fill="var(--secondary)" />
              <rect className="bess-charge b3" x="100" y="40" width="30" height="40" rx="4" fill="var(--secondary)" />
              {/* Símbolo de Rayo (Energía/Optimización) */}
              <path d="M125 10 L105 50 L120 50 L100 90 L135 40 L115 40 Z" fill="var(--primary)" filter="drop-shadow(0px 0px 8px var(--primary))" className="bess-lightning" />
            </svg>
          </div>
          <h2 className="bess-title">{t("home.bess_title")}</h2>
          <p className="bess-description">{t("home.bess_description")}</p>
        </div>
      </section>

      {/* Training Data Grid */}
      <section className="training-data-section">
        <div 
          className="training-data-grid" 
          ref={gridRef} 
          onMouseMove={handleMouseMove}
        >
          <div className="data-item">
            <h3>{t("home.data_input_title")}</h3>
            <img src="/cuadro_1.png" alt="Data Input" />
            <p>{t("home.data_input_description")}</p>
          </div>
          <div className="data-item">
            <h3>{t("home.model_submodels_title")}</h3>
            <img src="/cuadro_2.png" alt="Model Submodels" />
            <p>{t("home.model_submodels_description")}</p>
          </div>
          <div className="data-item">
            <h3>{t("home.optimization_title")}</h3>
            <img src="/cuadro_3.png" alt="Optimization" />
            <p>{t("home.optimization_description")}</p>
          </div>
          <div className="data-item">
            <h3>{t("home.comparison_title")}</h3>
            <img src="/cuadro_4.png" alt="Comparison" />
            <p>{t("home.comparison_description")}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
