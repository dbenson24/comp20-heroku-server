var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('mongodb://derek:derek@ds049084.mongolab.com:49084/comp20-dbenson');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    // yay!
});

var checkinSchema = mongoose.Schema({
    login: {type: String, unique: true },
    lat: Number,
    lng: Number,
    message: String,
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});


var Checkin = mongoose.model('Checkin', checkinSchema);

/* GET users listing. */
router.get('/', function(req, res, next) {
    Checkin.find(function(err, checkins) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(checkins);
        }
    });
});


router.get('/populate', function(req, res, next) {
    var logins = ['mchow', 'kaytea', 'CindyLytle', 'BenHarris', 'JeremyMaletic', 'LeeMiller', 'EricDapper', 'RichRumfelt', 'VanAmmerman', 'VicJohnson', 'ErinHolleman', 'PatFitzgerald', 'CheriVasquez', 'HarleyRhoden', 'JanetGage', 'HarleyConnell', 'GlendaMaletic', 'JeffSoulen', 'MarkHair', 'RichardDrake', 'CalvinStruthers', 'LeslieDapper', 'JefflynGage', 'PaulRamsey', 'BobPicky', 'RonConnelly', 'FrancieCarmody', 'ColleenSayers', 'TomDapper', 'MatthewKerr', 'RichBiggerstaff', 'MarkHarris', 'JerryRumfelt', 'JoshWright', 'LindyContreras', 'CameronGregory', 'MarkStruthers', 'TravisJohnson', 'RobertHeller', 'CalvinMoseley', 'HawkVasquez', 'LayneDapper', 'HarleyIsdale', 'GaylaSoulen', 'MatthewRichards', 'RoyDuke', 'GaylaRodriquez', 'FrancieGeraghty', 'LisaLytle', 'ErinHair', 'CalvinGraham', 'VanRhoden', 'KeithRumfelt', 'GlendaSmith', 'KathrynJohnson', 'FredVandeVorde', 'SheriMcKelvey', 'RoyMiller', 'PatIsdale', 'JoseRodriquez', 'KelleyRumfelt', 'JanetKinsey', 'RonCampbell', 'BenKerr', 'RobDennison', 'BobOwens', 'CherylLytle', 'LisaSoulen', 'TravisDuke', 'CindyGregory', 'JoyceVandeVorde', 'MatthewScholl', 'RobJohnson', 'EricHawthorn', 'CameronRodriquez', 'JoshRamsey', 'CalvinDuke', 'SheriHeller', 'LeaAmmerman', 'LayneVasquez', 'IMConnell', 'BenHauenstein', 'ColleenKerr', 'HawkRichards', 'LeaIsdale', 'RickSoulen', 'RoyMcFatter', 'KyleContreras', 'MaryHeller', 'KathrynFitzgerald', 'JanetRiedel', 'PatHawthorn', 'KeithHauenstein', 'BenRichards', 'RickVasquez', 'KelleyAmmerman', 'EvanConnelly', 'KendallRumfelt', 'TravisIsdale', 'RobContreras', 'JavierRussell', 'ColleenCampbell', 'JeremyConnelly', 'BenKinsey', 'JanetScholl', 'PaulaLewis', 'LeslieMcFatter', 'MatthewMcAda', 'LeeMuilman', 'KyleMoseley', 'JeffRhoden', 'AnitaHolleman', 'JefflynMcKelvey', 'BobContreras', 'RobFitzgerald', 'BenJohnson'];
    for(var i = 0; i < logins.length; i++) {
        var checkin = new Checkin({login: logins[i], lat:0, lng: 0, message:"", created_at: new Date(0)});
        checkin.save();
    }
    Checkin.find(function(err, checkins) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(checkins);
        }
    });
});

router.post('/', function(req, res,next) {
    var error = {"error":"Whoops, something is wrong with your data!"};
    console.log("query", req.query);
    if(!req.query.login || !req.query.lat || !req.query.lng || !req.query.message) {
        return res.send(error);
    }
    var checkin = {login: req.query.login, lat: req.query.lat, lng: req.query.lng, message: req.query.message, created_at: new Date()};
    var query = {login: req.query.login};
    Checkin.findOneAndUpdate(query, checkin, {}, function(err, doc) {
        if (err || doc === null) {
            res.send(error);
        } else {
            console.log("doc", doc);
            res.send(doc);
        }
    });
});

module.exports = router;
