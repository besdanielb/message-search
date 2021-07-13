import "./App.scss";
import React from "react";

function App() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [messageToRead, setMessageToRead] = React.useState();

  const onSearch = () => {
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
    setSearchTerm(event.target.value);
  };

  const onReadMessage = (messageDate) => {
    const url = "http://localhost:3001/message/" + messageDate;
    fetch(url)
      .then((response) => response.json())
      .then(
        (results) => {
          setMessageToRead(results);
        },
        (error) => {
          console.log("error: " + error);
        }
      );
  };

  const goBackToSearch = () => {
    setMessageToRead(null);
  };

  if (!messageToRead) {
    return (
      <>
        <div>Search for a message:</div>
        <input
          type="text"
          placeholder="Enter Search"
          value={searchTerm}
          onChange={onSearchInputValueChange}
        />
        <button onClick={onSearch} disabled={!searchTerm}>
          <i className="fa fa-search"></i>
        </button>
        <ul>
          {searchResults.map((result, index) => (
            <li key={index} onClick={() => onReadMessage(result.sermonDate)}>
              {result.sermonDate} | {result.sermonTitle} | {result.paragraph}
            </li>
          ))}
        </ul>
      </>
    );
  } else {
    return (
      <>
        <div>Message {messageToRead?.sermonTitle}</div>
        <ul>
          {messageToRead?.paragraphs.map((paragraph, index) => (
            <li key={index}>{paragraph}</li>
          ))}
        </ul>
        <button onClick={goBackToSearch}>Go back to search</button>
      </>
    );
  }
}

export default App;
