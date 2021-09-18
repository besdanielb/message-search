import "./read.scss";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ScrollUpButton from "../../Components/scroll-up-button";
import ScrollToTop from "react-scroll-up";
import Highlighter from "react-highlight-words";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../index";

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
              logEvent(analytics, "read_sermon", {
                sermon_date: location.state?.date,
                sermon_title: results[0]?.title,
              });
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

  const addSermonInfo = () => {
    //Get the selected text and append the extra info
    const selection = window.getSelection();
    let sermonInfo = "";
    let copytext = "";
    let newdiv;
    if (
      messageToRead[0] &&
      !selection.toString().includes(messageToRead[0].sermonDate)
    ) {
      sermonInfo =
        messageToRead[0]?.sermonDate + " | " + messageToRead[0]?.sermonTitle;
    }

    copytext = sermonInfo + "\n" + selection;

    //Create a new div to hold the prepared text
    newdiv = document.createElement("div");

    //hide the newly created container
    newdiv.style.position = "absolute";
    newdiv.style.left = "-99999px";
    newdiv.style.whiteSpace = "pre-line";

    //insert the container, fill it with the extended text, and define the new selection
    document.body.appendChild(newdiv);
    newdiv.innerHTML = copytext;
    selection.selectAllChildren(newdiv);

    window.setTimeout(function () {
      document.body.removeChild(newdiv);
    }, 100);
  };
  document.addEventListener("copy", addSermonInfo);

  const showSermonFromSemanticSearch = () => {
    return messageToRead?.map((entry) => (
      <li
        key={entry.paragraph}
        id={entry.paragraph}
        className={location?.state?.ref === entry.paragraph ? "highlight" : ""}
      >
        <p>
          <span className="index">{entry.paragraph}</span> {entry.section}
        </p>
      </li>
    ));
  };

  const showSermonFromAllWordsOrExactSearch = () => {
    return messageToRead?.map((entry) =>
      entry.paragraph === location?.state?.ref ? (
        <li key={entry.paragraph} id={entry.paragraph} className="highlight">
          <p>
            <span className="index">{entry.paragraph} </span>
            <Highlighter
              activeStyle={{
                backgroundColor: "yellow",
                color: "black",
              }}
              searchWords={location?.state?.searchTerm?.split(" ")}
              autoEscape={true}
              textToHighlight={entry.section}
            />
          </p>
        </li>
      ) : (
        <li key={entry.paragraph} id={entry.paragraph}>
          <p>
            <span className="index">{entry.paragraph}</span> {entry.section}
          </p>
        </li>
      )
    );
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
          {location?.state?.searchType === "semantic"
            ? showSermonFromSemanticSearch()
            : showSermonFromAllWordsOrExactSearch()}
        </ul>
        <ScrollToTop showUnder={260}>
          <ScrollUpButton aria-label="scroll to the top"></ScrollUpButton>
        </ScrollToTop>
      </div>
    </section>
  );
}
