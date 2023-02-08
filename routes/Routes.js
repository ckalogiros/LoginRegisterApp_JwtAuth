import * as auth from '../routeControllers/authController.js'
import Express from 'express'
import { Authorize, ValidateTokenMiddleware } from '../Authorization.js';


export const router = Express.Router();


router.get('/register', auth.RegisterGet);
router.post('/register', auth.RegisterPost);
router.get('/login', auth.LoginGet);
router.post('/login', auth.LoginPost);
// router.get('*', ValidateTokenMiddleware);
router.get('/logout', auth.LogoutGet);
router.get('/forgotPwd', auth.ForgotPwdGet);
router.post('/forgotPwd', auth.ForgotPwdPost);

router.get('/auth/resetPwd', Authorize, auth.ResetPwdGet);
router.post('/auth/resetPwd', Authorize, auth.ResetPwdPost);
// router.get('/resetPwd', auth.ResetPwdGet);
// router.post('/resetPwd', auth.ResetPwdPost);

// // Autorized pages
// router.get('/login', auth.LoginGet);

// Test cookies
// router.get('/test-cookies', auth.TestCookies);

