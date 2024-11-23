import { useState, useEffect } from "react";
import "./typing-title.scss"; // Import the corresponding CSS

const TypingTitle = ({ text, speed = 150 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(currentIndex));
        setCurrentIndex((prevIndex) => prevIndex + 1); 
      }, speed);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, text, speed]);

  return (
    <h1 className="typing-title">
      {displayedText}
      <span className="cursor">|</span>
    </h1>
  );
};

export default TypingTitle;
