const mongoose =  require('mongoose')
 
async function connectDB(){
    try{
        await mongoose.connect('mongodb://localhost:27017/hrms')
        
        
        console.log("dabase connnected success")
    }catch(err){
        console.log("database connection error", err)
    }
}

module.exports = connectDB