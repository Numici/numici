;(function() {
	'use strict';
	angular.module("vdvcApp").factory("GlobalErrorHandler", GlobalErrorHandler);
	
	GlobalErrorHandler.$inject = ['$q','_','APIUserMessages',"$rootScope","AUTH_EVENTS",'TimeLogService','$userTimeZone','$deviceInfo','uuidService'];
	
	function GlobalErrorHandler($q,_,APIUserMessages,$rootScope,AUTH_EVENTS,TimeLogService,$userTimeZone,$deviceInfo,uuidService) {
		var GlobalErrorHandler = {
				response : responseHandler,
				responseError : responseErrorHandler,
				request : request
		};
		
		return GlobalErrorHandler;
		
		function responseHandler(response) {
           if(_.isObject(response.data) && response.data && _.isBoolean(response.data.Status) && !response.data.Status) {
        	   var msg = response.data.Message ? response.data.Message : "Something went wrong.Did not get any Error Message "+"URL is "+response.config.url;
        	   APIUserMessages.error(msg);
        	   var err = new Error(msg);
        	   console.error(err);
           }
           
           setRespomnseTimeStamp(response);
           return response;
        }
        
        function responseErrorHandler(response) {
        	
        	if(response.status === 404) {
        		APIUserMessages.error('There was some problem. Please try again.');
            }
        	
        	if(response.status === 401) {
        		//$state.go("login");
        		$rootScope.$broadcast({
        	        401: AUTH_EVENTS.notAuthenticated,
        	        403: AUTH_EVENTS.notAuthorized,
        	        419: AUTH_EVENTS.sessionTimeout,
        	        440: AUTH_EVENTS.sessionTimeout
        	      }[response.status], response.data);
            }
        	
        	if(response.status === -1) {
        		//alert("either the server is down or the client is not connected to the internet");
        	}
        	
        	setRespomnseTimeStamp(response);
        	return  $q.reject(response);
        }
        
        function request(config) {
        	if(config.url && (config.url.indexOf("api/") >= 0 || config.url.indexOf("annotateWebApi/") >= 0)) {
            	config.requestTimestamp = new Date().getTime();
            	config.headers.USER_TIMEZONE= $userTimeZone.timeZone;
            	
            	config.headers.USER_BROWSER = "unknown";
            	config.headers.USER_OS = "unknown";
            	config.headers.USER_DEVICE_TYPE = "unknown";
            	config.headers.USER_DEVICE_MODEL = "unknown";
            	config.headers.USER_DEVICE_VENDOR = "unknown";
				config.headers["X-Client-Id"] = uuidService.getSessionUUID();
            	
            	if(!_.isEmpty($deviceInfo.deviceInfo)) {
            		var info = $deviceInfo.deviceInfo;
            		if(!_.isEmpty(info.browser) && !_.isEmpty(info.browser.name)) {
            			config.headers.USER_BROWSER = info.browser.name;
            		}
            		
            		if(!_.isEmpty(info.os) && !_.isEmpty(info.os.name)) {
            			config.headers.USER_OS = info.os.name;
            		}
            		
            		if(!_.isEmpty(info.device) && !_.isEmpty(info.device.type)) {
            			config.headers.USER_DEVICE_TYPE = info.device.type;
            		}
            		
            		if(!_.isEmpty(info.device) && !_.isEmpty(info.device.model)) {
            			config.headers.USER_DEVICE_MODEL = info.device.model;
            		}
            		
            		if(!_.isEmpty(info.device) && !_.isEmpty(info.device.vendor)) {
            			config.headers.USER_DEVICE_VENDOR = info.device.vendor;
            		}
            	}
        	}
        	
            return config;
        }
        
        function setRespomnseTimeStamp(response) {
        	 if(response.config.url && response.config.url.indexOf("api/") >= 0) {
        		  response.config.responseTimestamp = new Date().getTime();
            	  var time = response.config.responseTimestamp - response.config.requestTimestamp;
            	  time = (time/1000);
            	  if(time >= 0 && !response.config.url.indexOf("getUserNotificationCount") >= 0) {
            		  var timeLog = {
            			   'timeStamp': response.config.requestTimestamp,
						   'resp_timeStamp': response.config.responseTimestamp,
            			   'requestedUrl' : response.config.url,
            			   'httpStatus' : response.status,
            			   'responseTime' : time,
                           'serverExeTime' : response.headers()["response-time"]
            		  };
            		  TimeLogService.setTimeLogInfo(timeLog);
            	  }
        	 }
        }
	}
	
})();