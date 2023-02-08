const path = require("path");

const express = require("express");

const getController = require("../controllers/get");
const isAuth = require("../middleware/is_Auth");
const isAuthAdmin = require("../middleware/is_AuthAdmin");
const router = express.Router();
// get routes
router.get("/receipt", isAuth, getController.getReceipt);
router.get("/checkuser", isAuthAdmin, getController.getCheckUser);
router.get("/addproduct", isAuthAdmin, getController.getAddproduct);
router.get("/products", isAuthAdmin, getController.getproducts);
router.get("/store", isAuthAdmin, getController.getStore);
router.get("/sales", isAuthAdmin, getController.getSales);
router.get("/home", isAuth, getController.getHome);

module.exports = router;
