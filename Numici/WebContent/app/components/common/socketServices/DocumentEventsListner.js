;(function(){
	'use strict';
	
	angular.module("vdvcApp").factory("DocumentEventsListner",DocumentEventsListner);
	
	DocumentEventsListner.$inject = ['$rootScope','SocketFactory'];

	function DocumentEventsListner($rootScope,SocketFactory) {
		
		var socket = SocketFactory.getConnection('docevents',{
			reconnectIfNotNormalClose: true
		});
		var methods = {
				sendMessage: sendMessage,
				reconnect:reconnect,
				close: close,
				isConnected : isConnected
		};

		socket.onMessage(function(message){
			
			var data = JSON.parse(message.data);
			if(data) {
				$rootScope.$broadcast(data.action,data);
			}
		});
		
		socket.onOpen(function(){
			sendMessage({"userId":$rootScope.userinfo.UserId,"filter":null});
		});

		socket.onClose(function(event){
			
		});
		
		socket.onError(function(event){
			
		});
		
		return methods;
		
		function sendMessage(message) {
			return socket.send(message);
		}
		
		function reconnect() {
			socket.reconnect();
		}
		
		function close() {
			socket.close();
		}
		
		function isConnected() {
			if(socket && socket.readyState == 1) {
				return true;
			}
			return false;
		}
	}
	
})();