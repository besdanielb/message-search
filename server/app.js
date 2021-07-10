const express = require("express");
const bodyParser = require("body-parser");
const pino = require("express-pino-logger")();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(pino);
const port = 3001;

app.get("/", replyJson("ola"));

app.get("/search-results", replyFile(`responses/searchResults.json`));

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
