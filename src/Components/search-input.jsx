import React from "react";

export default function SearchInput(props) {
  return (
    <form className="search__form">
      <input
        type="search"
        className="search__input"
        placeholder="Enter Search"
        value={props.searchTerm}
        onChange={props.onSearchInputValueChange}
      ></input>
      <button
        className="search__button"
        type="submit"
        onClick={props.onSearch}
        disabled={!props.searchTerm}
      >
        <i className="fa fa-search"></i>
      </button>
    </form>
  );
}
