const mongoose=require('mongoose')
const itemSchema=new mongoose.Schema({
    name:String,
    age:Number

})

const itemModel=mongoose.model('item',itemSchema)
module.exports=itemModel