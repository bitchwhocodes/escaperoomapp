        // need to put this in a closure

$(document).ready(function(){
        //States 
        const STATE_LOGIN = 0;
        const STATE_PIN = 1;
        const STATE_ERGO = 2;
        const STATE_HAND = 3;
        const STATE_SUCCESS = 4;
        const STATE_FAIL = 5;
        

        var clippyEndPoint = "http://clippypi:3000";
        // TIMER Interval
        var timeInterval=null;
        var timeSeconds = 60;
        var errorTimes = 0;
        var state = 0;

        // AUDIO 
        var errorAudio = new Audio('sounds/CHORD.WAV');//wav is not the way to do things..
        var successAudio = new Audio('sounds/CHIMES.WAV');
        var failedAudio = new Audio('sounds/DING.WAV');
       
       
        /*
            SOCKET COMMUNICATION ---------------------------------------------
         */
        var socket = io();
        // Will be fired when we see the hand near it. 
        socket.on('authenticated', function (data) {
            // Stacey - We need to make sure we are in the right state to see this
            if(state == STATE_HAND)
            {
                if(data.response ==1){
                    doAuthentication();
                }else{
                    //doHumanHand();
                }
            }
            //IF WE ARE ON THE CORRECT SCREEN && WE HAVE AUTHENTICATION, WE CAN MOVE ON.
        });

        //Started using Vanilla JS = added bootstrap after so could use jquery i suppose
        // Reference to elements we need. 
        var loginScreen = document.getElementById("loginscreen");
        var pinScreen = document.getElementById("pinscreen");
        var ergoScreen = document.getElementById("ergoscreen");
        var handScreen = document.getElementById("handscreen");
        var failScreen = document.getElementById("failscreen");
        var successScreen = document.getElementById("successscreen");

        //var screens = [loginScreen, pinScreen, ergoScreen, handScreen, failScreen];
        var screens =[{'name':'login','state':STATE_LOGIN,'screen':loginScreen}];
        screens.push({'name':'pin','state':STATE_PIN,'screen':pinScreen});
        screens.push({'name':'ergo','state':STATE_ERGO,'screen':ergoScreen});
        screens.push({'name':'hand','state':STATE_HAND,'screen':handScreen});
        screens.push({'name':'success','state':STATE_SUCCESS,'screen':successScreen})
        screens.push({'name':'fail','state':STATE_FAIL,'screen':failScreen});
        

        //ITEMS
        var errorItem = document.getElementById("errors");
        var username = document.getElementById("username");
        var password = document.getElementById("password");
        var pin = document.getElementById("pin")
        var ergo = document.getElementById("ergo");

        //buttons
        var pinForm = document.getElementById("pinform");
        var ergoForm = document.getElementById("ergoform");


        var loginSubmit = document.getElementById("loginform");
    
        // Login Submit - 
        loginSubmit.onsubmit = function (eventObject) {
            eventObject.stopPropagation();
            eventObject.stopImmediatePropagation();
            processLogin();
            return false;
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

         $('input').focus(function(obj){
            $('.alert').fadeOut(500);
        })


        

        function showFailure(){
            showScreen(STATE_FAIL);
            //failedAudio.play();
        }

        function showSuccess(){
            showScreen(STATE_SUCCESS);
        }



        //CALLS
        function processLogin() {
            var user = username.value;
            var pass = password.value;
            // Could put in robust validation here, but is it necessary?
            //sendMessageToClippy();
            
            if (user.length && pass.length) {
                validateUserPass(user, pass);
            } else {
                //errorItem.innerHTML = "ERROR"
                showError("Ooops!Enter in a username or password!");
                //incrementError();
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
                    var screen = $(screens[i].screen);
                    if (i == state) {
                        // I hate myself for jquery
                        screen.removeClass('hide').addClass('active');
                    } else {
                        screen.removeClass('active').addClass('hide');
                    }
                }
        }

        function showScreen(screenState){
            for (var i = 0; i < screens.length; i++) {
                    var screen = $(screens[i].screen);
                    var name = screens[i].state;
                    if (name == screenState) {
                        // I hate myself for jquery
                        state = screenState;
                        screen.removeClass('hide').addClass('active');
                    } else {
                        screen.removeClass('active').addClass('hide');
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

       

        /*Need different headers for json */

        
      
       

        
        /* PROCESS PIN 
            Called to submit the form data on the process pin screen. 
        */
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

       

        function processErgo() {
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
                            nextScreen();
                        }
                    }
                }
            }else{
                incrementError();
            }
        }

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


        /* START HAND PROCESS 
            Called after the last ergonomics puzzle is done. 
            Sends a message via SOCKETS --> SERIAL ( arduino )
            Starts a countdown Timer
        
        */
         function startHandProcess(){
             sendHandMessage();
             setTimer();
        }
        // 3 ERRORS for the form 
        // Can send a message to Clippy 
        function incrementError() {
            console.log("error times"+errorTimes)
            if (errorTimes == 2) {
                errorTimes = 0;
                var message = getErrorMessage();
                //console.log("Increment Error:message"+message);
                sendMessageToClippy(clippyEndPoint+"/message",{'message':message})
            }else{
                errorTimes++;
            }
            
        }

        /* Get Error Message for CLIPPY 
            need to put in other states 
         */
        function getErrorMessage(){
            var errorMessage ;
            switch(state){
                case STATE_LOGIN:
                    errorMessage ="It looks like you are having problems logging on";
                    break;
                case STATE_PIN:
                    errorMessage = "WHERE IS YOUR PIN YO";
                    break;
                case STATE_ERGO = " Ergonomics error";
                    break;                

            }   
            return(errorMessage);
        }


        
       

        /* CLIPPY API
            Need to pass endpoint --> ie. clippyEndPoint+"/message";
            Need to pass data --> {'message':'put your message here'}
         */

        function sendMessageToClippy(endPoint,data){
            console.log("Send Message");
            var xhr = new XMLHttpRequest();   // new HttpRequest instance 
            xhr.open("POST", endPoint);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.send(JSON.stringify(data));
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4 && xhr.status == 200) {
                        //handle the return

                    }
            }
        }
        /* sendHandMessage
            Socket emits message that will be sent via serial on the server side. 
            It can start the animation or whatever it needs to do
        */

        function sendHandMessage(){
            console.log("SendHandMessage");
            socket.emit('hand');
        }
        /**/
        function doAuthentication(){
           showSuccess();
        }

       
        /* setTimer 
            Starts an interval for the timer countdown 
        */
        function setTimer(){
                timerInterval = setInterval(doTime, 1000);
        }
        /*
            doTime
            Checks to see if there is seconds left ( starts at 60 )
        */ 
        function doTime(){
            timeSeconds--;
           

            if(timeSeconds==0){
                clearInterval(timerInterval);
                showFailure();
            }

            var seconds = pad(timeSeconds);
             $('.seconds').text("00:00:"+seconds);
        }
        function pad(seconds){
            var sec = seconds.toString();
            if(sec.length==1){
                return("0"+sec)
            }else{
                return(sec);
            }
            //return( (seconds.length <2 )? ("0"+seconds.toString() ) : seconds.toString());
        }

});