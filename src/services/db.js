const mongoose=require("mongoose")
mongoose.connect("mongodb+srv://Admin:HelloWorld@holdings.sqfultd.mongodb.net/?retryWrites=true&w=majority&appName=Holdings")
.then(()=>{
    console.log("mongodb connected");
})
.catch(()=>{
    console.log('mongodb connection failed');
})


const Users=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const Owners=new mongoose.Schema({
    ownerName:{
        type:String,
        required:true
    },
    entityType:{
        type:String,
        required:true
    },
    ownerType:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    totalLand:{
        type:Number,
        required:true

    },
    fileName:{
        type:String,
        required:false
    }
})

const landHolding =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    ownerID:{
        type:String,
        required:true
    },
    ownerFrom:{
        type:String,
        required:true
    },
    legalEntity:{
        type:String,
        required:true
    },
    netMineralAcres:{
        type:String,
        required:true
    },
    mineralOwnerRoyalty:{
        type:String,
        required:true
    },
    sectionName:{
        type:String,
        required:true
    },
    section:{
        type:String,
        required:true
    },
    township:{
        type:String,
        required:true
    },
    range:{
        type:String,
        required:true
    },
    titleSource:{
        type:String,
        required:true
    },
    fileName:{
        type:String,
        required:false
    }
})

const collection = mongoose.model("collections",Users)
const owners = mongoose.model("owners",Owners)
const landholding = mongoose.model("landHolding",landHolding)

module.exports={collection,owners,landholding}
