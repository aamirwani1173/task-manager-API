const express=require('express')
const Task=require('../models/task')
const auth=require('../middleware/auth')
const User=require('../models/user')
//create a new task
const router=new express.Router()

router.post('/task',auth,async (req,res)=>{
    const task=new Task({
        ...req.body,
        owner:req.id
    })
    // task.setOwner(req.id)
    try{
       await task.save()
       res.send(task)
    }catch(e){
        res.send(e)
    }
    
})

//list all tasks

router.get('/mytasks',auth,async (req,res)=>{
    const match={}
    // const sort={createdAt:-1}
    
    const options={limit:10,skip:0}
    // if(req.query.sortBy){
    //     options.sort=req.query.sortBy
    // }
    if (req.query.limit){
        options.limit=req.query.limit
    }
    if(req.query.skip){
        options.skip=req.query.skip
    }

    if(req.query.completed){
        match.completed=req.query.completed
    }
    if(req.query.description){
        match.description=req.query.description
    }
    // const completed=req.query.completed
    try{
        const tasks=await req.user.populate({
            path:'tasks',
            match,
            options
        })
        if(!tasks){
            res.status(404).send()
        }
        // const user=await User.findById(req.id).populate('tasks').exec()
        res.status(200).send(req.user.tasks)
    }catch(e){
        res.status(500).send(e)
    }
})

// find task by id
router.get('/task/:id',async (req,res)=>{
    const _id=req.params.id
    try{
        const task=await Task.findById({_id,owner:req.id})
        if(!task){
            return res.status(404).send('no task found with this id')
        }
        res.status(200).send(task)
    }catch(e){
        res.send(e)
    }
})


//update a task by id
router.patch('/task/:id',async (req,res)=>{
    const _id=req.params.id
    const updates=Object.keys(req.body)
    const allowedProperty=['description','completed']
    const isValidProperty=updates.every((update)=>{
        return allowedProperty.includes(update)
    })
    if(!isValidProperty){
        return res.status(404).send('Not a valid property to update')
    }
    try{
    //    const task=await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        const task= await Task.findById({_id,owner:req.id})
        if(!task){
            return res.status(404).send('no task found')
        }
        updates.forEach((update)=>task[update]=req.body[update])
        await task.save()
        res.status(200).send(task)  
    } catch(e){
        res.status(400).send(e)
    }
})


// delete a task by id
router.delete('/task/:id',async (req,res)=>{
    const _id=req.params.id
    try{
        const task=await Task.findByIdAndDelete({_id,owner:req.id})
        if(!task){
            return res.status(404).send('no such task found')
        }
        res.status(200).send('deleted successfully')
    }catch(e){
        res.send(e)
    }
})

router.delete('/tasks/deleteall',auth,async (req,res)=>{
    try{
        await Task.deleteMany({owner:req.id})
        // tasks=[]
        res.send('deleted all tasks')
    }catch(e){
        res.status(500).send(e)
    }
    
    
})

module.exports=router