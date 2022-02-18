const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('./task')
require('dotenv').config()
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw ('Email not valid')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if (value<0){
           throw new Error("Age must not be below 0") 
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLength:7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw ("password doesnt meet the requirements")
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
    
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.statics.findByCredentials=async(email,password)=>{
    const user=await User.findOne({email})
    if(!user){
       throw new Error('Unable to login') 
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if (!isMatch){
        throw new Error("Unable to login")
    }
    // await user.save()
    return user
}
userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env['JWT_SECRET_CODE'])
    user.tokens=user.tokens.concat({token})
    // await user.save()
    return token
}
userSchema.methods.toJSON=function(){
    const user=this
    // const publicProf={
    //     id:user._id,
    //     name:user.name,
    //     age:user.age,
    //     email:user.email,
    //     // tokens:user.tokens
    // }
    const userObject=user.toObject()
    delete userObject.password
    delete userObject.tokens
    // await user.save()
    return userObject
}
userSchema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({owner:user._id})
    next()
})

userSchema.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }


    next()
})
const User=mongoose.model('User',userSchema)

module.exports=User