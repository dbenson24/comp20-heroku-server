var express = require('express');
var router = express.Router();
var logins = require("../logins");
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://derek:derek@ds049084.mongolab.com:49084/comp20-dbenson';
var db = null;
MongoClient.connect(url, function(err, database) {
    if (err) {
        console.warn(err);
    }
    db = database;
});

var insertCheckin = function(checkin, callback) {
    db.collection('checkins').insertOne(checkin, callback);
};

var getCheckins = function(query, callback) {
    db.collection('checkins').find(query).sort({
        created_at: -1
    }).toArray(callback);
}

var error = {
    "error": "Whoops, something is wrong with your data!"
};

/* GET checkins */
router.get('/', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    getCheckins({}, function(err, checkins) {
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
    var newCheckin = {
        login: req.body.login,
        lat: req.body.lat,
        lng: req.body.lng,
        message: req.body.message,
        created_at: new Date()
    };
    if (logins.indexOf(newCheckin.login) === -1) {
        return res.send(error);
    }
    insertCheckin(newCheckin, function() {
        getCheckins({}, function(err, checkins) {
            if (err) {
                res.send(err);
            }
            else {
                res.send(checkins);
            }
        });
    });
});


router.get('/latest.json', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (!req.query.login) {
        req.query.login = "";
    }
    getCheckins({
        login: req.query.login
    }, function(err, checkins) {
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
