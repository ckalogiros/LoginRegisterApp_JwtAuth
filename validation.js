import { MessagesCreate } from "./messagesHandler.js";
import { PASSWORD_MIN_LENGTH } from "./Constants.js";

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
    else if (!IsEmail(email)) {
        messages.error.email.msg.push('Invalid email<br/>');
        messages.error.email.anyExists = true;
    }
    else{ // Success
        messages.success.email = 'Email looks Ok!<br/>';
        messages.success.anyExists = true;
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
    else{ // Success
        messages.success.password = 'Passwords look Ok!<br/>';
        messages.success.anyExists = true;
    }
    return messages;
}


export function ValidatePassword(password, password2) {
    const messages = MessagesCreate();
    if (password === '') {
        messages.error.password.msg.push('Password required');
        messages.error.password.anyExists = true;
    }
    else if (password2 === '') {
        messages.error.password.msg.push('Confirmation password required');
        messages.error.password.anyExists = true;
    }
    else if (password !== password2) {
        messages.error.password.msg.push('Passwords don\'t match');
        messages.error.password.anyExists = true;
    }

    return messages;
}
export function ValidateMail(email) {
    const messages = MessagesCreate();
    if (email === '') {
        messages.error.email.msg.push('Required<br/>');
        messages.error.email.anyExists = true;
    }
    else if (!IsEmail(email)) {
        messages.error.email.msg.push('Invalid email<br/>');
        messages.error.email.anyExists = true;
    }

    return messages;
}
