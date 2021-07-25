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

app.get('/user/:id/CheckIn', (req, res) => {
    const timecheck = new TimeCheck({
        clockType: 'In',
        clockTime: Date.now(),
        clockUser: req.params.id
    });

    timecheck.save()
        .then((result) => {
            res.redirect(`/user/${req.params.id}/landing`);
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        });
})

app.get('/user/:id/CheckOut', (req, res) => {
    const timecheck = new TimeCheck({
        clockType: 'Out',
        clockTime: Date.now(),
        clockUser: req.params.id
    });

    timecheck.save()
        .then((result) => {
            res.redirect(`/user/${req.params.id}/landing`);
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

app.get('/createAccount', (req, res) => {
    res.render('createUser');
})

app.post('/login', async (req, res) => {
    var uName = req.body.userName;
    var pw = req.body.password;
    var validUser = false;
    var userID;

    /*const user = new User({
    *    userName: uName,
    *    userPassword: pw,
    *    userType: 1
    });*/

    await User.find({userName: uName, userPassword: pw})
        .then((result) => {
            if(result.length > 0) {
                validUser = true;
                userID = result[0].userID
            }
        })

    if(validUser) {
        res.redirect(`/user/${userID}/landing`);
    } else {
        res.send('Invalid Username and/or Password')
    }
    /*user.save()
        .then((result) => {
            res.redirect('/landing');
        });*/
})

app.post('/createAccount',async (req,res) => {
    var uName = req.body.userName;
    var pw = req.body.password;
    var userExists = false;
    var maxID = 0;

    await User.find()
        .then((result) => {
            if(result.length > 0) {
                result.forEach(User => {
                    if(uName === User.uName) {
                        userExists = true;
                    }
                    if(User.userID > maxID) {
                        maxID = User.userID;
                    }
                })
            }
        })

        if(userExists) {
            res.send('This Username is already in use');
        } else {
            const user = new User({
                userName: uName,
                userPassword: pw,
                userType: 1,
                userID: maxID + 1
            });

            user.save()
                .then((result) => {
                    //res.send(result);
                    res.redirect(`/user/${result.userID}/landing`);
                })
        }

})

function calculateTime(inputArray) {
    var totalTime = 0;
    inputArray.forEach(duel => {
        totalTime += duel.second.clockTime - duel.first.clockTime;
    })
    return totalTime;
}

function createDuets(inputArray) {
    var counter = 0;
    var duets = [];
    while(counter < inputArray.length) {
        while(counter < inputArray.length && inputArray[counter].clockType != 'Out') {
            counter++;
        }
        var outCounter = counter;
        while(counter < inputArray.length && inputArray[counter].clockType != 'In') {
            counter++;
        }
        var inCounter = counter;
        if(inputArray[inCounter] && inputArray[outCounter]) {
            var duet ={
                first: inputArray[inCounter],
                second: inputArray[outCounter]
            }
            duets.push(duet);
        }
    }
    return duets;
}

function milisecondsToTime(miliseconds) {
    const milInHour = 1000  * 60 * 60;
    var  hours = Math.trunc(miliseconds / milInHour);
    miliseconds = miliseconds - (hours *  milInHour);

    const  milInMinute = 1000 * 60;
    var minutes =  Math.trunc(miliseconds / milInMinute);
    miliseconds = miliseconds - (minutes *  milInMinute);

    const milInSecond =  1000;
    var seconds =  Math.trunc(miliseconds / milInSecond);

    return hours + ' h ' + minutes + ' m ' + seconds + ' s';
}

app.get('/user/:id/landing', async (req, res) => {
    var user = '';

    await User.find({userID: req.params.id})
    .then((result) => {
        user = result[0].userName;
        userID = result[0].userID;
        userType = result[0].userType;
    })

    TimeCheck.find({clockUser: req.params.id}).sort({clockTime: -1})
        .then((result) => {
            var totalTime = calculateTime(createDuets(result));

            if(result[0]) {
                res.render('landing', {timeClocks: result, userName: user, curUserID: userID, curStatus: result[0].clockType, timeToShow: true, userType: userType, totalTime: milisecondsToTime(totalTime)});
            } else {
                res.render('landing', {curUserID: userID, userName: user, curStatus: 'Out',timeToShow: false});
            }
           
        })
})

app.get('/admin/:id/users', async (req, res) => {
    var user = '';

    await User.find({userID: req.params.id})
    .then((result) => {
        user = result[0].userName;
        userID = result[0].userID;
    })

    User.find()
        .then((result) => {
            if(result[0]) {
                res.render('adminUserChanges', {users: result, userName: user, curUserID: userID, curStatus: result[0].clockType, usersToShow: true});
            } else {
                res.render('adminUserChanges', {curUserID: userID, userName: user, curStatus: 'Out',usersToShow: false});
            }
           
        })
})

app.get('/pwchange/:id', async (req, res) => {
    var user = '';

    await User.find({userID: req.params.id})
    .then((result) => {
        res.render('pwchange', {userName: result[0].userName, curUserID: result[0].userID});
    })

    
    
})

app.post('/pwchange/:id', async (req, res) => {
    oldPassword = '';

    await User.find({userID: req.params.id})
    .then((result) => {
        oldPassword = result[0].userPassword;
    });

    if(oldPassword != req.body.oldPassword) {
        res.send('That is the incorrect password');
    } else {
        await User.find({userID: req.params.id})
    .then((result) => {
        result[0].userPassword = req.body.newPassword;
        result[0].save()
        .then((result) => {
            res.redirect(`/user/${result.userID}/landing`);
        })
    });
    }
})

app.listen(3000);