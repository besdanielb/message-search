import React, { useState } from "react";
import { Card, CardContent, Typography, Button, Slide, IconButton } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
	Close,
	Lightbulb,
} from "@mui/icons-material";
import "./hint-card.scss"; // Custom styles

const hints = [
  "The 'Semantic' search uses AI to find related results in the whole Message, based on meaning. Queries with 'Holy Spirit' will also return results with 'Holy Ghost'.",
  "The 'Exact' search looks for exact matches of your search term within the Message database. Queries with 'Holy Spirit' will return results that contain exactly 'Holy Spirit'.",
  "The 'All Words' search type ensures all words in your query are included in the results. Queries with 'Holy Spirit' will return results that contains 'Holy Spirit', 'Holy' and 'Spirit'.",
];

export default function HintCard({ visible, onClose }) {
  const [currentHint, setCurrentHint] = useState(0);

  const nextHint = () => {
    if (currentHint < hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
  };

  const prevHint = () => {
    if (currentHint > 0) {
      setCurrentHint(currentHint - 1);
    }
  };

	const handleClose = () => {
    onClose();
  };

  return (
    <Slide direction="right"  in={visible} mountOnEnter unmountOnExit timeout={500}>
      <div className="hint-card-wrapper">
			<div className="hint-card-animation"></div>
        <Card className="hint-card">
          <CardContent className="hint-card__content">
            <div className="hint-card__header">
              <Typography variant="h6" className="hint-title">
                <Lightbulb className="hint-icon" />
                Hint #{currentHint + 1}
              </Typography>
              <IconButton aria-label="close" onClick={handleClose}>
                <Close />
              </IconButton>
            </div>
            <Typography variant="body1" className="hint-description">
              {hints[currentHint]}
            </Typography>
            <div className="hint-card__controls">
						<Button
                onClick={prevHint}
                disabled={currentHint === 0}
                startIcon={<ArrowBackIcon />}
                variant="contained"
                className="small-hint-button"
								size="small"
              >
                Prev
              </Button>
              <Button
                onClick={nextHint}
                disabled={currentHint === hints.length - 1}
                endIcon={<ArrowForwardIcon />}
                variant="contained"
                className="small-hint-button"
								size="small"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Slide>
  );
}
