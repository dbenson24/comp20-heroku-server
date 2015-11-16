var express = require('express');
var router = express.Router();
var logins = require("../logins");
var mongoose = require('mongoose');
mongoose.connect('mongodb://derek:derek@ds049084.mongolab.com:49084/comp20-dbenson');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    // yay!
});

var checkinSchema = mongoose.Schema({
    login: String,
    lat: Number,
    lng: Number,
    message: String,
    created_at: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    versionKey: false
});


var Checkin = mongoose.model('Checkin', checkinSchema);


// callback takes the err and checkins parameters
var getCheckins = function(callback) {
    Checkin.
    aggregate([{
        "$sort": {
            created_at: -1
        }
    }, {
        "$group": {
            _id: "$login",
            data: {
                $first: "$$ROOT"
            }
        }
    }]).
    project({
        _id: "$data._id",
        lat: "$data.lat",
        lng: "$data.lng",
        login: "$data.login",
        message: "$data.message",
        created_at: "$data.created_at"
    }).
    sort({
        created_at: -1
    }).
    exec(callback);
}

/* GET checkins */
router.get('/', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    getCheckins(function(err, checkins) {
        if (err) {
            res.render('checkins', {
                title: "Checkins"
            });
        }
        else {
            res.render('checkins', {
                title: "Checkins",
                checkins: checkins
            });
        }
    });
});

router.post('/sendLocation', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    var error = {
        "error": "Whoops, something is wrong with your data!"
    };
    if (!req.body.login || !req.body.lat || !req.body.lng || !req.body.message) {
        return res.send(error);
    }
    var checkin = new Checkin({
        login: req.body.login,
        lat: req.body.lat,
        lng: req.body.lng,
        message: req.body.message
    });
    if (logins.indexOf(checkin.login) === -1) {
        return res.send(error);
    }
    checkin.save().then(function() {
        getCheckins(function(err, checkins) {
            console.log(checkins);
            if (err) {
                res.send(err);
            }
            else {
                res.send(checkins);
            }
        })
    });
});


router.get('/latest.json', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    getCheckins(function(err, checkins) {
        console.log(checkins);
        if (err) {
            res.send(err);
        }
        else {
            res.send(checkins);
        }
    });
})
module.exports = router;
