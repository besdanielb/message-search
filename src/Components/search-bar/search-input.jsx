import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import { COLORS } from "../../constants";

export default function SearchInput(props) {
  return (
    <form className="search__form" noValidate autoComplete="off">
      <TextField
        sx={{
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
            color: COLORS.darkBlue,
          },
          "& .MuiInput-underline:after": {
            borderBottomColor: COLORS.darkBlue,
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: COLORS.darkBlue,
            },
            "&.Mui-focused fieldset": {
              borderColor: COLORS.darkBlue,
            },
            "&:hover fieldset": {
              cursor: "pointer",
              boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)",
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
