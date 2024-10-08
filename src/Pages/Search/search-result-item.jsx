import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  SentimentSatisfiedTwoTone as SentimentSatisfiedTwoToneIcon,
  SentimentDissatisfiedTwoTone as SentimentDissatisfiedTwoToneIcon,
  MoodTwoTone as MoodTwoToneIcon,
  MoodBadTwoTone as MoodBadTwoToneIcon,
  FileCopy,
  ReadMore,
} from "@mui/icons-material";
import { SEMANTIC_SEARCH_TYPE } from "../../constants";
import Highlighter from "react-highlight-words";
import AOS from "aos";
import { useEffect } from "react";

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

  useEffect(() => {
    AOS.refresh();
  }, [result]);

  const getParagraphRatingIcon = (distance) => {
    if (distance <= 0.55) {
      return (
        <Tooltip
          title="This is a really good result!"
          placement="top"
          arrow
          sx={{ marginRight: "10px" }}
        >
          <MoodTwoToneIcon color="success" />
        </Tooltip>
      );
    } else if (distance <= 0.63) {
      return (
        <Tooltip title="This is a good result!" placement="top" arrow>
          <SentimentSatisfiedTwoToneIcon
            color="success"
            sx={{ opacity: "0.5", marginRight: "10px" }}
          />
        </Tooltip>
      );
    } else if (distance <= 0.7) {
      return (
        <Tooltip title="This result is not the best." placement="top" arrow>
          <SentimentDissatisfiedTwoToneIcon
            color="warning"
            sx={{ opacity: "0.5", marginRight: "5px" }}
          />
        </Tooltip>
      );
    } else if (distance <= 0.8) {
      return (
        <Tooltip
          title="This result is not good, maybe try a different search."
          placement="top"
          arrow
        >
          <MoodBadTwoToneIcon color="warning" sx={{ marginRight: "5px" }} />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip
          title="This result is really bad, try a different search or add more words to your search text"
          placement="top"
          arrow
        >
          <MoodBadTwoToneIcon
            color="var(--error-color)"
            sx={{ marginRight: "10px" }}
          />
        </Tooltip>
      );
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
          {searchType === SEMANTIC_SEARCH_TYPE &&
            getParagraphRatingIcon(result.distance)}{" "}
          <Box sx={{ width: { xs: "100%", md: "65%" } }}>
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
                  ></ReadMore>
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
                backgroundColor: "var(--border-color)",
                color: "var(--background-color)",
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
