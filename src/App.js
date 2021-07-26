import "./App.scss";
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import Search from "./Pages/Search/search";
import Read from "./Pages/Read/read";
import ReadAll from "./Pages/Read/read-all";

function App() {
  return (
    <Router>
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
        <div className="menu__icon--desktop">&#9655;</div>
      </div>
      <Route exact path="/search" component={Search} />
      <Route exact path="/read" component={Read} />
      <Route exact path="/read-all" component={ReadAll} />
      <Redirect to="/search"></Redirect>
    </Router>
  );
}

export default App;
