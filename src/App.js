import "./App.scss";
import React from "react";
import { Route, Link, Redirect } from "react-router-dom";
import { Router } from "react-router-dom";
import Search from "./Pages/Search/search";
import Read from "./Pages/Read/read";
import ReadAll from "./Pages/Read/read-all";
import { createBrowserHistory } from "history";
import MenuIcon from "@material-ui/icons/Menu";
import { makeStyles } from "@material-ui/core/styles";
import { logEvent } from "firebase/analytics";
import { analytics } from "./index";

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

function App() {
  const classes = useStyles();
  logEvent(analytics, "homepage_visited");
  let vh = window.innerHeight * 0.01;
  const history = createBrowserHistory();
  document.documentElement.style.setProperty("--vh", `${vh}px`);

  return (
    <Router history={history}>
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
          <img src="/logo-highres.png" alt="logo-highres" />
        </div>
        <MenuIcon className={classes.menuIcon} id="menuIcon"></MenuIcon>
      </div>
      <Route exact path="/search" component={Search} />
      <Route exact path="/read" component={Read} />
      <Route exact path="/read-all" component={ReadAll} />
      <Redirect to="/search"></Redirect>
    </Router>
  );
}

export default App;
