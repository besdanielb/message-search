import HintCard from "./hint-card";
import ShowHintsButton from "./show-hints-button";

export default function Hints({
  hintCardVisible,
  onCloseHintCard,
  showHintButton,
  onShowHintCard,
}) {
  return (
    <>
      <HintCard visible={hintCardVisible} onClose={onCloseHintCard} />
      {showHintButton && <ShowHintsButton onClick={onShowHintCard} />}
    </>
  );
}
