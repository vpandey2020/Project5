const mongoose =require("mongoose")
const imageRegex = /.*\.(jpeg|jpg|png)$/;
const validFile = function (files) {
    return imageRegex.test(files.originalname);
  };

const phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
const validPhone = function (phone) {
    return phoneRegex.test(phone);
  };

const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
const validEmail = function (email) {
    return emailRegex.test(email);
  };
  
  
const pincodeRegex = /^[1-9][0-9]{5}$/;
const validPincode = function (pincode) {
    return pincodeRegex.test(pincode);
  };
const validPassword = function (password) {
  return password.trim().length >=8 && password.trim().length<= 15;
};

const isValidSizes = (availableSizes) => {
    return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) != -1

}



const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
    const isValidRequestBody = function (reqBody) {
    return Object.keys(reqBody).length > 0
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
  };

  module.exports = {
    validFile,
    validPhone,
    validEmail,
    validPassword,
    isValid,
    isValidRequestBody,
    isValidObjectId,
    validPincode,
    isValidSizes
  }
  