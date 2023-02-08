import { MESSAGES } from "./Constants.js";


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
