import { FormControl, InputLabel, ListItem, ListItemText, MenuItem, Select } from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { SORT_OPTIONS } from "../../constants";

export default function SortOptions ({ sortBy, handleSortChange }) {

  return (
  <FormControl
    style={{
      display: "flex",
      alignSelf: "center",
      margin: "1em 0",
      width: "12em",
    }}
  >
    <InputLabel id="sort-label">Sort</InputLabel>
    <Select
      labelId="sort-label"
      value={sortBy}
      onChange={handleSortChange}
      inputProps={{
        "aria-label": "search sorting",
        MenuProps: { disableScrollLock: true },
      }}
    >
      <MenuItem value={SORT_OPTIONS.DEFAULT}>
        <ListItemText primary="Default" />
      </MenuItem>
      <MenuItem value={SORT_OPTIONS.TITLE_ASC}>
        <ListItemText primary="Sermon Title" />
        <ListItem>
          <ArrowUpwardIcon />
        </ListItem>
      </MenuItem>
      <MenuItem value={SORT_OPTIONS.TITLE_DEC}>
        <ListItemText primary="Sermon Title" />
        <ListItem>
          <ArrowDownwardIcon />
        </ListItem>
      </MenuItem>
      <MenuItem value={SORT_OPTIONS.DATE_ASC}>
        <ListItemText primary="Sermon Date" />
        <ListItem>
          <ArrowUpwardIcon />
        </ListItem>
      </MenuItem>
      <MenuItem value={SORT_OPTIONS.DATE_DEC}>
        <ListItemText primary="Sermon Date" />
        <ListItem>
          <ArrowDownwardIcon />
        </ListItem>
      </MenuItem>
    </Select>
  </FormControl>
  );
};