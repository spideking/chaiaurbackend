import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middlleware.js';

const router = Router();

router.route('/register').post(
  upload.fields([
    { name: 'avator', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  registerUser
);

router.route('/login').post(loginUser);

export default router;
