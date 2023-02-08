import {ValidateRegistration, ValidateLogin} from "../logic/validate.js";
import { MessagesCreate } from "../MessageHandler.js";
import { UserModel, CreateUser, FindUser } from "../MongoDb.js";
import Dotenv from 'dotenv/config';
import Jwt from 'jsonwebtoken';
import { trusted } from "mongoose";
import { forgotPwd } from "../Mailer.js";
import { CreatejwtToken, ResetPassword, GetUserViaTokenValidation } from "../Authorization.js";


export function RegisterGet(req, res) {
    res.locals.messages = MessagesCreate();
    res.render('register');
}

export async function RegisterPost(req, res) {
    const { email, password, password2 } = req.body;
    // Validate that the user's input
    const messages = ValidateRegistration(email, password, password2);

    const found = await FindUser({ email: email }, null);
    if (!found) {

        // If user's input is valid, create a new database entry
        if(!messages.error.email.anyExists || !messages.error.password.anyExists){
            const newUser = new UserModel({ email: email, password: password, });
            
            // Create User
            const user = await CreateUser(newUser, (err, user) => {
                if (err) throw err;
                const { username, email } = user;
            });
                    
            // Create authentication token
            const token = CreatejwtToken(user.id);
            res.cookie('jwt', token, { httpOnly:true })
            console.log('Token:', token)
            
            return res.redirect('login');
        }

    }
    // Case that this email account already exists
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
    const {email, password} = req.body;

    const query = { email: email, password: password };
    const user = await FindUser(query, null);
    if(user){
        const token = CreatejwtToken(user._id);
        res.cookie('jwt', token, { httpOnly: trusted });
        // res.status(200).json({ user: user._id });
        res.redirect('/home');
    }
    else{
        // res.redirect('login')
        const messages = MessagesCreate();
        messages.error.email.msg.push('Invalid email or password'); 
        messages.error.email.anyExists = true;
        res.locals.messages = messages;

        res.render('login')
    }

}


export function LogoutGet(req, res) {
    // res.locals.messages = MessagesCreate();
    res.cookie('jwt', '', {maxAge:1});
    res.redirect('/');
}

export function ForgotPwdGet(req, res){
    res.render('forgotPwd')
}
export function ForgotPwdPost(req, res){
    const emailRecipient = req.body;
    console.log('Forgot password emailRecipient:', emailRecipient)

    forgotPwd(emailRecipient.email);

    res.render('forgotPwd')
}

export function ResetPwdGet(req, res){

    const {token, id, email} = req.query;
    console.log(`Email link query:  token:${token}  userId:${id}  email:${email}`)
    
    const user = GetUserViaTokenValidation(req.query.token);
    if(!user)  throw new Error("Reset password ERROR. Token validation failed");
    
    // Create new token
    const newToken = CreatejwtToken(id);
    console.log(`new token:${newToken}`)

    res.render('resetPwd')
}


export function ResetPwdPost(req, res){

    const token = req.cookies.jwt;
    const password = req.body.password;

    console.log(`Reset password:  token:${token}  new password:${password}`)

    ResetPassword(token, password)

    res.render('resetPwd')
}

///// Testing /////////////////////////////////////////////////////////////////////////////
// Test cookie creation
// export function TestCookies(req, res){

//     res.cookie('key1', true); // Create a 'key':key1 with 'value':true

//     /**
//      * Passing an object as a third arg, let us set some cookie properties.
//      * Default cookie life is the sessions life which is until the browser is closed 
//      */
//     res.cookie('key2', true, {maxAge:1000*60}); 
    
//     /**
//      * Another cookie property is the 'secure'. Default value = false.
//      * secure: true. Defines that the cookie will only be created if the protocol used is a secure protocol like https
//     */
//    res.cookie('key2', true, {maxAge:1000*60, secure:true}); 
//    /**
//     * Another cookie property is the 'httpOnly'. Default value = false.
//      * httpOnly: true. Does not allow the cookie to be accesed in the front end js code. 
//      * The cookie is allowed to be transfered through the http protocol
//      */
//     res.cookie('key3', true, {maxAge:1000*60, httpOnly:true}); 

//     // Cookies can be found in the 'request.cookies', that is the request send to the server.
//     const cookies = req.cookies;

//     // We can access a spesific cookie by it's name. E.x. req.cookies.key2

//     // res.send('200', cookies)
//     res.json(cookies)
// }