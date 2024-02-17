import express from 'express'
import {
  register,
  accountVerification,
  resendOtpForAccountVerification,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyOtp,
  socialRegister,
} from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
const router = express.Router()

router.route('/register').post(register)
router.route('/account_verification').post(accountVerification)
router.route('/resend_otp').post(resendOtpForAccountVerification)
router.route('/login').post(login)
router.route('/logout').post(authMiddleware, logout)
router.route('/forgot_password').post(forgotPassword)
router.route('/verify_otp').post(verifyOtp)
router.route('/reset_password').post(resetPassword)
router.route('/social_auth').post(socialRegister)

export default router
