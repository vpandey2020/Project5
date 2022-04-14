const productModel = require("../models/productModel")
const validation = require("../validation/validator")
const AWS = require("aws-sdk");
const mongoose = require("mongoose");
const aws = require("../controller/awsController")
//----------------------------------------------------------------------------------------






let createProduct = async function (req, res) {
    try {
        const data = req.body
        const files = req.files

        if (!validation.isValidRequestBody(data)) {
            res.status(400).send({ status: false, message: "please provide data " })
            return
        }
        if (!validation.isValid(files)) {
            return res.status(400).send({ status: false, message: "please insert the file" });
        }
        if (!validation.validFile(files[0])) {
            return res.status(400).send({ status: false, msg: "please insert an image in files" });
        }
        ///^[1-9][0-9]{5}$/
        // if(data.length==0){return res.staus(400).send({status: false, message: "please provide data"})}
        // if(files.length==0){return res.status(400).send({status: false,message: "please provide image"})}

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        if (!validation.isValid(title)) {
            return res.status(400).send({ status: false, message: "please provide title" })
        }

        const alreadyTitleUsed = await productModel.findOne({ title: title, isDeleted: false, deletedAt: null })
        if (alreadyTitleUsed) {
            return res.status(400).send({ status: false, message: "title already exists" })
        }
        if (!validation.isValid(description)) {
            return res.status(400).send({ status: false, message: "Please provide product's description" })
        }


        if (!validation.isValid(price)) {
            return res.status(400).send({ status: false, message: "Please provide product's price" })
        }

        if (!validation.isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "Please provide a currencyId" });
        }

        if (!validation.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "Please provide a currencyFormat" });
        }


        if (!validation.isValid(style)) {
            return res.status(400).send({ status: false, message: "Please provide product's style" })
        }

        if (!validation.isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "please provide the product size" })
        }

        // if(!validation.isValid(installments)){
        //     return res.status(400).send({status:false, message:"Please provide product's installments"})
        // }

        if (!validation.isValidSizes(availableSizes)) {
            return res.status(400).send({ status: false, message: "please provide the product availableSizes" })
        }

        const newProductImage = await aws.uploadFiles(files[0])

        if (!newProductImage) {
            res.status(400).send({ status: false, msg: "error in uloading the files" });
            return;
        }
        const productData = {
            title,
            description,
            price,
            currencyId,
            currencyFormat,
            isFreeShipping,
            productImage: newProductImage,
            style,
            availableSizes,
            installments
        }
        console.log(productData)
        const newProduct = await productModel.create(productData)

        return res.status(201).send({ status: true, message: "success", data: newProduct })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
        return
    }
}


const ProductById = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!validation.isValid(productId)) {
            return res.status(400).send({ status: false, message: `productId is required` })
        }


        if (!validation.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is not a valid user id` })
        }
        const allProduct = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!allProduct) {
            return res.status(404).send({ status: false, message: "Product not found" })
        }
        res.status(200).send({ status: true, data: allProduct })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
        return
    }
}

const productDelete = async function (req, res) {
    try {
        const productId = req.params.productId
        if (!validation.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "please provide valid productId" })
        }
        let deletedData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: Date.now() }, { new: true })
        let check = await productModel.findOne({ _id: productId })
        if (!check) {
            return res.status(404).send({ status: false, message: "no data found" })
        }
        if (deletedData)
            return res.status(200).send({ status: true, message: "data deleted successfilly" })
        else {
            return res.status(400).send({ status: false, message: "data allready deleted" })
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}




module.exports.productDelete = productDelete






module.exports.createProduct = createProduct
module.exports.ProductById = ProductById