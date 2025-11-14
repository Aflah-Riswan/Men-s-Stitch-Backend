
const express= require('express')
const cors=require('cors')
const app=express()
app.use(cors());
app.get('/',(req,res)=>{
  res.send({message:'hello world'})
})
app.listen(3000,()=>console.log('server is running..'))