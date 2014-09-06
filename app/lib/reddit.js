function reddit(e) {

	var clientid = e.clientid;
	var redirecturi = e.redirecturi;
	var duration = e.duration;
	var scope = e.scope;
	var secretkey = e.secretkey;
	var sr, title, kind;

	var wv = Ti.UI.createWebView({
		height : '400dp',
		width : '300dp',
		loading : true
	});

	var redditwindow = Ti.UI.createWindow({
		height : '400dp',
		width : '300dp',
		borderColor : '#2f2f2f',
		borderRadius : '10',
		borderWidth : '5dp',
		navBarHidden : 'true'
	});

	var modhash;
	var authorized;

	this.PostReddit = function(f, callback) {
		sr = f.sr;
		title = f.title;
		kind = f.kind;
		callback = callback;

		if (Ti.Platform.osname == "iphone" || Ti.Platform.osname == "ipad") {
			checkLoggedin(function(e) {
				authorized = e.return;
				if (!authorized) {
					redditwindow.add(wv);
					wv.setUrl("https://ssl.reddit.com/api/v1/authorize?client_id=" + clientid + "&response_type=code&state=testing&redirect_uri=" + redirecturi + "&duration=" + duration + "&scope=" + scope);
					redditwindow.open();
				} else {
					getModhash();
				}
			});

			wv.addEventListener('beforeload', function(e) {
				Ti.API.info(e);
				if (e.url.split('=')[0] === "http://www.reddit.com/?state") {
					alert(e.url.split('=')[2]);
					redditwindow.remove(wv);
					redditwindow.close();

					var url = "https://www.reddit.com/api/v1/access_token";
					var client = Ti.Network.createHTTPClient({
						// function called when the response data is available
						onload : function(e) {
							Ti.API.info("Received text: " + this.responseText);
							//{"access_token": "XzdEaumNe9g_LwATWOST30tkuXc", "token_type": "bearer", "expires_in": 3600, "refresh_token": "HSz-rxZLKRay1TOImFhZeSu-N2U", "scope": "modposts"}
							var data = JSON.parse(this.responseText);
							//Ti.App.Properties.setString('refreshtoken',data.refresh_token);
							getModhash();
						},
						// function called when an error occurs, including a timeout
						onerror : function(e) {
							Ti.API.debug(e.error);
							alert('error');
						},
						timeout : 5000 // in milliseconds
					});
					// Prepare the connection.
					var params = {
						'grant_type' : 'authorization_code',
						'code' : e.url.split('=')[2],
						'redirect_uri' : 'http://www.reddit.com'
					};
					client.open("POST", url);
					client.setRequestHeader('Authorization', 'Basic ' + Ti.Utils.base64encode(clientid + ':' + secretkey));
					// Send the request.
					client.send(params);
				}
			});

			Ti.App.addEventListener('callbackData', function(e) {
				callback({
					response : e
				});
			});

		} else {
			//alert('android');
			checkLoggedin(function(e) {
				authorized = e.return;
				if (!authorized) {
					androidLogin();
				} else {
					getModhash();
				}
			});

		}
	};
	
	function androidLogin()
	{
		var posturl = "http://www.reddit.com/api/login";
			var client = Ti.Network.createHTTPClient({
				// function called when the response data is available
				onload : function(e) {
					Ti.API.info("Received text: " + this.responseText);
					//{"access_token": "XzdEaumNe9g_LwATWOST30tkuXc", "token_type": "bearer", "expires_in": 3600, "refresh_token": "HSz-rxZLKRay1TOImFhZeSu-N2U", "scope": "modposts"}
					var data = JSON.parse(this.responseText);
					Ti.API.info("IDen text: " + data.json.data.cookie);
					/*checkLoggedin(function(e) {
					 Ti.API.info(e.return);
					 });*/
					getModhash();
					//postReddit1(data.jquery[10][3][0]);
				},
				// function called when an error occurs, including a timeout
				onerror : function(e) {
					Ti.API.debug(e.error);
					alert('error');
				},
				timeout : 5000 // in milliseconds
			});
			// Prepare the connection.
			var params = {
				'passwd' : 'superman2',
				'user' : 'iamrizwan',
				'rem' : 'true',
				'api_type' : 'json'
			};
			client.open("POST", posturl);

			client.send(params);
	}
	
	function checkLoggedin(callback) {
		var posturl = "http://www.reddit.com/api/me.json";
		var client = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				Ti.API.info("Login Check text: " + this.responseText);
				//{"access_token": "XzdEaumNe9g_LwATWOST30tkuXc", "token_type": "bearer", "expires_in": 3600, "refresh_token": "HSz-rxZLKRay1TOImFhZeSu-N2U", "scope": "modposts"}
				if (this.responseText == "{}") {
					callback({
						return : false
					});
				} else {
					callback({
						return : true
					});
				}
			},
			// function called when an error occurs, including a timeout
			onerror : function(e) {
				Ti.API.debug(e.error);
				alert('error');
			},
			timeout : 5000 // in milliseconds
		});
		client.open("GET", posturl);
		client.send();
	}

	function refreshToken(token, callback) {
		var posturl = "https://ssl.reddit.com/api/v1/access_token";
		var client = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				Ti.API.info("Refresh token text: " + this.responseText);
				//{"access_token": "XzdEaumNe9g_LwATWOST30tkuXc", "token_type": "bearer", "expires_in": 3600, "refresh_token": "HSz-rxZLKRay1TOImFhZeSu-N2U", "scope": "modposts"}
				if (this.responseText == "{}") {
					callback({
						return : false
					});
				} else {
					callback({
						return : true
					});
				}
			},
			// function called when an error occurs, including a timeout
			onerror : function(e) {
				Ti.API.debug(e.error);
				alert('error');
			},
			timeout : 5000 // in milliseconds
		});
		var params = {
			'grant_type' : 'refresh_token',
			'refresh_token' : token,
			'duration' : 'permanent'
		};
		client.open("POST", posturl);
		client.send(params);
	}

	function getModhash() {

		var posturl = "http://www.reddit.com/api/me.json";
		var client = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				Ti.API.info("Received text: " + this.responseText);
				//{"access_token": "XzdEaumNe9g_LwATWOST30tkuXc", "token_type": "bearer", "expires_in": 3600, "refresh_token": "HSz-rxZLKRay1TOImFhZeSu-N2U", "scope": "modposts"}
				var data = JSON.parse(this.responseText);
				modhash = data.data.modhash;
				postReddit();
			},
			// function called when an error occurs, including a timeout
			onerror : function(e) {
				Ti.API.debug(e.error);
				alert('error');
			},
			timeout : 5000 // in milliseconds
		});
		// Prepare the connection.

		client.open("GET", posturl);
		// Send the request.
		client.send();
	}

	function postReddit(e) {
		var posturl = "http://www.reddit.com/api/submit";
		var client = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				Ti.API.info("Received text: " + this.responseText);
				//{"access_token": "XzdEaumNe9g_LwATWOST30tkuXc", "token_type": "bearer", "expires_in": 3600, "refresh_token": "HSz-rxZLKRay1TOImFhZeSu-N2U", "scope": "modposts"}
				var data = JSON.parse(this.responseText);
				Ti.API.info("IDen text: " + data.jquery[10][3][0]);
				postReddit1(data.jquery[10][3][0]);
			},
			// function called when an error occurs, including a timeout
			onerror : function(e) {
				Ti.API.debug(e.error);
				alert('error');
			},
			timeout : 5000 // in milliseconds
		});
		// Prepare the connection.
		var params = {
			'title' : 'test',
			'sr' : 'test',
			'kind' : 'self',
			'text' : 'http://www.reddit.com',
			'uh' : modhash,
			'iden' : 'Vr7GlJXMEVaogPK5Eoj6iSh0HX534wsK',
			'captcha' : 'scvbcw',
			'save' : 'true'
		};
		client.open("POST", posturl);

		client.send(params);
	}

	function postReddit1(iden) {
		var posturl = "http://www.reddit.com/api/submit";
		var captchaview = Ti.UI.createView({
			height : '100%',
			width : '100%',
			backgroundColor : "#fff",
			layout : 'vertical',
			top : '10dp',
			bottom : '10dp'
		});
		var captchaLabel = Ti.UI.createLabel({
			text : 'Enter Captcha',
			font : {
				fontSize : '24',
				fontWeight : 'bold'
			},
			top : '20dp'
		});
		var captchaimage = Ti.UI.createImageView({
			top : '10dp'
		});
		captchaimage.image = "http://www.reddit.com/captcha/" + iden;
		var captchafield = Ti.UI.createTextField({
			width : '150',
			top : '10dp'
		});
		var button = Ti.UI.createButton({
			title : 'submit',
			top : '10dp'
		});
		captchaview.add(captchaLabel);
		captchaview.add(captchaimage);
		captchaview.add(captchafield);
		captchaview.add(button);

		redditwindow.add(captchaview);
		redditwindow.open({
			modal : false
		});
		var client = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				Ti.API.info("Received text: " + this.responseText);
				//{"access_token": "XzdEaumNe9g_LwATWOST30tkuXc", "token_type": "bearer", "expires_in": 3600, "refresh_token": "HSz-rxZLKRay1TOImFhZeSu-N2U", "scope": "modposts"}
				var data = JSON.parse(this.responseText);
				Ti.App.fireEvent("callbackData", data);
				redditwindow.remove(captchaview);
				redditwindow.close();
			},

			onerror : function(e) {
				Ti.API.debug(e.error);
				alert('error');
			},
			timeout : 5000
		});

		client.open("POST", posturl);
		button.addEventListener('click', function(e) {
			Ti.API.info(title + sr + kind);
			if (captchafield.getValue().trim().length != 0) {
				var params = {
					'title' : title,
					'sr' : sr,
					'kind' : kind,
					'text' : 'http://www.reddit.com',
					'uh' : modhash,
					'iden' : iden,
					'captcha' : captchafield.getValue(),
					'save' : 'true'
				};
				client.send(params);
			}
		});

	}

}

exports.reddit = reddit;
