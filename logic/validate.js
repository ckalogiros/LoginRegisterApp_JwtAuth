import { MessagesCreate } from "../MessageHandler.js";
import { PASSWORD_MIN_LENGTH } from "../Constants.js";

/* Validate email. Return true if email is a valid email address and false if not */
export function IsEmail(email){
    if (!(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email))) {
        return false;
    }
    return true;
}

export  function ValidateRegistration(email, password, password2) {

    const messages = MessagesCreate();
    if (email === '') {
        messages.error.email.msg.push('Required<br/>');
        messages.error.email.anyExists = true;
    }
    if (!IsEmail(email)) {
        messages.error.email.msg.push('Invalid email<br/>');
        messages.error.email.anyExists = true;
    }
    if (password === '') {
        messages.error.password.msg.push('Password required<br/>');
        messages.error.password.anyExists = true;
    }
    else if (password2 === '') {
        messages.error.password.msg.push('Confirm password required<br/>');
        messages.error.password.anyExists = true;
    }
    else if (password != password2) {
        messages.error.password.msg.push('Passwords don\'t match<br/>');
        messages.error.password.anyExists = true;
    }
    else if (password.length < PASSWORD_MIN_LENGTH) {
        messages.error.password.msg.push(`Must be at least ${PASSWORD_MIN_LENGTH} characters<br/>`);
        messages.error.password.anyExists = true;
    }
    return messages;
}

export function ValidateLogin(username, password, databaseUsername, databasePassword) {
    const messages = CreateMessagesBuffer();
    if (username === '') {
        messages.error.msg.push('Invalid Username');
        messages.error.anyExists = true;
    }
    else if (username !== databaseUsername) {
        messages.error.msg.push('Incorrect Username');
        messages.error.anyExists = true;
    }
    if (password === '') {
        messages.error.msg.push('Invalid Password');
        messages.error.anyExists = true;
    }
    else if (password !== databasePassword) {
        messages.error.msg.push('Incorrect Password');
        messages.error.anyExists = true;
    }

    return messages;
}
