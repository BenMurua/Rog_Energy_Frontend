// src/lang/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import es from "./es.json";
import eus from "./eus.json";
import en from "./en.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      eus: { translation: eus },
      en: { translation: en },
    },
    lng: "en", // idioma inicial
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
