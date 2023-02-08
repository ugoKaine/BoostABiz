const path = require("path");

const express = require("express");

const getController = require("../controllers/get");
const isAuth = require("../middleware/is_Auth");
const isAuthAdmin = require("../middleware/is_AuthAdmin");
const router = express.Router();
// get routes
router.get("/receipt", isAuth, getController.getReceipt);
router.get("/checkuser", isAuth, getController.getCheckUser);
router.get("/addproduct", isAuth, getController.getAddproduct);
router.get("/products", isAuth, getController.getproducts);
router.get("/store", isAuth, getController.getStore);
router.get("/sales", isAuth, getController.getSales);
router.get("/home", isAuth, getController.getHome);

module.exports = router;
