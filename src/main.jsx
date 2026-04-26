import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Routes.jsx";
import { ThemeProvider } from "./context/themeContext.jsx";
import { PredictionVersionProvider } from "./context/PredictionVersionContext.jsx";
import "./index.css";
import "./lang/eus.json";
import "./lang/i18n.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <PredictionVersionProvider>
        <RouterProvider router={router} />
      </PredictionVersionProvider>
    </ThemeProvider>
  </StrictMode>,
);
