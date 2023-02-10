import { MESSAGES } from "./Constants.js";

let authError = '';
export function SetAuthError(msg){authError = msg;}
export function GetAuthError(){return authError;}

export function MessagesCreate() {
    const messages = {
        error: {
            email:{
                msg: [],
                anyExists: false,
            },
            password:{
                msg: [],
                anyExists: false,
            },
        },
        success: {
            email:'',
            password:'',
        },
    };
    return messages;  
}
