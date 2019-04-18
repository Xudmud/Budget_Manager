var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./authjwt');
var jwt = require('jsonwebtoken');
var User = require('./Users');
var cors = require('cors');

var app = express();

const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(cors());

var router = express.Router();

/*
-----------------------BEGIN REQUEST FUNCTIONS HERE-----------------------
 */



/*
POST - /signup
This function is literally a carbon copy of Shawn's user sign up function right now.
It will have to be changed to fit our parameters.

Requirements:
    - Function should take in more information instead of just a username and password
    - This one function should be able to update literally everything for the user.
        Username
        Password
        First Name
        Last Name
        Email
        Phone Number
        Budget
 */
router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, message: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.first = req.body.name;
        user.last = req.body.name;
        user.age = req.body.age;
        user.budget = req.body.budget;

        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ success: true, message: 'User created!' });
        });
    }
});

/*
POST - /signin
This function is literally a carbon copy of Shawn's user sign up function right now.

Requirements:
    - Function needs to return nothing but the actual token allowing a user to acccess their profile

 */
router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, message: 'Authentication failed.'});
            }
        });


    });
});


/*
ROUTE: /users
Simple users ROUTE for getting, putting, and deleteing. We technically don't need a route for this but I'd prefer to
have one anyways just because its fun to make. It's really up to us what the standard will be.

Requirements:
    - PUT       (update profile)
    - GET       (profile information)
    - DELETE    (profile)
 */
router.route('/users')
    /*
    ROUTE: /users.put
    Function just needs to update the users profile with whatever they changed.

    Requirements:
        - This one function should be able to update literally everything for the user.
            Username
            Password
            First Name
            Last Name
            Email
            Phone Number
            Age
            Financial Information
            Budget
    */
    .put(authJwtController.isAuthenticated, function (req, res) {
        const usertoken = req.headers.authorization;
        const token = usertoken.split(' ');
        const decoded = jwt.verify(token[1], process.env.SECRET_KEY);

        let params = {
            username: req.body.username,
            first: req.body.first,
            last: req.body.last,
            password: req.body.password,
            age: req.body.age,
            email: req.body.email,
            phone: req.body.phone,
            budget: req.body.budget
        };

        for(let prop in params) if(!params[prop]) delete params[prop];

        User.findOneAndUpdate({username: decoded}, params, function (err, newDoc) {
                if (err) {
                    res.json({err: err});
                } else {
                    res.json({message: "Profile updated", updatedProfile: newDoc});
                }
            });
    }
    /*
    ROUTE: /users.get
    Just return the users profile information in full. Not sure if we should have a separate database to store their
    specific trend data but it's something to consider.
    Requirements:
        - Function needs to grab the users profile data from the users database and send it back in JSON.
    */
    .get(authJwtController.isAuthenticated, function (req, res) {
        const usertoken = req.headers.authorization;
        const token = usertoken.split(' ');
        const decoded = jwt.verify(token[1], process.env.SECRET_KEY);

        User.find({username: decoded}, function (err,user) {
            if(err)
            {
                res.json({message: "Invalid query"});
            }
            if(user)
            {
                res.json({message: "User Info:", user:user});
            }
        })
    })

    /*
    ROUTE: /users.delete
    Delete the profile
    Requirements:
        - DELETE THE PROFILE. This should take like ten seconds to write...
    */
    .delete(authJwtController.isAuthenticated, function (req, res) {
        const usertoken = req.headers.authorization;
        const token = usertoken.split(' ');
        const decoded = jwt.verify(token[1], process.env.SECRET_KEY);

        User.findOneAndDelete({username: decoded}, function(err, found)
        {
            if(err){
                res.json({message: "Invalid query"});
            }
            if(found != null){
                res.json({message: "Your account has been deleted"});
            }
            else{
                res.json({message: "Username not found"});
            }

        });
    }
)



/*
ROUTE: /trends
There's some thought to be had in making a separate "trends" database since we might not want to load in an entire
database worth of information everytime a user just wants to quickly view what their budget limit is or something.
Some of these "REQUIRED" functions will probably be removed or changed entirely.

Requirements:
    - GET       (trend data)
 */
router.route('/trends')
    /*
    ROUTE: /trends.get
    Gets the trend data based off the period specified in the request.
    Requirements:
        - Going to have to discuss this in full later. But the basic functionality isn't hard.
    */
    .get(authJwtController.isAuthenticated, function(req, res){

    });

/*
Reject all other requests that aren't listed above.
 */
 /* Response code of 405 is used for method not allowed */
router.all('*', function(req, res) {
    res.status(405).send({success: false, error: 'Request not allowed.'});
});

app.use('/', router);
app.listen(port);
