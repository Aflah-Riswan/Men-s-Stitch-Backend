
const reviewService = require('../services/reviewService')

const getFeaturedReview = async (req,res)=>{
  try {
    const response = await reviewService.getFeaturedReviewService()
    if(response.success){
      return res.json(response)
    }else{
      console.log(response)
      return res.json(response)
    }
  } catch (error) {
    console.log(error)
    return res.json({ success: true ,message: 'something went wrong'})
  }
}
module.exports =  { getFeaturedReview }