const express=require('express')
const { response } = require('express')
require('./db/mongoose')
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')
require('dotenv').config()

const app=express()
const port=process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



app.listen(port,()=>{
    console.log('server is up and running')
    // console.log(process.env['JWT_SECRET_CODE'])
})