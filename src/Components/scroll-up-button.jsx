import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Fab from "@mui/material/Fab";

export default function ScrollUpButton() {
  return (
    <Fab aria-label="scroll up" sx={{ margin: {
      margin: 1,
      position: "fixed",
      right: "3em",
      bottom: "7em",
    },}}>
      <KeyboardArrowUpIcon fontSize="large" />
    </Fab>
  );
}
