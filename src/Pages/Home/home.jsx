import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../index";
import "./home.scss";
import SearchBar from "../../Components/search-bar/search-bar";
import Hints from "../../Components/hints/hints";
import TypingTitle from "../../Components/typing-title/typing-title";
import { getState, saveState } from "../../Providers/localStorageProvider";
import { HINTS_STATE_NAME } from "../../constants";
import Footer from "../../Components/footer/footer";

export default function Home() {
  const navigate = useNavigate();
  const [hintCardVisible, setHintCardVisible] = useState(false);
  const [showHintButton, setShowHintButton] = useState(false || getState(HINTS_STATE_NAME));
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("semantic"); // Default search type

  // Show HintCard after 1 second if not previously shown
  useEffect(() => {
    if (!getState(HINTS_STATE_NAME)) {
      const timer = setTimeout(() => {
        setHintCardVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Log page visit on mount
  useEffect(() => {
    logEvent(analytics, "homepage_visited");
  }, []);

  const handleCloseHintCard = () => {
    setHintCardVisible(false);
    setShowHintButton(true);
    saveState(HINTS_STATE_NAME, true);
  };

  const handleShowHintCard = () => {
    setHintCardVisible(true);
    setShowHintButton(false);
  };

  const handleSearch = useCallback(
    (event, type = searchType, term = searchTerm) => {
      event.preventDefault();
      if (term.trim()) {
        const encodedSearchTerm = encodeURIComponent(term.trim());
        navigate(`/search?q=${encodedSearchTerm}&type=${type}`);
        logEvent(analytics, "search_from_home", {
          searchType: type,
          query: term.trim(),
        });
      }
    },
    [navigate, searchTerm, searchType]
  );

  const handleSearchInputValueChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleClearInput = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleSearchTypeChange = useCallback((event) => {
    const { id } = event.target;
    let newSearchType = "semantic";

    if (id === "option-3") {
      newSearchType = "allwords";
    } else if (id === "option-2") {
      newSearchType = "exact";
    }

    setSearchType(newSearchType);
  }, []);

  return (
    <div className="home-container">
      <div className="home-background">
      </div>
      <div className="home-content">
        <TypingTitle text="Search The Message" speed={150} />
        <SearchBar
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onSearchInputValueChange={handleSearchInputValueChange}
          onClearInput={handleClearInput}
          searchType={searchType}
          onSearchTypeChange={handleSearchTypeChange}
          showBackButton={false} 
        />
        <Hints
          hintCardVisible={hintCardVisible}
          onCloseHintCard={handleCloseHintCard}
          showHintButton={showHintButton}
          onShowHintCard={handleShowHintCard}
					isSearchPage={false}
        />
      </div>
			<Footer />
    </div>
  );
}
