const path = require("path");

const express = require("express");

const getController = require("../controllers/get");
const router = express.Router();
// get routes
router.get("/", getController.getLogin);
router.get("/createuser", getController.getCreateUser);
router.get("/receipt", getController.getReceipt);
router.get("/checkuser", getController.getCheckUser);
router.post("/login", getController.getIndex);
router.get("/addproduct", getController.getAddproduct);
router.get("/products", getController.getproducts);
router.get("/store", getController.getStore);

module.exports = router;
