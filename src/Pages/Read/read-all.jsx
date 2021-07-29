import "./read-all.scss";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import IconButton from "@material-ui/core/IconButton";
import { DataGrid } from "@material-ui/data-grid";

export default function ReadAll() {
  const [messages, setMessages] = React.useState([]);
  const [rows, setRows] = React.useState([]);
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
      flex: 1,
    },
    {
      field: "location",
      headerName: "Location",
      sortable: true,
      flex: 1,
    },
    {
      field: "read",
      headerName: " ",
      sortable: false,
      width: 70,
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

  const onReadMessage = (params) => {
    history.push({
      pathname: "/read",
      state: { date: params.row?.date },
    });
  };

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
        rows={rows}
        columns={TABLE_COLUMNS}
        disableSelectionOnClick
        pageSize={15}
        autoHeight
        loading={messages.length === 0}
      />
    </div>
  );
}
