import { useCallback } from "react";
import { Apple, Email } from "@mui/icons-material";
import { Fade, IconButton, Tooltip } from "@mui/material";
import "./footer.scss";
import { COLORS } from "../../constants";

export default function Footer() {
  // Open email client
  const openEmailClient = useCallback(() => {
    window.open(
      "mailto:themessagesearch@gmail.com?subject=Contact%20regarding%20website"
    );
  }, []);

  // Open iOS App link
  const openiOSApp = useCallback(() => {
    window.open("https://apps.apple.com/pt/app/message-search/id1579582830");
  }, []);

  return (
    <div className="contacts">
      <Tooltip
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 600 }}
        title="Check out our iOS app!"
        onClick={openiOSApp}
        arrow
      >
        <IconButton aria-label="download ios app" size="medium">
          <Apple fontSize="medium" sx={{color: COLORS.darkBlue}}/>
        </IconButton>
      </Tooltip>
      <Tooltip
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 600 }}
        title="Get in contact with us!"
        arrow
      >
        <IconButton
          aria-label="contact us by email"
          size="medium"
          onClick={openEmailClient}
        >
          <Email fontSize="medium" sx={{color: COLORS.darkBlue}} />
        </IconButton>
      </Tooltip>
    </div>
  );
}
