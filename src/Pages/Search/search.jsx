import "./search.scss";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import SearchInput from "../../Components/search-input";
import LoadingSpinner from "../../Components/loader";
import ScrollUpButton from "../../Components/scroll-up-button";
import FacebookIcon from "@material-ui/icons/Facebook";
import InstagramIcon from "@material-ui/icons/Instagram";
import EmailIcon from "@material-ui/icons/Email";
import AppleIcon from "@material-ui/icons/Apple";
import { Alert, AlertTitle } from "@material-ui/lab";
import Collapse from "@material-ui/core/Collapse";
import CloseIcon from "@material-ui/icons/Close";
import LanguageIcon from "@material-ui/icons/Language";
import AndroidOutlinedIcon from "@material-ui/icons/AndroidOutlined";
import { IconButton } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import Fade from "@material-ui/core/Fade";
import ScrollToTop from "react-scroll-up";
import Button from "@material-ui/core/Button";
import GetAppIcon from "@material-ui/icons/GetApp";
import {
  removeState,
  saveState,
  getState,
} from "../../Providers/localStorageProvider";
import SearchTypeRadioButtons from "../../Components/search-type-radio-buttons";

export default function Search() {
  const SEMANTIC_SEARCH_TYPE = "Semantic";
  const SEARCH_RESULTS_STATE_NAME = "searchResults";
  const SEARCH_TERM_STATE_NAME = "searchTerm";
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [search, setSearch] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [limit, setLimit] = React.useState(10);
  const [searchType, setSearchType] = React.useState(SEMANTIC_SEARCH_TYPE);
  const [noResultsFound, setNoResultsFound] = React.useState(false);
  const [alert, setAlert] = React.useState(false);
  const history = useHistory();

  // If there is search results in the local state, show them in the page
  useEffect(() => {
    if (getState(SEARCH_RESULTS_STATE_NAME)?.length > 0) {
      setSearchResults(getState(SEARCH_RESULTS_STATE_NAME));
      setSearchTerm(getState(SEARCH_TERM_STATE_NAME));
      setActive(true);
    }
  }, []);

  const onSearch = (event) => {
    event.preventDefault();
    setSearch(true);
    const url =
      "/search/?type=" +
      searchType +
      "&query=" +
      searchTerm +
      "&limit=" +
      limit;
    fetch(url)
      .then((response) => response.json())
      .then(
        (results) => {
          if (JSON.parse(results)?.similarities?.length > 0) {
            setAlert(false);
            const parsedResults = JSON.parse(results).similarities.map(
              (x) => x.features
            );
            setNoResultsFound(false);
            setSearchResults(parsedResults);
            saveState(SEARCH_TERM_STATE_NAME, searchTerm);
            saveState(SEARCH_RESULTS_STATE_NAME, parsedResults);
          } else {
            setNoResultsFound(true);
          }
          setActive(true);
          setSearch(false);
        },
        (error) => {
          setAlert(true);
          setSearch(false);
        }
      );
  };

  const onSearchInputValueChange = (event) => {
    setSearchResults([]);
    setSearchTerm(event.target.value);
  };

  const onClearInput = () => {
    setSearchResults([]);
    setSearchTerm("");
    removeState(SEARCH_TERM_STATE_NAME);
    removeState(SEARCH_RESULTS_STATE_NAME);
    setActive(false);
    setSearch(false);
    setNoResultsFound(false);
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
      "/search/?type=" +
      searchType +
      "&query=" +
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

  const onOpenAppleClick = () => {
    window.open("https://apps.apple.com/bf/app/apple-music/id1108187390");
  };

  const onSearchTypeChange = (event) => {
    if (event?.target?.labels[0]?.innerText !== searchType) {
      setSearchType(event.target.labels[0].innerText);
    }
  };

  return (
    <div className="container">
      <div className="search__container">
        {search || searchResults?.length > 0 || noResultsFound ? (
          <span></span>
        ) : (
          <h1 className="search__container__label">Message Search</h1>
        )}
        <SearchInput
          onSearch={onSearch}
          onSearchInputValueChange={onSearchInputValueChange}
          onClearInput={onClearInput}
          searchTerm={searchTerm}
          searchType={searchType}
        ></SearchInput>
        {search || searchResults?.length > 0 || noResultsFound ? (
          <></>
        ) : (
          <SearchTypeRadioButtons
            onSearchTypeChange={onSearchTypeChange}
          ></SearchTypeRadioButtons>
        )}

        {search && !noResultsFound ? <LoadingSpinner></LoadingSpinner> : <></>}
        <ul className={active ? "transition" : ""}>
          {searchTerm && searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <li
                key={index}
                onClick={() =>
                  onReadMessage(result.SermonDate, result.Paragraph)
                }
              >
                <h5 className="message-title">
                  {result.SermonDate} | {result.SermonTitle}
                </h5>
                <div className="underline"></div>
                <p className="paragraph-text">{result.Section}</p>
              </li>
            ))
          ) : (
            <h3 className="no-results-found">
              No results found. Please try a different search.
            </h3>
          )}
          {searchTerm && searchResults.length > 0 ? (
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
          marginRight: "3em",
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
          arrow
        >
          <IconButton aria-label="facebook" size="medium">
            <FacebookIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="Check out our Instagram"
          arrow
        >
          <IconButton aria-label="instagram" size="medium">
            <InstagramIcon fontSize="medium" />
          </IconButton>
        </Tooltip>

        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="You can download our app for IOS from the App store"
          arrow
        >
          <IconButton
            aria-label="apple"
            size="medium"
            onClick={onOpenAppleClick}
          >
            <AppleIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="You can download our app for Android from the Google Play store"
          arrow
        >
          <IconButton aria-label="android" size="medium">
            <AndroidOutlinedIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="Check out our church website"
          arrow
        >
          <IconButton aria-label="website" size="medium">
            <LanguageIcon fontSize="medium" />
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
