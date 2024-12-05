
var Util = (function() {

	var pathnaemArray = window.location.pathname.split('/');
	var Utils = {};

	Utils.protocol = window.location.protocol;
	Utils.host = window.location.host;
	Utils.baseUrl = Utils.protocol + "//" + Utils.host + "/api/";


	Utils.close = function() {
		window.close();
	};

	Utils.SigninWithExternalApp = function(signInUrl) {
		var w = 1200;
		var h = 650;
		window.location.href = signInUrl;

		if (screen.width < w) {
			w = screen.width;
		}

		if (screen.height < h) {
			h = screen.height;
		}

		var left = (screen.width - w) / 2;
		var top = (screen.height - h) / 2;

		window.resizeTo(w, h);
		window.moveTo(left, top);
	};

	//This method provides ajax get method
	Utils.ajaxGet = function(url, success, error, spinner) {
		var fullUrl = Utils.baseUrl + url;
		$.ajax({
			type: 'GET',
			contentType: 'application/json',
			url: fullUrl,
			dataType: 'json',
			success: function(result, textStatus, jqXHR) {

				if ("function" == typeof success) {
					success(result);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if ("function" == typeof error) {
					error();
				}
			}
		});
	};



	//This method provides ajax post method
	Utils.ajaxPost = function(url, input, success, failure, dataType) {
		var fullUrl = Utils.baseUrl + url;
		var io = null;
		if ("string" == typeof (input)) {
			io = input;
		} else {
			io = JSON.stringify(input);
		}
		$.ajax({
			type: 'POST',
			contentType: 'application/json',
			url: fullUrl,
			dataType: dataType || "json",
			data: io,
			success: function(result, textStatus, jqXHR) {
				if ("function" == typeof success) {
					success(result);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if ("function" === typeof failure) {
					failure();
				}
			}

		});
	};


	function init() {
		var lw = 630, lh = 560;
		if (screen.width < lw) {
			w = screen.width;
		}

		if (screen.height < lh) {
			w = screen.height;
		}

		var left = (screen.width - lw) / 2;
		var top = (screen.height - lh) / 2;

		window.resizeTo(lw, lh);
		window.moveTo(left, top);
	}

	init();


     Utils.checkCookie = function(){
	    var cookieEnabled = (navigator.cookieEnabled) ? true : false;
		if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled){ 
			document.cookie="testcookie=test";
			cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
		}
		
		if(cookieEnabled) {
			document.cookie = "testcookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
		}
		
		return cookieEnabled;
	};
	
	return Utils;

})();



var scheduleMaintenance = (function() {
	var self = this;
	self.settings = {};
	self.scheduleMaintenanceInterval = null;
	self.scheduleMaintenanceIntervalDuration = 1 * 60 * 1000;
	self.maintenanceScheduleMsg = "";
	self.showMaintenanceScheduleMsg = false;

	function escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	function replaceAll(str, term, replacement) {
		return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
	}


	function getMaintenanceNtfMsg(maintenanceSchedule) {
		var scheduleMessage = maintenanceSchedule.notificationMessage;
		scheduleMessage = replaceAll(scheduleMessage, '\n', "<br>");
		var startDate = new Date(maintenanceSchedule.scheduleStart);
		scheduleMessage = replaceAll(scheduleMessage, '${start}', "<b>" + startDate.toString() + "</b>");
		scheduleMessage = replaceAll(scheduleMessage, '${duration}', "<b>" + maintenanceSchedule.duration + "mins</b>");
		var endTimeStamp = maintenanceSchedule.scheduleStart + (maintenanceSchedule.duration * 60 * 1000);
		var endTime = new Date(endTimeStamp);
		scheduleMessage = replaceAll(scheduleMessage, '${end}', "<b>" + endTime.toString() + "</b>");
		return scheduleMessage;
	}

	function getShutdownNtfMsg(maintenanceSchedule) {
		var scheduleShutdownMessage = maintenanceSchedule.shutdownMessage;
		scheduleShutdownMessage = replaceAll(scheduleShutdownMessage, '\n', "<br>");
		var endTimeStamp = maintenanceSchedule.scheduleStart + (maintenanceSchedule.duration * 60 * 1000);
		var endTime = new Date(endTimeStamp);
		scheduleShutdownMessage = replaceAll(scheduleShutdownMessage, '${end}', "<b>" + endTime.toString() + "</b>");
		return scheduleShutdownMessage;
	}

	function startScheduleMaintenanceInterval() {
		if (scheduleMaintenanceInterval) return;
		scheduleMaintenanceInterval = setInterval(function() {
			if (sessionStorage.getItem("SCHEDULE_IN_MAINTENANCE_MODE")) {
				getActiveSchedule();
			}
		}, self.scheduleMaintenanceIntervalDuration);
	}

	function stopScheduleMaintenanceInterval() {
		if (scheduleMaintenanceInterval) {
			clearInterval(self.scheduleMaintenanceInterval);
			self.scheduleMaintenanceInterval = null;
		}
	}



	function UpdatedActiveScheduleNotification(maintenanceSchedule) {
		self.maintenanceScheduleMsg = "";
		self.showMaintenanceScheduleMsg = false;
		if (!$.isEmptyObject(maintenanceSchedule)) {
			if (maintenanceSchedule.notificationPeriod) {
				if (maintenanceSchedule.status == "Planned") {

					self.maintenanceScheduleMsg = getMaintenanceNtfMsg(maintenanceSchedule);
					self.showMaintenanceScheduleMsg = true;

				} else if (maintenanceSchedule.status == "Started") {
					self.maintenanceScheduleMsg = getShutdownNtfMsg(maintenanceSchedule);
					self.showMaintenanceScheduleMsg = true;
				}
			} else if (maintenanceSchedule.status == "Started") {
				self.maintenanceScheduleMsg = getShutdownNtfMsg(maintenanceSchedule);
				self.showMaintenanceScheduleMsg = true;
			}

			setScheduleMaintenaceMode();

		} else {
			removeScheduleMaintenaceMode();

		}

		if (self.showMaintenanceScheduleMsg && self.maintenanceScheduleMsg) {
			var $div = $("<div id='actSch'></div>");
			$div.html(self.maintenanceScheduleMsg);
			$(".message-container").html($div);
		} else {
			$(".message-container").empty();
		}
	}

	function setScheduleMaintenaceMode() {
		if (!sessionStorage.getItem("SCHEDULE_IN_MAINTENANCE_MODE")) {
			sessionStorage.setItem("SCHEDULE_IN_MAINTENANCE_MODE", true);
			startScheduleMaintenanceInterval();
		}
	}

	function removeScheduleMaintenaceMode() {
		if (sessionStorage.getItem("SCHEDULE_IN_MAINTENANCE_MODE")) {
			sessionStorage.removeItem("SCHEDULE_IN_MAINTENANCE_MODE");
			stopScheduleMaintenanceInterval();
		}
	}

	function getActiveSchedule() {
		Util.ajaxGet("maintenance/schedule/active", function(response) {
			var maintenanceSchedule = null;
			if (response && response.Status) {
				maintenanceSchedule = response.Schedule;
			}
			UpdatedActiveScheduleNotification(maintenanceSchedule);

		});
	}
	this.init = function() {
		var settingsElement = $('script.js-hypothesis-config');
		try {
			var settings = $.parseJSON(settingsElement.text());
			UpdatedActiveScheduleNotification(settings);
		} catch (err) {
			console.warn('Could not parse settings from js-hypothesis-config tags', err);
		}
	};

	return self;

})();



$(document).ready(function() {
	if(Util.checkCookie()) {
		$(".cookieError").hide();
		$(".login").show();
	} else {
		$("#host").html(Util.host);
		$(".cookieError").show();
		$(".login").hide();
	}
	
	$("#customSlackSignIn").on("click", function(event) {
		Util.SigninWithExternalApp($("#customSlackSignIn").attr("data-url"));
	});
	
	$("#customGoogleSignIn").on("click", function(event) {
		Util.SigninWithExternalApp($("#customGoogleSignIn").attr("data-url"));
	});
	
	/*function attachGoogleErrorSignin(element, error) {
		var msg = "Unable to initialize sign in with google";
		if(error && error.details && error.details.indexOf("Cookies are not enabled in current environment") > -1) {
			msg = '<div style="padding: 5px; background: #ffffffad; word-wrap: break-word; color: red;">\
					 	Your browser has cookies disabled for "accounts.google.com". \
						To use Sign in with google, make sure that your cookies are enabled for "accounts.google.com" \
						and try again.\
				  </div>';
		}
		if (element) {
			$(".googleError").html(msg);
			$(element).on("click" , function(event) {
				$(".googleError").html(msg);
			});
		}
	}

	function decodeJwtCredential(credential) {
		try {
			var base64Url = credential.split('.')[1];
		    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
		        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		    }).join(''));
		    return JSON.parse(jsonPayload);
		} catch (e) {
		    return {};
		}
	}
	
	function signInWithGoogle(googleUserResp) {
		var profile = decodeJwtCredential(googleUserResp.credential);
		var id = profile.sub;
		var firstName = profile.given_name;
		var lastName = profile.family_name;
		var name = profile.name;
		var email = profile.email;
		var imageUrl = profile.picture;
		var email_verified = profile.email_verified;
		var postdata = {
				"email": email,
				"name":name,
				"provision":true,
				"signInFrom": "Extension"
		};
		if(firstName) {
			postdata.firstName = firstName;
		}
		if(lastName) {
			postdata.lastName = lastName;
		}
		Util.ajaxPost("google/ext/login", postdata, function(response) {
			if (response) {
				var newDoc = document.open("text/html", "replace");
				newDoc.write(response);
				newDoc.close();
			}
		}, null, "html");
	}
		
	Util.ajaxGet("google/clientid", function(response) {
		if (response && response.Status) {
			var googleClientId = response.Data;
			if (googleClientId) {
				google.accounts.id.initialize({
					client_id: googleClientId,
					scope: 'profile email',
					callback: signInWithGoogle
				});
				var buttonProperties = {};
				google.accounts.id.renderButton(document.getElementById("customGoogleSignIn"),buttonProperties);
				google.accounts.id.prompt();
			} else {
				attachGoogleErrorSignin(document.getElementById('customGoogleSignIn'));
			}
		}
	});*/

	scheduleMaintenance.init();


});