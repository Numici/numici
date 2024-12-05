var timerModule = angular.module('scheduleTimer', []).directive('scheduleTimer', ['$compile', function ($compile) {
    return {
        restrict: 'EAC',
        replace: false,
        scope: {
            interval: '=interval',
            startTimeAttr: '=startTime',
            endTimeAttr: '=endTime',
            countdownattr: '=countdown',
            finishCallback: '&finishCallback',
            autoStart: '&autoStart',
            maxTimeUnit: '='
        },
        controller: ['$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {

            // Checking for trim function since IE8 doesn't have it
            // If not a function, create tirm with RegEx to mimic native trim
            if (typeof String.prototype.trim !== 'function') {
                String.prototype.trim = function () {
                    return this.replace(/^\s+|\s+$/g, '');
                };
            }

            //angular 1.2 doesn't support attributes ending in "-start", so we're
            //supporting both "autostart" and "auto-start" as a solution for
            //backward and forward compatibility.
            $scope.autoStart = $attrs.autoStart || $attrs.autostart;

            if ($element.html().trim().length === 0) {
                $element.append($compile('<span>{{millis}}</span>')($scope));
            } else {
                $element.append($compile($element.contents())($scope));
            }

            $scope.startTime = null;
            $scope.endTime = null;
            $scope.timeoutId = null;
            $scope.countdown = $scope.countdownattr && parseInt($scope.countdownattr, 10) >= 0 ? parseInt($scope.countdownattr, 10) : undefined;
            $scope.isRunning = false;

            $scope.$on('timer-start', function () {
                $scope.start();
            });

            $scope.$on('timer-resume', function () {
                $scope.resume();
            });

            $scope.$on('timer-stop', function () {
                $scope.stop();
            });

            $scope.$on('timer-clear', function () {
                $scope.clear();
            });

            $scope.$on('timer-set-countdown', function (e, countdown) {
                $scope.countdown = countdown;
            });

            function resetTimeout() {
                if ($scope.timeoutId) {
                    clearTimeout($scope.timeoutId);
                }
            }

            $scope.start = $element[0].start = function () {
                $scope.startTime = $scope.startTimeAttr ? new Date($scope.startTimeAttr) : new Date();
                $scope.endTime = $scope.endTimeAttr ? new Date($scope.endTimeAttr) : null;
                if (!$scope.countdown) {
                    $scope.countdown = $scope.countdownattr && parseInt($scope.countdownattr, 10) > 0 ? parseInt($scope.countdownattr, 10) : undefined;
                }
                resetTimeout();
                tick();
                $scope.isRunning = true;
            };

            $scope.resume = $element[0].resume = function () {
                resetTimeout();
                if ($scope.countdownattr) {
                    $scope.countdown += 1;
                }
                $scope.startTime = new Date() - ($scope.stoppedTime - $scope.startTime);
                tick();
                $scope.isRunning = true;
            };

            $scope.stop = $scope.pause = $element[0].stop = $element[0].pause = function () {
                var timeoutId = $scope.timeoutId;
                $scope.clear();
                $scope.$emit('timer-stopped', {
                    timeoutId: timeoutId,
                    millis: $scope.millis,
                    seconds: $scope.seconds,
                    minutes: $scope.minutes,
                    hours: $scope.hours,
                    days: $scope.days
                });
            };

            $scope.clear = $element[0].clear = function () {
                // same as stop but without the event being triggered
                $scope.stoppedTime = new Date();
                resetTimeout();
                $scope.timeoutId = null;
                $scope.isRunning = false;
            };

            $element.bind('$destroy', function () {
                resetTimeout();
                $scope.isRunning = false;
            });

            function calculateTimeUnits() {
                if ($attrs.startTime !== undefined) {
                    $scope.millis = new Date() - new Date($scope.startTimeAttr);
                }
                // compute time values based on maxTimeUnit specification
                if (!$scope.maxTimeUnit || $scope.maxTimeUnit === 'day') {
                    $scope.seconds = Math.floor(($scope.millis / 1000) % 60);
                    $scope.minutes = Math.floor((($scope.millis / (60000)) % 60));
                    $scope.hours = Math.floor((($scope.millis / (3600000)) % 24));
                    $scope.days = Math.floor((($scope.millis / (3600000)) / 24));
                    $scope.months = 0;
                    $scope.years = 0;
                } else if ($scope.maxTimeUnit === 'second') {
                    $scope.seconds = Math.floor($scope.millis / 1000);
                    $scope.minutes = 0;
                    $scope.hours = 0;
                    $scope.days = 0;
                    $scope.months = 0;
                    $scope.years = 0;
                } else if ($scope.maxTimeUnit === 'minute') {
                    $scope.seconds = Math.floor(($scope.millis / 1000) % 60);
                    $scope.minutes = Math.floor($scope.millis / 60000);
                    $scope.hours = 0;
                    $scope.days = 0;
                    $scope.months = 0;
                    $scope.years = 0;
                } else if ($scope.maxTimeUnit === 'hour') {
                    $scope.seconds = Math.floor(($scope.millis / 1000) % 60);
                    $scope.minutes = Math.floor((($scope.millis / (60000)) % 60));
                    $scope.hours = Math.floor($scope.millis / 3600000);
                    $scope.days = 0;
                    $scope.months = 0;
                    $scope.years = 0;
                } else if ($scope.maxTimeUnit === 'month') {
                    $scope.seconds = Math.floor(($scope.millis / 1000) % 60);
                    $scope.minutes = Math.floor((($scope.millis / (60000)) % 60));
                    $scope.hours = Math.floor((($scope.millis / (3600000)) % 24));
                    $scope.days = Math.floor((($scope.millis / (3600000)) / 24) % 30);
                    $scope.months = Math.floor((($scope.millis / (3600000)) / 24) / 30);
                    $scope.years = 0;
                } else if ($scope.maxTimeUnit === 'year') {
                    $scope.seconds = Math.floor(($scope.millis / 1000) % 60);
                    $scope.minutes = Math.floor((($scope.millis / (60000)) % 60));
                    $scope.hours = Math.floor((($scope.millis / (3600000)) % 24));
                    $scope.days = Math.floor((($scope.millis / (3600000)) / 24) % 30);
                    $scope.months = Math.floor((($scope.millis / (3600000)) / 24 / 30) % 12);
                    $scope.years = Math.floor(($scope.millis / (3600000)) / 24 / 365);
                }
                // plural - singular unit decision
                $scope.secondsS = ($scope.seconds === 1 || $scope.seconds === 0) ? '' : 's';
                $scope.minutesS = ($scope.minutes === 1 || $scope.minutes === 0) ? '' : 's';
                $scope.hoursS = ($scope.hours === 1 || $scope.hours === 0) ? '' : 's';
                $scope.daysS = ($scope.days === 1 || $scope.days === 0) ? '' : 's';
                $scope.monthsS = ($scope.months === 1 || $scope.months === 0) ? '' : 's';
                $scope.yearsS = ($scope.years === 1 || $scope.years === 0) ? '' : 's';
                //add leading zero if number is smaller than 10
                $scope.sseconds = $scope.seconds < 10 ? '0' + $scope.seconds : $scope.seconds;
                $scope.mminutes = $scope.minutes < 10 ? '0' + $scope.minutes : $scope.minutes;
                $scope.hhours = $scope.hours < 10 ? '0' + $scope.hours : $scope.hours;
                $scope.ddays = $scope.days < 10 ? '0' + $scope.days : $scope.days;
                $scope.mmonths = $scope.months < 10 ? '0' + $scope.months : $scope.months;
                $scope.yyears = $scope.years < 10 ? '0' + $scope.years : $scope.years;

            }

            //determine initial values of time units and add AddSeconds functionality
            if ($scope.countdownattr) {
                $scope.millis = $scope.countdownattr * 1000;

                $scope.addCDSeconds = $element[0].addCDSeconds = function (extraSeconds) {
                    $scope.countdown += extraSeconds;
                    $scope.$digest();
                    if (!$scope.isRunning) {
                        $scope.start();
                    }
                };

                $scope.$on('timer-add-cd-seconds', function (e, extraSeconds) {
                    $timeout(function () {
                        $scope.addCDSeconds(extraSeconds);
                    });
                });

                $scope.$on('timer-set-countdown-seconds', function (e, countdownSeconds) {
                    if (!$scope.isRunning) {
                        $scope.clear();
                    }

                    $scope.countdown = countdownSeconds;
                    $scope.millis = countdownSeconds * 1000;
                    calculateTimeUnits();
                });
            } else {
                $scope.millis = 0;
            }
            calculateTimeUnits();

            var tick = function () {

                $scope.millis = new Date() - $scope.startTime;
                var adjustment = $scope.millis % 1000;

                if ($scope.endTimeAttr) {
                    $scope.millis = $scope.endTime - new Date();
                    adjustment = $scope.interval - $scope.millis % 1000;
                }


                if ($scope.countdownattr) {
                    $scope.millis = $scope.countdown * 1000;
                }

                if ($scope.millis < 0) {
                    $scope.stop();
                    $scope.millis = 0;
                    calculateTimeUnits();
                    if ($scope.finishCallback) {
                        $scope.$eval($scope.finishCallback);
                    }
                    return;
                }
                calculateTimeUnits();

                //We are not using $timeout for a reason. Please read here - https://github.com/siddii/angular-timer/pull/5
                $scope.timeoutId = setTimeout(function () {
                    tick();
                    $scope.$digest();
                }, $scope.interval - adjustment);

                $scope.$emit('timer-tick', {
                    timeoutId: $scope.timeoutId,
                    millis: $scope.millis
                });

                if ($scope.countdown > 0) {
                    $scope.countdown--;
                } else if ($scope.countdown <= 0) {
                    $scope.stop();
                    if ($scope.finishCallback) {
                        $scope.$eval($scope.finishCallback);
                    }
                }
            };

            if ($scope.autoStart === undefined || $scope.autoStart === true) {
                $scope.start();
            }
        }]
    };
}]);

/* commonjs package manager support (eg componentjs) */
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports) {
    module.exports = timerModule;
}

;(function(window, angular) {
	'use strict';
	
	CKEDITOR.config.allowedContent = true;
	
	function checkCookie(){
	    var cookieEnabled = (navigator.cookieEnabled) ? true : false;
		if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled){ 
			document.cookie="testcookie=test";
			cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
		}
		
		if(cookieEnabled) {
			document.cookie = "testcookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
		}
		
		return cookieEnabled;
	}
	
	var dependencies =  ['angularMoment','ui.router','ngAnimate','ngSanitize','ngMaterial','angular.filter','ngResource','angular-loading-bar',
	                     'ui.bootstrap','duScroll','angular-inview','underscore','rangy','ngFileUpload','angular-confirm','ngDragDrop',
	                     'angular-pdf-viewer',"xeditable","ui.select","toaster","monospaced.elastic","LocalStorageModule",'colorpicker.module',
	                     'angular-clipboard','ui.sortable','pageslide-directive','ngWebSocket','CanvasViewer','markdown','turndown','ngCookies',
					     'ngFlash','scheduleTimer','UUIDV4'];
	
	angular.module('underscore', []);
	angular.module('underscore').factory('_', function() {
	  return window._;
	});
	
	angular.module('UUIDV4', []);
	angular.module('UUIDV4').factory('uuidv4', function() {
		return {
	      v4: window.uuidv4
	    };
    });
	
	angular.module('rangy', []);
	angular.module('rangy').factory('rangy', function() {
	  return window.rangy; 
	});
	
	
	
	angular.module("vdvcApp",dependencies);
	
	angular.module("vdvcApp").constant('companyName', 'numici');
	angular.module("vdvcApp").constant('baseUrl', 'api/');
	angular.module("vdvcApp").constant('defautlDateFormat', 'DD-MM-YYYY');
	angular.module("vdvcApp").constant('iscookiesEnabled', checkCookie());
	
	angular.module("vdvcApp").factory("appData", ["$location",function($location) {
		var appdata = {};
		return {
			setAppData : setAppData,
			getAppData : getAppData,
			clearAppData : clearAppData,
			storageKeyForExtension : storageKeyForExtension,
			storageKeyForApp: storageKeyForApp
			
		};
		
		function setAppData(key,value) {
			appdata[key] = value;
		}
		
		function getAppData() {
			return appdata;
		}
		
		function clearAppData() {
			appdata = {}
		}
		
		function storageKeyForExtension() {
			
 		    var apiDomain = $location.host();
 		    apiDomain = apiDomain.replace(/\./g, '%2E');
 		    return 'hypothesis.oauth.${apiDomain}.token';
 		}
 		
 		function storageKeyForApp() {
 			
 		    var apiDomain = $location.host();
 		    apiDomain = apiDomain.replace(/\./g, '%2E');
 		    return apiDomain;
 		}
 		
	}]);
	
	angular.module("vdvcApp").constant('AUTH_EVENTS', {
		loginSuccess: 'auth-login-success',
		loginFailed: 'auth-login-failed',
		logoutSuccess: 'auth-logout-success',
		sessionTimeout: 'auth-session-timeout',
		notAuthenticated: 'auth-not-authenticated',
		notAuthorized: 'auth-not-authorized',
		serverInMaintenanceMode: 'server-in-maintenance-mode'
	});
	
	function isIPad() {
	  return /iPad/i.test(navigator.userAgent);
	}
	
	angular.module("vdvcApp").provider('$deviceInfo', function () {
		
		var ua_parser = new UAParser();
		var deviceInfo = ua_parser.getResult();
		this.deviceInfo = deviceInfo;
		this.isIPad = isIPad();
		this.isMobile = deviceInfo.device && deviceInfo.device.type === 'mobile';
		this.isTablet = ((deviceInfo.device && deviceInfo.device.type === 'tablet') || isIPad);
		this.isTouch = (deviceInfo.device && (deviceInfo.device.type === 'tablet' || deviceInfo.device.type === 'mobile')) 
		|| (deviceInfo.os && deviceInfo.os.name == "Android");
		
		var browserName = deviceInfo.browser ? deviceInfo.browser.name : "";
		
		this.isChrome = browserName && browserName.indexOf("Chrome") !== -1 ? true : false;
		this.isSafari = browserName && browserName.indexOf("Safari") !== -1 ? true : false;
		this.isIE = browserName && browserName.indexOf("IE") !== -1 ? true : false;
		this.isEdge = browserName && browserName.indexOf("Edge") !== -1 ? true : false;
		
		this.setDeviceInfo = function (info) {
			this.deviceInfo = info;
		};

		this.$get = function () {
		    return this;
		};
	});
	
	angular.module("vdvcApp").provider('$userTimeZone', function () {
		this.timeZone = null;
		if(jstz) {
			this.timeZone = jstz.determine().name();
		} else {
			try{
				this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			} catch(e) {}
		}
		
		this.$get = function () {
		    return this;
		};
	});
	
})(window,window.angular);
