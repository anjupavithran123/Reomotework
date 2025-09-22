const  mongoose=require('mongoose');
const connectDB=async()=>{
    try{
        const conn= await mongoose.connect(
            'mongodb+srv://anjupavithranm95_db_user:ObnwvlwSxquXQAc6@cluster0.xyiidkl.mongodb.net/testdb',
 );


      console.log('mongoDB connected ');
    }catch(error)
    {
        console.error(error);
        process.exit(1);

    }
};
module.exports=connectDB;