import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  FileCopy,
  ReadMore,
} from "@mui/icons-material";
import { SEMANTIC_SEARCH_TYPE } from "../../constants";
import Highlighter from "react-highlight-words";
import AOS from "aos";
import { useContext, useEffect } from "react";
import { ThemeContext } from "../../Providers/themeContext";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function SearchResultItem({
  result,
  onReadMessage,
  onCopyParagraph,
  searchType,
  wordsToHighlight,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  
  // Corrected: Remove multiplication by 100
  const originalDistance = result.distance * 100; // Assumes result.distance is between 0-70

  const convertDistanceScore = (distanceScore) => {
    // Clamp the distanceScore between 0 and 70
    const clampedDistance = Math.max(0, Math.min(distanceScore, 70));
    
    // Perform the linear transformation
    const newScore = 100 - (clampedDistance / 70) * 100 + 40 ;
    
    return newScore;
  };

  const mappedDistance = convertDistanceScore(originalDistance); // Mapped to 0-100

  const {theme: contextTheme} = useContext(ThemeContext);

  useEffect(() => {
    AOS.refresh();
  }, [result]);

  const getDistanceColor = (mappedDistance) => {
    if (mappedDistance >= 65) { // Strong green for best scores
      return '#4CAF50';
    } else if (mappedDistance >= 55) {
      return '#81C784';
    } else if (mappedDistance >= 50) {
      return '#FFEB3B';
    } else if (mappedDistance >= 30) {
      return '#FF9800';
    } else {
      return '#F44336';
    }
  };

  // Function to get tooltip text based on mapped distance
  const getTooltipText = (mappedDistance) => {
    if (mappedDistance >= 65) {
      return "This is a very relevant result";
    } else if (mappedDistance >= 55) {
      return "This is a relevant result";
    } else if (mappedDistance >= 50) {
      return "This result may not be relevant.";
    } else if (mappedDistance >= 30) {
      return "This result is not very relevant to your prompt, maybe try a different search.";
    } else {
      return "This result is not relevant to your prompt, try a different search or add more words to your search text.";
    }
  };

  return (
    <li data-aos="fade-up">
      <Box
        onClick={
          isMobile
            ? () => onReadMessage(result.sermonDate, result.paragraph)
            : null
        }
        sx={{
          position: "relative",
          padding: "3px",
          borderRadius: "10px",
          backgroundColor: "var(--input-background)",
          cursor: isMobile ? "pointer" : "default",
        }}
      >
        <h5 className="message-title">
          {searchType === SEMANTIC_SEARCH_TYPE && (
            <Tooltip
              title={getTooltipText(mappedDistance)}
              placement="top"
              arrow
            >
              <Box sx={{ width: 35, height: 35, marginRight: '10px' }}>
                <CircularProgressbar
                  value={Math.round(mappedDistance)}
                  text={`${ Math.round(mappedDistance)}`}
                  styles={buildStyles({
                    pathColor: getDistanceColor(mappedDistance),
                    textColor: contextTheme === "dark" ? "#F2F4F8" : "#282828",
                    trailColor: "#d6d6d6",
                    textSize: '28px',
                  })}
                /> 
              </Box>
            </Tooltip>
          )}
          <Box sx={{ width: { xs: "100%", md: "75%" } }}>
            {result.sermonDate} | {result.sermonTitle}
          </Box>
          {/* Icons for Tablet and Desktop */}
          {(isTablet || isDesktop) && (
            <Box
              className="copy-button"
              sx={{
                display: isTablet ? "flex" : "none",
                position: isDesktop ? "absolute" : "static",
                alignItems: "center",
                opacity: isDesktop ? 0 : 1,
                transition: "opacity 0.3s ease",
                "&:hover": {
                  opacity: 1,
                },
              }}
            >
              <Tooltip title="Copy paragraph" placement="top" arrow>
                <IconButton
                  aria-label="copy paragraph"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent onClick
                    onCopyParagraph(result);
                  }}
                >
                  <FileCopy
                    fontSize="medium"
                    sx={{ color: "var(--text-color)" }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Read more" placement="top" arrow>
                <IconButton
                  aria-label="Read more"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent onClick
                    onReadMessage(result.sermonDate, result.paragraph);
                  }}
                >
                  <ReadMore
                    fontSize="large"
                    sx={{ color: "var(--text-color)" }}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </h5>
        <div className="underline"></div>
        <div style={{ marginTop: "10px" }}>
          {searchType !== SEMANTIC_SEARCH_TYPE ? (
            <Highlighter
              highlightStyle={{
                backgroundColor: contextTheme === "dark" ? "#3f3f3f" : "#8cb1d39a" ,
                color: contextTheme === "dark" ? "#F2F4F8": "#282828" ,
                padding: "2px 1px 2px 3px",
              }}
              searchWords={wordsToHighlight}
              autoEscape
              textToHighlight={`${result.paragraph} ${result.section}`}
            />
          ) : (
            <Typography textAlign="justify">
              <strong style={{ marginRight: "10px" }}>
                {result.paragraph}
              </strong>
              {result.section}
            </Typography>
          )}
        </div>
      </Box>
    </li>
  );
}
