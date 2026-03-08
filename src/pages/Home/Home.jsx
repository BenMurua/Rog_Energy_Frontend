// src/pages/Home/Home.js

import "./Home.css";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { RoutesValues } from "../../models/RoutesValues.js";

const Home = () => {
  const { t } = useTranslation();

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

      {/* BESS Focus Box */}
      <section className="bess-focus-section">
        <div className="bess-focus-box">
          <h2 className="bess-title">{t("home.bess_title")}</h2>
          <p className="bess-description">{t("home.bess_description")}</p>
        </div>
      </section>

      {/* Training Data Grid */}
      <section className="training-data-section">
        <div className="training-data-grid">
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
