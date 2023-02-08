const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
