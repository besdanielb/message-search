import React from "react";
import "./search-type-radio-buttons.scss";
import Tooltip from "@material-ui/core/Tooltip";
import Fade from "@material-ui/core/Fade";

export default function SearchTypeRadioButtons(props) {
  return (
    <div className="wrapper">
      <input
        type="radio"
        name="select"
        id="option-1"
        checked={props.searchType === "semantic"}
        aria-label="semantic search"
        onChange={props.onSearchTypeChange}
      />
      <input
        type="radio"
        name="select"
        id="option-2"
        checked={props.searchType === "exact"}
        aria-label="exact match search"
        onChange={props.onSearchTypeChange}
      />
      <input
        type="radio"
        name="select"
        id="option-3"
        checked={props.searchType === "allwords"}
        aria-label="All words search"
        onChange={props.onSearchTypeChange}
      />
      <Tooltip
        TransitionComponent={Fade}
        placement="left"
        TransitionProps={{ timeout: 600 }}
        title={
          <div style={{ fontSize: "16px", lineHeight: "20px" }}>
            Dynamic search matches relevant terms to your search query, e.g.
            searches with “Holy Spirit” will also return results with “Holy
            Ghost”.
          </div>
        }
        arrow
      >
        <label htmlFor="option-1" className="option option-1">
          <div className="dot"></div>
          <span>Dynamic</span>
        </label>
      </Tooltip>
      <Tooltip
        TransitionComponent={Fade}
        placement="top"
        TransitionProps={{ timeout: 600 }}
        title={
          <div style={{ fontSize: "16px", lineHeight: "20px" }}>
            Exact Match will search for the exact phrase that you type in,
            within the Message database.
          </div>
        }
        arrow
      >
        <label htmlFor="option-2" className="option option-2">
          <div className="dot"></div>
          <span>Exact match</span>
        </label>
      </Tooltip>
      <Tooltip
        TransitionComponent={Fade}
        placement="right"
        TransitionProps={{ timeout: 600 }}
        title={
          <div style={{ fontSize: "16px", lineHeight: "20px" }}>
            All words that are typed in, and are relevant to your search, will
            be shown in the search results.
          </div>
        }
        arrow
      >
        <label htmlFor="option-3" className="option option-3">
          <div className="dot"></div>
          <span>All words</span>
        </label>
      </Tooltip>
    </div>
  );
}
