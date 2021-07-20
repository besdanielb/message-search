import "./search.scss";
import React from "react";
import { useHistory } from "react-router-dom";

export default function Search() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const history = useHistory();

  const onSearch = (event) => {
    event.preventDefault();
    const url = "http://localhost:3001/search?title=" + searchTerm;
    fetch(url)
      .then((response) => response.json())
      .then(
        (results) => {
          setSearchResults(results);
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

  const onReadMessage = (messageDate) => {
    history.push({
      pathname: "/read",
      state: { date: messageDate },
    });
  };

  return (
    <div className="container">
      <div className="search__container">
        {searchResults?.length > 0 ? (
          <span></span>
        ) : (
          <h2>Search for a Message</h2>
        )}
        <form className="search__form">
          <input
            type="search"
            className="search__input"
            placeholder="Enter Search"
            value={searchTerm}
            onChange={onSearchInputValueChange}
          ></input>
          <button
            className="search__button"
            type="submit"
            onClick={onSearch}
            disabled={!searchTerm}
          >
            <i className="fa fa-search"></i>
          </button>
        </form>
        <ul>
          {searchTerm && searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <li key={index}>
                <p
                  className="message-title"
                  onClick={() => onReadMessage(result.sermonDate)}
                >
                  {result.sermonDate} | {result.sermonTitle}
                </p>
                <p>{result.paragraph}</p>
              </li>
            ))
          ) : (
            <></>
          )}
        </ul>
      </div>
    </div>
  );
}
