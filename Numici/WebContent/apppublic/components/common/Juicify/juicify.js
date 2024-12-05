;(function(){
	'use strict';
	angular.module("vdvcPublicApp").factory("Juicify",Juicify );
	
	Juicify.$inject = ['$q','$http','uuidService'];
	
	function Juicify($q,$http,uuidService) {
		var randomId = uuidService.newUuid();
		var markdownCssUrl = 'app/assets/css/markdown.css?id='+randomId;
		var Juicify = {
				getCssContent : getCssContent,
				inlineCss : inlineCss,
				markdownCssUrl: markdownCssUrl,
				cssMap : {}
		};
		
		return Juicify;
		
		
		function getCssContent(cssurl) {
			return $http.get(url,config).then(function(resp) {
			}).finally(function(resp) {
				if(resp) {
					cssMap[cssurl] = resp;
				}
			});
		}
		
		function inlineCss(html,css) {
			var html = '<div class="markdown-body">'+html+'</div>';
			if(css) {
				return juice.inlineContent(html, css);
			} else {
				return html;
			}
		}
	}
	
})();

