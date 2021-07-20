import "./App.scss";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Search from "./Pages/Search/search";
import Read from "./Pages/Read/read";

//use state to get the active link to apply css class

function App() {
  return (
    <Router>
      <div className="menu">
        <nav className="nav-bar">
          <ul>
            <li className="nav-bar__link">
              <Link to="/search">Search</Link>
            </li>
            <li className="nav-bar__link">
              <Link to="/read">Read</Link>
            </li>
          </ul>
        </nav>
      </div>
      <Route exact path="/search" component={Search} />
      <Route exact path="/read" component={Read} />
    </Router>
  );
}

export default App;
