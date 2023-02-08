const path = require("path");

const express = require("express");

const postController = require("../controllers/post");
const isAuth = require("../middleware/is_Auth");
const router = express.Router();

router.post("/addproduct", postController.postAddProduct);
router.post("/receipt", postController.postReceipt);

module.exports = router;
