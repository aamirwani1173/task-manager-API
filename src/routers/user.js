const express=require('express')
const User=require("../models/user")
const router=new express.Router()
const auth=require('../middleware/auth')
const multer=require('multer')
const upload=multer({
    // dest:'images',
    limits:{
        fileSize:1000000,
    },
    fileFilter(req,file,cb){
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
      }
})
 

// signup a user
router.post('/user/signup',async (req,res)=>{
    const user= new User(req.body)
    
    try{
        // await user.save()
        const token=await user.generateAuthToken()
        await user.save()
        // const profile=await user.publicProfile()
        res.status(200).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})


//upload avatar
router.post('/avatar',auth,upload.single('picture'),async (req,res)=>{
    req.user.avatar=req.file.buffer
    await req.user.save()
    res.status(200).send('uploaded successfully')
},(error,req,res,next)=>{
    res.status(415).send({error:error.message})
})

// remove avatar

router.delete('user/avatar/remove',auth,async (req,res)=>{
    const user=req.user
    try{
        user.avatar=undefined
        await user.save()
        res.send('removed successfully')
    }catch(e){
        res.status(400).send(e)
    }
    
    
})

//user login

router.post('/user/login',async(req,res)=>{
    try{
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateAuthToken()
        await user.save()
        // const profile= user.publicProfile()
        res.status(200).send({user,token})
    }catch(e){
        res.send(e)
    }
})

//user logout
router.post('/user/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return   token.token!==req.token
        })
        await req.user.save()
        res.send('logged out ')
       
    }catch(e){
        res.status(500).send(e)
    }
})

//logout of all sessions
router.post('/user/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        
        await req.user.save()
        // console.log(req.user.tokens.length)

        res.status(200).send('logged out of all sessions')
    }catch(e){
        res.status(400).send(e)
    }
})

//get profile

router.get('/user/profile',auth,async (req,res)=>{
    const user=req.user
    const token=req.token
    // const profile=await user.publicProfile()
    res.status(200).send({user,token})
})  


//update a user
router.patch('/user/update',auth,async (req,res)=>{
    const user=req.user
    const updates=Object.keys(req.body)
    const allowedProperty=['name','email','age','password']
    const isValidProperty=updates.every((update)=>{
        return allowedProperty.includes(update)
    })
    if(!isValidProperty){
        return res.status(404).send('Not a valid property to update')
    }
    
    try{
    //    const user= await User.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
        // const user=await User.findById(_id)
        updates.forEach((update)=>user[update]=req.body[update])
        await user.save()


        // if(!user){
        //   return res.status(404).send('no such user found')
    //    }
        res.status(200).send({user})
    } catch(e){
        res.status(400).send(e)
    }
})

// delete account
router.delete('/user/delete',auth,async (req,res)=>{
    try{
        await req.user.remove()
        res.send('deleted successfully')
    }catch(e){
        res.status(400).send(e)
    }
    
})

//render avatar
router.get('user/showavatar',auth,(req,res)=>{
    const user=req.user
    try {
        if(!user.avatar){
            throw new Error()
        }
        res.setHeader('Content-Type','image/jpeg')
        res.send(user.avatar)
    } catch (e) {
        res.status(400).send()
    }
})


module.exports=router