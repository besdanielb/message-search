import { Close } from "@mui/icons-material";
import { Alert, AlertTitle, Collapse, IconButton } from "@mui/material";

export default function ErrorAlert({ open, onClose }) {
  <Collapse
    in={open}
    style={{
      position: "absolute",
      top: "3em",
      right: "2em",
      left: "1em",
    }}
  >
    <Alert
      severity="error"
      style={{ marginBottom: "7em" }}
      action={
        <IconButton
          aria-label="close error message"
          size="small"
          onClick={onClose}
        >
          <Close fontSize="inherit" />
        </IconButton>
      }
    >
      <AlertTitle>Error</AlertTitle>
      There was an error. Please try again, and if the issue continues, please
      contact us by email.
    </Alert>
  </Collapse>
};
