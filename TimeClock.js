// Set up the App Service
const express = require('express');
const app = express();

//Setting up the body parser
const bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({extended: true})); 

// Set up the view engine
app.set('view engine', 'ejs');



// Set up the database
const mongoose = require('mongoose');
const TimeCheck = require('./Models/TimeChecks');
const User = require('./Models/Users');

// Mongo DB connection string
const dbURL = 'mongodb+srv://user1:UUTo7oqGN58dZqE3@timeclock.oaikt.mongodb.net/TimeClock?retryWrites=true&w=majority';

mongoose.connect(dbURL)
    .then((result) => console.log('Connected to db'))
    .catch((err) => console.log(err));

app.get('/CheckIn', (req, res) => {
    const timecheck = new TimeCheck({
        clockType: 'In',
        clockTime: Date.now(),
        clockUser: 2
    });

    timecheck.save()
        .then((result) => {
            res.redirect('/landing');
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        });
})

app.get('/CheckOut', (req, res) => {
    const timecheck = new TimeCheck({
        clockType: 'Out',
        clockTime: Date.now(),
        clockUser: 2
    });

    timecheck.save()
        .then((result) => {
            res.redirect('/landing');
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        });
})

app.get('/allpunches',(req,res) => {
    TimeCheck.find()
        .then((result) => {
            res.redirect('/landing');
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })
})


app.get('/', (req,res) =>{
    res.render('index');
})

app.post('/', (req, res) => {
    var uName = req.body.userName;
    var pw = req.body.password;
    var validUser = false;
    /*const user = new User({
    *    userName: uName,
    *    userPassword: pw,
    *    userType: 1
    });*/

    User.find()
        .then((result) => {
            result.forEach(User => {
                if(uName === User.userName && pw === User.userPassword) {
                    validUser = true;
                } 
            });
        })

        if(validUser === true) {
            res.redirect('/landing');
        } else {
            return res.status(401).end('Incorrect Username and/or Password!');
        }
    /*user.save()
        .then((result) => {
            res.redirect('/landing');
        });*/
})

app.get('/landing',(req, res) => {
    TimeCheck.find()
        .then((result) => {
            res.render('landing', {timeClocks: result});
        })
    
})

app.listen(3000);