$(document).ready(function(){
        // States 
        const STATE_LOGIN = 0;
        const STATE_PIN = 1;
        const STATE_ERGO = 2;
        const STATE_HAND = 3;
        const STATE_SUCCESS = 4;
        const STATE_FAIL = 5;
        
		// Setup
        var clippyEndPoint = "http://clippypi";
        var timeInterval = null; // TIMER Interval
        var timeSeconds = 60;
        var errorTimes = 0;
        var state = 0;
	
		// Clippy Messages
		const welcome = {"message": "Welcome to ..0@2#%d^&*443-0-4fdsg*j--+33jj", "icon":"note.png", "sound": "Clippy_TransformToCheckMark.wav"};
		const noUserPass = {"message": "Hey, there. Do you even know how to use a computer? <b>You have to type a username and a password!</b>", "icon": "keyboard.png", "sound": "Clippy_TransformToCheckMark.wav"};
		const noUserWithPass = {"message": "You gotta type in a username, genius.", "icon": "keyboard.png", "sound": "Clippy_TransformToCheckMark.wav"};
		const rightUsername = {"message": "<b>{usernames}</b>. What were you thinking?", "icon": "none", "sound": "Clippy_TransformToCheckMark.wav"};
		const TooManyWrongUsernames = {"message": "You know there is a <b>pattern</b>, right?", "icon": "note.png", "sound": "Clippy_TransformToCheckMark.wav"};
		const TooManyWrongPasswords = {"message": "Do you know how to <b>sum</b>?", "icon": "note.png", "sound": "Clippy_TransformToCheckMark.wav"};
		
		// State
		var triedBlankUserPass = false;
		var triedBlankUserWithPass = false;
		
		const WrongUsernameHintThreshold = 3;
		var wrongUsernameTries = 0;
		
		const usernameHistoryMaxCount = 6;
		var usernameHistory = [];
		var foundRightUsername = false;
		
		const WrongPasswordHintThreshold = 3;
		var wrongPasswordTries = 0;
		
        // Audio 
        var errorAudio = new Audio('sounds/CHORD.WAV'); //wav is not the way to do things..
        var successAudio = new Audio('sounds/CHIMES.WAV');
        var failedAudio = new Audio('sounds/DING.WAV');
       
		sendMessageToClippy(welcome);
		
        /* SOCKET COMMUNICATION */
        var socket = io();
		
        // Will be fired when we see the hand near it. 
        socket.on('authenticated', function (data) {
            // Stacey - We need to make sure we are in the right state to see this
            if(state == STATE_HAND)
            {
                if(data.response ==1) {
                    doAuthentication();
                } else {
                    //doHumanHand(); // Not working
                }
            }
        });
	
		// SCREENS
        var screens = [];
		screens.push({'name':'login',   'state':STATE_LOGIN,   'screen': "#loginscreen"});
        screens.push({'name':'pin',     'state':STATE_PIN,     'screen': "#pinscreen"});
        screens.push({'name':'ergo',    'state':STATE_ERGO,    'screen': "#ergoscreen"});
        screens.push({'name':'hand',    'state':STATE_HAND,    'screen': "#handscreen"});
        screens.push({'name':'success', 'state':STATE_SUCCESS, 'screen': "#successscreen"})
        screens.push({'name':'fail',    'state':STATE_FAIL,    'screen': "#failscreen"});
        

        // ITEMS
        var errorItem = document.getElementById("errors");
	
		// Form Events
		$("#loginform").submit(function (event) {
			event.preventDefault();
            processLogin($("#username").val(), $("#password").val());
        });
		
		$("#pinform").submit(function (event) {
			event.preventDefault();
            processPin($("#pin").val());
        });
		
		$("#ergoform").submit(function (event) {
			event.preventDefault();
            processErgo(processPin($("#ergo").val()));
        });

		// Other
        $('input').focus(function(obj){
            $('.alert').fadeOut(500);
        })
		
		// End Puzzle
        function showFailure(){
            showScreen(STATE_FAIL);
            //failedAudio.play();
        }

        function showSuccess(){
            showScreen(STATE_SUCCESS);
        }

        // Calls
        function processLogin(username, password) {
            console.log("Username: " + username);
			console.log("Password: " + password);
			
			if (!username.length && !password.length) {
				if (!triedBlankUserPass)
				{
					sendMessageToClippy(noUserPass);
					triedBlankUserPass = true;
				}
				
				return showError("Ooops! Enter in a username or password!");
			}
			else if (!username.length && password.length) {
				if (!triedBlankUserWithPass)
				{
					sendMessageToClippy(noUserWithPass);
					triedBlankUserWithPass = true;
				}
			}
			else {
				$.post("api/password", {"username": username, "password": password})
				.done(function(data) {
					console.log(data);
					switch(data.result) {
						case "success":
							return $("#loginscreen").fadeOut(500, function() {
								successAudio.play();
								return $("#pinscreen").fadeIn(500);
							});
							break;
						case "wrong_username":
							if (!foundRightUsername)
							{
								usernameHistory.push(data.username);
								
								// Clean up history
								if (usernameHistory.length > usernameHistoryMaxCount) {
									usernameHistory.shift();
								}
							
								// Hint
								wrongUsernameTries++;
								
								if (wrongUsernameTries >= WrongUsernameHintThreshold) {
									wrongUsernameTries = 0;
									sendMessageToClippy(TooManyWrongUsernames);
								}
							}
							
							return showError("Ooops! Wrong Username!");
							break;
						case "wrong_password":
							// Show usernames flavor
							if (!foundRightUsername && wrongUsernameTries > 0)
							{
								rightUsername.message = rightUsername.message.replace("{usernames}", usernameHistory.join(", "));
								sendMessageToClippy(rightUsername);
								foundRightUsername = true;
							}
							
							// Hint
							wrongPasswordTries++;
							
							if (wrongPasswordTries >= WrongPasswordHintThreshold) {
								wrongPasswordTries = 0;
								sendMessageToClippy(TooManyWrongPasswords);
							}
								
							return showError("Ooops! Wrong Password!");
							break;
						default:
							console.log("Something went wrong");
					}
				});
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
            //xhr.setRequestHeader("Content-length", params.length);
            //xhr.setRequestHeader("Connection", "close");
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
                var data = getClippyData();
                //console.log("Increment Error:message"+message);
            }else{
                errorTimes++;
            }
            
        }


        /* CLIPPY API
            Need to pass endpoint --> ie. clippyEndPoint+"/message";
            Need to pass data --> {'message':'put your message here'}
         */

        function sendMessageToClippy(data){
            console.log("Send Message");
            var xhr = new XMLHttpRequest();   // new HttpRequest instance 
            xhr.open("POST", clippyEndPoint + "/message");
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
