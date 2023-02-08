import { CreateUser, FindUser, UserModel } from '../MongoDb.js';
import { MESSAGES, PASSWORD_MIN_LENGTH } from '../Constants.js';
import Express from 'express'



const router = Express.Router();

router.use((req, res, next) => {
    console.log(`ROUTER: ${req.method}: ${req.originalUrl} StatusCode:${res.statusCode} ___________________________________________________________`);
    console.log('Session ID: ', req.sessionID);
    next();
});

router.get('/loginSuccess', (req, res) => {
    req.flash('info', 'Your registration was succesfull!');
    res.redirect('login');
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Login
 */
router.get('/login', (req, res) => {
    const lastSession = GetLastObjInObjFromJson(req.sessionStore.sessions);
    const username = lastSession.a;
    const password = lastSession.b;
    console.log(`From last session: username=${username}, password=${password}`);

    res.locals.messages = CreateMessagesBuffer(); // Empty buffer, so that the ejs's 'message buffer' has been declared before used
    const message = "sakjknscsuihdcihisdns"
    res.render('login', { message: req.flash('info') });
});
router.get('/loginRedirect', (req, res) => {
    res.redirect('/');
});
router.post('/login', (req, res) => {
    // Create a message buffer for user invalid input 
    const username = req.body.username;
    const password = req.body.password;

    const query = { name: req.body.username, password: req.body.password };
    FindUser(query, (err, user) => {
        // if(err) throw err;
        if (user) {
            console.log(`######### User Found! #########\n name:${user.username}, password: ${user.password}, email:${user.email}, id: ${user.id}`)
            console.log(`username:${username}, password: ${password}`)
            res.locals.messages = ValidateLogin(username, password, user.email, user.password);

            // If correct credentials but user isn't logged in... log and set one session-cookie for the user
            if (req.session.isAuthenticated === undefined) { 
                req.session.isAuthenticated = true;
                req.session.username = user.username;
                req.session.password = user.password;
                req.flash('info', 'You have been succesfuly logged to your account!');
                // return res.redirect('dashboard');
            }
            // else{
            //     // Get users cookie
            //     const userSession = GetSession(req.session.);
            // }
        }
        else {
            console.log(`######### User NOT Found! #########\n name:${username}, email: ${password}`)
            res.locals.messages = CreateMessagesBuffer();
            res.locals.messages.error.msg[2].anyExists = true;
            res.locals.messages.error.msg[2].msg[0] = 'Incorrect username or password';
            res.statusCode = 403;

        }
        res.render('login', { message: req.flash('info') });
    });
})

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Registration
 */
router.get('/register', (req, res,) => {
    res.locals.success_msg = '';
    res.locals.error_msg = '';
    res.locals.error = '';
    res.locals.messages = CreateMessagesBuffer();
    res.render('register.ejs');
    // res.render('register', {message: req.flash('info')});
});
router.get('/registerRedirect', (req, res) => {
    res.redirect('register');
});
router.post('/register', (req, res) => {
    // Create a message buffer for user invalid input 
    const { username, email, password, password2 } = req.body;
    res.locals.messages = ValidateRegistration(username, email, password, password2);

    if (!res.locals.messages.error.anyExists) {
        console.log('No validation errors occured')

        /* If the form is valid, continue by adding the user to the database */
        // Create an object based on our database's scheme 
        const newUser = new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        });

        // Create User
        CreateUser(newUser, (err, user) => {
            if (err) throw err;
            const { username, email } = user;
            console.log(`######### ERROR! #########\n Could not create user: name:${username}, email: ${email}`)
        });
        req.session.a = email;
        req.session.b = password;
        return res.redirect('login');
    }
    else {
        res.render('register');
    }

})
router.get('/register2', (req, res) => {
    console.log('------------------- GET request: /users/register2 -------------------')
    res.render('register2');
});
router.post('/register2', (req, res) => {
    // Validation
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('Email', 'email is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('password2', 'password2 is required').notEmpty();

    const errors = req.validationErrors();

    if (!errors) {
        console.log('No validation errors occured')

        /* If the form is valid, continue by adding the user to the database */
        // Create an object based on our database's scheme 
        const newUser = new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        });
        console.log('Adding user:', newUser)

        // Create User
        CreateUser(newUser, (err, user) => {
            if (err) throw err;
            const { username, email } = user;
            console.log(`######### ERROR! #########\n Could not create user: name:${username}, email: ${email}`)
        });

        res.render('register2');
    }
    else {
        console.log('There are some validation errors occured:', errors[0].msg);
        res.render('register2', { errors: errors });
    }
})

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Dashboard
 */
router.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

export default router;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Helper Functions
 */

// function CreateMessagesBuffer() {
//     // var key = "name";
//     // var person = {[key]:"John"}; // same as var person = {"name" : "John"}
//     const messages = {
//         error: {
//             msg: new Array(3),
//             anyExists: false,
//             count: 3,
//         },
//         success: {
//             register: ''
//         },
//     };
//     messages.error.msg[0] = {
//         msg: new Array(MESSAGES.USERNAME.size),
//         anyExists: false
//     }
//     messages.error.msg[1] = {
//         msg: new Array(MESSAGES.EMAIL.size),
//         anyExists: false
//     }
//     messages.error.msg[2] = {
//         msg: new Array(MESSAGES.PASSWORD.size),
//         anyExists: false
//     }
//     messages.error.msg[0].msg[0] = '';
//     messages.error.msg[0].msg[1] = '';
//     messages.error.msg[0].msg[2] = '';
//     messages.error.msg[1].msg[0] = '';
//     messages.error.msg[1].msg[1] = '';
//     messages.error.msg[2].msg[0] = '';
//     messages.error.msg[2].msg[1] = '';
//     messages.error.msg[2].msg[2] = '';

//     return messages;
// }

// function ValidateRegistration(username, email, password, password2) {

//     const messages = CreateMessagesBuffer();
//     if (username === '') {
//         messages.error.msg[0].msg[MESSAGES.USERNAME.NOT_EMPTY] = 'Required<br/>';
//         messages.error.msg[0].anyExists = true;
//         messages.error.anyExists = true;
//         console.log('Error: username:', messages.error.msg[0].msg[MESSAGES.USERNAME.NOT_EMPTY])
//     }
//     if (username.length < 3) {
//         messages.error.msg[0].msg[MESSAGES.USERNAME.MIN_LENGTH] = 'Must be at least 3 characters<br/>';
//         messages.error.msg[0].anyExists = true;
//         messages.error.anyExists = true;
//         console.log('Error: username:', messages.error.msg[0].msg[MESSAGES.USERNAME.MIN_LENGTH])
//     }
//     if (/\b[0-9]$/.test(username[0])) {
//         messages.error.msg[0].msg[MESSAGES.USERNAME.FIRST_NOT_DIGIT] = 'First character must be a letter<br/>';
//         messages.error.msg[0].anyExists = true;
//         messages.error.anyExists = true;
//         console.log('Error: username:', messages.error.msg[0].msg[MESSAGES.USERNAME.FIRST_NOT_DIGIT])
//     }
//     if (email === '') {
//         messages.error.msg[1].msg[MESSAGES.EMAIL.NOT_EMPTY] = 'Required<br/>';
//         messages.error.msg[1].anyExists = true;
//         messages.error.anyExists = true;
//         console.log('Error: email:', messages.error.msg[1].msg[MESSAGES.EMAIL.NOT_EMPTY])
//     }
//     if (!(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email))) {
//         messages.error.msg[1].msg[MESSAGES.EMAIL.IS_EMAIL] = 'Invalid email<br/>';
//         messages.error.msg[1].anyExists = true;
//         messages.error.anyExists = true;
//         console.log('Error: email:', messages.error.msg[1].msg[MESSAGES.EMAIL.IS_EMAIL])
//     }
//     if (password === '') {
//         messages.error.msg[2].msg[MESSAGES.PASSWORD.NOT_EMPTY] = 'Password required<br/>';
//         messages.error.msg[2].anyExists = true;
//         messages.error.anyExists = true;
//         console.log('Error: password:', messages.error.msg[2].msg[MESSAGES.PASSWORD.NOT_EMPTY])
//     }
//     else if (password2 === '') {
//         messages.error.msg[2].msg[MESSAGES.PASSWORD.NOT_EMPTY] = 'Confirm password required<br/>';
//         messages.error.msg[2].anyExists = true;
//         messages.error.anyExists = true;
//         console.log('Error: password:', messages.error.msg[2].msg[MESSAGES.PASSWORD.NOT_EMPTY])
//     }
//     else if (password != password2) {
//         messages.error.msg[2].msg[MESSAGES.PASSWORD.NOT_MATCH] = 'Passwords don\'t match<br/>';
//         messages.error.msg[2].anyExists = true;
//         messages.error.anyExists = true;
//         console.log('Error: password:', messages.error.msg[2].msg[MESSAGES.PASSWORD.NOT_MATCH])
//     }
//     else if (password.length < PASSWORD_MIN_LENGTH) {
//         messages.error.msg[2].msg[MESSAGES.PASSWORD.MIN_LENGTH] = `Must be at least ${PASSWORD_MIN_LENGTH} characters<br/>`;
//         messages.error.msg[2].anyExists = true;
//         messages.error.anyExists = true;
//         console.log('Error: password:', messages.error.msg[2].msg[MESSAGES.PASSWORD.MIN_LENGTH])
//     }
//     return messages;
// }

function ValidateLogin(username, password, databaseUsername, databasePassword) {
    const messages = CreateMessagesBuffer();
    if (username === '') {
        messages.error.msg[0].msg[MESSAGES.USERNAME.NOT_EMPTY] = 'Invalid Username';
        messages.error.msg[0].anyExists = true;
        messages.error.anyExists = true;
        console.log('messages', messages.error.msg[0].msg[MESSAGES.USERNAME.NOT_EMPTY])
    }
    else if (username !== databaseUsername) {
        messages.error.msg[0].msg[MESSAGES.USERNAME.NOT_EMPTY] = 'Incorrect Username';
        messages.error.msg[0].anyExists = true;
        messages.error.anyExists = true;
        console.log('messages', messages.error.msg[0].msg[MESSAGES.USERNAME.NOT_EMPTY])
    }
    if (password === '') {
        messages.error.msg[2].msg[MESSAGES.PASSWORD.NOT_EMPTY] = 'Invalid Password';
        messages.error.msg[2].anyExists = true;
        messages.error.anyExists = true;
        console.log('messages', messages.error.msg[1].msg[MESSAGES.PASSWORD.NOT_EMPTY])
    }
    else if (password !== databasePassword) {
        messages.error.msg[2].msg[MESSAGES.PASSWORD.NOT_EMPTY] = 'Incorrect Password';
        messages.error.msg[2].anyExists = true;
        messages.error.anyExists = true;
        console.log('messages', messages.error.msg[2].msg[MESSAGES.PASSWORD.NOT_EMPTY])
    }

    return messages;
}

/**
 * Returns the index(place) of the last key of an object
*/
function GetLastKeyIndex(obj) {
    let i = 0;
    let last = i;
    while (Object.keys(obj)[i]) {
        if (Object.keys(obj)[i] !== undefined) {
            last = i;
        }
        i++;
    }
    return i;
}
/**
 * Returns the value of the key the last object
 */
function GetLastObjInObjFromJson(obj) {
    let i = 0;
    let lastObj = i;
    // const obj = JSON.parse(objJson)
    while (Object.keys(obj)[i]) {
        if (Object.keys(obj)[i] !== undefined) {
            lastObj = JSON.parse(Object.values(obj)[i]);
        }
        i++;
    }
    return lastObj;
}