const authService = require('../services/authService')

const loginUser = async (req, res) => {
  console.log("inside loginuser auth controller")
  try {
    const result = await authService.loginService(req.body)
    console.log("result : ", result)
    if (result.success) {
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
      })
      res.json({ success: true, message: result.message, accessToken: result.accessToken, role: result.role })
    } else {
      res.json({ success: false, message: result.error })
    }

  } catch (error) {
    return res.status(400).json({ message: 'we found some errors' })
  }

}

const refreshAccessToken = async (req, res) => {
  try {

    const { refreshToken } = req.cookies
    const result = await authService.refreshAccessTokenService(refreshToken)
    if (result.succeess) {
      return res.json({
        success:true,
        accessToken : result.accessToken
      })
    }else {
      return res.status(403).json ({
        success:false,
        message: result.message
      })
    }

  } catch (error) {
  return res.status(400).json({success:false,message:"something went wrong"})
  }
}

const createUser = async (req,res)=>{
  try {
    console.log(req.body)
   const response = await authService.createUserService(req.body)
   console.log(response)
   if(response.success){
     res.cookie('refreshToken',response.refreshToken ,{
       httpOnly : true,
       secure:true,
       sameSite:'strict' 
     })
     return res.json({
      success:true,message:response.message,
      accessToken:response.accessToken,role:response.user.role
    })
   }
   else return res.json({success:false ,message : response.message})

  } catch (error) {
    console.log(error)
    return res.json({success:false ,message : error.message})
  }
}


module.exports = { loginUser, refreshAccessToken,createUser  }