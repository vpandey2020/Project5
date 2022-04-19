const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController')
const verfication=require('../miidleware/userVerify')
const ProductController = require('../controller/productController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
//user
router.post("/register" , UserController.registerUser)
router.post("/login",UserController.userLogin)
router.get("/user/:userId/profile",verfication.userVerify,UserController.getUser)
router.put("/user/:userId/profile",verfication.userVerify,UserController.updateUser)

//create Product
router.post("/products",ProductController.createProduct)
router.get("/products",ProductController.getProductbyQuery)
router.get("/products/:productId",ProductController.ProductById)
router.put("/products/:productId",ProductController.updateProduct)
router.delete("/products/:productId",ProductController.productDelete)

//cart  APIs
router.post("/users/:userId/cart",verfication.userVerify,cartController.createCart)
router.put("/users/:userId/cart",verfication.userVerify,cartController.updateCart)
router.get("/users/:userId/cart",verfication.userVerify,cartController.getFromCart)
router.delete("/users/:userId/cart",verfication.userVerify,cartController.deleteCart)

//order APIs
router.post("/users/:userId/orders",verfication.userVerify,orderController.createOrder)
router.put("/users/:userId/orders",verfication.userVerify,orderController.updateOrder)

module.exports = router;