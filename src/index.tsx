import * as ReactDOM from "react-dom";
import { Root } from "./components/Root";

import "./index.scss";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    // if ("serviceWorker" in navigator) {
    //   navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
    // }

    ReactDOM.render(<Root />, document.getElementById("content"));
  },
  { once: true },
);
