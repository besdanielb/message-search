import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "70vw",
      maxWidth: "63em",
      borderRadius: "30px",
      paddingLeft: "5px",
    },
    "& label.Mui-focused": {
      color: "var(--dark-color)",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "var(--grey-color)",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "var(--dark-color)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--dark-color)",
      },
      "&:hover fieldset": {
        cursor: "pointer",
      },
    },
  },
}));

export default function SearchInput(props) {
  const classes = useStyles();

  return (
    <form className="search__form" noValidate autoComplete="off">
      <TextField
        className={classes.root}
        id="search-input"
        label="Search the Message"
        variant="outlined"
        type="text"
        value={props.searchTerm}
        onChange={props.onSearchInputValueChange}
        onSubmit={props.onSearch}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {props.searchTerm ? (
                <IconButton onClick={props.onClearInput}>
                  <ClearIcon />
                </IconButton>
              ) : (
                <></>
              )}
              <IconButton
                type="submit"
                onClick={props.onSearch}
                disabled={!props.searchTerm}
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </form>
  );
}
