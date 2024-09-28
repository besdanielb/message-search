import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  IconButton,
  Skeleton,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Email as EmailIcon,
  Apple as AppleIcon,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";
import ScrollToTop from "react-scroll-up";
import "./search.scss";
import SearchInput from "../../Components/search-input";
import LoadingSkeleton from "../../Components/loader";
import ScrollUpButton from "../../Components/scroll-up-button";
import SearchTypeRadioButtons from "../../Components/search-type-radio-buttons";
import SearchingSVG from "../../Components/searching-svg";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../index";
import {
  removeState,
  saveState,
  getState,
} from "../../Providers/localStorageProvider";
import SearchResultItem from "./search-result-item";
import SortOptions from "./sort-options";
import {
  API_URLS,
  SEARCH_RESULTS_STATE_NAME,
  SEARCH_TERM_STATE_NAME,
  SEARCH_TYPE_STATE_NAME,
  SEMANTIC_SEARCH_TYPE,
  SORT_OPTIONS,
} from "../../constants";
import ErrorAlert from "./error-alert";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [wordsToHighlight, setWordsToHighlight] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [defaultSearchResults, setDefaultSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [limit, setLimit] = useState(20);
  const [searchType, setSearchType] = useState(SEMANTIC_SEARCH_TYPE);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [searchClicked, setSearchClicked] = useState(false);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.DEFAULT);
  const navigate = useNavigate();

  // Load initial state from localStorage
  useEffect(() => {
    const storedResults = getState(SEARCH_RESULTS_STATE_NAME);
    const storedTerm = getState(SEARCH_TERM_STATE_NAME);
    const storedType = getState(SEARCH_TYPE_STATE_NAME);

    if (storedResults?.length > 0) {
      setSearchResults(storedResults);
      setDefaultSearchResults(storedResults);
      setSearchTerm(storedTerm);
      setWordsToHighlight(storedTerm.split(" "));
      setSearchType(storedType);
      setIsActive(true);
    }
    window.scrollTo(0, 0);
  }, []);

  // Log page visit on mount
  useEffect(() => {
    logEvent(analytics, "searchpage_visited");
  }, []);

  // Handler to prevent default key down behavior (if needed)
  const handleKeyDown = useCallback((e) => {
    // Implement any key down logic if necessary
  }, []);

  // Reset search-related state fields
  const resetStateFields = useCallback(() => {
    setWordsToHighlight(searchTerm.trim().split(" "));
    setIsSearching(true);
    setSearchResults([]);
    setDefaultSearchResults([]);
    setIsActive(false);
    setNoResultsFound(false);
    setSearchClicked(true);
  }, [searchTerm]);

  // Parse API results
  const parseResults = (results) => {
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
  };

  // Fetch search results from API
  const fetchSearchResults = useCallback(
    async (url, typeOfSearch) => {
      try {
        const response = await fetch(url);
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
          (!typeOfSearch === SEMANTIC_SEARCH_TYPE && results.length === 0)
        ) {
          setSearchResults([]);
          setDefaultSearchResults([]);
          setNoResultsFound(true);
        } else {
          if (parsedResults.length > 0) {
            setSearchResults(parsedResults);
            setDefaultSearchResults(parsedResults);
            saveState(SEARCH_TERM_STATE_NAME, searchTerm);
            saveState(SEARCH_RESULTS_STATE_NAME, parsedResults);
          } else {
            setSearchResults(results);
            setDefaultSearchResults([...results]);
            saveState(SEARCH_TERM_STATE_NAME, searchTerm);
            saveState(SEARCH_RESULTS_STATE_NAME, results);
          }
          setIsActive(true);
          setNoResultsFound(false);
        }
        setIsSearching(false);
        logEvent(analytics, "search_query", {
          searchType: typeOfSearch,
          query: searchTerm,
        });
      } catch (error) {
        console.error("Fetch search results error:", error);
        setAlertOpen(true);
        setIsSearching(false);
        setSearchClicked(false);
      }
    },
    [searchTerm]
  );

  // Handle search submission
  const onSearch = useCallback(
    (event, typeOfSearch) => {
      if (event) event.preventDefault();
      resetStateFields();
      if (typeOfSearch) {
        saveState(SEARCH_TYPE_STATE_NAME, typeOfSearch);
      }
      const url =
        typeOfSearch === SEMANTIC_SEARCH_TYPE
          ? `${API_URLS.SEMANTIC}?limit=${limit}&query=${encodeURIComponent(
              searchTerm
            )}`
          : `${API_URLS.OTHER}${typeOfSearch}&query=${encodeURIComponent(
              searchTerm
            )}`;
      fetchSearchResults(url, typeOfSearch);
    },
    [fetchSearchResults, limit, resetStateFields, searchTerm]
  );

  // Handle input value change
  const onSearchInputValueChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  // Clear search input and reset state
  const onClearInput = useCallback(() => {
    setSearchResults([]);
    setSearchClicked(false);
    setDefaultSearchResults([]);
    setSearchTerm("");
    setSearchType(SEMANTIC_SEARCH_TYPE);
    removeState(SEARCH_TERM_STATE_NAME);
    removeState(SEARCH_RESULTS_STATE_NAME);
    removeState(SEARCH_TYPE_STATE_NAME);
    setIsActive(false);
    setIsSearching(false);
    setNoResultsFound(false);
    setLimit(20);
    setSortBy(SORT_OPTIONS.DEFAULT);
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
      const url = `${
        API_URLS.SEMANTIC
      }?limit=${newLimit}&query=${encodeURIComponent(searchTerm)}`;
      setIsSearching(true);
      setLimit(newLimit);
      try {
        const response = await fetch(url);
        const results = await response.json();
        const parsedResults = parseResults(results);
        setSearchResults((prevResults) => {
          const updatedResults = [...prevResults, ...parsedResults];
          saveState(SEARCH_RESULTS_STATE_NAME, updatedResults);
          return updatedResults;
        });
        setIsSearching(false);
      } catch (error) {
        console.error("Load more results error:", error);
        setAlertOpen(true);
        setIsSearching(false);
        setSearchClicked(false);
      }
    },
    [limit, searchTerm]
  );

  // Open email client
  const openEmailClient = useCallback(() => {
    window.open(
      "mailto:themessagesearch@gmail.com?subject=Contact%20regarding%20website"
    );
  }, []);

  // Open iOS App link
  const openiOSApp = useCallback(() => {
    window.open("https://apps.apple.com/pt/app/message-search/id1579582830");
  }, []);

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

      setSearchType(newSearchType);
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
      setSortBy(selectedSort);

      let sortedResults = [...searchResults];

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
          sortedResults = [...defaultSearchResults];
          break;
      }

      setSearchResults(sortedResults);
    },
    [searchResults, defaultSearchResults]
  );

  // Handle copying paragraph text
  const onCopyParagraphClick = useCallback((result) => {
    const textToCopy = `${result.sermonDate} | ${result.sermonTitle}\n${result.paragraph} ${result.section}`;
    navigator.clipboard
      .writeText(textToCopy)
      .catch((err) => console.error("Failed to copy text: ", err));
  }, []);

  return (
    <div className="container">
      <div className="search__container" onKeyDown={handleKeyDown}>
        {!isSearching && searchResults.length === 0 && !noResultsFound && (
          <div className="search__container__title">
            <div className="search__container__title--align">
              <h2 className="search__container__title__h2">THE MESSAGE</h2>
              <h1 className="search__container__title__h1">SEARCH</h1>
              <div className="search__container__title__description">
                Search the sermons of William Marrion Branham using a learning
                technology that seeks to understand what you are searching for
                and links your search to specific phrases and quotes. You can
                also use the exact match and word match searches to find the
                exact quote or word you are looking for.
              </div>
            </div>
            <SearchingSVG />
          </div>
        )}

        <span style={{ position: "relative" }}>
          {searchClicked && (
            <IconButton
              aria-label="go back"
              size="medium"
              style={{
                position: "absolute",
                left: "-60px",
                top: "1.2em",
              }}
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
          />
        </span>

        {!noResultsFound && (
          <SearchTypeRadioButtons
            searchType={searchType}
            onSearchTypeChange={onSearchTypeChange}
          />
        )}

        {searchTerm && searchClicked && (
          <div className="info-div">
            <h5 className="number-of-results">
              Number of results:{" "}
              {isSearching && !noResultsFound ? (
                <Skeleton
                  animation="wave"
                  width={30}
                  height={24}
                  style={{ display: "inline-flex" }}
                />
              ) : (
                searchResults.length
              )}
            </h5>
            <SortOptions sortBy={sortBy} handleSortChange={handleSortChange} />
          </div>
        )}

        {isSearching && !noResultsFound && <LoadingSkeleton />}

        <ul className={isActive ? "transition" : ""}>
          {!isSearching && searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <SearchResultItem
                key={index}
                result={result}
                onReadMessage={onReadMessage}
                onCopyParagraph={onCopyParagraphClick}
                searchType={searchType}
                wordsToHighlight={wordsToHighlight}
              />
            ))
          ) : noResultsFound ? (
            <h3 className="no-results-found">
              No results found. Please try a different search.
            </h3>
          ) : null}

          {searchTerm &&
            searchResults.length > 0 &&
            searchType === SEMANTIC_SEARCH_TYPE && (
              <Button
                style={{
                  display: "flex",
                  margin: "5em auto 9em",
                }}
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

      <div className="contacts">
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="Check out our iOS app!"
          onClick={openiOSApp}
          arrow
        >
          <IconButton aria-label="download ios app" size="medium">
            <AppleIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="Get in contact with us!"
          arrow
        >
          <IconButton
            aria-label="contact us by email"
            size="medium"
            onClick={openEmailClient}
          >
            <EmailIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      </div>

      <ErrorAlert open={alertOpen} onClose={() => setAlertOpen(false)} />
    </div>
  );
}
