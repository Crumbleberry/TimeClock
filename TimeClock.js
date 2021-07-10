// Set up the App Service
const express = require('express');
const app = express();

// Set up the view engine
app.set('view engine', 'ejs');

// Set up the database
const mongoose = require('mongoose');
const TimeCheck = require('./Models/TimeChecks');

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
            res.send(result)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        });
})

app.get('/allpunches',(req,res) => {
    TimeCheck.find()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })
})


app.get('/', (req,res) =>{
    res.render('index');
})

app.get('/landing',(req, res) => {
    TimeCheck.find()
        .then((result) => {
            res.render('landing', {timeClocks: result});
        })
    
})

app.listen(3000);