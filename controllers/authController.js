const  authService = require('../services/authService')

const loginUser = async (req, res) => {
  try {
     const result = await authService.loginService(req.body)
     console.log("result : ",result)
     if(result.success){
       res.json({success : result.message})
     }else{
       res.json({failed : result.error})
     }
    
  } catch (error) {
    return res.status(400).json({message : 'we found some errors'})
  }


}


module.exports = { loginUser }