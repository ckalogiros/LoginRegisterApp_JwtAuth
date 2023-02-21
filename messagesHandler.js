// Global variable but as a private, to store and persist any authentication error messages
let authError = '';
export function SetAuthError(msg){authError = msg;}
export function GetAuthError(){return authError;}


// Generic messages object
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
            anyExists: false,
        },
    };
    return messages;  
}
