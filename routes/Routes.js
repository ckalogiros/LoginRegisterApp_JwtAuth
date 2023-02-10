import * as auth from '../routeControllers/routeController.js'
import Express from 'express'
import { Authorize } from '../Authorization.js';


export const router = Express.Router();


router.get('/', auth.HomeGet);
router.get('/home', auth.HomeGet);

router.get('/users/register', auth.RegisterGet);
router.post('/users/register', auth.RegisterPost);

router.get('/users/login', auth.LoginGet);
router.post('/users/login', auth.LoginPost);

router.get('/users/logout', Authorize, auth.LogoutGet);

router.get('/users/forgotPwd', auth.ForgotPwdGet);
router.post('/users/forgotPwd', auth.ForgotPwdPost);

/* Authorized Pages */
router.get('/users/auth/resetPwd', Authorize, auth.ResetPwdGet);
router.post('/users/auth/resetPwd', Authorize, auth.ResetPwdPost);
// router.get('/auth/authorizedPage', Authorize, auth.AuthPageGet);
router.get('/auth/authorizedPage', auth.AuthPageGet);

/* Success Pages */
router.get('/success', (req, res)=>{
    res.render('emailSentSuccess');
});
router.get('/users/registrationSuccess', auth.RegistrationSuccessGet);
// router.get('/users/resetPasswordSuccess', auth.ResetPasswordSuccess);
// router.get('/registrationSuccess', (req, res)=>{res.render('registrationSuccess')});

/* Error Pages */
router.get('/accessDenied', auth.accessDeniedGet);


// router.get('*', ValidateTokenMiddleware);