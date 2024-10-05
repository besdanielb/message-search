// src/components/Navbar.js

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItemText,
  Divider,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ListItemButton from "@mui/material/ListItemButton"; // Import ListItemButton
import { useNavigate } from "react-router-dom";
import { COLORS } from "../constants";

export default function Navbar(props) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  // Toggle Drawer (Mobile Menu)
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          transition: "background-color 0.3s ease",
          background: scrolled
            ? "rgba(25, 54, 89, 0.9)"
            : "linear-gradient(to right, rgba(25, 54, 89, 0.1), rgba(25, 54, 89, 0.2))",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
        <Container maxWidth="xl" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: "2.5vmax",
              fontFamily: "Great Vibes",
              fontWeight: "bold",
              color: scrolled ? COLORS.lightGray : COLORS.darkBlue,
              ":hover": { cursor: "pointer" },
            }}
            onClick={() => navigate("/")}
          >
            Message Search
          </Typography>

          {/* Desktop Navigation Items */}
          <Box className="navbar-buttons" sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              sx={{
                height: "40px",
                position: "relative",
                color: scrolled ? COLORS.lightGray : COLORS.darkBlue,
                fontSize: "clamp(20px, 1.3vmax, 30px)",
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
              onClick={() => navigate("/")}
            >
              Search
            </Button>
            <Button
              sx={{
                height: "40px",
                position: "relative",
                color: scrolled ? COLORS.lightGray : COLORS.darkBlue,
                fontSize: "clamp(20px, 1.3vmax, 30px)",
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
          </Box>

          {/* Mobile Menu Icon */}
          <IconButton
            edge="start"
            sx={{ display: { xs: "block", md: "none" }, color: "#fff" }}
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          </Container>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 200,
            background: "linear-gradient(to right, rgba(25, 54, 89, 0.96), rgba(25, 54, 89, 0.9))",
            height: "100%",
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          {/* Drawer Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5px 16px",
            }}
          >
            <h3 style={{color: COLORS.midGray}}>Menu</h3>
           
            <IconButton onClick={toggleDrawer(false)} sx={{ color: COLORS.midGray }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider  sx={{ borderColor: COLORS.grayBlue }}/>

          {/* Menu Links */}
          <List>
            <ListItemButton onClick={() => navigate("/")}>
              <ListItemText
                primary="Search"
                primaryTypographyProps={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: COLORS.midGray,
                }}
              />
            </ListItemButton>
            <ListItemButton onClick={() => navigate("/read-all")}>
              <ListItemText
                primary="Read"
                primaryTypographyProps={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: COLORS.midGray,
                }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
