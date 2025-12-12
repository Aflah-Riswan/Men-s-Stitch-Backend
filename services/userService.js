
const Users = require('../models/users')

const getUserService = async (data) =>{
const {
  page = Number(data.page) || 1,
  limit = Number(data.limit) || 5,
  sort,
  active,
  search 
} = data

const skip = (page-1)*limit

let = filter = {role:'user'}
filter.$or =[{firstName : {$regex : search ,$options : 'i'} , lastName : { $regex : search , $options : 'i'}}]
if(active === 'active') filter.isBlocked = false
if(active === 'inactive') filter.isBlocked = true
let sortQuery = { createdAt : 1}
if(sort === 'old-to-new') sortQuery = {createdAt: -1}
if(sort === 'a-z') sortQuery = {firstName : 1 }
if(sort === 'z-a') sortQuery = {firstName : -1 }

const users = await Users.find(filter).sort(sortQuery).skip(limit)
if(users){
  console.log(users)
}else{
  console.log("found error ")
}

}