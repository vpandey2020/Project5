const express = require('express');
const bodyParser = require('body-parser');
const route = require('../src/router/route')
const { default: mongoose } = require('mongoose');
const app = express();
const multer = require("multer")


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any())
mongoose.connect("mongodb+srv://Projectblog1:Roomno20@cluster0.vl9g6.mongodb.net/Group_01-DB?authSource=admin&replicaSet=atlas-fm8m4t-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true", {

        useNewUrlParser: true
    })
    .then(() => console.log("MongoDb is connected now"))
    .catch(err => console.log(err))

app.use('/', route);


app.listen(process.env.PORT || 3000, function() {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});