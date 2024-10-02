import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../constants";

export default function Navbar(props) {
  const [scrolled, setScrolled] = useState(false);
	const navigate = useNavigate();
  // Listen for scroll events to change the AppBar background color
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 5) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          transition: "background-color 0.3s ease", // Smooth transition
          backgroundColor: scrolled
            ? "rgba(25, 54, 89, 0.8)" // Color when scrolled
            : "transparent", // Default color
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{ fontSize: "2rem", fontFamily: "Great Vibes", fontWeight: "bold", color: scrolled
							? COLORS.lightGray : COLORS.darkBlue, ":hover": { cursor: "pointer" } }}
              onClick={() => navigate("/")}
          >
            Message Search
          </Typography>

          {/* Desktop Navigation Items */}
          <div className="navbar__nav-items">
          <Button
            sx={{
							height: "40px",
              position: "relative", // Needed for the pseudo-element
              color: scrolled ? COLORS.lightGray : COLORS.darkBlue,
              fontSize: "1.2rem",
              marginLeft: 2,
              textTransform: "capitalize",
              padding: "6px 12px",
              overflow: "hidden", // Hide the pseudo-element overflow
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "0%",
                height: "2px",
                backgroundColor: scrolled ? COLORS.lightGray : COLORS.darkBlue,
                transition: "width 0.3s ease",
              },
							"&:hover": {
								backgroundColor: "transparent",
              },
              "&:hover::after": {
                width: "100%",
              },
            }}
            onClick={() => navigate("/")}
          >
            Search
          </Button>
          <Button
            sx={{
							height: "40px",
              position: "relative",
              color: scrolled ? COLORS.lightGray : COLORS.darkBlue,
              fontSize: "1.2rem",
              marginLeft: 2,
              textTransform: "capitalize",
              padding: "6px 12px",
              overflow: "hidden",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "0%",
                height: "2px",
                backgroundColor: scrolled ? COLORS.lightGray : COLORS.darkBlue,
                transition: "width 0.3s ease",
              },
              "&:hover::after": {
                width: "100%",
              },
							"&:hover": {
								backgroundColor: "transparent",
              },
            }}
            onClick={() => navigate("/read-all")}
          >
            Read
          </Button>
        </div>

          {/* Mobile Menu Icon */}
          <IconButton
            edge="start"
            sx={{ display: { xs: "block", md: "none" }, color: "#fff" }}
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
  );
}




