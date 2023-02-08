import Express from 'express'
import Parser from 'body-parser';


export const routerHome = Express.Router();


routerHome.get('/', (req, res, next)=>{
    res.render('home');
    next();
});
routerHome.get('/home', (req, res, next)=>{
    res.render('home');
    next();
});

