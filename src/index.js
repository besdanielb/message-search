import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "typeface-roboto";
import "typeface-merriweather";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// ######### TODO ###########3

// Search page:
// Handle input clear button - set active flag to false
// Handle Load more event
// Handle max title size to not mess with card width

// Read page:
// Check Read page title size

// All site:
// Add production build
// check reponsiveness
