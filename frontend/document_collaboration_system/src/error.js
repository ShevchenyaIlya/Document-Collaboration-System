import React from "react";
import "./css/base.css";
import {useLocation} from "react-router-dom";

export function Error404() {
  const location = useLocation();

  return (
      <div className="errorPage">
        <h1>404 Resource not found</h1>
        <h2>at '{location.pathname}'</h2>
      </div>
  );
}