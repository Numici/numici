;(function(){
	'use strict';
	
	angular.module("vdvcApp").factory("TaskSpaceEventListner",TaskSpaceEventListner);
	
	TaskSpaceEventListner.$inject = ['$rootScope','SocketFactory','uuidService','notificationEvents'];

	function TaskSpaceEventListner($rootScope,SocketFactory,uuidService,notificationEvents) {
		
		var socket = SocketFactory.getConnection('tsevents',{
			reconnectIfNotNormalClose: true
		});
		
		var methods = {
				sendMessage: sendMessage,
				reconnect:reconnect,
				close: close,
				isConnected: isConnected
		};

		

        function handleTaskspaceNotifications(message) {
			var data = JSON.parse(message.data);
			if(data) {
				console.log(data.action);
				console.log(data);
				switch(data.action) {
					case "DOCS_ADDED" :
					case "DOCS_REMOVED" :
					case "SECTION_ADDED" :
					case "SECTION_REMOVED" :
					case "SECTION_RENAMED" :
					case "COMMENT_CREATED_OR_UPDATED" :
					case "COMMENT_DELETED" :
					case "DOCUMENT_MOVED" :
					case "DOCUMENT_INDEXED" :
					case "PERMISSIONS_CHANGED" :
						$rootScope.$broadcast(notificationEvents[data.action],data);
						break;
					case "TS_RENAMED":
					case "TS_DELETED" :
					case "TS_CREATED" :
					case "TS_OWNER_CHANGED" :
					case "SHARED" :
					case "UNSHARED" :
					 	if(notificationEvents.shouldHandle(data)) {
							$rootScope.$broadcast(notificationEvents[data.action],data);
						}
						break;
				}
				
			}
		}
		
		socket.onMessage(function(message){
			handleTaskspaceNotifications(message);
		});
		
		socket.onOpen(function(){
			sendMessage({"userId":$rootScope.userinfo.UserId,"tabId":uuidService.getSessionUUID(),"filter":null});
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