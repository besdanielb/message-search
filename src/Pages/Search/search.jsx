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

export default function Search() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [search, setSearch] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const history = useHistory();
  const SEARCH_RESULTS_STATE_NAME = "searchResults";
  const SEARCH_TERM_STATE_NAME = "searchTerm";

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
    const url = "http://localhost:3001/search?title=" + searchTerm;
    fetch(url)
      .then((response) => response.json())
      .then(
        (results) => {
          setTimeout(() => {
            setActive(true);
            setSearchResults(results);
            saveState(SEARCH_TERM_STATE_NAME, searchTerm);
            saveState(SEARCH_RESULTS_STATE_NAME, results);
            setSearch(false);
          }, 2500);
        },
        (error) => {
          console.log("error: " + error);
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
    const url = "http://localhost:3001/search/load-more";
    fetch(url)
      .then((response) => response.json())
      .then(
        (results) => {
          setTimeout(() => {
            setSearchResults(results);
            saveState(SEARCH_RESULTS_STATE_NAME, results);
            setSearch(false);
          }, 1000);
        },
        (error) => {
          console.log("error: " + error);
        }
      );
  };

  const openEmailClient = () => {
    window.open(
      "mailto:message-search@gmail.com?subject=Contact%20regarding%20website"
    );
  };

  const onOpenAppleClick = () => {
    window.open("https://apps.apple.com/bf/app/apple-music/id1108187390");
  };

  return (
    <div className="container">
      <div className="search__container">
        {search || searchResults?.length > 0 ? (
          <span></span>
        ) : (
          <h1 className="search__container__label">Message Search</h1>
        )}
        <SearchInput
          onSearch={onSearch}
          onSearchInputValueChange={onSearchInputValueChange}
          onClearInput={onClearInput}
          searchTerm={searchTerm}
        ></SearchInput>
        {search ? <LoadingSpinner></LoadingSpinner> : <></>}
        <ul className={active ? "transition" : ""}>
          {searchTerm && searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <li
                key={index}
                onClick={() =>
                  onReadMessage(result.sermonDate, result.paragraphNumber)
                }
              >
                <h5 className="message-title">
                  {result.sermonDate} | {result.sermonTitle}
                </h5>
                <div className="underline"></div>
                <p className="paragraph-text">{result.paragraph}</p>
              </li>
            ))
          ) : (
            <></>
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
          title="You can download out app for IOS from the App store"
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
          title="You can download out app for Android from the Google Play store"
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
