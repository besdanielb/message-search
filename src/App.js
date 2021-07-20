import "./App.scss";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import Search from "./Pages/Search/search";
import Read from "./Pages/Read/read";

//use state to get the active link to apply css class

function App() {
  return (
    <Router>
      <div className="app-container">
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

        <Switch>
          <Route path="/search">
            <Search />
          </Route>
          <Route path="/read">
            <Read />
          </Route>
          <Redirect to="/search"></Redirect>
          <Route component={Search} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
