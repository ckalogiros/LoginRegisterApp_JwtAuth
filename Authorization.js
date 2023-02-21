import Jwt from "jsonwebtoken";
import Dotenv from 'dotenv/config';
import { FindUser, UpdateUser } from "./database.js";
import { SetAuthError, GetAuthError } from "./messagesHandler.js";


export function Authorize(req, res, next) {
    const token = req.cookies.jwt;

    if (token) {
        Jwt.verify(token, process.env.LOGIN_SECRET, (err, decodedToken) => {
            if (err) {
                console.log('Authorization ERROR. err:', err);
                SetAuthError('Authorization token expired.');
                res.redirect('/users/accessDenied');
            }
            else {
                console.log('Token:', token);
                console.log('Decoded Token:', decodedToken);
                next();
            }
        })
    }
    else {
        // res.render('restricted');
        next();
    }
}
export async function Authorize2(req, res) {
    const token = req.cookies.jwt;

    if (token) {
        const decoded = Jwt.verify(token, process.env.LOGIN_SECRET);
        const user = await FindUser({_id:decoded.id}, null);
        if(user){
            return user;
        }else{
            return null;
        }
    }else{
        return null;
    }
}
export function VerifyToken(token) {
    if (token) {
        const decoded = Jwt.verify(token, process.env.LOGIN_SECRET);
        return decoded;
    }    
    return null;
}

export async function GetUserViaTokenValidation(token) {
    const decode = VerifyToken(token);
    if (decode) {
            const query = {_id: decode.id}
            const user = await FindUser(query, null);
            if(user){
                // If user is found, return the email and password only
                return {email:user.email, password:user.password};
            }
            // TODO: message: User not found
            else return null;
    }
    // TODO: message: token is not verified
    return null;
};

export function  CreatejwtToken(id, expiration){
    return Jwt.sign({id}, process.env.LOGIN_SECRET, {expiresIn: expiration});
}


export async function ResetPassword(token, password) {
    if (token) {
        const decode = await Jwt.verify(token, process.env.LOGIN_SECRET)
        if(decode){
            const query = {_id: decode.id}
            const user = await UpdateUser(query, {password:password}, null);
            return decode;        
        }

    }
}