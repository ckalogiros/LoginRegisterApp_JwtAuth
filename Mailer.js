import nodemailer from 'nodemailer'
import Dotenv from 'dotenv'
import { FindUser } from './database.js';
import { CreatejwtToken } from './authorization.js';
import { TIME } from './Constants.js';



const transporter = nodemailer.createTransport({
    service:'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    logger: true,
    debug: true,
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.GMAIL_WINDOWS_APP_PWD, // Google's gmail needs an app password. See: https://myaccount.google.com/u/3/lesssecureapps?rapt=AEjHL4MFOmwAofsekYwspyP14cDTwxY91_o9IAHnVHk0CAPpvSaaRiLpFqpRN1yhZAIrQUJIebl9sP9uJSAulZ_XxyO9WmyRHQ
    }
});

export function SendEmail(emailRecipient){
    const options = {
        from: process.env.EMAIL_SENDER,
        to: emailRecipient,
        subject: 'Nodemailer test',
        text: 'This email has been send with nodemailer'
    };

    transporter.sendMail(options, function(err, info){
        if(err) console.log('Email sender error: ', err)
        else console.log('Email sent: ', info.response)
    });
}

export async function forgotPwd(url, emailRecipient, callback){
    
    const user = await FindUser({email:emailRecipient});
    if(!user) throw new Error("User does not exist");
    const resetToken = CreatejwtToken(user._id, 1*TIME.MINUTES); 
    
    const link = `${url}/users/auth/resetPwd?token=${resetToken}&id=${user._id}&email=${user.email}`;

    const options = {
        from: process.env.EMAIL_SENDER,
        to: emailRecipient,
        subject: 'Reset Password',
        text: 'This email has been send with nodemailer.\nIn order to reset your password click the link and follow the instructions.\n' + link,
    };
    
    // transporter.sendMail(options, function(err, info){
    //     if(err) console.log('Email sender error: ', err)
    //     else {
    //         console.log('Email sent: ', info.response)
    //         return true;
    //     } 
    // });
    transporter.sendMail(options, callback);
}