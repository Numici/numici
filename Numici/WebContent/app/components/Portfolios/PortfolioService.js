;(function() {
	'use strict';
	
	angular.module("vdvcApp").factory("PortfolioService",PortfolioService);
	
	PortfolioService.$inject = ['httpService'];
	
	function PortfolioService(httpService) {
		
		var portfolioActionProps = {
				"Share": {type:"PortfolioActionProps",action:"share",title:"Share",show:false,class:"fa-users"},
		        "Edit" : {type:"PortfolioActionProps",action:"edit",title:"Edit",show:false,class:"fa fa-pencil-square-o"},
		        "Delete" : {type:"PortfolioActionProps",action:"delete",title:"Delete",show:false,class:"fa-trash-o"},
		    };
		
		var portfolioListHeaders = [
		 	                  {
		 	                	  "label":"Name",
		 	                	  "value":"name",
		 	                	  "checked" : true,
		 		                  "type" : "text",
		 		                  "class" : "col-md-4"
		 	                  },{
		 	                	  "label":"Owner",
		 	                	  "value":"createdBy",
		 	                	  "checked" : true,
		 		                  "type" : "text",
		 		                  "class" : "col-md-2"
		 	                  },{
		 	                	 "label":"Tickers",
	 		                	  "value":"displayTickers",
	 		                	  "checked" : true,
	 		                	  "type" : "text",
	 		                	  "class" : "col-md-3"
		 	                  },{
	 		                	  "label":"Date Created",
	 		                	  "value":"createdOn",
	 		                	  "checked" : true,
	 		                	  "type" : "Date",
	 		                	  "class" : "col-md-3"
	 		                  },{
	 		                	  "label":"Last Modified",
	 		                	  "value":"modifiedOn",
	 		                	  "checked" : true,
	 		                	  "type" : "Date",
	 		                	  "class" : "col-md-3"
	 		                  }    
		 	            ];
		
		var pfTickersListHeaders = [
		 	                  {
		 	                	  "label":"Ticker",
		 	                	  "value":"ticker",
		 	                	  "checked" : true,
		 		                  "type" : "text",
		 		                  "class" : "col-md-3"
		 	                  },{
		 	                	  "label":"Company Name",
		 	                	  "value":"companyName",
		 	                	  "checked" : true,
		 		                  "type" : "text",
		 		                  "class" : "col-md-4"
		 	                  },{
		 	                	 "label":"Cik",
	 		                	 "value":"cik",
	 		                	 "checked" : true,
	 		                	 "type" : "text",
	 		                	 "class" : "col-md-2"
		 	                  },{
		 	                	 "label":"",
	 		                	 "value":"x",
	 		                	 "checked" : true,
	 		                	 "type" : "text",
	 		                	 "class" : "col-md-2"
		 	                  }  
		 	            ];
		
		var Portfolio = {
				portfolioActionProps : portfolioActionProps,
				portfolioListHeaders : portfolioListHeaders,
				pfTickersListHeaders : pfTickersListHeaders,
				
				getAllPortfolios : getAllPortfolios,
				creatPortfolio : creatPortfolio,
				getPortfolioById : getPortfolioById,
				updatePortfolioById : updatePortfolioById,
				deletePortfolioList : deletePortfolioList,
				getPortfoliosByTicker : getPortfoliosByTicker,
				getPortfolioPermissionSet : getPortfolioPermissionSet,
				sharePortfolio : sharePortfolio,
				getPortfolioSharedUsers : getPortfolioSharedUsers,
				getPortfolioPermissionsById : getPortfolioPermissionsById,
				unsharePortfolio : unsharePortfolio,
				setSearchId : setSearchId 
		};
		
		return Portfolio;
		
		function getAllPortfolios() {
			return httpService.httpGet("portfolio/list/all");
		}
		
		function creatPortfolio(postdata) {
			return httpService.httpPost("portfolio/create",postdata);
		}
		
		function getPortfolioById(portfolioId) {
			return httpService.httpGet("portfolio/get/"+portfolioId);
		}
		
		function updatePortfolioById(postdata) {
	    	return httpService.httpPost("portfolio/update",postdata);
	    }
	    
		function deletePortfolioList(postdata) {
			return httpService.httpDelete("portfolio/delete",postdata);
		}
		
		function getPortfoliosByTicker(tickerName) {
			return httpService.httpGet("portfolio/get/"+tickerName);
		}
		
		function getPortfolioPermissionSet() {
			return httpService.httpGet("portfolio/permissions");
		}
		
		function sharePortfolio(postdata) {
			return httpService.httpPost("portfolio/share",postdata);
		}
		
		function getPortfolioSharedUsers(portfolioId) {
			return httpService.httpGet("portfolio/shared/users/"+portfolioId);
		}
		
		function getPortfolioPermissionsById(postdata) {
			return httpService.httpPost("portfolio/get/permissions",postdata);
		}
		
		function unsharePortfolio(postdata) {
			return httpService.httpPost("portfolio/unshare",postdata);
		}
		
		function setSearchId(postdata) {
			return httpService.httpPost("portfolio/setSearchId",postdata);
		}
	}
})();