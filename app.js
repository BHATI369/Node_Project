const express = require('express');
const app = express();
const mongoose = require('mongoose')
const User = require('./model/users')
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var crypto = require('crypto');
var key = "password";
var algo = 'aes256';
const jwt=require('jsonwebtoken')
jwtKey="jwt"

// MongoDB Connection

mongoose.connect('mongodb+srv://Bhati:Bhati1234@cluster0.xralu.mongodb.net/task1?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.warn("DB connectedd db");
    })

// Registertion of User

// POST API 

app.post('/register', jsonParser,function(req,res){
    var cipher=crypto.createCipher(algo,key);
    var encrypted=cipher.update(req.body.password,'utf8','hex')
    +cipher.final('hex');

    console.warn(encrypted)
    const data= new User({
        _id:mongoose.Types.ObjectId(),
        name:req.body.name,
        email:req.body.email,
        address:req.body.address,
        password:encrypted,
    })

// User Requesting the token

  data.save().then((result)=>{
      
    // Save the token

   jwt.sign({result},jwtKey,{expiresIn:'300s'},(err,token)=>{
       res.status(201).json({token})
   })
  })
  .catch((err)=>console.warn(err)
  )
})


// User validation 

app.post('/login',jsonParser,function(req,res){
User.findOne({email:req.body.email}).then((data)=>{
    var decipher=crypto.createDecipher(algo,key);
    var decrypted=decipher.update(data.password,'hex','utf8')+
    decipher.final('utf8');
    if(decrypted==req.body.password){
        jwt.sign({data},jwtKey,{expiresIn:'300s'},(err,token)=>{
            res.status(200).json({token})
        })
    }
})    
})

//Login the User ans using middleware

app.get('/users', verifyToken, function(req, res) {
    User.find().then((result)=>{
     res.status(200).json(result)
    })
})

function verifyToken(req, res,  next){
    const bearerHeader=req.headers['authorization'];
    
    //Return Token

    if(typeof bearerHeader !=='undefined')
    {
        const bearer= bearerHeader.split(' ')
        console.warn(bearer[1])
        req.token=bearer[1]    
        jwt.verify(req.token,jwtKey,(err ,authData)=>{
            if(err)
            {
                res.json({result:err})
            }
            else{
                next();
            }
        })
    }
    else{
        res.send({"result":"Token not Provied"})
    }
}

//READ API

app.get('/read',function(req,res){
    User.find().then(()=>{
        res.status(201).json(data)
    })
})


// DELETE API

app.delete('/user/:id',function(req,res){

    User.deleteOne({_id:req.params.id}).then((result)=>{
     res.status(200).json(result)
    }).catch((err)=>{console.warn(err)})
})


//UPDATE API

app.put("users/:id",function(req,res){
    User.updateOne({_id:req.params.id},
        {$set:{
            name:req.body.name,
            email:req.body.email,
            address:req.body.address,
            password:req.body.password,
        }

        })
})


app.listen(5000);
