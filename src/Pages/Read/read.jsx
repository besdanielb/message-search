import "./read.scss";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ScrollUpButton from "../../Components/scroll-up-button";
import ScrollToTop from "react-scroll-up";

export default function Read() {
  const [messageToRead, setMessageToRead] = React.useState([]);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    if (location?.state?.date) {
      const url =
        "https://bsaj8zf1se.execute-api.us-east-2.amazonaws.com/prod/ReadingSermonFromMySQL?sermon=" +
        location?.state?.date;
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
      element = document.getElementById(1);
    }
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <section className="container">
      <div className="read__container">
        {messageToRead[0]?.sermonDate || messageToRead[0]?.sermonTitle ? (
          <h1 className="message-title">
            {messageToRead[0]?.sermonDate} | {messageToRead[0]?.sermonTitle}
          </h1>
        ) : (
          <></>
        )}
        <ul>
          {messageToRead?.map((entry) => (
            <li
              key={entry.paragraph}
              id={entry.paragraph}
              className={
                location?.state?.ref === entry.paragraph ? "highlight" : ""
              }
            >
              <p>
                <span className="index">{entry.paragraph}</span> {entry.section}
              </p>
            </li>
          ))}
        </ul>
        <ScrollToTop showUnder={160}>
          <ScrollUpButton></ScrollUpButton>
        </ScrollToTop>
      </div>
    </section>
  );
}
