import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { AppRouter } from "./wiki/AppRouter";
import "@xterm/xterm/css/xterm.css";
import "./styles.css";

// HashRouter (URLs like /pyverdex/#/tools) so every deep link resolves on a
// static host (GitHub Pages) with no server-side rewrite / 404 fallback needed.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <AppRouter />
    </HashRouter>
  </React.StrictMode>
);
