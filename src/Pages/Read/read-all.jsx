// src/Pages/ReadAll/ReadAll.js

import "./read-all.scss";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import IconButton from "@mui/material/IconButton";
import { DataGrid } from "@mui/x-data-grid";
import QuickSearchToolbar from "../../Components/quick-search-toolbar";
import { saveState, getState } from "../../Providers/localStorageProvider";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../index";

// Utility function to escape RegExp special characters
const escapeRegExp = (value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// Debounce function to limit the rate of function calls
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function ReadAll() {
  const [messages, setMessages] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const MESSAGES_STATE_NAME = "messages";

  const onReadMessage = useCallback((params) => {
    const { date, paragraph } = params.row;

    // Ensure both date and paragraph are present
    if (date) {
      console.log(`/read/${date}${paragraph ? "/"+paragraph : ""}`);
      navigate(`/read/${date}${paragraph ? "/"+paragraph : ""}`);
    } else {
      console.error("Missing date or paragraph information for navigation.");
    }
  }, [navigate]);

  // Define table columns using useMemo
  const TABLE_COLUMNS = useMemo(() => [
    {
      field: "title",
      headerName: "Title",
      sortable: true,
      flex: 2,
    },
    {
      field: "date",
      headerName: "Date",
      sortable: true,
      hide: isMobile,
      flex: 1,
    },
    {
      field: "read",
      headerName: "",
      sortable: false,
      width: 60,
      disableColumnMenu: true,
      disableClickEventBubbling: true,
      renderCell: (params) => (
        <IconButton
          aria-label="read message"
          color="default"
          onClick={() => onReadMessage(params)}
        >
          <MenuBookIcon />
        </IconButton>
      ),
    },
  ], [isMobile, onReadMessage]);

  // Memoize rows based on messages
  const rows = useMemo(() => {
    return messages.map((message, index) => ({
      id: index,
      title: message.sermonTitle,
      date: message.sermonDate,
      paragraph: message.paragraph,
    }));
  }, [messages]);

  // Memoize filtered rows based on searchText
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    const searchRegex = new RegExp(escapeRegExp(searchText), "i");
    return rows.filter((row) => {
      return Object.keys(row).some((field) =>
        searchRegex.test(row[field]?.toString())
      );
    });
  }, [rows, searchText]);

  // Handle search input changes with debounce
  const requestSearch = useCallback(
    debounce((searchValue) => {
      setSearchText(searchValue);
    }, 300),
    []
  );

  // Handle window resize with debounce
  useEffect(() => {
    const handleResize = debounce(() => {
      setIsMobile(window.innerWidth <= 768);
    }, 200);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch messages from API or load from localStorage
  useEffect(() => {
    const fetchMessages = async () => {
      const cachedMessages = getState(MESSAGES_STATE_NAME);
      if (cachedMessages?.length > 0) {
        setMessages(cachedMessages);
        logEvent(analytics, "read-allpage_loaded_from_cache");
      } else {
        try {
          const response = await fetch(
            "https://bsaj8zf1se.execute-api.us-east-2.amazonaws.com/prod/listsermons"
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setMessages(data);
          logEvent(analytics, "read-allpage_loaded_from_api");
        } catch (err) {
          console.error("Failed to fetch messages:", err);
          setError("Failed to load messages. Please try again later.");
          logEvent(analytics, "read-allpage_fetch_error");
        }
      }
    };

    fetchMessages();
  }, []);

  // Save messages to localStorage when messages state changes
  useEffect(() => {
    if (messages.length > 0) {
      saveState(MESSAGES_STATE_NAME, messages);
    }
  }, [messages]);

  // Log page visit
  useEffect(() => {
    logEvent(analytics, "read-allpage_visited");
  }, []);

  return (
    <div className="read-all-container" style={{backgroundImage: `url(${process.env.PUBLIC_URL}/44.webp)`}}>
      <div className="title-section">
        <h1>Read a Message</h1>
        {error && <div className="error-message">{error}</div>}
      </div>
      <div className="data-grid-container">
        <DataGrid
          disableRowSelectionOnClick
          rows={filteredRows}
          columns={TABLE_COLUMNS}
          disableSelectionOnClick
          loading={messages.length === 0 && !error}
          components={{ Toolbar: QuickSearchToolbar }}
          componentsProps={{
            toolbar: {
              value: searchText,
              onChange: (event) => requestSearch(event.target.value),
              clearSearch: () => requestSearch(""),
            },
          }}
          pagination
          pageSize={25}
          rowsPerPageOptions={[25, 50, 100]}
          localeText={{
            noRowsLabel: "No Messages found",
          }}
        />
      </div>
    </div>
  );
}
