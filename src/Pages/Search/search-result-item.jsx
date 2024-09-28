import { IconButton, Tooltip } from "@mui/material";
import {
  SentimentSatisfiedTwoTone as SentimentSatisfiedTwoToneIcon,
  SentimentDissatisfiedTwoTone as SentimentDissatisfiedTwoToneIcon,
  MoodTwoTone as MoodTwoToneIcon,
  MoodBadTwoTone as MoodBadTwoToneIcon,
	FileCopy,
} from "@mui/icons-material";
import { SEMANTIC_SEARCH_TYPE } from "../../constants";
import Highlighter from "react-highlight-words";

export default function SearchResultItem ({
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
        <Tooltip
          title="This result is not the best."
          placement="top"
          arrow
        >
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
          <MoodBadTwoToneIcon
            color="warning"
            style={{ marginRight: "5px" }}
          />
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
            color="error"
            style={{ marginRight: "5px" }}
          />
        </Tooltip>
      );
    }
  };

  return (
    <li>
      <div onClick={() => onReadMessage(result.sermonDate, result.paragraph)}>
        <h5 className="message-title">
          {getParagraphRatingIcon(result.distance)} {result.sermonDate} | {result.sermonTitle}
        </h5>
        <div className="underline"></div>
        <p className="paragraph-text">
          {searchType !== SEMANTIC_SEARCH_TYPE ? (
            <Highlighter
              activeStyle={{ backgroundColor: "yellow", color: "black" }}
              searchWords={wordsToHighlight}
              autoEscape
              textToHighlight={`${result.paragraph} ${result.section}`}
            />
          ) : (
            `${result.paragraph} ${result.section}`
          )}
        </p>
      </div>
      <span className="copy-button">
        <IconButton
          aria-label="copy paragraph"
          onClick={() => onCopyParagraph(result)}
        >
          <FileCopy fontSize="medium" />
        </IconButton>
        <h5 className="copy-label">Copy</h5>
      </span>
    </li>
  );
};