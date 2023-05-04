const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

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

const User = mongoose.model("user", userSchema);

//* Middleware
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(cookieParser());

//* Handlers
const isUserAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decodedUserToken = jwt.verify(token, "secret");
    req.user = await User.findById(decodedUserToken._id);
    next();
  } else {
    res.render("login-form");
  }
};

const addUserToDataBaseAndCreateCookie = async (req, res, next) => {
  const { name, email } = req.body;
  const user = await User.create({ name, email });

  //* JWT token
  const token = jwt.sign({ _id: user._id }, "secret");

  //* Cookie
  res.cookie("token", token, {
    expires: new Date(Date.now() + 300 * 1000),
  });
  next();
};

//* Access Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//* Routes
app.get("/", isUserAuthenticated, (req, res) => {
  res.render("index", { name: req.user.name, email: req.user.email });
});

app.post("/login", addUserToDataBaseAndCreateCookie, (req, res) => {
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(port, () => console.log(`server listening on ${port} !`));
