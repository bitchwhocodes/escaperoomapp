var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var index = require('./routes/index');
var api = require('./routes/api');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));

// TO change using PROCESS.ENV
var port = 3000;
http.listen(port, function() {
	    console.log('Server running on port ' + port);
});

// Needed to get data from requests 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//Setting the Routes - Index is main page and api is all api calls. 
app.use('/', index);
app.use('/api',api);


// TIMER 
function sendTime() {
    io.emit('time', { time: new Date().toJSON() });
}

// Send current time every 10 secs
setInterval(sendTime, 10000);


io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

/* SERIAL CONNECTION

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort(process.argv[2],{baudRate:115200});

const parser = new Readline();
port.pipe(parser);
parser.on('data', function(data){
    console.log(data);
    if(data.indexOf('id')!=-1){
        console.log("ID");
        // we can check for diffferent types of tags if we need to
        // need to send messsage to the interaface
        io.emit('authenticated',{response:1})
    }
});
parser.on('close',console.log);
parser.on('connection',console.log);
*/
