import "./read-all.scss";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import IconButton from "@material-ui/core/IconButton";
import { DataGrid } from "@material-ui/data-grid";
import QuickSearchToolbar from "../../Components/quick-search-toolbar";
import { saveState, getState } from "../../Providers/localStorageProvider";

const escapeRegExp = (value) => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

export default function ReadAll() {
  const [messages, setMessages] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [rowsCopy, setRowsCopy] = React.useState(rows);
  const [width, setWidth] = React.useState(window.innerWidth);
  const [searchText, setSearchText] = React.useState("");
  const [hasCache, setHasCache] = React.useState();
  let isMobile = width <= 768;
  const history = useHistory();
  const MESSAGES_STATE_NAME = "messages";
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
    setRowsCopy(rows);
  }, [rows]);

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    if (getState(MESSAGES_STATE_NAME)?.length > 0) {
      setHasCache(true);
      setMessages(getState(MESSAGES_STATE_NAME));
    }
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  useEffect(() => {
    saveState(MESSAGES_STATE_NAME, messages);
    setHasCache(true);
    let tableData = messages.map((message, index) => {
      return {
        id: index,
        title: message.sermonTitle,
        date: message.sermonDate,
      };
    });
    setRows(tableData);
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    const url =
      "https://bsaj8zf1se.execute-api.us-east-2.amazonaws.com/prod/listsermons";

    if (messages?.length === 0 && !hasCache) {
      fetch(url)
        .then((response) => response.json())
        .then(
          (result) => {
            if (isMounted) {
              setMessages(result);
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
    // eslint-disable-next-line
  }, [messages?.length]);

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

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  return (
    <div className="container center">
      <div className="title">
        <h1>Read a Message</h1>
        <p>
          Here you can read and search for any Message in the table bellow. You
          can also sort and filter the table columns.
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
