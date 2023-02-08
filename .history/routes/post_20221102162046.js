const path = require("path");

const express = require("express");

const postController = require("../controllers/post");
const router = express.Router();

router.post("/login", postController.postLogin);
router.post("/addproduct", postController.postAddProduct);
router.post("/receipt", postController.postReceipt);

module.exports = router;
