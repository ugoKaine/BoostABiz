const path = require("path");

const express = require("express");

const postController = require("../controllers/post");
const isAuth = require("../middleware/is_Auth");
const router = express.Router();

router.post("/addproduct", isAuth, postController.postAddProduct);
router.post("/receipt", isAuth, postController.postReceipt);
router.post("/transactions", isAuth, postController.postTransactions);
router.post("/delete", isAuth, postController.postDelete);
router.post("/deleteP", isAuth, postController.postDeleteP);

module.exports = router;
