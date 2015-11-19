var express = require('express');
var router = express.Router();
var logins = require("../logins");
var mongoose = require('mongoose');
mongoose.connect('mongodb://derek:derek@ds049084.mongolab.com:49084/comp20-dbenson');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {});

var error = {
    "error": "Whoops, something is wrong with your data!"
};


/**
 * @callback checkinsCallBack
 * @param {object} err
 * @param {object[]} checkins
 */

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

/**
 * Gets all of the checkins and executes the callback with them
 * @param {checkinsCallBack} callback
 */
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
    Checkin.find({}).sort({
        created_at: -1
    }).exec(function(err, checkins) {
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
    if (!req.body.login || !req.body.lat || !req.body.lng || !req.body.message) {
        return res.send(error);
    }
    var newCheckin = new Checkin({
        login: req.body.login,
        lat: req.body.lat,
        lng: req.body.lng,
        message: req.body.message
    });
    if (logins.indexOf(newCheckin.login) === -1) {
        return res.send(error);
    }
    newCheckin.save().then(function() {
        Checkin.find({}).sort({
            created_at: -1
        }).exec(function(err, checkins) {
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
    if (!req.query.login) {
        req.query.login = "";
    }
    Checkin.find({
        login: req.query.login
    }).sort({
        created_at: -1
    }).limit(1).exec(function(err, checkins) {
        if (err) {
            res.send(err);
        }
        else {
            if (checkins.length === 0) {
                res.send({});
            }
            else {
                res.send(checkins[0]);
            }
        }
    });
})
module.exports = router;
