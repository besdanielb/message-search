// src/Pages/ReadPage/Read.js

import "./read.scss";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import ScrollUpButton from "../../Components/scroll-up-button";
import ScrollToTop from "react-scroll-up";
import Highlighter from "react-highlight-words";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../index";
import ReadSkeleton from "../../Components/read-skeleton";

export default function Read() {
  const [messageToRead, setMessageToRead] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const location = useLocation();

  // Ref to track if the component is mounted
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchSermon = async () => {
      if (location?.state?.date) {
        setIsLoading(true);
        setError(null);

        const url = `https://bsaj8zf1se.execute-api.us-east-2.amazonaws.com/prod/ReadingSermonFromMySQL?sermon=${location.state.date}`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const results = await response.json();
          if (isMountedRef.current) {
            setMessageToRead(results);
            logEvent(analytics, "read_sermon", {
              sermon_date: location.state.date,
              sermon_title: results[0]?.title,
            });
          }
        } catch (err) {
          if (isMountedRef.current) {
            console.error("Fetch error:", err);
            setError("Failed to load the sermon. Please try again later.");
          }
        } finally {
          if (isMountedRef.current) {
            setIsLoading(false);
          }
        }
      }
    };

    fetchSermon();

    return () => {
      isMountedRef.current = false;
    };
  }, [location?.state?.date]);

  // Effect to handle scrolling after messages are set
  useEffect(() => {
    if (messageToRead.length > 0) {
      executeScroll(location?.state?.ref);
    }
  }, [messageToRead, location?.state?.ref]);

  const executeScroll = (i) => {
    const element = document.getElementById(i) || document.getElementById(1);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      console.warn(`Element with id "${i}" not found.`);
    }
  };

  // Handle copy event with proper cleanup
  useEffect(() => {
    const addSermonInfo = (event) => {
      const selection = window.getSelection();
      let sermonInfo = "";
      let copyText = "";

      if (messageToRead[0] && !selection.toString().includes(messageToRead[0].sermonDate)) {
        sermonInfo = `${messageToRead[0]?.sermonDate} | ${messageToRead[0]?.sermonTitle}`;
      }

      copyText = `${sermonInfo}\n${selection}`;

      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-99999px";
      tempDiv.style.whiteSpace = "pre-line";
      tempDiv.textContent = copyText;

      document.body.appendChild(tempDiv);
      selection.selectAllChildren(tempDiv);

      window.setTimeout(() => {
        document.body.removeChild(tempDiv);
      }, 100);
    };

    document.addEventListener("copy", addSermonInfo);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("copy", addSermonInfo);
    };
  }, [messageToRead]);

  const renderSermonList = () => {
    if (location?.state?.searchType === "semantic") {
      return messageToRead.map((entry) => (
        <li
          key={entry.paragraph}
          id={entry.paragraph}
          className={+location?.state?.ref === entry.paragraph ? "highlight" : ""}
        >
          <p>
            <span className="index">{entry.paragraph}</span> {entry.section}
          </p>
        </li>
      ));
    } else {
      return messageToRead.map((entry) =>
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
    }
  };

  return (
    <section className="container">
      <div className="read__container">
        {isLoading && <ReadSkeleton />}
        {error && <div className="error">{error}</div>}
        {!isLoading && !error && (
          <>
            {(messageToRead[0]?.sermonDate || messageToRead[0]?.sermonTitle) && (
              <h1 className="read-message-title">
                {messageToRead[0]?.sermonDate} | {messageToRead[0]?.sermonTitle}
              </h1>
            )}
            <ul>{renderSermonList()}</ul>
            <ScrollToTop showUnder={260}>
              <ScrollUpButton aria-label="scroll to the top" />
            </ScrollToTop>
          </>
        )}
      </div>
    </section>
  );
}
