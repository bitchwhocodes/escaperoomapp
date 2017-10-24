        // need to put this in a closure

$(document).ready(function(){
        
        var socket = io();
        socket.on('welcome', function (data) {
            console.log("socket: welcome");
            // Respond with a message including this clients' id sent from the server
            socket.emit('i am client', { data: 'foo!', id: data.id });
        });
        // Will be fired when we see the hand near it. 
        socket.on('authenticated', function (data) {
            //IF WE ARE ON THE CORRECT SCREEN && WE HAVE AUTHENTICATION, WE CAN MOVE ON.
           
        })
        
        //Started using Vanilla JS = added bootstrap after so could use jquery i suppose
        var loginScreen = document.getElementById("loginscreen");
        var pinScreen = document.getElementById("pinscreen");
        var ergoScreen = document.getElementById("ergoscreen");
        var handScreen = document.getElementById("handscreen");

        var screens = [loginScreen, pinScreen, ergoScreen, handScreen];

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

        //CALLS
        function processLogin() {
            var user = username.value;
            var pass = password.value;
            // Could put in robust validation here, but is it necessary?
            if (user.length && pass.length) {
                validateUserPass(user, pass);
            } else {
                //errorItem.innerHTML = "ERROR"

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
                        //Success
                    
                        nextScreen();
                    }
                }
            }
        }
        function nextScreen() {
            state++;
            if(state> screens.length-1){return;}//SM to account for this. 
            for (var i = 0; i < screens.length; i++) {
                if (i == state) {
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

     
        function sendStateToAPI() {
            var params = "state="+state+"&errorTimes="+errorTimes;
            var xhr = sendRequest("POST","/url",params);
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4 && xhr.status == 200) {
                        //handle the return
                    }
            }
            // make a call to the api to let clippy know. 
        }
        function incrementError() {
            if (errorTimes == 2) {
                errorTimes = 0;
                sendStateToAPI();
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
                            nextScreen();
                        }
                    }
                }
            }else{
                incrementError();
            }
        }

});