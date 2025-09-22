const express = require("express")
const connectDB=require('./db.js')
const itemModel=require('./user/details.js')
const cors=require('cors')

const app=express()

app.use(express.json())

connectDB()
app.get('/',async(req,res)=>{
    const response= await itemModel.find()
     return res.json({items:response})

})
app.listen("3000",()=>{
    console.log("sever is running !!!") 
})