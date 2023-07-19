import React from "react";
import ReactDOM from "react-dom/client";
import RouteSwitch from "./components/RouteSwitch";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <RouteSwitch />
  </React.StrictMode>
);
