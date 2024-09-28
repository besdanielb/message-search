import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

export default function SearchInput(props) {
  return (
    <form className="search__form" noValidate autoComplete="off">
      <TextField
        sx={{
          "& > *": {
            margin: 1, 
            width: "70vw",
            maxWidth: "63em",
            borderRadius: "30px",
            paddingLeft: "5px",
            "@media (max-width:600px)": {
              width: "90vw",
            },
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
        }}
        id="search-input"
        label={"Search the " + props.searchBook}
        variant="outlined"
        type="text"
        value={props.searchTerm}
        onChange={props.onSearchInputValueChange}
        onSubmit={props.onSearch}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {props.searchTerm ? (
                <IconButton
                  onClick={props.onClearInput}
                  aria-label="clear search"
                >
                  <ClearIcon />
                </IconButton>
              ) : (
                <></>
              )}
              <IconButton
                type="submit"
                aria-label="submit search"
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
