const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController')
const verfication=require('../miidleware/userVerify')
const ProductController = require('../controller/productController')
//user
router.post("/register" , UserController.registerUser)
router.post("/login",UserController.userLogin)
router.get("/user/:userId/profile",verfication.userVerify,UserController.getUser)
router.put("/user/:userId/profile",verfication.userVerify,UserController.updateUser)

//create Product
router.post("/products",ProductController.createProduct)
router.get("/products/:productId",ProductController.ProductById)
router.delete("/products/:productId",ProductController.productDelete)
module.exports = router;