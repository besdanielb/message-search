import { useEffect, useReducer, useCallback, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button, Typography } from "@mui/material";
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
import Lottie from 'lottie-react';
import noResultsAnimation from '../../assets/animation.json'; 

const initialState = {
  searchTerm: "",
  wordsToHighlight: [],
  searchResults: [],
  defaultSearchResults: [],
  isSearching: false,
  isActive: false,
  limit: 20,
  offset: 0, // Added offset
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
    case "SET_OFFSET": // New case
      return { ...state, offset: action.payload };
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
    offset,
    searchType,
    noResultsFound,
    alertOpen,
    searchClicked,
  } = state;

  const listRef = useRef(null);
  const loadMoreButtonRef = useRef(null);

  const parseSemanticResults = useCallback((results) => {
    return results?.searchSamples?.map((entry) => {
      const sermonInfo = entry?.externalId?.split("/");
      return {
        sermonTitle: sermonInfo[1],
        sermonDate: sermonInfo[0],
        section: entry.data,
        paragraph: sermonInfo[2],
        ...entry,
      };
    }) || [];
  }, []);

  const parseNonSemanticResults = useCallback((results) => {
    return Array.isArray(results) ? results : [];
  }, []);

  const resetStateFields = useCallback(() => {
    dispatch({ type: "SET_WORDS_TO_HIGHLIGHT", payload: [] });
    dispatch({ type: "SET_IS_SEARCHING", payload: true });
    dispatch({ type: "SET_IS_ACTIVE", payload: false });
    dispatch({ type: "SET_NO_RESULTS_FOUND", payload: false });
    dispatch({ type: "SET_SEARCH_CLICKED", payload: true });
    dispatch({ type: "SET_SEARCH_RESULTS", payload: [] }); // Clear existing results
    dispatch({ type: "SET_OFFSET", payload: 0 }); // Reset offset
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

        if (typeOfSearch === SEMANTIC_SEARCH_TYPE) {
          parsedResults = parseSemanticResults(results);
        } else if (typeOfSearch === "exact" || typeOfSearch === "allwords") {
          parsedResults = parseNonSemanticResults(results);
        }

        if (parsedResults.length === 0) {
          dispatch({ type: "SET_SEARCH_RESULTS", payload: [] });
          dispatch({ type: "SET_DEFAULT_SEARCH_RESULTS", payload: [] });
          dispatch({ type: "SET_NO_RESULTS_FOUND", payload: true });
        } else {
          dispatch({ type: "SET_SEARCH_RESULTS", payload: parsedResults });
          dispatch({ type: "SET_DEFAULT_SEARCH_RESULTS", payload: parsedResults });
          dispatch({ type: "SET_IS_ACTIVE", payload: true });
          dispatch({ type: "SET_NO_RESULTS_FOUND", payload: false });
        }

        // Introduce a slight delay to ensure LoadingSkeleton is visible
        setTimeout(() => {
          dispatch({ type: "SET_IS_SEARCHING", payload: false });
        }, 300); // 300ms delay

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
    [parseSemanticResults, parseNonSemanticResults, searchTerm]
  );

  const onSearch = useCallback(
    (event, typeOfSearch = state.searchType, term = inputValue) => {
      if (event) event.preventDefault();
      resetStateFields();
      if (typeOfSearch) {
        dispatch({ type: "SET_SEARCH_TYPE", payload: typeOfSearch });
      }
      const encodedSearchTerm = encodeURIComponent(term);
      const url =
        typeOfSearch === SEMANTIC_SEARCH_TYPE
          ? `${API_URLS.SEMANTIC}?limit=${limit}&offset=0&query=${encodedSearchTerm}` // Start from offset 0
          : `${API_URLS.OTHER}${typeOfSearch}&limit=${limit}&offset=0&query=${encodedSearchTerm}`;
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

        onSearch(null, type, query);
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

      const newOffset = offset + limit;
      const encodedSearchTerm = encodeURIComponent(searchTerm);
      const url =
        searchType === SEMANTIC_SEARCH_TYPE
          ? `${API_URLS.SEMANTIC}?limit=${limit}&offset=${newOffset}&query=${encodedSearchTerm}`
          : `${API_URLS.OTHER}${searchType}&limit=${limit}&offset=${newOffset}&query=${encodedSearchTerm}`;
      
      // Set isSearching to true to show the LoadingSkeleton
      dispatch({ type: "SET_IS_SEARCHING", payload: true });

      // Capture the current scroll position
      const currentScrollY = window.scrollY;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const results = await response.json();
        let parsedResults = [];

        if (searchType === SEMANTIC_SEARCH_TYPE) {
          parsedResults = parseSemanticResults(results);
        } else if (searchType === "exact" || searchType === "allwords") {
          parsedResults = parseNonSemanticResults(results);
        }

        if (parsedResults.length === 0) {
          // No more results to load
          dispatch({ type: "SET_NO_RESULTS_FOUND", payload: true });
        } else {
          const updatedResults = [...searchResults, ...parsedResults];
          dispatch({ type: "SET_SEARCH_RESULTS", payload: updatedResults });
          dispatch({ type: "SET_DEFAULT_SEARCH_RESULTS", payload: updatedResults });
          dispatch({ type: "SET_OFFSET", payload: newOffset });
        }

        // Hide LoadingSkeleton after fetching
        dispatch({ type: "SET_IS_SEARCHING", payload: false });

        // Restore the scroll position to where it was before loading more
        window.scrollTo(0, currentScrollY);
      } catch (error) {
        console.error("Load more error:", error);
        dispatch({ type: "SET_ALERT_OPEN", payload: true });
        dispatch({ type: "SET_IS_SEARCHING", payload: false });
        dispatch({ type: "SET_SEARCH_CLICKED", payload: false });
      }
    },
    [offset, limit, searchType, searchTerm, parseSemanticResults, parseNonSemanticResults, searchResults]
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

      console.log(`Changing search type to: ${newSearchType}`);
      dispatch({ type: "SET_SEARCH_TYPE", payload: newSearchType });

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
        key={`${result.sermonDate}-${result.paragraph}-${index}`}
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

        {/* Prioritize LoadingSkeleton when searching */}
        {isSearching ? 
          <LoadingSkeleton />
         : noResultsFound ? (
          <div className="no-results-found">
            <Lottie animationData={noResultsAnimation} className="no-results-animation" />
            <Typography variant="h4">No results found</Typography>
            <Typography variant="body1">Please try a different search</Typography>
          </div>
        ) : (
          <>
            <ul className={isActive ? "transition" : ""} ref={listRef}>
              {renderedSearchResults}
            </ul>
            {/* Load More Button for Semantic Searches */}
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
                  ref={loadMoreButtonRef}
                >
                  {isSearching ? "Loading..." : "Load more"}
                </Button>
              )}
          </>
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
