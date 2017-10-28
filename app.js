var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cors = require('cors');

var index = require('./routes/index');
var api = require('./routes/api');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
app.use(cors());
app.options("*",cors())

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




io.on('connection', function (socket) {

  socket.on('hand',function(socket){
      console.log("hand has been called");
      serialport.write("mode_scan");
    });
 });


const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const serialport = new SerialPort(process.argv[2],{baudRate:115200});

const parser = new Readline();
serialport.pipe(parser);
parser.on('data', function(data){

    if(data.indexOf('ID')!=-1){
        io.emit('authenticated',{response:1})
    }
});
parser.on('close',console.log);
	parser.on('connection',function(data){
});







