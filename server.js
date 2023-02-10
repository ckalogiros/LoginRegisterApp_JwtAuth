import Express from 'express';
import Dotenv from 'dotenv/config';
import Parser from 'body-parser';
import Cors from 'cors';
import expressLayouts from 'express-ejs-layouts';
import ejs from 'ejs';
import Mongoose from 'mongoose';
import CookieParser from 'cookie-parser';
import {router} from './routes/Routes.js';
import { Authorize } from './Authorization.js';



const app = Express();
app.use(Express.static('public'));


/* Middleware */
app.use(Parser.urlencoded({ extended: false }))
app.use(Parser.json({ type: 'application/json' }));
app.use(Parser.text({ type: 'text/html' }))
app.use(CookieParser());
app.use(Cors());


/* View Engine */
app.set('view engine', 'ejs');
app.use(expressLayouts);

/* Routes */
// app.get('*', ValidateTokenMiddleware);
// app.use('/', routerHome)    // Home page
// app.use('/users', router);  // Login and Sign up pages
app.use('/', router);  // Login and Sign up pages
// app.get('/auth/authorizedPage', Authorize, (req, res)=>{res.render('authorizedPage')});


Mongoose.set('strictQuery', true);
Mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true});


var port = process.env.PORT || 5556;
app.listen(port, () => console.log(`Node server listening on port ${port}!`));

