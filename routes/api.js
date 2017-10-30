var express = require('express');
var router = express.Router();
const config = require('../config/config');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express'});
});

router.post('/password', function(req, res, next) {
	console.log(req.body);
	if (req.body.username != config.USERNAME) {
		return res.send({"result": "wrong_username", "username": req.body.username});
	}
	
	if (req.body.password != config.PASSWORD) {
		return res.send({"result": "wrong_password"});
	}
	
	return res.send({"result": "success"});
});

router.post('/ergo',function(req,res,next){
    var returnValue = (req.body.ergo==config.ERGO)?"1":"0";
    res.send(returnValue);
})

router.post('/pin',function(req,res,next){
    if (req.body.pin == config.PIN) {
        return res.send({"result": "success"});
    }
    return res.send({"result": "wrong_pin", "pin": req.body.pin});
})

/*
router.post('/clippy',function(req,res,next){
    //

    console.log("clippy api");

    var request = require('request');

    // Set the headers
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/json'
    }

    // Configure the request
    var options = {
        url: 'http://clippypi:3000',
        method: 'POST',
        headers: headers,
        body: {'message':'DOES THIS WORK?'}
    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log(body)
            res.send(body);
        }
    })

});
    
*/

module.exports = router;
