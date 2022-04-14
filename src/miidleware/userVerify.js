const jwt = require("jsonwebtoken")

const userVerify = async function (req, res, next) {
    try {
        const token = req.headers["authorization"];
        if (!token) {
            res.status(401).send({ status: false, msg: "Token is required" })
            return
        }
      let bearerHeader = token && token.split(' ')[1];
        let decodeToken = jwt.verify(bearerHeader,"group1", { ignoreExpiration: true })

        let expire = decodeToken.exp
        let iat = Math.floor(Date.now() / 1000)
        if (expire < iat) {
            return res.status(401).send({ status: false, msg: "token is expired" })
        }
        if (!decodeToken) {
            res.status(400).send({ status: false, msg: "Inavlid Token" })
            return
        }
        req.userId=decodeToken.userId

        next();

    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}
module.exports.userVerify=userVerify