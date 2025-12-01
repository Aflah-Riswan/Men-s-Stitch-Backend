
const express = require('express')
const router = express.Router()

router.post('/',(req,res)=>{
  const data = req.body
  console.log(data)
  res.json({data:"got the data"})
})
module.exports = router