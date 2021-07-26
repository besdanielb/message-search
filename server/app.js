const express = require("express");
const bodyParser = require("body-parser");
const pino = require("express-pino-logger")();

const cors = require("cors");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);
const port = 3001;
app.use(
  cors({
    origin: "*",
  })
);

app.get("/search", replyFile(`./responses/searchResults.json`));
app.get("/message/:date", replyFile(`./responses/message.json`));
app.get("/all-messages", replyFile(`./responses/all-messages.json`));
app.get("/", replyJson("This is working"));

function replyFile(file) {
  return function (req, res) {
    return res.status(200).sendFile(file, {
      root: __dirname,
    });
  };
}

function replyJson(json) {
  return (req, res) => res.status(200).jsonp(json);
}

app.listen(port, () =>
  console.log("Express server is running on localhost:3001")
);
