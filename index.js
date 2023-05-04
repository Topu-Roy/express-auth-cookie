const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();
const port = 5002;

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(cookieParser());

//* Access Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.render("login-form");
});

app.post("/login", (req, res) => {
  const { name, email } = req.body;
  console.log(name, email);
  res.render("index");
});
app.get("/logout", (req, res) => {});

app.listen(port, () => console.log(`server listening on ${port}`));
