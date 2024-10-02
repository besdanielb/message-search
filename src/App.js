import "./App.scss";
import { BrowserRouter, Route, Navigate, Routes } from "react-router-dom";
import Home from "./Pages/Home/home";
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
      <Navbar />
      <Routes>
        {/* Home route with just the search input and related components */}
        <Route path="/" element={<Home />} />

        {/* Search results route */}
        <Route path="/search" element={<Search />} />

        {/* Dynamic Read route with date and ref parameters */}
        <Route path="/read/:date/:ref" element={<Read />} />

        {/* Dynamic Read route with only date parameter */}
        <Route path="/read/:date" element={<Read />} />

        {/* ReadAll route */}
        <Route path="/read-all" element={<ReadAll />} />

        {/* Fallback route redirects to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
