import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  useScrollTrigger,
  Slide,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { COLORS } from "../constants";

// Custom hook to hide the AppBar on scroll down
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

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
          {/* Logo */}
          <Typography
            variant="h6"
            sx={{ fontSize: "1.5rem", fontWeight: "bold", color: scrolled
							? COLORS.lightGray : COLORS.darkBlue }}
          >
            Message Search
          </Typography>

          {/* Desktop Navigation Items */}
          <div className="navbar__nav-items">
            <Button sx={{ color: scrolled
            ? COLORS.lightGray :  COLORS.darkBlue, fontSize: "1.2rem", marginLeft: 2, textTransform: "capitalize" }} onClick={() => navigate("/search")}>
						Search
            </Button>
            <Button sx={{ color: scrolled
            ? COLORS.lightGray :  COLORS.darkBlue, fontSize: "1.2rem", marginLeft: 2, textTransform: "capitalize" }} onClick={() => navigate("/read-all")}>
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




