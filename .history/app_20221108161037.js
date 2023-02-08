const path = require("path");

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const flash = require("connect-flash");

const MONGODB_URI = "mongodb://localhost:27017/AdminPharmacy";

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));

const getRoutes = require("./routes/get");
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
app.use(getRoutes);
app.use(postRoutes);
app.use(authRoutes);

app.set("port", process.env.PORT || 3000);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
