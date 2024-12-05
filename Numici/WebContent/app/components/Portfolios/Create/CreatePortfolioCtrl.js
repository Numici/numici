;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('CreatePortfolioCtrl',CreatePortfolioCtrl);
	
	CreatePortfolioCtrl.$inject = ['$scope', '$uibModalInstance','PortfolioService','$confirm',"_","SecFilingService","AdvSearchService","appData","MessageService"];
	
	function CreatePortfolioCtrl($scope, $uibModalInstance,PortfolioService,$confirm,_,SecFilingService,AdvSearchService,appData,MessageService) {
		  var vm = this;
		  var appdata = appData.getAppData();
		  
		  var selectedTickersForPost = [];
		  vm.errMsg = "";
		  vm.pfTickersListHeaders = PortfolioService.pfTickersListHeaders;
		  vm.companiesList = [];
		  vm.selectedTickers = [];
		  vm.portfolioName = '';
		  vm.isNotify = true;
		  vm.query = angular.copy(AdvSearchService.SearchQuery);
		  vm.query.userId = appdata.UserId;
		  vm.query.enterprises = [appdata.Organization];
		  vm.advancedInputs = vm.query.advancedInputs;
		  vm.ModifiedDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
		  vm.docTypes = angular.copy(AdvSearchService.docTypes);
		  
		  vm.onChangeNotify = onChangeNotify;
		  vm.processTickerOnSelect = processTickerOnSelect;
		  vm.removeTickerFromSelection = removeTickerFromSelection;
		  vm.refreshTickers = refreshTickers;
		  vm.ok = ok; 
		  vm.cancel = cancel;
		  
		  function onChangeNotify () {
			  vm.isNotify = !vm.isNotify;
		  }
		  		  
		  vm.DocTypeWrap = {
				"isOpen" : false,
				"toggle" : function() {
					var isValid = true;
					if(vm.DocTypeWrap.isOpen) {
						isValid = this.validateDocTypeSelection();
					}
					if(isValid) {
						vm.DocTypeWrap.isOpen = !vm.DocTypeWrap.isOpen;
					}
					
				},
				"close" : function() {
					
					var isValid = true;
					if(vm.DocTypeWrap.isOpen) {
						isValid = this.validateDocTypeSelection();
					}
					if(isValid) {
						vm.DocTypeWrap.isOpen = false;
					}
				},
				"validateDocTypeSelection" : function() {
					var allDocs = vm.docTypes['Documents'];
					var DocTypeSelectons = _.where(allDocs, {"checked": true});
					
					if(DocTypeSelectons.length > 0) {
						return true;
					} else {
						return false;
					}
					
				}
			}
		  
		  vm.SlctdDocTypes = {
					getSelectedDocTypes : function () {
						var docTypes = [],displayDocTypes = [],subTypes = {},DocTypes=[];
						var allDocs = vm.docTypes['Documents'];
						var ownerShip = vm.docTypes['ownerShip'];
						var optional = vm.docTypes['optional'];
						var DocTypeSelectons = _.where(_.union(allDocs,ownerShip,optional), {"checked": true});
						
						var ownerShipSelection =  _.where(ownerShip, {"checked": true});
						
						vm.advancedInputs.isGlobal = false;
						vm.advancedInputs.sharedWithMe = false;
						vm.advancedInputs.myDocuments = false;
						vm.advancedInputs.annotatedDocs = false;
						vm.advancedInputs.searchInAnnotation = false;
						vm.query.entityTypes = [];
						
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
							
							if(vm.docTypes.selectAllDocs) {
								displayDocTypes.push("ALL");
							} else if (SecArray.length > 0){
								displayDocTypes.push(SecArray[0].lable);
							} 
							if(!vm.docTypes.selectAllDocs && CompanyDocArray.length > 0) {
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
									if(!_.contains(vm.query.entityTypes,"document")) {
										vm.query.entityTypes.push("document");
									}
									if(SecArray.length == 0 && !vm.docTypes.selectAllDocs) {
										displayDocTypes.push(obj.lable);
									}
									break;
								case "Document":
									
									if(!vm.docTypes.selectAllDocs) {
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
										if(!_.contains(vm.query.entityTypes,"document")) {
											vm.query.entityTypes.push("document");
										}
									} else if(!_.contains(vm.query.entityTypes,"news")) {
										vm.query.entityTypes.push("news");
									} 
									break;
								case "ownerShip":
									vm.advancedInputs[obj.type] = true;
									if(!_.contains(vm.query.entityTypes,"document")) {
										vm.query.entityTypes.push("document");
									}
									if(ownerShip.length != ownerShipSelection.length ) {
										displayDocTypes.push(obj.lable);
									}
									break;
								case "optional":
									if(obj.type === "annotatedDocs" && obj.checked) { 
										vm.advancedInputs.annotatedDocs = true;
									}
									if(obj.type === "searchInAnnotation" && obj.checked) { 
										vm.advancedInputs.searchInAnnotation = true;
									}
									if(!_.contains(vm.query.entityTypes,"document")) {
										vm.query.entityTypes.push("document");
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
						
						vm.advancedInputs.documentType = DocTypes;
						vm.advancedInputs.subtypes = subTypes;
						return displayDocTypes.join(",");
					}
				}
				
				vm.onDocTypeChange = function(doc){
					
					var allDocs = vm.docTypes['Documents'];
					
					if (doc == "All") {
						for(var i=0; i < allDocs.length; i++) {
							allDocs[i].checked = vm.docTypes.selectAllDocs;
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
							 var ownerShip = vm.docTypes['ownerShip'];
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
							 vm.docTypes.selectAllDocs = true;
						 } else {
							 vm.docTypes.selectAllDocs = false;
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
			  vm.selectedTickers = _.reject(vm.selectedTickers,{cik:selectedTicker.cik});
			  selectedTickersForPost = _.reject(selectedTickersForPost,{cik:selectedTicker.cik});
		  }
		  
		  function refreshTickers (searchKey) {
			   if(!_.isEmpty(searchKey)) {
				   SecFilingService.getCompaniesList({"searchTxt":searchKey}).then(function(resp){
				    	if(resp.status == 200 && resp.data.Status) {
				    		vm.companiesList = resp.data.Company;
				    	}
				    });
			   }
		  }
		  
		  function cancel() {
		    $uibModalInstance.dismiss('cancel');
		  }
		  
		  function processQuery(portfolio) {
			  var query = angular.copy(vm.query);
			  query["userId"] = appdata.UserId;
			  query.advancedInputs["portfolios"] = [portfolio];
			  vm.SlctdDocTypes.getSelectedDocTypes();
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
		 				vm.advancedInputs.sort = sortOption;
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
								
				if (query.advancedInputs.tickers.length == 0) {
					delete query.advancedInputs.tickers;
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
				
				if (vm.ModifiedDtModel.datePublished.fromDate || vm.ModifiedDtModel.datePublished.toDate) {
					var date = angular.copy(vm.ModifiedDtModel);
					date.datePublished.timeframe = vm.timeFrameDate.selected.id;
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
		  
		  function setSearchId(portfolio,savedSearch) {
			  var postdata = {
					  searchId : savedSearch.id,
					  id : portfolio.id
			  };
			  
			  PortfolioService.setSearchId(postdata).then(function(result){
				  if(result.status ==200 && result.data.Status) {
					  $uibModalInstance.close(result.data.Portfolio);
				  }
			  });
		  }
		  
		  function saveSearch (postdata,portfolio) {
			  AdvSearchService.saveSearchCriteria(postdata).then(function(result) {
				  if(result.status ==200 && result.data.Status) {
					  setSearchId(portfolio,result.data.Search);
				  }
			  });
		  }
			
		  function saveSearchCriteria(portfolio) {
			  var query = processQuery(portfolio);
			  var postdata = {};
			  postdata.name = vm.portfolioName;
			  postdata.systemSearch = "false";
			  postdata.group = "portfolio";
			  postdata.savedFromPortfolio = true;
			  postdata.map = query;
			  var actionsArray = [];
			  if(vm.isNotify) {
				  var actionObj = {
						  "type" : "notify",
						  "requestBy" : $scope.userinfo.UserId
				  };
				  actionsArray.push(actionObj);
			  }
			  postdata.actions = actionsArray;
			  saveSearch(postdata,portfolio);
		  }
		  
		  function creatPortfolio(postdata) {
			  PortfolioService.creatPortfolio(postdata).then(function(response){
				  if (response.status == 200 && response.data.Status) {
					  if(!_.isEmpty(response.data.Message) && (response.data.Message == "Another Portfolio with the same name already exists.")) {
						  vm.errMsg = response.data.Message;
					  } else {
						  saveSearchCriteria(response.data.Portfolio);
					  }
				  }
			  });
		  }
		  
		  function ok() {
			  if(!_.isEmpty(vm.portfolioName)) {
				  var postdata = {};
					postdata["name"] = vm.portfolioName;
					if(!_.isEmpty(vm.selectedTickers)) {
						postdata["portfolioTickers"] = selectedTickersForPost;
					}
					creatPortfolio(postdata);
					/*var data = [{
						"portfolioname" : vm.portfolioName,
					}];
					
					DocFactory.isDocPresentList(data).then(function(response){
						if(response.status == 200 && response.data.Status) {
							var isExist = _.findWhere(response.data.Notes,{"isExist":true});
							if(isExist) {
								$confirm({text: 'The portfolio "'+vm.portfolioName+'" already has. Do you want to replace the portfolio?'})
						        .then(function() {
						        	postdata.id = response.data.Notes[0].existingDocId;
									postdata.overwrite = true;
									creatPortfolio(postdata);
						        });
								
							} else {
								creatPortfolio(postdata);
							}
						}
					});*/
					
			  }
		  }
		  
		  
	}
})();