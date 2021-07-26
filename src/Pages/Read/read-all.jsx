import "./read.scss";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import SearchInput from "../../Components/search-input";

export default function ReadAll(props) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const history = useHistory();

  useEffect(() => {
    let isMounted = true;
    const url = "http://localhost:3001/all-messages";
    if (messages?.length === 0) {
      fetch(url)
        .then((response) => response.json())
        .then(
          (messages) => {
            if (isMounted) {
              setMessages(messages);
            }
          },
          (error) => {
            console.log("error: " + error);
          }
        );
    }
    return () => {
      isMounted = false;
    };
  }, [messages]);

  const onSearch = (event) => {
    event.preventDefault();
  };

  const onSearchInputValueChange = (event) => {
    setSearchTerm(event.target.value);
    const results = messages.filter((message) =>
      message.sermonTitle
        .toLowerCase()
        .includes(event.target.value.toLowerCase())
    );
    setMessages(results);
  };

  const onReadMessage = (messageDate) => {
    history.push({
      pathname: "/read",
      state: { date: messageDate },
      // TODO READ PAGE WITHOUT REF
    });
  };

  return (
    <div className="container">
      <div className="search__container"></div>
      {messages?.length > 0 ? <span></span> : <h2>Search for a Message</h2>}
      <SearchInput
        onSearch={onSearch}
        onSearchInputValueChange={onSearchInputValueChange}
        searchTerm={searchTerm}
      ></SearchInput>
      <ul>
        {messages?.length > 0 ? (
          messages.map((result, index) => (
            <li
              key={index}
              onClick={() =>
                onReadMessage(result.sermonDate, result.paragraphNumber)
              }
            >
              <p className="message-title">
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
  );
}
