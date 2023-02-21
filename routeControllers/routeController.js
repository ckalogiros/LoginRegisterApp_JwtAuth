import { ValidateRegistration, ValidatePassword, ValidateMail } from "../validation.js";
import { SetAuthError, GetAuthError, MessagesCreate } from "../messagesHandler.js";
import { UserModel, CreateUser, FindUser } from "../database.js";
import Dotenv from 'dotenv/config';
import Jwt from 'jsonwebtoken';
import { forgotPwd } from "../mailer.js";
import { CreatejwtToken, ResetPassword, GetUserViaTokenValidation } from "../authorization.js";
import { TIME, COOKIE_SEQURITY, COOKIE_HTTP } from "../Constants.js";
import { Authorize2, VerifyToken } from "../authorization.js";


export async function HomeGet(req, res) {
    res.locals.messages = MessagesCreate();
    const user = await Authorize2(req, res);
    if (user) {
        res.locals.username = user.email.split('@')[0];
    }
    res.render('home');
}
export async function AuthPageGet(req, res) {
    res.locals.messages = MessagesCreate();
    const user = await Authorize2(req, res);
    if (user) {
        res.locals.username = user.email.split('@')[0];
        res.render('authorizedPage');
    }
    else {
        SetAuthError('Authorization token expired.');
        res.redirect('/accessDenied');
    }
}
export function RegisterGet(req, res) {
    res.locals.messages = MessagesCreate();
    res.locals.user = {email:'', password:''};    
    res.render('register');
}
export async function RegisterPost(req, res) {
    const { email, password, password2 } = req.body;
    // Validate that the user's input
    const messages = ValidateRegistration(email, password, password2);

    // Keep any of the inpu if it passes validation
    if(!messages.error.email.anyExists){res.locals.email = email;}
    else{res.locals.email = '';}
    if(messages.error.password.msg[0] !=='Password required<br/>'){
        res.locals.password = password;
    }
    else{res.locals.password = '';}
    if( messages.error.password.msg[0] !=='Confirm password required<br/>' &&
        messages.error.password.msg[0] !=='Passwords don\'t match<br/>'){
        res.locals.password2 = password2;
    }
    else{res.locals.password2 = '';}


    const found = await FindUser({ email: email }, null);
    if (!found) {
        if (!messages.error.email.anyExists && !messages.error.password.anyExists) {
            const newUser = new UserModel({ email: email, password: password, });

            // Create User
            const user = await CreateUser(newUser, (err, user) => { if (err) throw err; });

            // Create authentication token
            const maxAge = 30 * TIME.MINUTES;
            const token = CreatejwtToken(user.id, maxAge);
            console.log('Token:', token)

            return res.redirect('/users/registrationSuccess');
        }
        res.locals.messages = messages; // Pass messages to the rendered page
        return res.render('register');
    }

    // Case user was found, so this email account already exists
    messages.error.email.msg.push('This email already exists. Try to login.');
    messages.error.email.anyExists = true;
    res.locals.messages = messages; // Pass messages to the rendered page
    res.render('register');
}
export async function LoginGet(req, res) {
    res.locals.messages = MessagesCreate();

    // Case we have been redirected from a new registration
    const user = await GetUserViaTokenValidation(req.cookies.jwt);
    console.log('Login - user check:', user)

    res.locals.user = user;
    res.render('login');
}
export async function LoginPost(req, res) {
    // Create a message buffer for user invalid input 
    const { email, password } = req.body;

    const query = { email: email, password: password };
    const user = await FindUser(query, null);
    if (user) {
        // Create token
        const maxAge = 30 * TIME.MINUTES;
        const token = CreatejwtToken(user._id, maxAge);
        res.cookie('jwt', token, { httpOnly: COOKIE_HTTP, secure: COOKIE_SEQURITY, maxAge: maxAge });
        console.log(req.cookies)
        // res.locals.username = user.email.split('@')[0].substr(0,3);
        res.locals.username = user.email.split('@')[0];
        res.redirect('/home');
    }
    else {
        const messages = MessagesCreate();
        messages.error.email.msg.push('Invalid email or password');
        messages.error.email.anyExists = true;
        res.locals.messages = messages;

        res.render('login')
    }

}
export function LogoutGet(req, res) {
    res.cookie('jwt', '', { httpOnly: COOKIE_HTTP, secure: COOKIE_SEQURITY, maxAge: 1 });
    res.redirect('/');
}
export function ForgotPwdGet(req, res) {
    res.locals.messages = MessagesCreate();
    res.render('forgotPwd')
}
export async function ForgotPwdPost(req, res) {
    const emailRecipient = req.body;
    const messages = ValidateMail(emailRecipient.email);
    console.log('Forgot password emailRecipient:', emailRecipient)

    if (!messages.error.email.anyExists) {
        const url = `${req.protocol}://${req.headers.host}`;
        // const url = `${req.protocol}://${req.headers.hostname}`;
        await forgotPwd(url, emailRecipient.email, function () {
            console.log('FROM MAILER')
            res.redirect('/success');
        });
    }
    else {
        res.locals.messages = messages;
        res.render('forgotPwd');
    }

    // res.render('forgotPwd')
}
export async function ResetPwdGet(req, res) {

    const { token, id, email } = req.query;
    console.log(`Email link query:  token:${token}  userId:${id}  email:${email}`)

    const verified = VerifyToken(token)
    res.locals.messages = MessagesCreate();

    if (verified) {
        const user = await GetUserViaTokenValidation(req.query.token);

        if (user) {
            res.locals.resetPwdUserId = id; //  HACK: To pass the user id and store it in a none visible input field.
            res.render('resetPwd')
        }
        else {
            //TODO: massage: user not found
            res.render('authFail')
        }
    }
    else {
        //TODO: massage: token not verified
    }

}
export async function ResetPwdPost(req, res) {

    // const token = req.cookies.jwt;
    const { userid, password, password2 } = req.body; //  HACK: We pass the user id via a none visible input field.
    const maxAge = 1 * TIME.MINUTES;
    const newToken = CreatejwtToken(userid, maxAge);
    console.log(`Reset password:  newToken:${newToken}  new password:${password}`)

    res.locals.messages = ValidatePassword(password, password2);
    res.locals.resetPwdUserId = userid;

    if (!res.locals.messages.error.password.anyExists) {
        const user = ResetPassword(newToken, password)
        if (user) {
            const user = await GetUserViaTokenValidation(newToken);
            res.locals.messages = MessagesCreate();
            return res.render('resetPasswordSuccess', { user: user })
        }
    }
    res.render('resetPwd')
}
export async function RegistrationSuccessGet(req, res) {
    res.locals.user = await GetUserViaTokenValidation(req.cookies.jwt);
    if(!res.locals.user) res.locals.user = {email:'', password:''};
    res.locals.messages = MessagesCreate();
    res.render('registrationSuccess')
}
export function accessDeniedGet(req, res) {
    const authError = GetAuthError();
    if (authError) res.locals.authError = authError;
    res.render('accessDenied')
}

