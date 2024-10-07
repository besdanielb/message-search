import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import { useContext } from "react";
import { ThemeContext } from "../../Providers/themeContext";

export default function SearchInput(props) {
  const { theme } = useContext(ThemeContext); 

  return (
    <form className="search__form" noValidate autoComplete="off">
      <TextField
        sx={{
          marginTop: "25px",
          "& > *": {
            margin: 1,
            width: "70vw",
            maxWidth: "63em",
            borderRadius: "10px",
            paddingLeft: "5px",
            "@media (max-width:600px)": {
              width: "90vw",
            },
          },
          "& label.Mui-focused": {
            color: 'var(--text-color)',
          },
          "& .MuiInput-underline:after": {
            borderColor: 'var(--text-color)',
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              border: '3px solid var(--text-color)',
            },
            "&.Mui-focused fieldset": {
              border: '3px solid var(--text-color)',
              color: 'var(--text-color)',
            },
            "&:hover fieldset": {
              cursor: "pointer",
              borderColor: 'var(--text-color)',
              boxShadow:  theme === 'dark' ? 'none' : "0px 4px 10px var(--hover-input)",
            },
          },
        }}
        id="search-input"
        label={"Enter your search terms here"}
        variant="outlined"
        type="text"
        value={props.searchTerm}
        onChange={props.onSearchInputValueChange}
        onSubmit={props.onSearch}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" >
              {props.searchTerm ? (
                <IconButton
                  onClick={props.onClearInput}
                  aria-label="clear search"
                >
                  <ClearIcon sx={{color: "var(--text-color)"}} />
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
                <SearchIcon  sx={{color: "var(--text-color)"}}/>
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </form>
  );
}
