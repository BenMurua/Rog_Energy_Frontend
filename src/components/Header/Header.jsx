import { useEffect, useState } from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { RoutesValues } from "../../models/RoutesValues.js";

export default function Header() {
  const [theme, setTheme] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

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
      </nav>

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
