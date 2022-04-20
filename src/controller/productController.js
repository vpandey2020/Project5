const productModel = require("../models/productModel")
const validation = require("../validation/validator")
const AWS = require("aws-sdk");
const mongoose = require("mongoose");
const aws = require("../controller/awsController")

//************************createProduct************** */

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

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

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
        if (data.currencyId.trim() !== "INR") {
            return res.status(400).send({ status: false, message: "Please provide Indian Currency Id" })
        }

        if (!validation.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "Please provide a currencyFormat" });
        }
        if (data.currencyFormat.trim() !== "₹") {
            return res.status(400).send({ status: false, message: "Please provide valid format for currency" })
        }


        if (!validation.isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "please provide the product size" })
        }
        availableSizes = availableSizes.split(",");


        if (!validation.isValidSizes(availableSizes)) {
            return res.status(400).send({ status: false, message: "please provide the product availableSizes" })
        }

        const newProductImage = await aws.uploadFiles(files[0])

        if (!newProductImage) {
            res.status(400).send({ status: false, msg: "error in uloading the files" });
            return;
        }
        let productData = {
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

//*****************************getProductbyQuery******************************** */

const getProductbyQuery = async function (req, res) {
    try {
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query
        let filters = { isDeleted: false }

        if (size != null) {
            if (!validation.isValidSizes(size)) {
                return res.status(400).send({ status: false, msg: 'No Such Size Exist in our Filters ... Select from ["S", "XS", "M", "X", "L", "XXL", "XL"]' })
            }
            filters["availableSizes"] = size
        }

        let arr = []
        if (name != null) {
            const findTitle = await productModel.find({ isDeleted: false }).select({ title: 1, _id: 0 })
            for (let i = 0; i < findTitle.length; i++) {
                var checkTitle = findTitle[i].title

                let check = checkTitle.includes(name)
                if (check) {
                    arr.push(findTitle[i].title)
                }
            }
            filters["title"] = arr
        }



        if (priceGreaterThan != null && priceLessThan == null) {
            filters["price"] = { $gt: priceGreaterThan }
        }

        if (priceGreaterThan == null && priceLessThan != null) {
            filters["price"] = { $lt: priceLessThan }
        }

        if (priceGreaterThan != null && priceLessThan != null) {
            filters["price"] = { $gte: priceGreaterThan, $lte: priceLessThan }
        }



        if (priceSort != null) {
            if (priceSort == 1) {
                const products = await productModel.find(filters).sort({ price: 1 })
                if (products.length == 0) {
                    return res.status(404).send({ status: false, message: "No data found that matches your search" })
                }
                return res.status(200).send({ status: true, message: "Results", count: products.length, data: products })
            }

            if (priceSort == -1) {
                const products = await productModel.find(filters).sort({ price: -1 })
                if (products.length == 0) {
                    return res.status(404).send({ status: false, message: "No data found that matches your search" })
                }
                return res.status(200).send({ status: true, message: "Results", count: products.length, data: products })
            }
        }

        const products = await productModel.find(filters)
        if (products.length == 0) {
            return res.status(404).send({ status: false, message: "No data found that matches your search" })
        }
        return res.status(200).send({ status: true, message: "Results", count: products.length, data: products })

    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}

//*************************************** ProductById*************************/

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
        return res.status(200).send({ status: true, message: "Success", data: allProduct })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
        return
    }
}

//*****************************updateProduct**************** */

const updateProduct = async function (req, res) {
    try {
        let Id = req.params.productId;
        let requestBody = req.body;
        let files = req.files;

        if (!(validation.isValidObjectId(Id))) {
            return res.status(400).send({ status: false, message: "Please enter the valid id" })
        }

        let details = await productModel.findOne({ _id: Id, isDeleted: false });
        if (!details) {
            return res.status(404).send({ status: false, message: "Details of the product are not found" })
        }
        if (!validation.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: "please provide data " })
            return
        }

        const { title, description, price, isFreeShipping, currencyId, currencyFormat, style, availableSizes, installments } = requestBody


        if (!validation.isValid(title)) {
            return res.status(400).send({ status: false, message: "please enter a valid title" })
        }

        const alreadyTitleUsed = await productModel.findOne({ title: title, isDeleted: false, deletedAt: null })
        if (alreadyTitleUsed) {
            return res.status(400).send({ status: false, message: "title already registered" })
        }
        if (!validation.isValid(description)) {
            return res.status(400).send({ status: false, message: "Please provide description" })
        }


        if (!validation.isValid(isFreeShipping)) {
            return res.status(400).send({ status: false, message: "Please provide the value isFreeShipping" })
        }
        if (!validation.isValid(price)) {
            return res.status(400).send({ status: false, message: "Please provide price" })
        }

        if (!validation.isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "Please provide currencyId" });
        }
        if (requestBody.currencyId.trim() !== "INR") {
            return res.status(400).send({ status: false, message: "Please Provide a valid Indian currencyId INR" })
        }
        if (!validation.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "Please provide currencyFormat" });
        }
        if (requestBody.currencyFormat.trim() !== "₹") {
            return res.status(400).send({ status: false, message: "Please Provide a valid currencyFormat ₹" })
        }
        if (!validation.isValid(style)) {
            return res.status(400).send({ status: false, message: "Please provide product's style" })
        }
        if (!validation.isValid(installments)) {
            return res.status(400).send({ status: false, message: "Please provide every installment" })
        }
        if (!validation.isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "Size is required" })
        }
        if (!validation.isValidSizes(availableSizes)) {
            return res.status(400).send({ status: false, message: "please provide sizes in between in the ENUM Value" })
        }
        let uploadedFileURL = await aws.uploadFiles(files[0])

        if (!uploadedFileURL) {
            res.status(400).send({ status: false, msg: "No file found" });
            return;
        }
        const priceOfTheProduct = {
            title, description,
            price, isFreeShipping,
            currencyId,
            currencyFormat,
            productImage: uploadedFileURL,
            style,
            installments
        }
        lat = await productModel.findOneAndUpdate({ _id: Id }, { $push: { availableSizes: availableSizes } })

        const updatedProduct = await productModel.findOneAndUpdate({ _id: Id }, priceOfTheProduct, { new: true })

        return res.status(200).send({ status: true, message: "successfully updated producr", data: updatedProduct })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//*******************************productDelete***************************** */

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
module.exports.getProductbyQuery = getProductbyQuery
module.exports.createProduct = createProduct
module.exports.ProductById = ProductById
module.exports.updateProduct = updateProduct
