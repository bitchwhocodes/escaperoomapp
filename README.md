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

* Run the server
```shell
$ node app
```

* See your completed app at [localhost:3000](http://localhost:3000)

## Config
* All passwords are temporary and in the config folder. To be replaced. 
## Project Structure
* app.js  --> Starting point for the application. Starts server, and does routing. Currently
had the Serial Port commented out, which has been tested with the NFC device. Starts the app and starts the socket io - which attaches itself to the server. Sockets let you communicate to server side ( for example where you might get the serial input ) to the client side. 

* routes --> typically web app routing ( this uses Express). Should have the api routes for all Post requests to validate server side any information from forms. 

* public --> client side file. 
