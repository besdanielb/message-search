import { useEffect, useReducer, useCallback, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@mui/material";
import { GetApp as GetAppIcon } from "@mui/icons-material";
import ScrollToTop from "react-scroll-up";
import "./search.scss";
import SearchBar from "../../Components/search-bar/search-bar";
import LoadingSkeleton from "../../Components/skeleton/loader";
import ScrollUpButton from "../../Components/scroll-up-button";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../index";
import {
  removeState,
  saveState,
  getState,
} from "../../Providers/localStorageProvider";
import SearchResultItem from "./search-result-item";
import {
  API_URLS,
  HINTS_STATE_NAME,
  SEARCH_RESULTS_STATE_NAME,
  SEARCH_TERM_STATE_NAME,
  SEARCH_TYPE_STATE_NAME,
  SEMANTIC_SEARCH_TYPE,
  SORT_OPTIONS,
} from "../../constants";
import ErrorAlert from "./error-alert";
import Footer from "../../Components/footer/footer";
import Hints from "../../Components/hints/hints";
import AOS from "aos";
import "aos/dist/aos.css";

const initialState = {
  searchTerm: "",
  wordsToHighlight: [],
  searchResults: [],
  defaultSearchResults: [],
  isSearching: false,
  isActive: false,
  limit: 20,
  searchType: SEMANTIC_SEARCH_TYPE,
  noResultsFound: false,
  alertOpen: false,
  searchClicked: false,
  sortBy: SORT_OPTIONS.DEFAULT,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };
    case "SET_WORDS_TO_HIGHLIGHT":
      return { ...state, wordsToHighlight: action.payload };
    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.payload };
    case "SET_DEFAULT_SEARCH_RESULTS":
      return { ...state, defaultSearchResults: action.payload };
    case "SET_IS_SEARCHING":
      return { ...state, isSearching: action.payload };
    case "SET_IS_ACTIVE":
      return { ...state, isActive: action.payload };
    case "SET_LIMIT":
      return { ...state, limit: action.payload };
    case "SET_SEARCH_TYPE":
      return { ...state, searchType: action.payload };
    case "SET_NO_RESULTS_FOUND":
      return { ...state, noResultsFound: action.payload };
    case "SET_ALERT_OPEN":
      return { ...state, alertOpen: action.payload };
    case "SET_SEARCH_CLICKED":
      return { ...state, searchClicked: action.payload };
    case "SET_SORT_BY":
      return { ...state, sortBy: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function Search() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [inputValue, setInputValue] = useState(state.searchTerm);

  const [hintCardVisible, setHintCardVisible] = useState(false);
  const [showHintButton, setShowHintButton] = useState(
    false || getState(HINTS_STATE_NAME)
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    searchTerm,
    wordsToHighlight,
    searchResults,
    isSearching,
    isActive,
    limit,
    searchType,
    noResultsFound,
    alertOpen,
    searchClicked,
  } = state;

  const parseResults = useCallback((results) => {
    return results?.searchSamples.map((entry) => {
      const sermonInfo = entry?.externalId?.split("/");
      return {
        sermonTitle: sermonInfo[1],
        sermonDate: sermonInfo[0],
        section: entry.data,
        paragraph: sermonInfo[2],
        ...entry,
      };
    });
  }, []);

  const resetStateFields = useCallback(() => {
    dispatch({
      type: "SET_WORDS_TO_HIGHLIGHT",
      payload: [],
    });
    dispatch({ type: "SET_IS_SEARCHING", payload: true });
    dispatch({ type: "SET_IS_ACTIVE", payload: false });
    dispatch({ type: "SET_NO_RESULTS_FOUND", payload: false });
    dispatch({ type: "SET_SEARCH_CLICKED", payload: true });
  }, []);

  const fetchSearchResults = useCallback(
    async (url, typeOfSearch) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const results = await response.json();
        let parsedResults = [];

        if (
          typeOfSearch === SEMANTIC_SEARCH_TYPE &&
          results?.searchSamples?.length > 0
        ) {
          parsedResults = parseResults(results);
        }

        if (
          (typeOfSearch === SEMANTIC_SEARCH_TYPE &&
            parsedResults.length === 0) ||
          (typeOfSearch !== SEMANTIC_SEARCH_TYPE && results.length === 0)
        ) {
          dispatch({ type: "SET_SEARCH_RESULTS", payload: [] });
          dispatch({ type: "SET_DEFAULT_SEARCH_RESULTS", payload: [] });
          dispatch({ type: "SET_NO_RESULTS_FOUND", payload: true });
        } else {
          if (parsedResults.length > 0) {
            dispatch({ type: "SET_SEARCH_RESULTS", payload: parsedResults });
            dispatch({
              type: "SET_DEFAULT_SEARCH_RESULTS",
              payload: parsedResults,
            });
            saveState(SEARCH_TERM_STATE_NAME, searchTerm);
            saveState(SEARCH_RESULTS_STATE_NAME, parsedResults);
          } else {
            dispatch({ type: "SET_SEARCH_RESULTS", payload: results });
            dispatch({
              type: "SET_DEFAULT_SEARCH_RESULTS",
              payload: [...results],
            });
            saveState(SEARCH_TERM_STATE_NAME, searchTerm);
            saveState(SEARCH_RESULTS_STATE_NAME, results);
          }
          dispatch({ type: "SET_IS_ACTIVE", payload: true });
          dispatch({ type: "SET_NO_RESULTS_FOUND", payload: false });
        }
        dispatch({ type: "SET_IS_SEARCHING", payload: false });
        logEvent(analytics, "search_query", {
          searchType: typeOfSearch,
          query: searchTerm,
        });
      } catch (error) {
        console.error("Fetch search results error:", error);
        dispatch({ type: "SET_ALERT_OPEN", payload: true });
        dispatch({ type: "SET_IS_SEARCHING", payload: false });
        dispatch({ type: "SET_SEARCH_CLICKED", payload: false });
      }
    },
    [parseResults, searchTerm]
  );

  const onSearch = useCallback(
    (event, typeOfSearch = state.searchType, term = inputValue) => {
      if (event) event.preventDefault();
      resetStateFields();
      if (typeOfSearch) {
        dispatch({ type: "SET_SEARCH_TYPE", payload: typeOfSearch });
        saveState(SEARCH_TYPE_STATE_NAME, typeOfSearch);
      }
      const encodedSearchTerm = encodeURIComponent(term);
      const url =
        typeOfSearch === SEMANTIC_SEARCH_TYPE
          ? `${API_URLS.SEMANTIC}?limit=${limit}&query=${encodedSearchTerm}`
          : `${API_URLS.OTHER}${typeOfSearch}&query=${encodedSearchTerm}`;
      fetchSearchResults(url, typeOfSearch);

      const currentQ = searchParams.get("q") || "";
      const currentType = searchParams.get("type") || SEMANTIC_SEARCH_TYPE;

      if (currentQ !== term || currentType !== typeOfSearch) {
        setSearchParams({ q: term, type: typeOfSearch });
      }

      dispatch({ type: "SET_SEARCH_TERM", payload: term });
    },
    [
      fetchSearchResults,
      limit,
      resetStateFields,
      setSearchParams,
      inputValue,
      state.searchType,
      searchParams,
    ]
  );

  useEffect(() => {
    AOS.init({
      duration: 800, 
      easing: "ease-in-out", 
      once: true, 
      mirror: false, 
    });
  }, []);

  useEffect(() => {
    const query = searchParams.get("q");
    const type = searchParams.get("type");

    if (!query || !type || query.trim() === "" || type.trim() === "") {
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (searchTerm) {
      let highlightWords = [];
      if (searchType === "exact") {
        highlightWords = [searchTerm]; // Highlight the entire phrase for exact matches
      } else if (searchType === "allwords") {
        highlightWords = searchTerm.split(" "); // Split into words for all words search
      } else {
        highlightWords = searchTerm.split(" "); // Default behavior for other search types
      }
      dispatch({
        type: "SET_WORDS_TO_HIGHLIGHT",
        payload: highlightWords,
      });
    } else {
      dispatch({
        type: "SET_WORDS_TO_HIGHLIGHT",
        payload: [],
      });
    }
  }, [searchTerm, searchType]);

  useEffect(() => {
    const query = searchParams.get("q");
    const type = searchParams.get("type");

    if (!query || !type || query.trim() === "" || type.trim() === "") {
      navigate("/", { replace: true });
    } else {
      if (
        query !== state.searchTerm ||
        type !== state.searchType
      ) {
        dispatch({ type: "SET_SEARCH_TERM", payload: query });
        dispatch({ type: "SET_SEARCH_TYPE", payload: type });

        setInputValue(query);

        const storedResults = getState(SEARCH_RESULTS_STATE_NAME);
        const storedTerm = getState(SEARCH_TERM_STATE_NAME);
        const storedType = getState(SEARCH_TYPE_STATE_NAME);

        if (
          storedResults?.length > 0 &&
          query === storedTerm &&
          type === storedType
        ) {
          dispatch({ type: "SET_SEARCH_RESULTS", payload: storedResults });
          dispatch({
            type: "SET_DEFAULT_SEARCH_RESULTS",
            payload: storedResults,
          });
          dispatch({ type: "SET_IS_ACTIVE", payload: true });
        } else {
          onSearch(null, type, query);
        }
      }
    }
    window.scrollTo(0, 0);
  }, [
    location.search,
    navigate,
    onSearch,
    state.searchTerm,
    state.searchType,
    searchParams,
  ]);
  
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
    logEvent(analytics, "searchpage_visited");
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

  // Handler to prevent default key down behavior (if needed)
  const handleKeyDown = useCallback((e) => {
    // Implement any key down logic if necessary
  }, []);

  // Modified input change handler to update inputValue
  const onSearchInputValueChange = useCallback((event) => {
    setInputValue(event.target.value);
  }, []);

  // Clear search input and reset state
  const onClearInput = useCallback(() => {
    dispatch({ type: "RESET" });
    removeState(SEARCH_TERM_STATE_NAME);
    removeState(SEARCH_RESULTS_STATE_NAME);
    removeState(SEARCH_TYPE_STATE_NAME);
    setInputValue(""); // Reset inputValue
    // Navigate to home
    navigate("/");
  }, [navigate]);

  // Navigate to read message
  const onReadMessage = useCallback(
    (messageDate, index) => {
      if (messageDate && index) {
        navigate(
          `/read/${messageDate}/${index}?q=${encodeURIComponent(
            searchTerm
          )}&type=${searchType}`
        );
      }
    },
    [navigate, searchTerm, searchType]
  );

  // Load more results
  const onLoadMore = useCallback(
    async (event) => {
      if (event) event.preventDefault();

      const encodedSearchTerm = encodeURIComponent(searchTerm);
      const url = `${API_URLS.SEMANTIC}?limit=${limit}&query=${encodedSearchTerm}`;
      
      // Set isSearching to true to show the LoadingSkeleton
      dispatch({ type: "SET_IS_SEARCHING", payload: true });
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const results = await response.json();
        const parsedResults = parseResults(results);
        
        // Append the new results to the existing searchResults
        const updatedResults = [...searchResults, ...parsedResults];
        dispatch({ type: "SET_SEARCH_RESULTS", payload: updatedResults });
        
        // Update the defaultSearchResults if necessary
        dispatch({
          type: "SET_DEFAULT_SEARCH_RESULTS",
          payload: updatedResults,
        });
        
        // Save the updated results to local storage
        saveState(SEARCH_RESULTS_STATE_NAME, updatedResults);
        
        // Update the limit in the state
        dispatch({ type: "SET_LIMIT", payload: limit });
        
        // Set isSearching to false to hide the LoadingSkeleton
        dispatch({ type: "SET_IS_SEARCHING", payload: false });
      } catch (error) {
        console.error("Load more error:", error);
        dispatch({ type: "SET_ALERT_OPEN", payload: true });
        dispatch({ type: "SET_IS_SEARCHING", payload: false });
      }
    },
    [limit, parseResults, searchResults, searchTerm]
  );

  // Handle search type change
  const onSearchTypeChange = useCallback(
    (event) => {
      const { id } = event.target;
      let newSearchType = SEMANTIC_SEARCH_TYPE;

      if (id === "option-3") {
        newSearchType = "allwords";
      } else if (id === "option-2") {
        newSearchType = "exact";
      }

      dispatch({ type: "SET_SEARCH_TYPE", payload: newSearchType });
      saveState(SEARCH_TYPE_STATE_NAME, newSearchType);

      if (searchTerm) {
        onSearch(null, newSearchType, searchTerm);
      }
    },
    [onSearch, searchTerm]
  );

  // Handle copying paragraph text
  const onCopyParagraphClick = useCallback((result) => {
    const textToCopy = `${result.sermonDate} | ${result.sermonTitle}\n${result.paragraph} ${result.section}`;
    navigator.clipboard
      .writeText(textToCopy)
      .catch((err) => console.error("Failed to copy text: ", err));
  }, []);

  // Memoized Search Results
  const renderedSearchResults = useMemo(() => {
    return searchResults.map((result, index) => (
      <SearchResultItem
        key={result.sermonDate + index}
        result={result}
        onReadMessage={() => onReadMessage(result.sermonDate, result.paragraph)}
        onCopyParagraph={onCopyParagraphClick}
        searchType={searchType}
        wordsToHighlight={wordsToHighlight}
      />
    ));
  }, [
    searchResults,
    onReadMessage,
    onCopyParagraphClick,
    searchType,
    wordsToHighlight,
  ]);

  return (
    <div className="search-container">
      <Hints 
        hintCardVisible={hintCardVisible}
        onCloseHintCard={handleCloseHintCard}
        showHintButton={showHintButton}
        onShowHintCard={handleShowHintCard}
        isSearchPage={true}
      />
      <div className="search__container" onKeyDown={handleKeyDown}>
        <SearchBar
          searchTerm={inputValue}
          onSearch={(event) => onSearch(event, searchType, inputValue)} 
          onSearchInputValueChange={onSearchInputValueChange}
          onClearInput={onClearInput}
          searchType={searchType}
          onSearchTypeChange={onSearchTypeChange}
          showBackButton={searchClicked || searchResults.length > 0}
        />

        {/* Optional: Uncomment if you implement sort options
        {searchTerm && searchClicked && (
          <div className="info-div">
            <SortOptions sortBy={sortBy} handleSortChange={handleSortChange} />
          </div>
        )}
        */}

        {noResultsFound ? (
          <h4 className="no-results-found" style={{ paddingTop: "20px" }}>
            No results found. Please try a different search.
          </h4>
        ) : (
          <>
            <ul className={isActive ? "transition" : ""}>
              {renderedSearchResults}
            </ul>
            {/* Show LoadingSkeleton below the results when loading more */}
            {isSearching && <LoadingSkeleton />}
          </>
        )}

        {searchTerm &&
          searchResults.length > 0 &&
          searchType === SEMANTIC_SEARCH_TYPE && (
            <Button
              className="load-more-button"
              size="medium"
              variant="contained"
              aria-label="load more results"
              onClick={onLoadMore}
              endIcon={<GetAppIcon />}
              sx={{
                marginBottom: "100px",
                backgroundColor: 'var(--text-color)',
                color: 'var(--border-color)',
                opacity: isSearching ? 0.6 : 1,
                pointerEvents: isSearching ? 'none' : 'auto',
              }}
              disabled={isSearching}
            >
              {isSearching ? "Loading..." : "Load more"}
            </Button>
          )}

        <ScrollToTop showUnder={260}>
          <ScrollUpButton aria-label="scroll up" />
        </ScrollToTop>
      </div>

      <Footer />
      <ErrorAlert
        open={alertOpen}
        onClose={() => dispatch({ type: "SET_ALERT_OPEN", payload: false })}
      />
    </div>
  );
}
