var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Derek Benson' });
});

router.get('/lab8', function(req, res, next) {
  res.render('lab8', { title: 'Comp 20 - Lab 8' });
});

router.get('/lab8.html', function(req, res, next) {
  res.render('lab8', { title: 'Comp 20 - Lab 8' });
});



module.exports = router;
