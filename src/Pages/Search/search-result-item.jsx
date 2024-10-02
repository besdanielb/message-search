import { IconButton, Tooltip, Typography } from "@mui/material";
import {
  SentimentSatisfiedTwoTone as SentimentSatisfiedTwoToneIcon,
  SentimentDissatisfiedTwoTone as SentimentDissatisfiedTwoToneIcon,
  MoodTwoTone as MoodTwoToneIcon,
  MoodBadTwoTone as MoodBadTwoToneIcon,
  FileCopy,
  ReadMore,
} from "@mui/icons-material";
import { COLORS, EXACT_SEARCH_TYPE, SEMANTIC_SEARCH_TYPE } from "../../constants";
import Highlighter from "react-highlight-words";

export default function SearchResultItem({
  result,
  onReadMessage,
  onCopyParagraph,
  searchType,
  wordsToHighlight,
}) {
  const getParagraphRatingIcon = (distance) => {
    if (distance <= 0.55) {
      return (
        <Tooltip
          title="This is a really good result!"
          placement="top"
          arrow
          style={{ marginRight: "5px" }}
        >
          <MoodTwoToneIcon color="success" />
        </Tooltip>
      );
    } else if (distance <= 0.63) {
      return (
        <Tooltip title="This is a good result!" placement="top" arrow>
          <SentimentSatisfiedTwoToneIcon
            color="success"
            style={{ opacity: "0.5", marginRight: "5px" }}
          />
        </Tooltip>
      );
    } else if (distance <= 0.7) {
      return (
        <Tooltip title="This result is not the best." placement="top" arrow>
          <SentimentDissatisfiedTwoToneIcon
            color="warning"
            style={{ opacity: "0.5", marginRight: "5px" }}
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
          <MoodBadTwoToneIcon color="warning" style={{ marginRight: "5px" }} />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip
          title="This result is really bad, try a different search or add more words to your search text"
          placement="top"
          arrow
        >
          <MoodBadTwoToneIcon color="error" style={{ marginRight: "5px" }} />
        </Tooltip>
      );
    }
  };

  return (
    <li>
      <h5 className="message-title">
        {searchType === SEMANTIC_SEARCH_TYPE && getParagraphRatingIcon(result.distance)} {result.sermonDate} |{" "}
        {result.sermonTitle}
        <span className="copy-button">
          <Tooltip title="Copy paragraph" placement="top" arrow>
            <IconButton
              aria-label="copy paragraph"
              onClick={() => onCopyParagraph(result)}
            >
              <FileCopy fontSize="medium" sx={{ color: COLORS.darkBlue }} />
            </IconButton>
          </Tooltip>
        <Tooltip title="Read more" placement="top" arrow>
          <IconButton aria-label="Read more">
            <ReadMore
              fontSize="large" 
              onClick={() => onReadMessage(result.sermonDate, result.paragraph)}
              sx={{ color: COLORS.darkBlue }}
            ></ReadMore>
          </IconButton>
          </Tooltip>
        </span>
      </h5>
      <div className="underline"></div>
      <p className="paragraph-text">
        {searchType !== SEMANTIC_SEARCH_TYPE ? (
          <Highlighter
            highlightStyle={{ backgroundColor: COLORS.midGray, color: "black", padding: "2px 1px 2px 3px"  }}
            searchWords={wordsToHighlight}
            autoEscape
            textToHighlight={`${result.paragraph} ${result.section}`}
          />
        ) : (
          <Typography textAlign="justify">
            <strong style={{marginRight: '10px'}}>{result.paragraph}</strong>
            {result.section}
          </Typography>
        )}
      </p>
    </li>
  );
}
