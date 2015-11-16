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
    match({
        created_at: {
            $gt: new Date(0)
        }
    }).
    sort({
        created_at: -1
    }).
    exec(callback);
}

/* GET checkins */
router.get('/', function(req, res, next) {
    getCheckins(function(err, checkins) {
        console.log(checkins);
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

/* Used to populate the Mongodb for the first time */
router.get('/populate', function(req, res, next) {
    for (var i = 0; i < logins.length; i++) {
        var checkin = new Checkin({
            login: logins[i],
            lat: 0,
            lng: 0,
            message: "",
            created_at: new Date(0)
        });
        checkin.save();
    }
    getCheckins(function(err, checkins) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(checkins);
        }
    });
});

router.post('/', function(req, res, next) {
    var error = {
        "error": "Whoops, something is wrong with your data!"
    };
    if (!req.query.login || !req.query.lat || !req.query.lng || !req.query.message) {
        return res.send(error);
    }
    var checkin = new Checkin({
        login: req.query.login,
        lat: req.query.lat,
        lng: req.query.lng,
        message: req.query.message
    });
    if (logins.indexOf(checkin.login) === -1) {
        return res.send(error);
    }
    var checkinPromise = checkin.save().then(function() {
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

module.exports = router;
