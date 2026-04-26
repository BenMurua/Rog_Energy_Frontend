import { useEffect, useState } from "react";
import "./Header.css";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { usePredictionVersion } from "../../context/PredictionVersionContext";
import { RoutesValues } from "../../models/RoutesValues.js";

export default function Header() {
  const [theme, setTheme] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { predictionVersion, setPredictionVersion } = usePredictionVersion();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header>
      <a href="/" className="logo">
        {t("header.logo")}
      </a>

      <button
        className={`menu-toggle ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <nav className={menuOpen ? "open" : ""}>
        {/* Usamos NavLink con la prop "to" */}
        <NavLink to={RoutesValues.prediction}>
          {t("header.pages.prediction")}
        </NavLink>
        <NavLink to={RoutesValues.historic}>
          {t("header.pages.historic")}
        </NavLink>
        <NavLink to={RoutesValues.statistics}>
          {t("header.pages.statistics")}
        </NavLink>
        <NavLink to={RoutesValues.otherData}>
          {t("header.pages.otherData")}
        </NavLink>
      </nav>

      <div className="prediction-version-selector">
        <label>{t("prediction.dataSourceLabel")}:</label>
        <select
          value={predictionVersion}
          onChange={(e) => setPredictionVersion(e.target.value)}
          className="version-select"
        >
          <option value="V1">V1</option>
          <option value="V2">V2</option>
          <option value="V3">V3</option>
          <option value="V4">V4</option>
          <option value="V5">V5</option>
        </select>
      </div>

      <select
        className="lang-select"
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="es">ES</option>
        <option value="en">EN</option>
        <option value="eus">EUS</option>
      </select>

      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? t("header.theme.light") : t("header.theme.dark")}
      </button>
    </header>
  );
}
