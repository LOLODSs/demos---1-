import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./refinements.css";
import "./visit-scene.css";
import "./urgent-responsive.css";
import "./service-details.css";
import "./notebook.css";
import "./interaction-motion.css";
import "./mobile-compact.css";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
