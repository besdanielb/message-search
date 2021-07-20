import "./read.scss";
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

export default function Read(props) {
  const [messageToRead, setMessageToRead] = React.useState();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (location?.state?.date) {
      const url = "http://localhost:3001/message/" + location?.state?.date;
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
    }
  }, [location?.state?.date]);

  const goBackToSearch = () => {
    setMessageToRead(null);
    history.push("/search");
  };

  if (messageToRead) {
    return (
      <section className="container">
        <div className="content">
          <div>Message {messageToRead.sermonTitle}</div>
          <ul>
            {messageToRead?.paragraphs.map((paragraph, index) => (
              <li key={index}>{paragraph}</li>
            ))}
          </ul>
          <button onClick={goBackToSearch}>Go back to search</button>
        </div>
      </section>
    );
  } else {
    return <div>Read Messages For Free</div>;
  }
}
