// src/Pages/Read/Read.js

import "./read.scss";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ScrollUpButton from "../../Components/scroll-up-button";
import ScrollToTop from "react-scroll-up";
import Highlighter from "react-highlight-words";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../index";
import ReadSkeleton from "../../Components/skeleton/read-skeleton";

export default function Read() {
  // Extract URL parameters
  const { date, ref } = useParams(); // :date and :ref from the URL
  const [searchParams] = useSearchParams(); // Query parameters: q and type

  // Extract query parameters
  const searchTerm = searchParams.get("q") || "";
  const searchType = searchParams.get("type") || "semantic"; // Default to 'semantic' if not provided

  // State management
  const [messageToRead, setMessageToRead] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Ref to track if the component is mounted
  const isMountedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    isMountedRef.current = true;

    console.log(`Navigating to Read Component with date: ${date}, ref: ${ref}`);

    if (!date) {
      // If date parameter is missing, redirect to Home or show an error
      navigate("/", { replace: true });
      return;
    }

    const fetchSermon = async () => {
      if (date) {
        setIsLoading(true);
        setError(null);

        // Adjust the API URL based on whether 'ref' is present
        const url = ref
          ? `https://bsaj8zf1se.execute-api.us-east-2.amazonaws.com/prod/ReadingSermonFromMySQL?sermon=${date}&ref=${ref}`
          : `https://bsaj8zf1se.execute-api.us-east-2.amazonaws.com/prod/ReadingSermonFromMySQL?sermon=${date}`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const results = await response.json();

          if (isMountedRef.current) {
            setMessageToRead(results);
            logEvent(analytics, "read_sermon", {
              sermon_date: date,
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
  }, [date, ref, navigate]);

  // Effect to handle scrolling after messages are set
  useEffect(() => {
    if (messageToRead.length > 0 && ref) {
      executeScroll(ref);
    } else if (messageToRead.length > 0) {
      // If ref is not provided, scroll to the first paragraph
      executeScroll(1);
    }
  }, [messageToRead, ref]);

  // Function to scroll to a specific paragraph
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

  // Function to render the sermon list
  const renderSermonList = () => {
    if (searchType === "semantic") {
      return messageToRead.map((entry) => (
        <li
          key={entry.paragraph}
          id={entry.paragraph}
          className={+ref === entry.paragraph ? "highlight" : ""}
        >
          <p>
            <span className="index">{entry.paragraph}</span> {entry.section}
          </p>
        </li>
      ));
    } else {
      return messageToRead.map((entry) =>
        entry.paragraph === ref ? (
          <li key={entry.paragraph} id={entry.paragraph} className="highlight">
            <p>
              <span className="index">{entry.paragraph} </span>
              <Highlighter
                activeStyle={{
                  backgroundColor: "yellow",
                  color: "black",
                }}
                searchWords={searchTerm.split(" ")}
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
    <section className="read-container">
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
