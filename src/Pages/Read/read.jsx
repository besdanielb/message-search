import "./read.scss";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Read() {
  const [messageToRead, setMessageToRead] = React.useState();
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
  }, [location?.state?.date, location?.state?.ref]);

  const executeScroll = (i) => {
    let element;
    if (i) {
      element = document.getElementById(i);
    } else {
      element = document.getElementById(0);
    }
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <section className="container">
      <div className="read__container">
        <h1 className="message-title">{messageToRead?.sermonTitle}</h1>
        <ul>
          {messageToRead?.paragraphs.map((paragraph, index) => (
            <li
              key={index}
              id={index}
              className={location?.state?.ref === index ? "highlight" : ""}
            >
              <p>
                <span className="index">{index}</span> {paragraph}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
