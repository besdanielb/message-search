import React, {
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  useState,
  useRef,
} from "react";
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

// Initial state for the reducer
const initialState = {
  searchTerm: "",
  wordsToHighlight: [],
  searchResults: [],
  defaultSearchResults: [],
  isSearching: false,
  isLoadingMore: false, // New state property
  isActive: false,
  limit: 20, // Initial limit
  offset: 20, // Initial offset for the first load more (20 already fetched)
  searchType: SEMANTIC_SEARCH_TYPE,
  noResultsFound: false,
  alertOpen: false,
  searchClicked: false,
  sortBy: SORT_OPTIONS.DEFAULT,
};

// Reducer function to manage state transitions
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
    case "SET_IS_LOADING_MORE": // New case
      return { ...state, isLoadingMore: action.payload };
    case "SET_IS_ACTIVE":
      return { ...state, isActive: action.payload };
    case "SET_LIMIT":
      return { ...state, limit: action.payload };
    case "SET_OFFSET":
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
  // Initialize reducer
  const [state, dispatch] = useReducer(reducer, initialState);

  // Local state for input value
  const [inputValue, setInputValue] = useState(state.searchTerm);

  // Local states for hint card visibility
  const [hintCardVisible, setHintCardVisible] = useState(false);
  const [showHintButton, setShowHintButton] = useState(
    !getState(HINTS_STATE_NAME)
  );

  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Destructure state for easy access
  const {
    searchTerm,
    wordsToHighlight,
    searchResults,
    isActive,
    searchType,
    alertOpen,
    searchClicked,
  } = state;

  // Refs for list and load more button
  const listRef = useRef(null);
  const loadMoreButtonRef = useRef(null); // Ref for "Load More" button

  // Parse semantic search results
  const parseSemanticResults = useCallback((results) => {
    return (
      results?.searchSamples?.map((entry) => {
        const sermonInfo = entry?.externalId?.split("/");
        return {
          sermonTitle: sermonInfo[1],
          sermonDate: sermonInfo[0],
          section: entry.data,
          paragraph: sermonInfo[2],
          ...entry,
        };
      }) || []
    );
  }, []);

  // Parse non-semantic search results
  const parseNonSemanticResults = useCallback((results) => {
    return Array.isArray(results) ? results : [];
  }, []);

  // Reset state fields before a new search
  const resetStateFields = useCallback(() => {
    dispatch({ type: "SET_WORDS_TO_HIGHLIGHT", payload: [] });
    dispatch({ type: "SET_IS_SEARCHING", payload: true });
    dispatch({ type: "SET_IS_ACTIVE", payload: false });
    dispatch({ type: "SET_NO_RESULTS_FOUND", payload: false });
    dispatch({ type: "SET_SEARCH_CLICKED", payload: true });
    dispatch({ type: "SET_SEARCH_RESULTS", payload: [] });
    dispatch({ type: "SET_OFFSET", payload: 20 }); // Reset to initial offset
  }, []);

  // Fetch search results from the API
  const fetchSearchResults = useCallback(
    async (url, typeOfSearch, isLoadMore = false) => {
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

        if (isLoadMore) {
          // Append only the new 10 items
          const newItems = parsedResults.slice(state.offset, state.offset + 10);
          if (newItems.length === 0) {
            dispatch({ type: "SET_NO_RESULTS_FOUND", payload: true });
          } else {
            dispatch({
              type: "SET_SEARCH_RESULTS",
              payload: [...searchResults, ...newItems],
            });
            dispatch({
              type: "SET_DEFAULT_SEARCH_RESULTS",
              payload: [...searchResults, ...newItems],
            });
            dispatch({ type: "SET_OFFSET", payload: state.offset + 10 });
          }
          dispatch({ type: "SET_IS_LOADING_MORE", payload: false }); // Stop loading more
        } else {
          // Initial search
          if (parsedResults.length === 0) {
            dispatch({ type: "SET_SEARCH_RESULTS", payload: [] });
            dispatch({ type: "SET_DEFAULT_SEARCH_RESULTS", payload: [] });
            dispatch({ type: "SET_NO_RESULTS_FOUND", payload: true });
          } else {
            dispatch({ type: "SET_SEARCH_RESULTS", payload: parsedResults });
            dispatch({
              type: "SET_DEFAULT_SEARCH_RESULTS",
              payload: parsedResults,
            });
            dispatch({ type: "SET_IS_ACTIVE", payload: true });
            dispatch({ type: "SET_NO_RESULTS_FOUND", payload: false });
          }
          dispatch({ type: "SET_IS_SEARCHING", payload: false }); // Stop initial searching
        }

        // Delay to ensure LoadingSkeleton is visible
        setTimeout(() => {
          if (!isLoadMore) {
            dispatch({ type: "SET_IS_SEARCHING", payload: false });
          }
        }, 300); // 300ms delay

        // Log the search event
        logEvent(analytics, "search_query", {
          searchType: typeOfSearch,
          query: searchTerm,
        });
      } catch (error) {
        console.error("Fetch search results error:", error);
        dispatch({ type: "SET_ALERT_OPEN", payload: true });
        dispatch({ type: "SET_IS_SEARCHING", payload: false });
        dispatch({ type: "SET_SEARCH_CLICKED", payload: false });
        dispatch({ type: "SET_IS_LOADING_MORE", payload: false });
      }
    },
    [
      parseSemanticResults,
      parseNonSemanticResults,
      searchTerm,
      searchResults,
      state.offset,
    ]
  );

  // Handle search action
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
          ? `${API_URLS.SEMANTIC}?limit=20&offset=0&query=${encodedSearchTerm}`
          : `${API_URLS.OTHER}${typeOfSearch}&limit=20&offset=0&query=${encodedSearchTerm}`;

      fetchSearchResults(url, typeOfSearch, false);

      const currentQ = searchParams.get("q") || "";
      const currentType = searchParams.get("type") || SEMANTIC_SEARCH_TYPE;

      if (currentQ !== term || currentType !== typeOfSearch) {
        setSearchParams({ q: term, type: typeOfSearch });
      }

      dispatch({ type: "SET_SEARCH_TERM", payload: term });
    },
    [
      fetchSearchResults,
      resetStateFields,
      setSearchParams,
      inputValue,
      state.searchType,
      searchParams,
    ]
  );

  // Initialize AOS for animations
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }, []);

  // Redirect to home if query params are missing or invalid
  useEffect(() => {
    const query = searchParams.get("q");
    const type = searchParams.get("type");

    if (!query || !type || query.trim() === "" || type.trim() === "") {
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate]);

  // Update words to highlight based on search term and type
  useEffect(() => {
    if (searchTerm) {
      const highlightWords =
        searchType === "exact" ? [searchTerm] : searchTerm.split(" ");
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

  // Sync URL params with state and perform search
  useEffect(() => {
    const query = searchParams.get("q");
    const type = searchParams.get("type");

    if (!query || !type || query.trim() === "" || type.trim() === "") {
      navigate("/", { replace: true });
    } else {
      if (query !== state.searchTerm || type !== state.searchType) {
        dispatch({ type: "SET_SEARCH_TERM", payload: query });
        dispatch({ type: "SET_SEARCH_TYPE", payload: type });
        dispatch({ type: "SET_OFFSET", payload: 20 }); // Reset offset for new search

        setInputValue(query);

        onSearch(null, type, query);
      }
    }
    // Removed window.scrollTo(0, 0);
  }, [
    location.search,
    navigate,
    onSearch,
    state.searchTerm,
    state.searchType,
    searchParams,
  ]);

  // Show hint card if not previously shown
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

  // Handle closing the hint card
  const handleCloseHintCard = () => {
    setHintCardVisible(false);
    setShowHintButton(true);
    saveState(HINTS_STATE_NAME, true);
  };

  // Handle showing the hint card
  const handleShowHintCard = () => {
    setHintCardVisible(true);
    setShowHintButton(false);
  };

  // Handle key down events if necessary
  const handleKeyDown = useCallback((e) => {
    // Implement any key down logic if necessary
  }, []);

  // Handle input value change
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

  const openEmailClient = useCallback(() => {
    window.open(
      "mailto:themessagesearch@gmail.com?subject=Contact%20regarding%20website"
    );
  }, []);

  // Handle "Load More" functionality
  const onLoadMore = useCallback(
    async (event) => {
      if (event) event.preventDefault();

      const encodedSearchTerm = encodeURIComponent(searchTerm);
      const url =
        searchType === SEMANTIC_SEARCH_TYPE
          ? `${API_URLS.SEMANTIC}?limit=${
              state.offset + 10
            }&offset=0&query=${encodedSearchTerm}`
          : `${API_URLS.OTHER}${searchType}&limit=${
              state.offset + 10
            }&offset=0&query=${encodedSearchTerm}`;

      // Show loading indicator for loading more
      dispatch({ type: "SET_IS_LOADING_MORE", payload: true });

      try {
        // Pass isLoadMore=true to handle appending
        await fetchSearchResults(url, searchType, true);
      } catch (error) {
        console.error("Load more error:", error);
        dispatch({ type: "SET_ALERT_OPEN", payload: true });
        dispatch({ type: "SET_IS_SEARCHING", payload: false });
        dispatch({ type: "SET_SEARCH_CLICKED", payload: false });
        dispatch({ type: "SET_IS_LOADING_MORE", payload: false });
      }
    },
    [state.offset, searchType, searchTerm, fetchSearchResults]
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

  // Memoize rendered search results
  const renderedSearchResults = useMemo(() => {
    return searchResults.map((result, index) => (
      <SearchResultItem
        key={`${result.sermonDate}-${result.paragraph}-${index}`}
        result={result}
        onReadMessage={() => onReadMessage(result.sermonDate, result.paragraph)}
        onCopyParagraph={() => onCopyParagraphClick(result)}
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

        {/* Display Initial Loading Skeleton */}
        {state.isSearching && searchResults.length === 0 && <LoadingSkeleton />}

        {/* Display No Results Found */}
        {!state.isSearching && state.noResultsFound && (
          <div className="no-results-container">
            <div className="no-results-message">
              <h2>No results found</h2>
              <p>
                We couldn't find any results for your search. Here are some tips
                that might help:
              </p>

              <ol className="search-tips">
                <li>
                  Ensure you're using the correct search type.
                </li>
                <li>
                  Double-check your spelling for typos or errors.
                </li>
                <li>Try using fewer keywords or a broader search term for "Exact match" and
                  "All words" search.</li>
                <li>Try using more keywords or a narrower search term for "AI search".</li>
                <li>Use synonyms or related words to refine your search.</li>
              </ol>

              <div className="help-link">
                <p style={{fontSize: "15px"}}>
                  Still need help? Send us an{" "}
                  <span
                    onClick={openEmailClient}
                  >
                    email
                  </span>{" "}
                  for more guidance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Display Search Results */}
        {!state.isSearching && !state.noResultsFound && (
          <ul className={isActive ? "transition" : ""} ref={listRef}>
            {renderedSearchResults}
          </ul>
        )}

        {/* Display Loading More Skeleton */}
        {state.isLoadingMore && <LoadingSkeleton />}

        {/* Load More Button for Semantic Searches */}
        {!state.isSearching &&
          !state.isLoadingMore &&
          searchTerm &&
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
                backgroundColor: "var(--text-color)",
                color: "var(--border-color)",
                opacity: state.isLoadingMore ? 0.6 : 1,
                pointerEvents: state.isLoadingMore ? "none" : "auto",
              }}
              disabled={state.isLoadingMore}
              ref={loadMoreButtonRef}
            >
              {state.isLoadingMore ? "Loading..." : "Load more"}
            </Button>
          )}

        {/* Scroll to Top Button */}
        <ScrollToTop showUnder={260}>
          <ScrollUpButton aria-label="scroll up" />
        </ScrollToTop>
      </div>

      <Footer />

      {/* Error Alert */}
      <ErrorAlert
        open={alertOpen}
        onClose={() => dispatch({ type: "SET_ALERT_OPEN", payload: false })}
      />
    </div>
  );
}
