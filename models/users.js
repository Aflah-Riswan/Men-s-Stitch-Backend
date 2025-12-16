

const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  firstName:{type:String,required:true,trim:true},
  lastName:{type:String,required:true,trim:true},
  phone:{type:String,required:true,trim:true},
  addressLine1:{type:String,required:true,trim:true},
  addressLine2:{type:String,required:true,trim:true},
  city:{type:String,required:true,trim:true},
  state:{type:String,required:true,trim:true,},
  country:{type:String,required:true,trim:true},
  pincode:{ type:String,required:true, trim:true},
  label:{ type:String, default:'Home', trim:true},
  isDefault:{type:Boolean,default:false}
})

const userSchema=new mongoose.Schema({
  firstName:{type:String,required:true,trim:true},
  lastName:{type:String,required:true,trim:true},
  email:{type:String, required:true, unique:true, lowerCase:true,trim:true,},
  phone:{ type:String, required:true,trim:true},
  password:{type:String,required:true,},
  walletBalance:{type:Number,default:0},
  isPhoneVerified:{type:Boolean,default:false},
  isBlocked:{type:Boolean,default:false}, 
  role:{type:String,default:'user',enum:['user','admin']},
  addresses:{
    type : [addressSchema],
    default:[]
  },
  refreshToken:{type:String,default:null},
 
},
 { timestamps:true})

 const User = mongoose.model('User',userSchema)
 module.exports=User