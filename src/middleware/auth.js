const jwt=require('jsonwebtoken')
const User=require('../models/user')
require('dotenv').config()
const auth=async(req,res,next)=>{
    try{
        // console.log(req.header('Authorization'))
        const token=req.header('Authorization').split(' ')[1]
        const decoded=jwt.verify(token,process.env['JWT_SECRET_CODE'])
        const user=await User.findOne({_id:decoded._id,'tokens.token':token})


        if(!user){
            throw new Error()
        }

        req.token=token
        req.user=user
        req.id=decoded._id
        next()
    }catch(e){
        res.send({error:'You need to login first'})
    }
}


module.exports=auth