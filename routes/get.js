const path = require("path");

const express = require("express");

const getController = require("../controllers/get");
const isAuth = require("../middleware/is_Auth");
const router = express.Router();
// get routes
router.get("/receipt", isAuth, getController.getReceipt);
router.get("/products", isAuth, getController.getStore);
router.get("/sales", isAuth, getController.getSales);
router.get("/home", isAuth, getController.getHome);
router.get("/users", isAuth, getController.getUsers);

module.exports = router;
