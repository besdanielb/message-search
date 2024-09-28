import "./App.scss";
import React from "react";
import { BrowserRouter, Route, Link, Navigate, Routes } from "react-router-dom";
import Search from "./Pages/Search/search";
import Read from "./Pages/Read/read";
import ReadAll from "./Pages/Read/read-all";
import MenuIcon from "@mui/icons-material/Menu";
import { makeStyles } from "@mui/styles";
import { logEvent } from "firebase/analytics";
import { analytics } from "./index";
import withClearCache from "./ClearCache";

const useStyles = makeStyles({
  menuIcon: {
    display: "flex",
    justifyContent: "center",
    color: "var(--gray-color)",
    fontSize: "12.5vmin",
    transition: "0.5s ease-in-out",
    width: "100%",
  },
});

const ClearCacheComponent = withClearCache(MainApp);

function App() {
  return <ClearCacheComponent />;
}

function MainApp(props) {
  const classes = useStyles();
  logEvent(analytics, "homepage_visited");
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);

  return (
    <BrowserRouter>
      <div id="menu" className="menu">
        <nav className="nav-bar">
          <ul>
            <li className="nav-bar__link">
              <Link to="/search">Search</Link>
            </li>
            <li className="nav-bar__link">
              <Link to="/read-all">Read</Link>
            </li>
          </ul>
        </nav>
        <div className="menu__logo">
          <img
            width="65%"
            height="100%"
            src="/logo-highres.png"
            alt="website logo"
          />
        </div>
        <MenuIcon className={classes.menuIcon} id="menuIcon"></MenuIcon>
      </div>
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
