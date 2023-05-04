const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const port = 5002;

//* Connect to database
mongoose
  .connect("mongodb://127.0.0.1:27017", { dbName: "users" })
  .then(() => console.log("Database connected !"));

//* Mongoose Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const userModel = mongoose.model("user", userSchema);

//* Middleware
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(cookieParser());

//* Handlers
const isUserAuthenticated = (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    next();
  } else {
    res.render("login-form");
  }
};

const addUserToDataBaseAndCreateCookie = async (req, res, next) => {
  const { name, email } = req.body;
  const user = await userModel.create({ name, email });

  //* Cookie
  res.cookie("token", user._id, {
    expires: new Date(Date.now() + 300 * 1000),
  });
  next();
};

//* Access Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//* Routes
app.get("/", isUserAuthenticated, (req, res) => {
  res.render("index");
});

app.post("/login", addUserToDataBaseAndCreateCookie, (req, res) => {
  res.render("index");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(port, () => console.log(`server listening on ${port} !`));
