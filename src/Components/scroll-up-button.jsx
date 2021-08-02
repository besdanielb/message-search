import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Fab from "@material-ui/core/Fab";

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
    position: "fixed",
    right: "3em",
    bottom: "3em",
  },
}));

export default function ScrollUpButton() {
  const classes = useStyles();
  return (
    <Fab aria-label="scroll up" className={classes.margin}>
      <KeyboardArrowUpIcon fontSize="large" />
    </Fab>
  );
}
