# Escape Room Command Prompt

## Installation

* Install Node.js from [nodejs.org](http://nodejs.org)

* Clone Repo && cd into Repo. Try to install modules 
```shell
$ npm install
```
* Install Express
```shell
$ npm install express --save
```

* Install Socket.IO
```shell
$ npm install socket.io --save
```

* Install SerialPort
```shell
$ npm install serialport --save
```

* Run the server - you need to pass the COM port in for the serial communication ( node app COM4)
```shell
$ node app PORT
```

* See your completed app at [localhost:3000](http://localhost:3000)

## Config
* All passwords are temporary and in the config folder. You can change any of the paswords by going into config/config.js and then make them what you want them to be. 

## Project Structure
* app.js  --> Starting point for the application. Starts server, and does routing. Currently
had the Serial Port commented out, which has been tested with the NFC device. Starts the app and starts the socket io - which attaches itself to the server. Sockets let you communicate to server side ( for example where you might get the serial input ) to the client side. 

Currently can read and write serial communication. All serial communication to Arduino is located in this file and this file only. Anything that needs to go between the client side and socket side- you need to look at app.js and then main.js to look for the socket communication. 

* routes --> typically web app routing ( this uses Express). Should have the api routes for all Post requests to validate server side any information from forms. 

* public --> client side file. 

* public --> index.html - the main page
* public --> main.js - client side javascript. Uses jquery ( ugh ) and handles things like the screens, form input, submitting forms to api, socket io from client side to server side. 
