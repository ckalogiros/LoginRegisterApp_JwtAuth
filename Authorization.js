import Jwt from "jsonwebtoken";
import Dotenv from 'dotenv/config';
import { FindUser, UpdateUser } from "./MongoDb.js";


export function Authorize(req, res, next) {
    const token = req.cookies.jwt;

    if (token) {
        Jwt.verify(token, process.env.LOGIN_SECRET, (err, decodedToken) => {
            if (err) {
                console.log('Authorization ERROR. err:', err);
                // res.redirect('users/login');
                res.redirect('/login');
            }
            else {
                console.log('Token:', token);
                console.log('Decoded Token:', decodedToken);
                next();
            }
        })
    }
    else {
        res.redirect('/users/login');
    }
}

export const ValidateTokenMiddleware = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        Jwt.verify(token, process.env.LOGIN_SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                const query = {_id: decodedToken.id}
                let user = await FindUser(query, null);
                res.locals.username = user.email.split('@')[0];
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

export async function GetUserViaTokenValidation(token) {
    let user = null;

    if (token) {
        const decode = await Jwt.verify(token, process.env.LOGIN_SECRET)
        if(decode){
            const query = {_id: decode.id}
            user = await FindUser(query, null);
            // If user is found, return the email and password only
            return {email:user.email, password:user.password};
        }
    }
    return user; // If user not found, return null
};

export function  CreatejwtToken(id){
    return Jwt.sign({id}, process.env.LOGIN_SECRET);
}


export async function ResetPassword(token, password) {

    if (token) {
        const decode = await Jwt.verify(token, process.env.LOGIN_SECRET)
        if(decode){
            const query = {_id: decode.id}
            const user = await UpdateUser(query, {password:password}, null);
            if(user) console.log('Update password was succesful!!!')           
            else console.log('Failed to update password.')           
        }
    }
}