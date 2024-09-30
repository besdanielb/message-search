import "./App.scss";
import React from "react";
import { BrowserRouter, Route, Navigate, Routes } from "react-router-dom";
import Search from "./Pages/Search/search";
import Read from "./Pages/Read/read";
import ReadAll from "./Pages/Read/read-all";
import { logEvent } from "firebase/analytics";
import { analytics } from "./index";
import withClearCache from "./ClearCache";
import Navbar from "./Components/navbar";

const ClearCacheComponent = withClearCache(MainApp);

function App() {
  return <ClearCacheComponent />;
}

function MainApp(props) {
  logEvent(analytics, "homepage_visited");
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);

  return (
    <BrowserRouter>
      <Navbar></Navbar>
      <Routes>
      <Route exact path="/search" element={<Search></Search>} />
      <Route exact path="/read" element={<Read></Read>} />
      <Route exact path="/read-all" element={<ReadAll></ReadAll>} />
      <Route path="*" element={<Navigate to="/search" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
