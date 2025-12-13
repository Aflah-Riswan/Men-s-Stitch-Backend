

const userService = require('../services/userService')
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      search = '',
      sort = '',
      active = ''
    } = req.query

    const response = await userService.getUserService({ page, limit, search, sort, active })
    if(response.success){
      return res.json(response)
    }else{
      return res.json(response)
    }
  } catch (error) {
     return res.json({ success: false ,message : errror.message})
  }

}

const blockUser = async (req,res)=>{
  try {
    console.log("inside block")
    const {id} = req.params
    const response = await userService.blockUserService(id)
    if(response.success){
      return res.json(response)
    }else{
      console.log(response)
      return res.json(response)
    }
  } catch (error) {
    return res.json({success:false , message : 'something went wrong'})
  }
}

const getCustomerAnalytics = async (req,res)=>{
  try {
    const response = await userService.analyticsService()
    if(response.success){
      return res.json(response)
    }else{
      console.log(response)
      return res.json(response)
    }
  } catch (error) {
     return res.json({ success:false ,message : ' something went wrong'})
  }
}
module.exports = { getUsers ,blockUser , getCustomerAnalytics }