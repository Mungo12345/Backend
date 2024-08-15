const express = require("express")
const path = require("path")
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const {collection, owners, landholding} = require("./src/services/db")
const cors = require("cors")
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static('public'));

//Display
app.get("/getOwners", async(req,res)=>{
    await owners.find()
    .then(users => res.json(users))
    .catch(err => res.json(err))

})
app.get("/getOwner/:id",async(req,res)=>{
    const {id} = req.params
    await owners.findOne({_id: id})
    .then(users => res.json(users))
    .catch(err => res.json(err))

})


app.get("/getLandHoldings",async(req,res)=>{
    await landholding.find()
    .then(landhold => res.json(landhold))
    .catch(err => res.json(err))

})

app.get("/getLandHolding/:id",async(req,res)=>{
    const {id} = req.params
    await landholding.findOne({_id: id})
    .then(users => res.json(users))
    .catch(err => res.json(err))

})
//Edit
app.put("/updateOwner/:id", async(req,res) =>{
    const{id,...rest} = req.body.values
    await landholding.updateMany({ownerID:id}, [{$set:{ownerID:id,ownerFrom:rest.ownerName}}])
    const data = await owners.updateOne({_id : id}, rest)
    res.send({success : true, message : "data update successful", data : data})
})

app.put("/updateLandHolding/:id", async(req,res) =>{
    const{id,...rest} = req.body.values
    console.log(id)
    const township = rest.townshipBeg + rest.townshipEnd
    const range = rest.rangeBeg + rest.rangeEnd
    const sectionName = rest.section + "-" + township + "-" + range
    const name = sectionName + rest.legalEntity
    const ownerFrom = await owners.findOne({_id:rest.ownerID},{ownerName:1,_id:1})
    rest.ownerFrom = ownerFrom.ownerName
    rest.name = name
    rest.range = range
    rest.township = township
    rest.sectionName = sectionName
    delete rest.rangeBeg
    delete rest.rangeEnd
    delete rest.townshipBeg
    delete rest.townshipEnd
    await owners.updateOne({_id:rest.prevOwnerID}, [{$set:{totalLand:{$subtract:["$totalLand", 1 ]}}}])
    delete rest.prevOwnerID
    await owners.updateOne({_id:ownerFrom._id}, [{$set:{totalLand:{$add:["$totalLand", 1 ]}}}])
    const data = await landholding.updateOne({_id : id}, rest)
    res.send({success : true, message : "data update successful", data : data})
})
//Delete
app.delete("/deleteOwner/:id",async(req,res) =>{
    const id = req.params.id
    console.log(id)
    await landholding.deleteMany({ownerID:id})
    const data = await owners.deleteOne({_id : id})
    res.send({success : true, message : "data deleted successfully", data : data})
})

app.delete("/deleteLandHolding/:id",async(req,res) =>{
    const id = req.params.id
    const owner = await landholding.findOne({_id:id},{ownerID:1,'_id':0})
    await owners.updateOne({_id:owner.ownerID}, [{$set:{totalLand:{$subtract:["$totalLand", 1 ]}}}])
    const data = await landholding.deleteOne({_id : id})
    res.send({success : true, message : "data deleted successfully", data : data})
})
//Login
app.post("/",async(req,res)=>{
    const{email,password}=req.body

    try{
        const check=await collection.findOne({email:email, password:password})

        if(check){
            res.json("exist")
        }
        else{
            res.json("notexist")
        }

    }
    catch(error){
        res.json("fail")
    }

})


//Sign In
app.post("/signIn",async(req,res)=>{
    const{email,password}=req.body

    const data={
        email:email,
        password:password
    }

    try{
        const check=await collection.findOne({email:email})

        if(check){
            res.json("exist")
        }
        else{
            res.json("notexist")
            await collection.insertMany([data])
        }

    }
    catch(e){
        res.json("fail")
    }

})
//Add
app.post("/Add", async(req,res)=>{
    const{ownerName,entityType,ownerType,address}=req.body
    const totalLand = 0

    const data={
        ownerName:ownerName,
        entityType:entityType,
        ownerType:ownerType,
        address:address,
        totalLand:totalLand
    }

    try{
        const check=await owners.findOne({ownerName:ownerName,address:address})

        if(check){
            res.json("exist")
        }
        else{
            res.json("notexist")
            await owners.insertMany([data])
        }

    }
    catch(e){
        res.json("fail")
    }

})

app.post("/AddLand", async(req,res)=>{
    const{ownerID,legalEntity,netMineralAcres,mineralOwnerRoyalty,section,townshipBeg,townshipEnd,rangeBeg,rangeEnd,titleSource}=req.body
    const township = townshipBeg + townshipEnd
    const range = rangeBeg + rangeEnd
    const sectionName = section + "-" + township + "-" + range
    const name = sectionName + legalEntity
    const ownerFrom = await owners.findOne({_id:ownerID},{ownerName:1,'_id':0})
    const data={
        name:name,
        ownerID:ownerID,
        ownerFrom:ownerFrom.ownerName,
        legalEntity:legalEntity,
        netMineralAcres:netMineralAcres,
        mineralOwnerRoyalty:mineralOwnerRoyalty,
        sectionName:sectionName,
        section:section,
        township:township,
        range:range,
        titleSource:titleSource

    }

    try{
        
        await landholding.insertMany([data])
        await owners.updateOne({_id:ownerID}, [{$set:{totalLand:{$add:["$totalLand", 1 ]}}}])

    }
    catch(e){
        res.json("fail")
    }

})
//FileUpload
// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// Mongo URI
const mongoURI = 'mongodb+srv://Admin:HelloWorld@holdings.sqfultd.mongodb.net/?retryWrites=true&w=majority&appName=Holdings';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
})
const upload = multer({
  storage:storage
})

app.post('/uploadOwnerFile/:id', upload.single('image') ,async(req,res) => {
  const id = req.params.id
  const image = req.file.filename
  await owners.updateOne({_id:id}, [{$set:{fileName:image}}])

})
app.post('/uploadLandFile/:id', upload.single('image') ,async(req,res) => {
  const id = req.params.id
  const image = req.file.filename
  await landholding.updateOne({_id:id}, [{$set:{fileName:image}}])

})

app.listen(3000,()=>{
    console.log("port connected");
})

