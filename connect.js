const express = require("express")
const path = require("path")
const {collection, owners, landholding} = require("./src/services/db")
const cors = require("cors")
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())



app.get("/getOwners",(req,res)=>{
    owners.find()
    .then(users => res.json(users))
    .catch(err => res.json(err))

})
app.get("/getOwner/:id",(req,res)=>{
    const {id} = req.params
    owners.findOne({_id: id})
    .then(users => res.json(users))
    .catch(err => res.json(err))

})


app.get("/getLandHoldings",(req,res)=>{
    landholding.find()
    .then(landhold => res.json(landhold))
    .catch(err => res.json(err))

})

app.get("/getLandHolding/:id",(req,res)=>{
    const {id} = req.params
    landholding.findOne({_id: id})
    .then(users => res.json(users))
    .catch(err => res.json(err))

})

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



app.listen(3000,()=>{
    console.log("port connected");
})

