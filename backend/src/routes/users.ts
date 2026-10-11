import express from 'express';
import { getAllUsers, createUser, getUserById, updateUser, deleteUser, getUserStatistics } from '../controllers/userController';
import { authenticate, requireSuperAdmin } from '../middleware/auth';

const router = express.Router();

// All user routes are protected and require superAdmin privileges
router.use(authenticate, requireSuperAdmin);

router.get('/statistics/overview', getUserStatistics);

router.route('/')
  .get(getAllUsers)
  .post(createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;
