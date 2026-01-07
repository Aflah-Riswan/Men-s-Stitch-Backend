
import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    user : { type : mongoose.Schema.Types.ObjectId , ref : 'User' , required: true } ,
    order : { type : mongoose.Schema.Types.ObjectId , ref : 'Orders' , unique : true , required: true},
    paymentId : {type : String ,unique: true , required: true },
    amount :  { type : Number , unique : true , required: true},
    transactionType : { type : String ,enum : ['Credit' ,'Debit'] , required: true },
    status : { type : String , enum : ['Pending', 'Success', 'Failed', 'Refunded'] , default : 'Pending' },
    method : { type : String  , required: true },
    description : { type: String , default : '' }
  },
  { timestamps : true }
)
const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;