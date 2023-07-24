import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Root } from "./components/Root";

const root = createRoot(document.getElementById("content")!);
root.render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
