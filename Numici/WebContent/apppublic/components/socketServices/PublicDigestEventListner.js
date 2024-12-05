;(function(){
	'use strict';
	
	angular.module("vdvcPublicApp").factory("PublicDigestEventListner",PublicDigestEventListner);
	
	PublicDigestEventListner.$inject = ['$rootScope','SocketFactory','uuidService','notificationEvents'];

	function PublicDigestEventListner($rootScope,SocketFactory,uuidService,notificationEvents) {
		
		var socket = SocketFactory.getConnection('digestevents',{
			reconnectIfNotNormalClose: true
		});
		
		var digestEvent = {
				taskspaceId : null,
				documentId : null,
				sendMessage: sendMessage,
				reconnect:reconnect,
				close: close,
				isConnected: isConnected
		};
		
		function handleDigestNotifications(message) {
			var data = JSON.parse(message.data);
			if(data) {
				console.log(data.action);
				console.log(data);
				switch(data.action) {
					case "DIGEST_CHANGED" :
						$rootScope.$broadcast(notificationEvents[data.action],data);
						break;
				}
			}
		}
		
		socket.onMessage(function(message){
			handleDigestNotifications(message);
		});
		
		socket.onOpen(function(){
			sendMessage({"taskspaceId":digestEvent.taskspaceId,"documentId":digestEvent.documentId});
		});
		
		return digestEvent;
		
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