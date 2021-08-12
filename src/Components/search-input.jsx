import React from "react";
import { IconButton } from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";

const useStyles = makeStyles((theme) => ({
  clearButton: {
    margin: theme.spacing(1),
    position: "absolute",
    marginTop: "1.1em",
    marginRight: "3.5em",
  },
}));

export default function SearchInput(props) {
  const classes = useStyles();

  return (
    <form className="search__form">
      <input
        type="text"
        className="search__input"
        style={{ position: "relative" }}
        placeholder={
          props.searchType === "Semantic"
            ? "Enter your search (minimum 5 characters)"
            : "Enter Search"
        }
        value={props.searchTerm}
        onChange={props.onSearchInputValueChange}
      ></input>
      {props?.searchTerm ? (
        <IconButton
          aria-label="clear input"
          className={classes.clearButton}
          onClick={props?.onClearInput}
          size="small"
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      ) : (
        <></>
      )}
      <button
        className="search__button"
        type="submit"
        onClick={props.onSearch}
        disabled={
          !props.searchTerm ||
          (props.searchType === "Semantic" && props.searchTerm.length < 5)
        }
      >
        <SearchIcon fontSize="small"></SearchIcon>
      </button>
    </form>
  );
}
