"use strict";

function settings(e, t) {
	var r = {};
	t || (t = "js-hypothesis-settings");
	if($("script."+t).length > 0) {
		 Object.assign(r, JSON.parse($("script."+t)[0].textContent));
	}
	return r;
}


$(function() {
	var config = settings(window, "js-hypothesis-settings");
	try {
		chrome.runtime.sendMessage(config.extId,{ "type": "authorization_response" ,"data": JSON.stringify(config)},
			function(response) {
				if (typeof success == "function") {
					
				}
			});
	} catch (e) {
		console.log("exception : " + e.message);
		if (typeof success == "function") {
		}
	}
});