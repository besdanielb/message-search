import React from "react";
import "./search-type-radio-buttons.scss";

export default function SearchTypeRadioButtons(props) {
  return (
    <div className="wrapper">
      <input
        type="radio"
        name="select"
        id="option-1"
        defaultChecked
        onClick={props.onSearchTypeChange}
      />
      <input
        type="radio"
        name="select"
        id="option-2"
        onClick={props.onSearchTypeChange}
      />
      <input
        type="radio"
        name="select"
        id="option-3"
        onClick={props.onSearchTypeChange}
      />
      <label htmlFor="option-1" className="option option-1">
        <div className="dot"></div>
        <span>Semantic</span>
      </label>
      <label htmlFor="option-2" className="option option-2">
        <div className="dot"></div>
        <span>Exact match</span>
      </label>
      <label htmlFor="option-3" className="option option-3">
        <div className="dot"></div>
        <span>All words</span>
      </label>
    </div>
  );
}
