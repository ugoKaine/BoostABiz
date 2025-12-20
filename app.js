const path = require("path");
const PDFDocument = require("pdfkit");
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const flash = require("connect-flash");

const MONGODB_URI = 
//"mongodb://localhost:27017/AdminPharmacy";
"mongodb+srv://ugokaine_db_user:wXeffli6MogpgaJx@cluster0.kaijdyi.mongodb.net/BoostaTechDataBase";

// "mongodb+srv://Destiny-Admin:ashley1811@cluster0.dgjqm0d.mongodb.net/AdminPharmacyDB";

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
const bookingRoutes = require("./routes/bookingRoutes");
app.use(bookingRoutes);
app.use(getRoutes);
app.use(postRoutes);
app.use(authRoutes);


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(port, function () {
      console.log("server started successfully");
    });
  })
  .catch((err) => {
    console.log(err);
  });
