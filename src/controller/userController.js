const mongoose = require('mongoose')
const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")
const aws = require("../controller/awsController")
const jwt = require("jsonwebtoken")

let isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
let isValidRequestBody = function (reqBody) {
    return Object.keys(reqBody).length > 0
}
let isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
};


let registerUser = async function (req, res) {
    try {
        let reqBody = req.body;
        let files = req.files;

        if (!isValidRequestBody(reqBody)) {
            res.status(400).send({ status: false, message: "please provide data " })
            return
        }
        let { fname, lname, email, phone, password, address } = reqBody;



        if (!isValid(fname)) {
            res.status(400).send({ status: false, message: "First name is required" })
            return
        }
        if (!isValid(lname)) {
            res.status(400).send({ status: false, message: "Last name is required" })
            return
        }
        if (!isValid(email)) {
            res.status(400).send({ status: false, message: "Email is required" })
            return
        }

        if (!isValid(phone)) {
            res.status(400).send({ status: false, message: "Phone  is required" })
            return
        }
        if (!isValid(password)) {
            res.status(400).send({ status: false, message: "Password is required" })
            return
        }

        if (!isValid(address)) {
            res.status(400).send({ status: false, message: "Address is required" })
            return
        }
        let isAddress = JSON.parse(address)
        let { billing, shipping } = isAddress


        if (!isValid(shipping.street)) {
            res.status(400).send({ status: false, message: "Shipping Street Address is required" })
            return
        }
        if (!isValid(shipping.city)) {
            res.status(400).send({ status: false, message: "Shipping Address City is required" })
            return
        }
        if (!isValid(shipping.pincode)) {
            res.status(400).send({ status: false, message: "Shipping Address pincode is required" })
            return
        }

        if (!isValid(billing.street)) {
            res.status(400).send({ status: false, message: " Billing Street Address is required" })
            return
        }
        if (!isValid(billing.city)) {
            res.status(400).send({ status: false, message: " Billing Address City name is required" })
            return
        }
        if (!isValid(billing.pincode)) {
            res.status(400).send({ status: false, message: " Billing Address pincode is required" })
            return
        }
        if (!isValid(isAddress)) {
            res.status(400).send({ status: false, message: "Address is required" })
            return
        }






        //format validation
        if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/.test(phone.trim()))) {
            return res.status(400).send({ status: false, msg: "Not a valid Number provide valid phone Number" })
        }

        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email.trim()))) {
            return res.status(400).send({ status: false, msg: "Not a valid Email provide valid email" })
        }

        if (!(/^.{8,15}$/.test(password))) {
            return res.status(400).send({ status: false, msg: "Invalid Password" })
        }

        //Unique Validation
        let findPhone = await userModel.findOne({ phone });
        if (findPhone) {
            res.status(400).send({ status: false, message: "Phone is already registered" })
            return
        }
        let findEmail = await userModel.findOne({ email });
        if (findEmail) {
            res.status(400).send({ status: false, message: "Email is already registered" })
            return
        }

        if (files && files.length > 0) {
            var uploadedFileURL = await aws.uploadFiles(files[0])

        } else {
            return res.status(400).send({ msg: "No file found" })
        }

        let encryptedPassword = await bcrypt.hash(password, 10)

        let saveData = {
            fname: fname,
            lname: lname,
            email: email,
            profileImage: uploadedFileURL,
            phone: phone,
            password: encryptedPassword,
            address: isAddress
        };
        let createUser = await userModel.create(saveData);
        res.status(201).send({ status: true, message: "Succesfully created User", data: createUser });
    }

    catch (error) {
        res.status(500).send({ status: false, message: error.message })
        return
    }
}


const userLogin = async function (req, res) {
    try {
        let data = req.body;
        let data1 = req.body.email;
        let data2 = req.body.password;

        //mandatory validation
        if (Object.keys(data) == 0) {
            return res.status(400).send({ status: false, msg: "No Parameters Passed in requestBody" })
        }
        if (!isValid(data1)) {
            return res.status(400).send({ status: false, msg: "email is required" })
        }
        if (!isValid(data2)) {
            return res.status(400).send({ status: false, msg: "password is required" })
        }

        //format validaion
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(data1.trim()))) {
            return res.status(400).send({ status: false, msg: "Not a valid Email provide valid email" })
        }


        if (!(/^.{8,15}$/)) {
            return res.status(400).send({ status: false, msg: "Password is not in the format" })
        }
        let findUser = await userModel.findOne({ email: data1 })
        const validPassword = await bcrypt.compare(data2, findUser.password);
        if (!validPassword) {
            return res.status(400).send({ status: false, message: "Invalid password" })
        }
        if (!findUser) {
            return res.status(400).send({ status: false, msg: "Invalid Credentials" })
        } else {
            let geneToken = jwt.sign({
                userId: findUser._id,
            }, "group1", { expiresIn: "1hr" });

            let storeToken = { userId: findUser._id, geneToken: geneToken }
            return res.status(201).send({ status: true, msg: "token Created Successfully", Token: storeToken })
        }
    }


    catch (error) {
        res.status(500).send({ status: false, message: error.message })
        return
    }
}
let getUser = async function (req, res) {
    try {
        let userId = req.params.userId
        let geneToken = req.userId
        //not working not found id
        let validUser = await userModel.findOne({ _id: userId })
        if (!validUser) {
            return res.status(404).send({ status: false, msg: "UserId not found" })
        }
        if (!isValid(userId)) {
            res.status(400).send({ status: false, message: "User id is not valid" })
            return
        }
        //not working for valid id
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "please provide a valid user id" })
        }

        if (!geneToken == userId) {
            res.status(404).send({ status: false, message: "token and user id not Matched" })
            return
        }
        let createUser = await userModel.findOne({ _id: userId });
        if (!createUser) {
            return res.status(404).send({ status: false, message: "Please Provide a valid userId" })
        }
        res.status(200).send({ status: true, message: "Succesfully provide user details", data: createUser })

    }

    catch (error) {
        res.status(500).send({ status: false, message: error.message })
        return
    }
}



const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId;
        let body = req.body;
        let profileImage = req.files
        let geneToken = req.userId

        if (!isValidRequestBody(body)) {
            return res.status(400).send({ status: false, message: "please provide data for updation" })

        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "please provide a valid user id" })
        }
        let validUser = await userModel.findOne({ _id: userId })
        if (!validUser) {
            return res.status(404).send({ status: false, msg: "User not found" })
        }

        let { fname, lname, email, phone, password, address } = body  //Destructring

        if (isValid(body.email))
            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email.trim()))) {
                return res.status(400).send({ status: false, msg: "Not a valid Email provide valid email" })
            }
        let findEmail = await userModel.findOne({ email });
        if (findEmail) {
            res.status(400).send({ status: false, message: "Email is already updated " })
            return
        }

        if (isValid(body.phone))
            if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/.test(phone.trim()))) {
                return res.status(400).send({ status: false, msg: "Not a valid Number provide valid phone No." })
            }
        let findPhone = await userModel.findOne({ phone });
        if (findPhone) {
            res.status(400).send({ status: false, message: "Phone is already updated " })
            return
        }
        //validation for password
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }
        if (!(/^.{8,15}$/.test(password))) {
            return res.status(400).send({ status: false, msg: "Invalid Password" })
        }
        var encryptedPassword = await bcrypt.hash(password, 10)
        if (profileImage && profileImage.length > 0) {
            var uploadedFileURL = await aws.uploadFiles(profileImage[0])

        } else {
            return res.status(400).send({ msg: "No file found" })
        }


        let isAddress = JSON.parse(address)
        let { billing, shipping } = isAddress
        if (!isValid(shipping.street)) {
            res.status(400).send({ status: false, message: "Shipping Street Address is required" })
            return
        }
        if (!isValid(shipping.city)) {
            res.status(400).send({ status: false, message: "Shipping Address City is required" })
            return
        }
        if (!isValid(shipping.pincode)) {
            res.status(400).send({ status: false, message: "Shipping Address pincode is required" })
            return
        }

        if (!isValid(billing.street)) {
            res.status(400).send({ status: false, message: " Billing Street Address is required" })
            return
        }
        if (!isValid(billing.city)) {
            res.status(400).send({ status: false, message: " Billing Address City name is required" })
            return
        }
        if (!isValid(billing.pincode)) {
            res.status(400).send({ status: false, message: " Billing Address pincode is required" })
            return
        }


        const updateData = {
            fname: fname,
            lname: lname,
            email: email,
            phone: phone,
            address: isAddress,
            profileImage: uploadedFileURL,
            password: encryptedPassword
        }
        let updatedItem = await userModel.findOneAndUpdate({ _id: userId }, updateData, { new: true });
        res.status(201).send({ status: true, message: "User updated Succesfully", data: updatedItem });
        return
    }

    catch (err) {
        return res.status(500).send({ Error: err.message })
    }
};




module.exports.registerUser = registerUser
module.exports.userLogin = userLogin
module.exports.getUser = getUser
module.exports.updateUser = updateUser