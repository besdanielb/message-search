import "./search.scss";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import SearchInput from "../../Components/search-input";
import LoadingSpinner from "../../Components/loader";
import ScrollUpButton from "../../Components/scroll-up-button";
import FacebookIcon from "@material-ui/icons/Facebook";
import EmailIcon from "@material-ui/icons/Email";
import AppleIcon from "@material-ui/icons/Apple";
import { Alert, AlertTitle } from "@material-ui/lab";
import Collapse from "@material-ui/core/Collapse";
import CloseIcon from "@material-ui/icons/Close";
import YouTubeIcon from "@material-ui/icons/YouTube";
import AndroidOutlinedIcon from "@material-ui/icons/AndroidOutlined";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { IconButton } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Tooltip from "@material-ui/core/Tooltip";
import Fade from "@material-ui/core/Fade";
import ScrollToTop from "react-scroll-up";
import Button from "@material-ui/core/Button";
import GetAppIcon from "@material-ui/icons/GetApp";
import Mark from "mark.js";
import {
  removeState,
  saveState,
  getState,
} from "../../Providers/localStorageProvider";
import SearchTypeRadioButtons from "../../Components/search-type-radio-buttons";
import SearchingSVG from "../../Components/searching-svg";

export default function Search() {
  const SEMANTIC_SEARCH_TYPE = "semantic";
  const SEARCH_RESULTS_STATE_NAME = "searchResults";
  const SEARCH_TERM_STATE_NAME = "searchTerm";
  const SEARCH_TYPE_STATE_NAME = "searchType";
  const SORT_BY_DEFAULT = "defaultSort";
  const SORT_BY_TITLE_DEC = "titleDEC";
  const SORT_BY_TITLE_ASC = "titleASC";
  const SORT_BY_DATE_ASC = "dateASC";
  const SORT_BY_DATE_DEC = "dateDEC";
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [defaultSearchResults, setDefaultSearchResults] = React.useState([]);
  const [search, setSearch] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [limit, setLimit] = React.useState(10);
  const [searchType, setSearchType] = React.useState(SEMANTIC_SEARCH_TYPE);
  const [noResultsFound, setNoResultsFound] = React.useState(false);
  const [alert, setAlert] = React.useState(false);
  const [sortBy, setSortBy] = React.useState(SORT_BY_DEFAULT);
  const history = useHistory();

  // If there is search results in the local state, show them in the page
  useEffect(() => {
    if (getState(SEARCH_RESULTS_STATE_NAME)?.length > 0) {
      setSearchResults(getState(SEARCH_RESULTS_STATE_NAME));
      setDefaultSearchResults(getState(SEARCH_RESULTS_STATE_NAME));
      setSearchTerm(getState(SEARCH_TERM_STATE_NAME));
      setSearchType(getState(SEARCH_TYPE_STATE_NAME));
      setActive(true);
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (searchType && searchType !== "semantic") {
      const instance = new Mark(".paragraph-text");
      instance.mark(searchTerm);
    }
  }, [sortBy, searchTerm, searchType]);

  const onSearch = (event) => {
    event.preventDefault();
    setSearch(true);
    setSearchResults([]);
    setDefaultSearchResults([]);
    setActive(false);
    setNoResultsFound(false);
    let url;
    if (searchType === "semantic") {
      url =
        "https://bsaj8zf1se.execute-api.us-east-2.amazonaws.com/prod/search/search/semantic?query=" +
        searchTerm +
        "&limit=" +
        limit;
    } else {
      url =
        "https://bsaj8zf1se.execute-api.us-east-2.amazonaws.com/prod/search/search?type=" +
        searchType +
        "&query=" +
        searchTerm;
    }

    fetch(url)
      .then((response) => response.json())
      .then(
        (results) => {
          let parsedResults = [];
          if (
            searchType === "semantic" &&
            JSON.parse(results)?.similarities &&
            JSON.parse(results)?.similarities?.length > 0
          ) {
            parsedResults = JSON.parse(results).similarities.map(
              (x) => x.features
            );
          }
          if (parsedResults.length === 0 && results.length === 0) {
            setSearchResults([]);
            setDefaultSearchResults([]);
            setNoResultsFound(true);
          } else if (parsedResults.length > 0) {
            setAlert(false);
            setNoResultsFound(false);
            setSearchResults(parsedResults);
            setDefaultSearchResults(parsedResults);
            saveState(SEARCH_TERM_STATE_NAME, searchTerm);
            saveState(SEARCH_RESULTS_STATE_NAME, parsedResults);
          } else {
            setSearchResults(results);
            setDefaultSearchResults(results);
            saveState(SEARCH_TERM_STATE_NAME, searchTerm);
            saveState(SEARCH_RESULTS_STATE_NAME, results);
            setAlert(false);
            setNoResultsFound(false);
            const instance = new Mark(".paragraph-text");
            instance.mark(searchTerm);
          }
          setActive(true);
          setSearch(false);
          saveState(SEARCH_TYPE_STATE_NAME, searchType);
        },
        (error) => {
          setAlert(true);
          setSearch(false);
        }
      );
  };

  const onSearchInputValueChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const onClearInput = () => {
    setSearchResults([]);
    setDefaultSearchResults([]);
    setSearchTerm("");
    setSearchType(SEMANTIC_SEARCH_TYPE);
    removeState(SEARCH_TERM_STATE_NAME);
    removeState(SEARCH_RESULTS_STATE_NAME);
    removeState(SEARCH_TYPE_STATE_NAME);
    setActive(false);
    setSearch(false);
    setNoResultsFound(false);
    setLimit(10);
  };

  const onReadMessage = (messageDate, index) => {
    history.push({
      pathname: "/read",
      state: { date: messageDate, ref: index },
    });
  };

  const onLoadMore = (event) => {
    event.preventDefault();
    setSearch(true);
    let newLimit = limit + 10;
    const url =
      "https://bsaj8zf1se.execute-api.us-east-2.amazonaws.com/prod/search/semantic?query=" +
      searchTerm +
      "&limit=" +
      newLimit;
    setLimit(limit + 10);
    fetch(url)
      .then((response) => response.json())
      .then(
        (results) => {
          const parsedResults = JSON.parse(results).similarities.map(
            (x) => x.features
          );
          setSearchResults(parsedResults);
          saveState(SEARCH_RESULTS_STATE_NAME, parsedResults);
          setSearch(false);
        },
        (error) => {
          setAlert(true);
          setSearch(false);
        }
      );
  };

  const openEmailClient = () => {
    window.open(
      "mailto:themessagesearch@gmail.com?subject=Contact%20regarding%20website"
    );
  };

  const onOpenFacebookClick = () => {
    window.open(
      "https://www.facebook.com/Igreja-Voz-do-S%C3%A9timo-Anjo-312711608747578"
    );
  };

  const onOpenYoutubeClick = () => {
    window.open("https://apps.apple.com/bf/app/apple-music/id1108187390");
  };

  const onSearchTypeChange = (event) => {
    if (event?.target?.labels[0]?.innerText !== searchType) {
      if (event.target.labels[0].innerText === "All words") {
        setSearchType("allwords");
      } else if (event.target.labels[0].innerText === "Exact match") {
        setSearchType("exact");
      } else {
        setSearchType(event.target.labels[0].innerText.toLowerCase());
      }
    }
  };

  const handleSortChange = (event) => {
    switch (event.target.value) {
      case SORT_BY_TITLE_ASC:
        setSortBy(SORT_BY_TITLE_ASC);
        searchResults.sort(function (a, b) {
          if (a.sermonTitle < b.sermonTitle) {
            return -1;
          }
          if (a.sermonTitle > b.sermonTitle) {
            return 1;
          }
          return 0;
        });
        setSearchResults(searchResults);
        break;
      case SORT_BY_TITLE_DEC:
        setSortBy(SORT_BY_TITLE_DEC);
        searchResults.sort(function (a, b) {
          if (a.sermonTitle > b.sermonTitle) {
            return -1;
          }
          if (a.sermonTitle < b.sermonTitle) {
            return 1;
          }
          return 0;
        });
        setSearchResults(searchResults);
        break;
      case SORT_BY_DATE_DEC:
        setSortBy(SORT_BY_DATE_DEC);
        searchResults.sort(function (a, b) {
          if (a.sermonDate > b.sermonDate) {
            return -1;
          }
          if (a.sermonDate < b.sermonDate) {
            return 1;
          }
          return 0;
        });
        setSearchResults(searchResults);
        break;
      case SORT_BY_DATE_ASC:
        setSortBy(SORT_BY_DATE_ASC);
        searchResults.sort(function (a, b) {
          if (a.sermonDate < b.sermonDate) {
            return -1;
          }
          if (a.sermonDate > b.sermonDate) {
            return 1;
          }
          return 0;
        });
        setSearchResults(searchResults);
        break;
      case SORT_BY_DEFAULT:
        setSortBy(SORT_BY_DEFAULT);
        const defaultResults = Object.assign([], defaultSearchResults);
        setSearchResults(defaultResults);
        break;
      default:
        break;
    }
  };

  const onCopyParagraphClick = (event) => {
    const textToCopy =
      event.sermonDate + " | " + event.sermonTitle + "\n" + event.section;
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <div className="container">
      <div className="search__container">
        {search || searchResults?.length > 0 || noResultsFound ? (
          <span></span>
        ) : (
          <div className="search__container__title">
            <div className="search__container__title--align">
              <h2 className="search__container__title__h2">THE MESSAGE</h2>
              <h1 className="search__container__title__h1">SEARCH</h1>
              <div className="search__container__title__description">
                Search the Message of Brother William Marrion Branham like never
                before, with this new semantic search, powered by the latest
                Machine Learning algorithms. Or use one of the other more common
                search methods we have available.
              </div>
            </div>

            <SearchingSVG></SearchingSVG>
          </div>
        )}
        <SearchInput
          onSearch={onSearch}
          onSearchInputValueChange={onSearchInputValueChange}
          onClearInput={onClearInput}
          searchTerm={searchTerm}
          searchType={searchType}
        ></SearchInput>
        {(!search || searchTerm) &&
        searchResults.length > 0 &&
        (searchType === "allwords" || searchType === "exact") ? (
          <FormControl
            style={{
              display: "flex",
              alignSelf: "center",
              margin: "1em 0",
              width: "12em",
            }}
          >
            <InputLabel id="sort-label">Sort</InputLabel>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              inputProps={{ "aria-label": "search sorting" }}
            >
              <MenuItem value={SORT_BY_DEFAULT}>
                <em>Default</em>
              </MenuItem>
              <MenuItem value={SORT_BY_TITLE_ASC}>Sermon title ASC</MenuItem>
              <MenuItem value={SORT_BY_TITLE_DEC}>Sermon title DESC</MenuItem>
              <MenuItem value={SORT_BY_DATE_ASC}>Sermon date ASC</MenuItem>
              <MenuItem value={SORT_BY_DATE_DEC}>Sermon date DESC</MenuItem>
            </Select>
          </FormControl>
        ) : (
          <></>
        )}

        {search || searchResults?.length > 0 || noResultsFound ? (
          <></>
        ) : (
          <SearchTypeRadioButtons
            onSearchTypeChange={onSearchTypeChange}
          ></SearchTypeRadioButtons>
        )}

        {search && !noResultsFound ? <LoadingSpinner></LoadingSpinner> : <></>}
        <ul className={active ? "transition" : ""}>
          {(!search || searchTerm) && searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <li key={index} className="message-paragraph">
                <span
                  onClick={() =>
                    onReadMessage(result.sermonDate, result.paragraph)
                  }
                >
                  <h5 className="message-title">
                    {result.sermonDate} | {result.sermonTitle}
                  </h5>
                  <div className="underline"></div>
                  <p className="paragraph-text">{result.section}</p>
                </span>
                <span className="copy-button">
                  <IconButton
                    aria-label="copy"
                    size="medium"
                    onClick={() => onCopyParagraphClick(result)}
                  >
                    <FileCopyIcon fontSize="medium" />
                  </IconButton>
                  <h5 className="copy-label">Copy</h5>
                </span>
              </li>
            ))
          ) : noResultsFound ? (
            <h3 className="no-results-found">
              No results found. Please try a different search.
            </h3>
          ) : (
            <></>
          )}
          {searchTerm &&
          searchResults.length > 0 &&
          searchType === "semantic" ? (
            <Button
              style={{
                display: "flex",
                marginTop: "5em",
                marginBottom: "9em",
                marginLeft: "auto",
                marginRight: "auto",
              }}
              size="medium"
              variant="outlined"
              onClick={onLoadMore}
              endIcon={<GetAppIcon></GetAppIcon>}
            >
              Load more
            </Button>
          ) : (
            <></>
          )}
        </ul>
        <ScrollToTop showUnder={160}>
          <ScrollUpButton></ScrollUpButton>
        </ScrollToTop>
      </div>
      <Collapse
        in={alert}
        style={{
          position: "absolute",
          top: "3em",
          right: 0,
          marginRight: "2em",
          marginLeft: "1em",
        }}
      >
        <Alert
          severity="error"
          style={{ marginBottom: "7em" }}
          action={
            <IconButton
              aria-label="close"
              size="small"
              onClick={() => {
                setAlert(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <AlertTitle>Error</AlertTitle>
          There was an error. Please try again, and if the issue continues,
          please contact us by email.
        </Alert>
      </Collapse>
      <div className="contacts">
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="Check out our Facebook page"
          onClick={onOpenFacebookClick}
          arrow
        >
          <IconButton aria-label="facebook" size="medium">
            <FacebookIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="Our iOS is coming soon!"
          arrow
        >
          <IconButton aria-label="apple" size="medium">
            <AppleIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="Our Android app is coming soon!"
          arrow
        >
          <IconButton aria-label="android" size="medium">
            <AndroidOutlinedIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="Check out our Youtube channel"
          onClick={onOpenYoutubeClick}
          arrow
        >
          <IconButton aria-label="youtube" size="medium">
            <YouTubeIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="Get in contact with us!"
          arrow
        >
          <IconButton
            aria-label="email"
            size="medium"
            onClick={openEmailClient}
          >
            <EmailIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
