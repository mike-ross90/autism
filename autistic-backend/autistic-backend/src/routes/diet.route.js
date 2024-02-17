import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import {
  createDietPlans,
  getAllConfirmedPatients,
  getAllMyDiets,
  updateDietPlan,
} from '../controllers/diet.controller.js'
const router = express.Router()

router.route('/get_all_diets').get(authMiddleware, getAllConfirmedPatients)
router.route('/create_diet').post(authMiddleware, createDietPlans)
router.route('/get_all_my_diets').get(authMiddleware, getAllMyDiets)
router.route('/update_diet').put(authMiddleware, updateDietPlan)

export default router
