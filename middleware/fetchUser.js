const jwt = require("jsonwebtoken");

const JWT_secret = "iamagoodbot$";

const fetchUser =(req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error:"Please enter some valid token"})
    }
    try {
        const data = jwt.verify(token,JWT_secret);
        req.user = data.user;
        next()
    } catch (error) {
        res.status(401);
    }
}

module.exports = fetchUser;