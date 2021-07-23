import "./read.scss";
import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function Read(props) {
  const [messageToRead, setMessageToRead] = React.useState();
  let refs = useRef([
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef(),
  ]);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    if (location?.state?.date) {
      const url = "http://localhost:3001/message/" + location?.state?.date;
      fetch(url)
        .then((response) => response.json())
        .then(
          (results) => {
            if (isMounted) {
              setMessageToRead(results);
              executeScroll(location?.state?.ref);
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
  }, [location?.state?.date]);

  const executeScroll = (i) => {
    refs.current[i].current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (messageToRead) {
    return (
      <section className="container">
        <div className="read__container">
          <h2 className="message-title">{messageToRead.sermonTitle}</h2>
          <ul>
            {messageToRead?.paragraphs.map((paragraph, index) => (
              <li key={index} ref={refs.current[index]}>
                <p>
                  <span className="index">{index}</span> {paragraph}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  } else {
    return (
      <section className="container">
        <div className="read__container">
          <h2>Read Messages For Free</h2>
          <p>Table with list of messages</p>
        </div>
      </section>
    );
  }
}
