import "./read-all.scss";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import IconButton from "@material-ui/core/IconButton";
import { DataGrid, escapeRegExp } from "@material-ui/data-grid";
import QuickSearchToolbar from "../../Components/quick-search-toolbar";

export default function ReadAll() {
  const [messages, setMessages] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [rowsCopy, setRowsCopy] = React.useState(rows);
  const [width, setWidth] = React.useState(window.innerWidth);
  const [searchText, setSearchText] = React.useState("");
  let isMobile = width <= 768;
  const history = useHistory();
  const TABLE_COLUMNS = [
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
      field: "location",
      headerName: "Location",
      sortable: true,
      hide: isMobile,
      flex: 1,
    },
    {
      field: "read",
      headerName: " ",
      sortable: false,
      width: 60,
      disableColumnMenu: true,
      disableClickEventBubbling: true,
      renderCell: (params) => {
        return (
          <IconButton
            aria-label="read"
            color="default"
            onClick={() => {
              onReadMessage(params);
            }}
          >
            <MenuBookIcon />
          </IconButton>
        );
      },
    },
  ];

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const url = "http://localhost:3001/all-messages";
    if (messages?.length === 0) {
      fetch(url)
        .then((response) => response.json())
        .then(
          (messages) => {
            if (isMounted) {
              setTimeout(() => {
                setMessages(messages);
                let tableData = messages.map((message, index) => {
                  return {
                    id: index,
                    title: message.sermonTitle,
                    date: message.sermonDate,
                    location: message.location,
                  };
                });
                setRows(tableData);
              }, 2000);
            }
          },
          (error) => {
            console.log("error: " + error);
          }
        );
    }
    return () => {
      isMounted = false;
    };
  }, [messages?.length]);

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  const onReadMessage = (params) => {
    history.push({
      pathname: "/read",
      state: { date: params.row?.date },
    });
  };

  const requestSearch = (searchValue) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), "i");
    const filteredRows = rows.filter((row) => {
      return Object.keys(row).some((field) => {
        return searchRegex.test(row[field].toString());
      });
    });
    setRowsCopy(filteredRows);
  };

  useEffect(() => {
    setRowsCopy(rows);
  }, [rows]);

  return (
    <div className="container center">
      <div className="title">
        <h1>Read a Message</h1>
        <p>
          Here you can search and sort for a message Lorem Ipsum Dolor sit amet
          Lorem Ipsum Dolor sit amet.
        </p>
      </div>
      <DataGrid
        rows={rowsCopy}
        columns={TABLE_COLUMNS}
        disableSelectionOnClick
        loading={messages.length === 0}
        components={{ Toolbar: QuickSearchToolbar }}
        componentsProps={{
          toolbar: {
            value: searchText,
            onChange: (event) => requestSearch(event.target.value),
            clearSearch: () => requestSearch(""),
          },
        }}
      />
    </div>
  );
}
