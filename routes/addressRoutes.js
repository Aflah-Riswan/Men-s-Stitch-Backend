
import  express  from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import { validateAddress } from '../middlewares/validateAddress.js'
import { addAddress, getAddress, updateAddress } from '../controllers/addressController.js'

const router = express.Router()

router.post('/',protect , validateAddress , addAddress)
router.get('/',protect , getAddress)
router.put('/:addressId/',protect , validateAddress, updateAddress)
export default router