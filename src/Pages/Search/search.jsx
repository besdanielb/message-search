import React, { useEffect, useReducer, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  IconButton,
} from "@mui/material";
import {
  ArrowBackIosNew as ArrowBackIosNewIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";
import ScrollToTop from "react-scroll-up";
import "./search.scss";
import SearchInput from "../../Components/search-input";
import LoadingSkeleton from "../../Components/loader";
import ScrollUpButton from "../../Components/scroll-up-button";
import SearchTypeRadioButtons from "../../Components/search-type-radio-buttons";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../index";
import {
  removeState,
  saveState,
  getState,
} from "../../Providers/localStorageProvider";
import SearchResultItem from "./search-result-item";
// import SortOptions from "./sort-options";
import {
  API_URLS,
  SEARCH_RESULTS_STATE_NAME,
  SEARCH_TERM_STATE_NAME,
  SEARCH_TYPE_STATE_NAME,
  SEMANTIC_SEARCH_TYPE,
  SORT_OPTIONS,
} from "../../constants";
import ErrorAlert from "./error-alert";
import Footer from "../../Components/footer";
import HintCard from "../../Components/hint-card";
import ShowHintsButton from "../../Components/show-hints-button";
import TypingTitle from "../../Components/typing-title";

// Initial State for Reducer
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

// Reducer Function
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
  const [hintCardVisible, setHintCardVisible] = useState(false);
  const [showHintButton, setShowHintButton] = useState(false);
  const navigate = useNavigate();

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
    sortBy,
  } = state;

  // Load initial state from localStorage
  useEffect(() => {
    const storedResults = getState(SEARCH_RESULTS_STATE_NAME);
    const storedTerm = getState(SEARCH_TERM_STATE_NAME);
    const storedType = getState(SEARCH_TYPE_STATE_NAME);

    if (storedResults?.length > 0) {
      dispatch({ type: "SET_SEARCH_RESULTS", payload: storedResults });
      dispatch({ type: "SET_DEFAULT_SEARCH_RESULTS", payload: storedResults });
      dispatch({ type: "SET_SEARCH_TERM", payload: storedTerm });
      dispatch({
        type: "SET_WORDS_TO_HIGHLIGHT",
        payload: storedTerm.split(" "),
      });
      dispatch({ type: "SET_SEARCH_TYPE", payload: storedType });
      dispatch({ type: "SET_IS_ACTIVE", payload: true });
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHintCardVisible(true); // Show hint card after 1 second
    }, 1000);
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  // Log page visit on mount
  useEffect(() => {
    logEvent(analytics, "searchpage_visited");
  }, []);

  const handleCloseHintCard = () => {
    setHintCardVisible(false); // Trigger slide-out animation
    setShowHintButton(true); // Show the "Show Hints" button after the card slides out
  };

  const handleShowHintCard = () => {
    setHintCardVisible(true); // Show the hint card
    setShowHintButton(false); // Hide the "Show Hints" button
  };

  // Handler to prevent default key down behavior (if needed)
  const handleKeyDown = useCallback((e) => {
    // Implement any key down logic if necessary
  }, []);

  // Reset search-related state fields
  const resetStateFields = useCallback(() => {
    dispatch({
      type: "SET_WORDS_TO_HIGHLIGHT",
      payload: searchTerm.trim().split(" "),
    });
    dispatch({ type: "SET_IS_SEARCHING", payload: true });
    dispatch({ type: "SET_SEARCH_RESULTS", payload: [] });
    dispatch({ type: "SET_DEFAULT_SEARCH_RESULTS", payload: [] });
    dispatch({ type: "SET_IS_ACTIVE", payload: false });
    dispatch({ type: "SET_NO_RESULTS_FOUND", payload: false });
    dispatch({ type: "SET_SEARCH_CLICKED", payload: true });
  }, [searchTerm]);

  // Parse API results
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

  // Fetch search results from API
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
          results?.searchSamples.length > 0
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

  // Handle search submission
  const onSearch = useCallback(
    (event, typeOfSearch) => {
      if (event) event.preventDefault();
      resetStateFields();
      if (typeOfSearch) {
        dispatch({ type: "SET_SEARCH_TYPE", payload: typeOfSearch });
        saveState(SEARCH_TYPE_STATE_NAME, typeOfSearch);
      }
      const encodedSearchTerm = encodeURIComponent(searchTerm);
      const url =
        typeOfSearch === SEMANTIC_SEARCH_TYPE
          ? `${API_URLS.SEMANTIC}?limit=${limit}&query=${encodedSearchTerm}`
          : `${API_URLS.OTHER}${typeOfSearch}&query=${encodedSearchTerm}`;
      fetchSearchResults(url, typeOfSearch);
    },
    [fetchSearchResults, limit, resetStateFields, searchTerm]
  );

  // Handle input value change
  const onSearchInputValueChange = useCallback((event) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: event.target.value });
  }, []);

  // Clear search input and reset state
  const onClearInput = useCallback(() => {
    dispatch({ type: "RESET" });
    removeState(SEARCH_TERM_STATE_NAME);
    removeState(SEARCH_RESULTS_STATE_NAME);
    removeState(SEARCH_TYPE_STATE_NAME);
  }, []);

  // Navigate to read message
  const onReadMessage = useCallback(
    (messageDate, index) => {
      if (messageDate && index) {
        navigate("/read", {
          state: {
            date: messageDate,
            ref: index,
            searchTerm,
            searchType,
          },
        });
      }
    },
    [navigate, searchTerm, searchType]
  );

  // Load more results
  const onLoadMore = useCallback(
    async (event) => {
      if (event) event.preventDefault();
      const newLimit = limit + 10;
      const encodedSearchTerm = encodeURIComponent(searchTerm);
      const url = `${API_URLS.SEMANTIC}?limit=${newLimit}&query=${encodedSearchTerm}`;
      dispatch({ type: "SET_IS_SEARCHING", payload: true });
      dispatch({ type: "SET_LIMIT", payload: newLimit });
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const results = await response.json();
        const parsedResults = parseResults(results);
        const updatedResults = [...searchResults, ...parsedResults];
        dispatch({ type: "SET_SEARCH_RESULTS", payload: updatedResults });
        saveState(SEARCH_RESULTS_STATE_NAME, updatedResults);
        dispatch({ type: "SET_IS_SEARCHING", payload: false });
      } catch (error) {
        console.error("Load more results error:", error);
        dispatch({ type: "SET_ALERT_OPEN", payload: true });
        dispatch({ type: "SET_IS_SEARCHING", payload: false });
        dispatch({ type: "SET_SEARCH_CLICKED", payload: false });
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
        onSearch(null, newSearchType);
      }
    },
    [onSearch, searchTerm]
  );

  // Handle sort option change
  const handleSortChange = useCallback(
    (event) => {
      const selectedSort = event.target.value;
      dispatch({ type: "SET_SORT_BY", payload: selectedSort });

      const sortedResults = [...searchResults];
      switch (selectedSort) {
        case SORT_OPTIONS.TITLE_ASC:
          sortedResults.sort((a, b) =>
            a.sermonTitle.localeCompare(b.sermonTitle)
          );
          break;
        case SORT_OPTIONS.TITLE_DEC:
          sortedResults.sort((a, b) =>
            b.sermonTitle.localeCompare(a.sermonTitle)
          );
          break;
        case SORT_OPTIONS.DATE_ASC:
          sortedResults.sort(
            (a, b) => new Date(a.sermonDate) - new Date(b.sermonDate)
          );
          break;
        case SORT_OPTIONS.DATE_DEC:
          sortedResults.sort(
            (a, b) => new Date(b.sermonDate) - new Date(a.sermonDate)
          );
          break;
        case SORT_OPTIONS.DEFAULT:
        default:
          sortedResults.sort((a, b) =>
            new Date(a.sermonDate) - new Date(b.sermonDate)
          );
          break;
      }

      dispatch({ type: "SET_SEARCH_RESULTS", payload: sortedResults });
    },
    [searchResults]
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
    if (isSearching) return null;
    if (noResultsFound) {
      return <h3 className="no-results-found">No results found. Please try a different search.</h3>;
    }
    return searchResults.map((result, index) => (
      <SearchResultItem
        key={index}
        result={result}
        onReadMessage={onReadMessage}
        onCopyParagraph={onCopyParagraphClick}
        searchType={searchType}
        wordsToHighlight={wordsToHighlight}
      />
    ));
  }, [isSearching, noResultsFound, searchResults, onReadMessage, onCopyParagraphClick, searchType, wordsToHighlight]);

  return (
    <div className="container">
       <HintCard visible={hintCardVisible} onClose={handleCloseHintCard} />
       {showHintButton && <ShowHintsButton onClick={handleShowHintCard} />}
      <div className="search__container" onKeyDown={handleKeyDown}>
        {!isSearching && searchResults.length === 0 && !noResultsFound && (
          <div className="search__container__title">
          <TypingTitle text="Search The Message" speed={150} />
        </div>
        )}

        <span style={{ position: "relative" }}>
          
          <div className="search__container__input-container" style={{marginTop: isSearching || searchClicked || searchResults.length > 0 ? '70px': '0'}}>
          {searchClicked && (
            <IconButton
              aria-label="go back"
              size="medium"
              sx={{marginTop: "10px"}}
              onClick={onClearInput}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}
          <SearchInput
            onSearch={(event) => onSearch(event, searchType)}
            onSearchInputValueChange={onSearchInputValueChange}
            onClearInput={onClearInput}
            searchTerm={searchTerm}
            aria-label="search input"
            searchBook="Message"
          />
          </div>
        </span>

        {!noResultsFound && (
          <SearchTypeRadioButtons
            searchType={searchType}
            onSearchTypeChange={onSearchTypeChange}
          />
        )}

        {/*searchTerm && searchClicked && (
          <div className="info-div">
            <SortOptions sortBy={sortBy} handleSortChange={handleSortChange} />
          </div>
        )*/}

        {isSearching && !noResultsFound && <LoadingSkeleton />}

        <ul className={isActive ? "transition" : ""}>
          {renderedSearchResults}

          {searchTerm &&
            searchResults.length > 0 &&
            searchType === SEMANTIC_SEARCH_TYPE && (
              <Button
                className="load-more-button"
                size="medium"
                variant="outlined"
                aria-label="load more results"
                onClick={onLoadMore}
                endIcon={<GetAppIcon />}
              >
                Load more
              </Button>
            )}
        </ul>

        <ScrollToTop showUnder={260}>
          <ScrollUpButton aria-label="scroll up" />
        </ScrollToTop>
      </div>

      <Footer></Footer>

      <ErrorAlert open={alertOpen} onClose={() => dispatch({ type: "SET_ALERT_OPEN", payload: false })} />
    </div>
  );
}
