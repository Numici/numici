;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('EditPortfolioCtrl',EditPortfolioCtrl);
	
	EditPortfolioCtrl.$inject = ['$scope', '$uibModalInstance','PortfolioService','$confirm',"_","SecFilingService","portfolio","savedSearch","AdvSearchService","appData","MessageService"];
	
	function EditPortfolioCtrl($scope, $uibModalInstance,PortfolioService,$confirm,_,SecFilingService,portfolio,savedSearch,AdvSearchService,appData,MessageService) {
		  var ep = this;
		  var appdata = appData.getAppData();
		  var selectedTickersForPost = [];
		  ep.portfolio;
		  ep.companiesList = [];
		  ep.selectedTickers = [];
		  ep.portfolioName = '';
		  ep.pfTickersListHeaders = PortfolioService.pfTickersListHeaders;
		  ep.isNotify = false;
		  ep.query = angular.copy(AdvSearchService.SearchQuery);
		  ep.query.userId = appdata.UserId;
		  ep.query.enterprises = [appdata.Organization];
		  ep.advancedInputs = ep.query.advancedInputs;
		  ep.ModifiedDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
		  ep.docTypes = angular.copy(AdvSearchService.docTypes);
		  
		  ep.onChangeNotify = onChangeNotify;
		  ep.processTickerOnSelect = processTickerOnSelect;
		  ep.removeTickerFromSelection = removeTickerFromSelection;
		  ep.refreshTickers = refreshTickers;
		  ep.ok = ok; 
		  ep.cancel = cancel;
		  
		  function onChangeNotify () {
			  ep.isNotify = !ep.isNotify;
		  }
		  		  
		  ep.DocTypeWrap = {
				  "isOpen" : false,
				  "toggle" : function() {
					  var isValid = true;
					  if(ep.DocTypeWrap.isOpen) {
						  isValid = this.validateDocTypeSelection();
					  }
					  if(isValid) {
						  ep.DocTypeWrap.isOpen = !ep.DocTypeWrap.isOpen;
					  }
				  },
				  "close" : function() {
					  var isValid = true;
					  if(ep.DocTypeWrap.isOpen) {
						  isValid = this.validateDocTypeSelection();
					  }
					  if(isValid) {
						  ep.DocTypeWrap.isOpen = false;
					  }
				  },
				  "validateDocTypeSelection" : function() {
					  var allDocs = ep.docTypes['Documents'];
					  var DocTypeSelectons = _.where(allDocs, {"checked": true});
					  if(DocTypeSelectons.length > 0) {
						  return true;
					  } else {
						  return false;
					  }
			
				  }
		  }
			  
		  ep.SlctdDocTypes = {
				  getSelectedDocTypes : function () {
					  var docTypes = [],displayDocTypes = [],subTypes = {},DocTypes=[];
					  var allDocs = ep.docTypes['Documents'];
					  var ownerShip = ep.docTypes['ownerShip'];
					  var optional = ep.docTypes['optional'];
					  var DocTypeSelectons = _.where(_.union(allDocs,ownerShip,optional), {"checked": true});
					  var ownerShipSelection =  _.where(ownerShip, {"checked": true});
				
					  ep.advancedInputs.isGlobal = false;
					  ep.advancedInputs.sharedWithMe = false;
					  ep.advancedInputs.myDocuments = false;
					  ep.advancedInputs.annotatedDocs = false;
					  ep.advancedInputs.searchInAnnotation = false;
					  ep.query.entityTypes = [];
				
					  if(DocTypeSelectons) {
						  var filteredArray = _.filter(DocTypeSelectons,function(obj) {
							  return obj.type != "All_SEC";
						  });
					
						  var SecArray = _.filter(DocTypeSelectons,function(obj) {
							  return obj.type == "All_SEC";
						  });
						  
						  var CompanyDocArray = _.filter(DocTypeSelectons,function(obj) {
						     return obj.type == "CompanyDoc";
						  });
						  
						  if(ep.docTypes.selectAllDocs) {
							  displayDocTypes.push("ALL");
						  } else if (SecArray.length > 0){
							  displayDocTypes.push(SecArray[0].lable);
						  } 
						  if(!ep.docTypes.selectAllDocs && CompanyDocArray.length > 0) {
							  displayDocTypes.push(CompanyDocArray[0].lable);
						  }
						
						  if (SecArray.length > 0){
							  DocTypes.push("SECFile");
							  DocTypes.push("SECCompareFile");
						  } else if(SecArray.length == 0) {
							  subTypes["SECFile"] = [];
							  subTypes["SECCompareFile"] = [];
						  }
						
						  if(CompanyDocArray.length == 0) {
							  subTypes["CompanyDoc"] = [];
						  }
						  
						  _.each(filteredArray,function(obj,index){
							  switch(obj.group) {
							  case "SECFile":
								  if(SecArray.length == 0) { 
									  subTypes.SECFile.push(obj.type);
									  subTypes.SECCompareFile.push(obj.type);
								  }
								  if(!_.contains(ep.query.entityTypes,"document")) {
									  ep.query.entityTypes.push("document");
								  }
								  if(SecArray.length == 0 && !ep.docTypes.selectAllDocs) {
									  displayDocTypes.push(obj.lable);
								  }
								  break;
							  case "Document":
								  if(!ep.docTypes.selectAllDocs) {
									  if(!obj.subGroup) {
										  displayDocTypes.push(obj.lable);
									  }
									  if(CompanyDocArray.length == 0 && obj.type != "CompanyDoc" && obj.subGroup && obj.subGroup === "CompanyDoc") { 
										  displayDocTypes.push(obj.lable);
									  }
								  }
								  
								  if(obj.type === "CompanyDoc" && obj.checked) { 
									  DocTypes.push(obj.type);
								  } else if(obj.subGroup && obj.subGroup === "CompanyDoc" && CompanyDocArray.length == 0 && obj.type != "CompanyDoc") { 
									  subTypes.CompanyDoc.push(obj.type);
								  }
								  
								  if(obj.type != "News") { 
									  if(!obj.subGroup || obj.subGroup !== "CompanyDoc") {
										  DocTypes.push(obj.type);
									  }
									  if(!_.contains(ep.query.entityTypes,"document")) {
										  ep.query.entityTypes.push("document");
									  }
								  } else if(!_.contains(ep.query.entityTypes,"news")) {
									  ep.query.entityTypes.push("news");
								  } 
								  break;
							  case "ownerShip":
								  ep.advancedInputs[obj.type] = true;
								  if(!_.contains(ep.query.entityTypes,"document")) {
									  ep.query.entityTypes.push("document");
								  }
								  if(ownerShip.length != ownerShipSelection.length ) {
									  displayDocTypes.push(obj.lable);
								  }
								  break;
							  case "optional":
								  ep.advancedInputs.annotatedDocs = true;
								  if(!_.contains(ep.query.entityTypes,"document")) {
									  ep.query.entityTypes.push("document");
								  }
								  displayDocTypes.push(obj.lable);
								  break;
							  }
						  });	
					  }
					  
					  if(SecArray.length == 0) {
						  if(subTypes.SECFile.length == 0) {
							  delete subTypes.SECFile;
							  delete subTypes.SECCompareFile
						  }
					  }
					
					  if(CompanyDocArray.length == 0) {
						  if(subTypes.CompanyDoc.length == 0) {
							  delete subTypes.CompanyDoc;
						  }
					  }
					  ep.advancedInputs.documentType = DocTypes;
					  ep.advancedInputs.subtypes = subTypes;
					  return displayDocTypes.join(",");
				  }
		  	}
			
			ep.onDocTypeChange = function(doc){
				var allDocs = ep.docTypes['Documents'];
				if (doc == "All") {
					for(var i=0; i < allDocs.length; i++) {
						allDocs[i].checked = ep.docTypes.selectAllDocs;
			        }
				} else if(_.isObject(doc)) {
					 if(doc.group == "SECFile") {
						 var secAll =  _.findWhere(allDocs, {"type": "All_SEC"});
						 var sedDocs = _.where(allDocs, {"group": "SECFile"});
						 if (doc.hasSubType) {
							 for(var i = 0; i < sedDocs.length; i++) {
								 sedDocs[i].checked = doc.checked;
							 }
						 } else {
							 var s = true;
							 for(var i = 0; i < sedDocs.length; i++) {
								 if (!sedDocs[i].checked && sedDocs[i].type != "All_SEC") {
									 secAll.checked = false;
									 s = false;
								 }
							 }
							 if (s) {
								 secAll.checked = true;
							 }
						 }
					 } 
					 
					 if(doc.group == "ownerShip") {
						 var ownerShip = ep.docTypes['ownerShip'];
						 var ownerShipSelection =  _.where(ownerShip, {"checked": false});
						 if (ownerShip.length == ownerShipSelection.length) {
							 for(var i=0; i < ownerShip.length; i++) {
								 ownerShip[i].checked = true;
						     }
						 }
					 }
					 
					 if(doc.group == "Document" && doc.subGroup && doc.subGroup == "CompanyDoc") {
						 var companyDocsAll =  _.findWhere(allDocs, {"type": "CompanyDoc"});
						 var companyDocs = _.where(allDocs, {"subGroup": "CompanyDoc"});
						 var companyDocSelection =  _.where(companyDocs, {"checked": false});
						 if (doc.hasSubType) {
							 for(var i=0; i < companyDocs.length; i++) {
								 companyDocs[i].checked = doc.checked;
						     }
						 } else {
							 var s = true;
							 for(var i = 0; i < companyDocs.length; i++) {
								 if (!companyDocs[i].checked && companyDocs[i].type != "CompanyDoc") {
									 companyDocsAll.checked = false;
									 s = false;
								 }
							 }
							 if (s) {
								 companyDocsAll.checked = true;
							 }
						 }
					 }
					 
					 var unchecked = _.where(allDocs, {"checked": false});
					 var checked = _.where(allDocs, {"checked": true});
					 if(allDocs.length == checked.length ) {
						 ep.docTypes.selectAllDocs = true;
					 } else {
						 ep.docTypes.selectAllDocs = false;
					 }
				}
			}
			
		  function processTickerOnSelect(selectedTicker){
			  selectedTickersForPost = _.reject(selectedTickersForPost,{cik:selectedTicker.cik});
			  var tickerObj = {};
			  tickerObj["ticker"] = selectedTicker.ticker;
			  tickerObj["companyName"] = selectedTicker.companyName;
			  tickerObj["cik"] = selectedTicker.cik;
			  selectedTickersForPost.push(tickerObj);
		  }
		  
		  function removeTickerFromSelection(selectedTicker){
			  ep.selectedTickers = _.reject(ep.selectedTickers,{cik:selectedTicker.cik});
			  selectedTickersForPost = _.reject(selectedTickersForPost,{cik:selectedTicker.cik});
		  }
		  
		  function refreshTickers (searchKey) {
			   if(!_.isEmpty(searchKey)) {
				   SecFilingService.getCompaniesList({"searchTxt":searchKey}).then(function(resp){
				    	if(resp.status == 200 && resp.data.Status) {
				    		ep.companiesList = resp.data.Company;
				    		_.each(selectedTickersForPost,function(selectedTicker) {
				    			ep.companiesList = _.reject(ep.companiesList, function(company){ 
					    			return company.cik == selectedTicker.cik; 
					    		});
				    		});
				    	}
				    });
			   }
		  }
		  
		  function cancel() {
		    $uibModalInstance.dismiss('cancel');
		  }
		  
		  function processQuery(portfolio) {
			  var query = angular.copy(ep.query);
			  query["userId"] = appdata.UserId;
			  delete query.advancedInputs.tickers;
			  query.advancedInputs["portfolios"] = [portfolio];
			  ep.SlctdDocTypes.getSelectedDocTypes();
			  if (_.isString(query.searchString) && !_.isEmpty(query.searchString)) {
		    		
		    		if(_.startsWith(query.searchString,"~")) {
		    			query.queryString = _.strRight(query.searchString,"~");
		    			delete query.searchString;
		    		} else if(query.searchString.indexOf('"') != -1 && query.searchString.indexOf('~') != -1) {
		    			var n = query.searchString.split('~');
			    		if(n.length >= 2){
			    			query.searchString = n[0];
			    			if (_.isEmpty( n[0])) {
			    				MessageService.showErrorMessage("PROXIMITY_VAL_ERR");
			    				return false;
			    			} else {
			    				 var re = new RegExp(/\w+\s\w+/);
			    				if (!_.isEmpty( n[0]) && !isNaN(n[1]) && n[0].match(re)) {
				    				query.proximity =  n[1].trim();
				    			}else {
				    				MessageService.showErrorMessage("PROXIMITY_VAL_ERR");
				    				return false;
				    			}
			    			}
			    		}
		    		}
		    	} else {
		    		delete query.searchString;
		    		var sortOption = {};
		    		if (_.isEmpty(query.advancedInputs.sort)){
		 				sortOption["datePublished"] = "desc";
		 				query.advancedInputs.sort = sortOption;
		 				ep.advancedInputs.sort = sortOption;
					}
		    	}
		    	
		    	if(!query.systemSearchId) {
		    		delete query.systemSearchId;
		    	}
		    	
		    	if(query.entityTypes.length == 0) {
		    		delete query.entityTypes;
		    	}
		    	
				if (query.advancedInputs.multiTags.length == 0) {
					delete query.advancedInputs.multiTags;
				} 
				
				
				if (_.isEmpty(query.advancedInputs.sort)) {
					delete query.advancedInputs.sort;
				}
				
				if (_.isEmpty(query.advancedInputs.subtypes)) {
					delete query.advancedInputs.subtypes;
				}
				
				if (_.isEmpty(query.advancedInputs.documentType)) {
					delete query.advancedInputs.documentType;
				} 
				
				if (query.advancedInputs.documentName == null) {
					delete query.advancedInputs.documentName;
				}
				
				if (ep.ModifiedDtModel.datePublished.fromDate || ep.ModifiedDtModel.datePublished.toDate) {
					var date = angular.copy(ep.ModifiedDtModel);
					date.datePublished.timeframe = ep.timeFrameDate.selected.id;
					if (date.datePublished.fromDate) {
						date.datePublished.fromDate = date.datePublished.fromDate;
					} else {
						delete date.datePublished.fromDate;
					}
					if (date.datePublished.toDate) {
						date.datePublished.toDate = date.datePublished.toDate;
					} else {
						delete date.datePublished.toDate;
					}
					query.advancedInputs.dates.push(date);
				}
				
				if ( query.advancedInputs.dates.length == 0) {
					delete  query.advancedInputs.dates;
				}
				
				return query;
		  }
		  function setSearchId(portfolio,Search) {
			  var postdata = {
					  searchId : Search.id,
					  id : portfolio.id
			  };
			  
			  PortfolioService.setSearchId(postdata).then(function(result){
				  if(result.status ==200 && result.data.Status) {
					  $uibModalInstance.close(result.data.Portfolio);
				  }
			  });
		  }
		  
		  function updateSearchCriteria(portfolio) {
			  var query = processQuery(portfolio);
			  var postdata = {};
			  
			  if(savedSearch && !_.isEmpty(savedSearch)) {
				  postdata.name = savedSearch.name;
			  } else {
				  postdata.name = portfolio.name + " - Portfolio";
			  }
			  
			  var actionsArray = [];
			  if(ep.isNotify) {
				  var actionObj = {
						  "type" : "notify",
						  "requestBy" : $scope.userinfo.UserId
				  };
				  actionsArray.push(actionObj);
			  }
			  postdata.actions = actionsArray;
			  postdata.systemSearch = "false";
			  postdata.group = "portfolio";
			  postdata.savedFromPortfolio = true;
			  postdata.map = query;
			  
			  if(portfolio.searchId) {
				 postdata.id = portfolio.searchId
			  }
			  AdvSearchService.saveSearchCriteria(postdata).then(function(result) {
				  if(result.status ==200 && result.data.Status) {
					  if(portfolio.searchId) {
						  $uibModalInstance.close(portfolio);
					  } else {
						  setSearchId(portfolio,result.data.Search);
					  }
				  }
			  });
		  }
		  
		  function updatePortfolio(postdata) {
			  PortfolioService.updatePortfolioById(postdata).then(function(response){
					if (response.status == 200 && response.data.Status) {
						updateSearchCriteria(response.data.Portfolio)
					}
			  });
		  }
		  
		  function ok() {
			  if(!_.isEmpty(ep.portfolio)) {
				  var postdata = {};
				  postdata["id"] = ep.portfolio.id;
				  postdata["name"] = ep.portfolio.name;
				  postdata["createdBy"] = ep.portfolio.createdBy;
				  postdata["createdOn"] = ep.portfolio.createdOn;
				  if(ep.portfolio.searchId) {
					  postdata.searchId = ep.portfolio.searchId;
				  }
				  if(!_.isEmpty(ep.selectedTickers)) {
					  postdata["portfolioTickers"] = selectedTickersForPost;
				  }
				  updatePortfolio(postdata);
			  }
		  }
		  
		  function setPortfolioDefaults(portfolio) {
			  ep.portfolio = portfolio;
			  ep.selectedTickers = angular.copy(ep.portfolio.portfolioTickers);
			  selectedTickersForPost = angular.copy(ep.portfolio.portfolioTickers);
			  if(savedSearch && !_.isEmpty(savedSearch)) {
				  ep.docTypes.selectAllDocs = false;
				  for(var i=0; i < ep.docTypes['Documents'].length; i++) {
					  if(ep.docTypes['Documents'][i].type != "News") {
						  ep.docTypes['Documents'][i].checked = ep.docTypes.selectAllDocs;
					  }
				  }
				  var newObj = _.findWhere(ep.docTypes.Documents, {"type": "News"});
					
				  if(newObj) {
					  newObj.checked = false;
				  }
				  
				  if(!_.isEmpty(savedSearch.actions) && savedSearch.actions[0].type == "notify") {
					  ep.isNotify = true;
				  }
				  
				  if(savedSearch.map && savedSearch.map.entityTypes) {
					  if(_.contains(savedSearch.map.entityTypes,"news")) {
							var obj = _.findWhere(ep.docTypes.Documents, {"type": "News"});
							if(obj) {
								obj.checked = true;
							}
					  }
				  }
				  
				  if(savedSearch.map && savedSearch.map.advancedInputs) {
					  
					  _.each(savedSearch.map.advancedInputs, function(val,key) {
						  switch(key) {
						  case "multiTags":
							  _.each(val,function(tag){
								  ep.advancedInputs[key].push(tag);
							  });
							  break;
						  case "tickers":
							  _.each(val,function(ticker){
								  if(ticker && !ticker.group) {
									  ticker["group"] = "companies";
								  } 
								  ep.advancedInputs[key].push(ticker);
							  });
							  break;
						  case "portfolios":
							  _.each(val,function(portfolio){
								  if(portfolio && !portfolio.group) {
									  portfolio["group"] = "portfolios";
								  } 
								  if(!_.isEmpty(portfolio.portfolioTickers)) {
									  //tickersArrayToString(portfolio);
								  } else {
									  if(portfolio.displayTickers && !_.isEmpty(portfolio.displayTickers)) {
										  delete portfolio.displayTickers;
									  }
								  }
								  ep.advancedInputs["tickers"].push(portfolio);
							  });
							  break;
						  	case "subtypes":
						  		_.each(val,function(v,i){
						  			_.each(v,function(type,index){
						  				var obj = _.findWhere(ep.docTypes.Documents, {"type": type});
						  				if(obj) {
						  					obj.checked = true;
						  				}
						  				if (v.length-1 == index) {
						  					ep.onDocTypeChange(obj);
						  				}
						  			});
						  		});
						  		break;
						  case "documentType":
							  _.each(val,function(v,i){
								  var obj = _.findWhere(ep.docTypes.Documents, {"type": v});
								  if(v === "SECFile") {
									  obj = _.findWhere(ep.docTypes.Documents, {"type": "All_SEC"});
								  }
								  if(v === "CompanyDoc") {
									  obj = _.findWhere(ep.docTypes.Documents, {"type": "CompanyDoc"});
								  }
								  if(obj) {
									  obj.checked = true;
								  }
								  if (v === "SECFile" || v === "CompanyDoc" || (val.length-1 == i)) {
									  ep.onDocTypeChange(obj);
								  }
							  });
							  break;
						  case "isGlobal":
						  case "myDocuments":
						  case "sharedWithMe":
							  var obj = _.findWhere(ep.docTypes.ownerShip, {"type": key});
							  if(obj) {
								  obj.checked = val;
							  }
							  break;
						  case "annotatedDocs":
							  var obj = _.findWhere(ep.docTypes.optional, {"type": key});
							  if(obj) {
								  obj.checked = val;
							  }
							  break;
						  case "searchInAnnotation":
								var obj = _.findWhere(ep.docTypes.optional, {"type": key});
								if(obj) {
									obj.checked = val;
								}
								break;
						  case "sort":
								_.each(val,function(order,field){
									ep.advancedInputs.sort[field] = order;
								});
								break;
						  case "dates":
							  _.each(val,function(dateObj,type){
								  if (dateObj.datePublished.timeframe == "Custom") {
									  if (dateObj.datePublished.fromDate) {
										  ep.ModifiedDtModel.datePublished.fromDate = dateObj.datePublished.fromDate;
									  }
									  if (dateObj.datePublished.toDate) {
										  ep.ModifiedDtModel.datePublished.toDate = dateObj.datePublished.toDate;
									  }
								  } else {
									  if (dateObj.datePublished.fromDate) {
										  ep.ModifiedDtModel.datePublished.fromDate = dateObj.datePublished.fromDate;
									  }
								  }
							  });
							  break;
						  }
					  });
				  }
			  }
		  }
		  
		  if(portfolio.PortfolioInfo) {
			  setPortfolioDefaults(portfolio.PortfolioInfo);
		  }
	}
})();