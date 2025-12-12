
const Users = require('../models/users')

const getUsers = async (req,res)=>{
  const {
    page=1,
    limit = 5,
    search='',
    sort='',
    active=''
   } = req.query

   const response = await 
}