;(function(){
	'use strict';
	
	angular.module("vdvcPublicApp").factory("SocketFactory",SocketFactory);
	
	SocketFactory.$inject = ['$rootScope','$websocket','$location','urlParser','_'];

	function SocketFactory($rootScope,$websocket,$location,urlParser,_) {
		
		var connections = {};
		var socket = {
				getConnection : getConnection,
				closeAllSockets : closeAllSockets 
		};
		
		$rootScope.$on("ONLOGIN", function(event, data) {
			reconnectAllSockets();
		});
		
		return socket;
		
		function createEndPointUrl(endpoint) {
			
			var absUrl = $location.absUrl();
			var urlObj = urlParser.parseUrl(absUrl);
			
			try {
				var protocol = urlObj.protocol;
				var host = urlObj.host;
				var context = urlObj.pathname.split('/')[1];
				
				if(protocol == 'https:') {
					return 'wss://'+host+'/'+endpoint;
				} else {
					return 'ws://'+host+'/'+endpoint;
				}
			} catch(e) {
				
			}
			
		}
		
		function closeAllSockets() {
			_.each(connections,function(socket,url) {
				socket.close();
			});
		}
		
		function reconnectAllSockets() {
			_.each(connections,function(socket,url) {
				socket.reconnect();
			});
		}
		
		function getConnection(endpoint,options) {
			var url = createEndPointUrl(endpoint);
			if(url) {
				var connection = $websocket(url,false,options);
				connections[url] = connection;
				return connection;
			}
		}
		
	}
})();