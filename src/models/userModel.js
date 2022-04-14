const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    fname: {
        type:String,
        required:"First name is mandatory",
        trim :true
    },
    lname:{
        type:String,
        required:"Last name is Mandatory",
        trim :true

    },
    email:{
        type:String,
        trim:true,
        required:"Email is  Mandatory",
        unique:true,
        lowercase:true
    },
    //S3 Link
    profileImage:{
        type:String,
        required:"Profile image is required"
    },
    phone:{
        type:String,
        required:"Phone no. is Mandatory",
        unique:true,
        trim:true
    },
    //Encrypted password
    password:{
        type:String,
        required:"Please Enter Password",
        minLen:8,
        maxLen:15,
        trim :true
    },
    address:{
        shipping:{
            street:{type:String,required:"Shipping Address is mandatory",trim:true},
            city:{type:String,required:"please enter your City",trim:true },
            pincode:{type:Number,required:"please enter pincode",trim :true},
        },
      billing:{
        street:{type:String,required:" Billing Address is mandatory",trim:true},
        city:{type:String,required:" Please enter your City",trim:true },
        pincode:{type:Number,required:"please enter pincode is mandatory",trim:true},

    },
    },



}, {timestamps:true});
module.exports=mongoose.model('user',userSchema)