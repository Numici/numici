;(function() {
	'use strict';

	angular.module('vdvcPublicApp').factory('urlParser', urlParser);
	
	urlParser.$inject = ['_'];

	function urlParser(_) {

		var parser = {
			parseUrl : parseUrl
		};
		
		return parser;
		
		function parseUrl(url) {
			var parser = document.createElement('a'), searchObject = {}, queries, split, i;
			parser.href = url;
			queries = parser.search.replace(/^\?/, '').split('&');

			var pathname = parser.pathname;
			if(_.isString(pathname) && pathname.trim().charAt(0) !== "/") {
				pathname = "/"+pathname;
			}
			
			for (i = 0; i < queries.length; i++) {
				split = queries[i].split('=');
				searchObject[split[0]] = split[1];
			}

			return {
				protocol : parser.protocol, // ex: http:
				host : parser.host, // ex: localhost:3000
				hostname : parser.hostname, // ex: localhost
				port : parser.port, // ex: 3000
				pathname : pathname, // ex: /models
				search : parser.search,
				searchObject : searchObject,
				hash : parser.hash
			};

		}
	}
})();