
import  express  from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import { validateAddress } from '../middlewares/validateAddress.js'
import { addAddress } from '../controllers/addressController.js'

const router = express.Router()

router.post('/',protect , validateAddress , addAddress)

export default router