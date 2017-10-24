var express = require('express');
var router = express.Router();
const config = require('../config/config');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express'});
});

router.post('/password',function(req,res,next){
    var returnValue = (req.body.user==config.USERNAME && req.body.pass==config.PASSWORD)?"1":"0";
    res.send(returnValue);
})

router.post('/ergo',function(req,res,next){
    var returnValue = (req.body.ergo==config.ERGO)?"1":"0";
    res.send(returnValue);
})

router.post('/pin',function(req,res,next){

    var returnValue = (req.body.pin==config.PIN)?"1":"0";
    res.send(returnValue);
})


module.exports = router;
