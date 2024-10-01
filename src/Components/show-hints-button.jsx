import React from "react";
import { IconButton, Tooltip, Fade } from "@mui/material";
import { Lightbulb as LightbulbIcon } from "@mui/icons-material";
import "./show-hints-button.scss";

export default function ShowHintsButton({ onClick }) {
  return (
    <Fade in timeout={1000}>
      <div className="show-hints-button">
        <Tooltip title="Show hints" placement="bottom">
          <IconButton color="primary" onClick={onClick} aria-label="show hints">
            <LightbulbIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </div>
    </Fade>
  );
}
