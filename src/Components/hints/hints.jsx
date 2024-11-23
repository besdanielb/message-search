import { Box } from "@mui/material";
import HintCard from "./hint-card";
import ShowHintsButton from "./show-hints-button";

export default function Hints({
  hintCardVisible,
  onCloseHintCard,
  showHintButton,
  onShowHintCard,
  isSearchPage,
}) {
  return (
    <Box sx={{display: isSearchPage ? {xs: "none"} : 'flex'}}>
      <HintCard visible={hintCardVisible} onClose={onCloseHintCard} />
      {showHintButton && <ShowHintsButton onClick={onShowHintCard} />}
    </Box>
  );
}
