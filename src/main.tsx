import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { shouldHydrate } from "./lib/hydration-mode";
import "./fonts.css";
import "./index.css";

const container = document.getElementById("root")!;
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// The prerender (scripts/prerender.mjs) rendered this same tree for the URL
// and stamped the path on #root; hydrate it in place so the static body is
// kept, not replaced. A root without a matching stamp (the rendered 404 page
// served for an unknown URL) is rendered from scratch instead.
if (shouldHydrate(container.getAttribute("data-prerender-path"), window.location.pathname)) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
