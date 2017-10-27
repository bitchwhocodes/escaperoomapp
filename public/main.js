        // need to put this in a closure

$(document).ready(function(){
        const STATE_LOGIN = 0;
        const STATE_PIN = 1;
        const STATE_ERGO = 2;
        const STATE_HAND = 3;

        var clippyEndPoint = "http://clippypi:3000";
        
        
      
        var timeInterval=null;
        var timeSeconds = 60;
        var errorAudio = new Audio('sounds/CHORD.WAV');//wav is not the way to do things..
        var successAudio = new Audio('sounds/CHIMES.WAV');
        //Socket Io
        var socket = io();
        socket.on('welcome', function (data) {
            console.log("socket: welcome");
            // Respond with a message including this clients' id sent from the server
            //Stacey temp code
            socket.emit('i am client', { data: 'foo!', id: data.id });
        });
        // Will be fired when we see the hand near it. 
        socket.on('authenticated', function (data) {
        
            // Stacey - We need to make sure we are in the right state to see this
            if(state == STATE_HAND)
            {
                if(data.response ==1){
                    doAuthentication();
                }else{
                    doHumanHand();
                }
            }
            //IF WE ARE ON THE CORRECT SCREEN && WE HAVE AUTHENTICATION, WE CAN MOVE ON.
        });

        //Started using Vanilla JS = added bootstrap after so could use jquery i suppose
        var loginScreen = document.getElementById("loginscreen");
        var pinScreen = document.getElementById("pinscreen");
        var ergoScreen = document.getElementById("ergoscreen");
        var handScreen = document.getElementById("handscreen");
        var failScreen = document.getElementById("failscreen");

        var screens = [loginScreen, pinScreen, ergoScreen, handScreen, failScreen];
        

        //ITEMS
        var errorItem = document.getElementById("errors");
        var username = document.getElementById("username");
        var password = document.getElementById("password");
        var pin = document.getElementById("pin")
        var ergo = document.getElementById("ergo");

        //buttons
        var pinForm = document.getElementById("pinform");
        var ergoForm = document.getElementById("ergoform");

        var errorTimes,state = 0;

        var loginSubmit = document.getElementById("loginform");
    
        // Login Submit - 
        loginSubmit.onsubmit = function (eventObject) {
            eventObject.stopPropagation();
            eventObject.stopImmediatePropagation();
            processLogin();
            return false;
        }
        function sendHandMessage(){
            console.log(socket);
            socket.emit('hand');
        }
        function doAuthentication(){
            //STACEY TO REPLACE
            $('#handscreen').hide();
            // $('body').css({"background-color":"#FF0000"})
        }

        function doHumanHand(){

            $('#handscreen').hide();
            $('#humanscreen').show();
        }

        function setTimer(){

           timerInterval = setInterval(doTime, 1000);

        }

        function doTime(){
            timeSeconds--;
            var bgColor;
            if(timeSeconds==-1){
                clearInterval(timerInterval);
                showFailure();
            }else{
               // bgColor = (timeSeconds%2)?"#FF0000":"#CC0000";
                //$('body').css({'background-color':bgColor});
                var seconds = pad(timeSeconds);
                $('.seconds').text("00:00:"+timeSeconds);
            }
        }
        function pad(seconds){

            //return((seconds.length<2)?("0"+seconds):seconds));
        }

        function showFailure(){


        }

        //CALLS
        function processLogin() {
            var user = username.value;
            var pass = password.value;
            // Could put in robust validation here, but is it necessary?
            sendMessageToClippy();
            
            if (user.length && pass.length) {
                validateUserPass(user, pass);
            } else {
                //errorItem.innerHTML = "ERROR"
                showError("Ooops!Enter in a username or password!");
                incrementError();
            }
        }

        function validateUserPass(user, pass) {
            var params = "user=" + user + "&pass=" + pass;
            var xhr = new sendRequest('api/password', 'POST', params);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    //Failure
                    if (xhr.responseText == "0") {
                        showError("Ooops!Incorrect Password");
                    } else {
                        nextScreen();
                    }
                }
            }
        }
        function nextScreen() {

            successAudio.play();
            state++;

            if(state> screens.length-1){return;}//SM to account for this. 
            for (var i = 0; i < screens.length; i++) {
                if (i == state) {
                    // I hate myself for jquery
                    $(screens[i]).removeClass('hide').addClass('active');
                } else {
                     $(screens[i]).removeClass('active').addClass('hide');
                }
            }
            
        }
        // need to edit this
        function showError(error) {
            //TODO - show a label
           // errorItem.innerHTML = error;
           console.log("Error",error)
           var item = null;
           errorAudio.play();
           switch(state){
            case 0:
                item = $('.login-error');
                break;
            case 1 : 
                item = $('.pin-error');
                break;

            case 2:
                item =$('.ergo-error');
                break;

           }
       
            item.fadeIn(100);
            
            item.text(error);
            incrementError();
        }

        $('input').focus(function(obj){
            $('.alert').fadeOut(500);
        })

        /*Need different headers for json */

        function sendMessageToClippy(endPoint,data){
          
            var data={'message':'IS THIS WORKING'};
            console.log("send message to clippy ",data);
            var xhr = new XMLHttpRequest();   // new HttpRequest instance 
            xhr.open("POST", 'http://clippypi:3000/message');
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.send(JSON.stringify(data));
            
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4 && xhr.status == 200) {
                        //handle the return

                    }
            }
        }
      
        function incrementError() {
            if (errorTimes == 2) {
                errorTimes = 0;
                //sendMessageToClippy("endPoint",{})
            }else{
                errorTimes++;
            }
            
        }
        ergoForm.onsubmit = function (eventObject) {
            eventObject.stopPropagation();
            eventObject.stopImmediatePropagation();
            processErgo();
            return false;
        }

        pinForm.onsubmit = function (eventObject) {
            eventObject.stopPropagation();
            eventObject.stopImmediatePropagation();
            processPin();
            return false;

        };

        /** Generic Send Request **/
        function sendRequest(url, type, params, handler) {
            var xhr = new XMLHttpRequest();
            xhr.open(type, url);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.setRequestHeader("Content-length", params.length);
            xhr.setRequestHeader("Connection", "close");
            xhr.send(params);
            return xhr;

        }
        function processPin() {
            if (pin.value.length) {
                var params = "pin=" + pin.value;
                var xhr = new sendRequest('api/pin', 'POST', params);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        //Failure
                        if (xhr.responseText == "0") {
                            showError("Incorrect Pin");
                        } else {
                            //Success
                            //errorItem.innerHTML = "YAY"
                            nextScreen();
                        }
                    }
                }
            } else {
                // need to fix
                incrementError();

            }
        }

        function startHandProcess(){
             sendHandMessage();
             setTimer();
        }

        function processErgo() {
           console.log("SEND HAND MESSAGE");
            if (ergo.value.length) {
                var params = "ergo=" + ergo.value;
                var xhr = new sendRequest('api/ergo', 'POST', params);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        //Failure
                        if (xhr.responseText == "0") {
                            showError("Incorrect ERGO");
                        } else {
                            //Success
                            //errorItem.innerHTML = "YAY"
                           
                            startHandProcess();
                            console.log("Send Hand Message");
                            nextScreen();
                        }
                    }
                }
            }else{
                incrementError();
            }
        }

       




});