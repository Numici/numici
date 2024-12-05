;(function(){
	'use strict';
	
	angular.module('vdvcApp').directive('searchDocViewer', function() {
		  return {
		    restrict: "E",
		    templateUrl:'app/components/AdvancedSearch/doc.html',
		    controller:'DocViewerController'
		  }
	});
	angular.module('vdvcApp').directive('searchNewsDocViewer', function() {
		  return {
		    restrict: "E",
		    templateUrl : 'app/components/NewsFeed/NewsFeed.html',
        	controller : 'NewsFeedController'
		  }
	});
	angular.module('vdvcApp').directive('searchOnedriveDocViewer', function() {
		  return {
		    restrict: "E",
		    templateUrl : 'app/components/OneDrive/DocViewer/OneDriveDocViewer.html',
       	 	controller : 'OneDriveDocViewerController',
       	 	controllerAs: 'ODDV'
		  }
	});
	
	angular.module("vdvcApp").controller("AdvSearchController",AdvSearchController);
	
	AdvSearchController.$inject = ['$rootScope','$scope','$sanitize','commonService','AdvSearchService','TagService','SecFilingService','MessageService','_','$state',
	                  			 '$stateParams','$document','$uibModal', '$timeout','$confirm','defautlDateFormat','DocFactory','$sce','localStorageService',
	                			 'appData','HelpDescService','orderByFilter','$deviceInfo','WarningPopupService','$compile','TaskSpaceService','pendingRequests',
	                			 'SlackSearchService'];
	
	function AdvSearchController($rootScope,$scope,$sanitize,commonService,AdvSearchService,TagService,SecFilingService,MessageService,_,$state,
			 $stateParams,$document,$uibModal,$timeout,$confirm,defautlDateFormat,DocFactory,$sce,localStorageService,
			 appData,HelpDescService,orderByFilter,$deviceInfo,WarningPopupService,$compile,TaskSpaceService,pendingRequests,
			 SlackSearchService){
		
		var appdata = appData.getAppData();
		
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		
		var searchCriteriaTimer,
			searchAlertTimer;
		var defaultState = {
				"name": "docs",
				"params": {folderId :appdata.rootFolderId}
		};
		var PreViousState = {
				"name": "docs",
				"params": {}
		};
		
		var restrictedUrls = ["search.doc","search","search.news"];
		
		function checkIsGlobalAllowed() {
			if(appdata && appdata.UserSettings && appdata.UserSettings.contentAccess_FinancialAnalyst === "No") {
				var ownerShipDoctypes = $scope.docTypes["ownerShip"];
				_.findWhere(ownerShipDoctypes,{type : "isGlobal"}).checked = false;
				_.findWhere(ownerShipDoctypes,{type : "isGlobal"}).disable = true;
			}
		}
		
		function setSearchDefaults() {
			$scope.query = angular.copy(AdvSearchService.SearchQuery);
			$scope.query.userId = $scope.userinfo.UserId;
			$scope.query.enterprises = [$scope.userinfo.Organization];
			
			$scope.advancedInputs = $scope.query.advancedInputs;
			$scope.ModifiedDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
			
			$scope.docTypes = angular.copy(AdvSearchService.docTypes);
			checkIsGlobalAllowed();
		}
		
		$scope.deviceInfo = $deviceInfo;
		$scope.showOnlySearchFilters = false;
		$scope.tsInfoMap = {};
		$scope.toggleSrcBar = false;
		$scope.isFromNotification = false;
		$scope.defaultDateFormat = defautlDateFormat;
		
		$scope.resultDateFormat = "YYYY-MM-DD HH:mm:ss";
		$scope.displayFormat = "YYYY-MM-DD";
		
		$scope.savedSearchList = [];
		$scope.systemsavedSearchList = [];
		
		$scope.searchResults;
		$scope.resultCount = {};
		$scope.snippets;
		$scope.uiSnippets;
		$scope.selectedSnippet = -1;
		$scope.tickersList = [];
		$scope.isolateDoc = false;
		
		$scope.custTimeFrame = false;
		$scope.custStartDateErrMsg = "";
		$scope.custEndDateErrMsg = "";
		$scope.today = function() {
			 $scope.dt = new Date();
		};
		$scope.today();
		
		$scope.dtObj = {
		    	"start" : null,
		    	"end" : null,
		    	"maxDate":	new Date()
		};
		
		var previousDTObj = angular.copy($scope.dtObj);
		$scope.tags =[];
		$scope.query;
		$scope.toggleSideBarChecked = false;
		
		$scope.allGroups = [];
		$scope.isKeywordDisabled = false;
		var tabOrientationWarningData = {"message" : "Portrait mode is not supported for search.","enableHeader" : false,"enableFooter" : false};
		var mobileOrientationWarningData = {"message" : "Landscape mode is not supported for search.","enableHeader" : false,"enableFooter" : false};
		$scope.$on('orientationChange', function (event,orientation) {
			if($deviceInfo.isTablet ) {
				if(orientation == "portrait") {
					WarningPopupService.open(tabOrientationWarningData);
				} else {
					WarningPopupService.close();
				}
			} else if($deviceInfo.isMobile) {
				if(orientation == "landscape") {
					WarningPopupService.open(mobileOrientationWarningData);
				} else {
					WarningPopupService.close();
				}
			}
		});
		
		$scope.$on('objectLoaded',function(event,msg){
			$scope.selectedId = msg.objectId;
		});
		
		$scope.$on("$destroy", function (event)  {
			$timeout.cancel(snippetWatchTimer); 
			commonService.DocSnippets = null;
			commonService.searchKey = null;
			commonService.selectedSnippet = null;
			removeSearchCriteria();
		});
		
		$scope.enableSaveSearch = function(criteriaName) {
			if(_.isEmpty(criteriaName)){
				return true;
			}
			return false;
		};
		
		$scope.showHelp = function(key) {
			HelpDescService.showHelp(key);
		};
		
		
		$scope.toggleSearchBar = function() {
			$scope.toggleSrcBar = !$scope.toggleSrcBar;
		};
		
		$scope.toggleSideBarColor = function() {
			var toggleStripColor = {"background":appdata.toggleStripClrCde};
			return toggleStripColor;
       };
       
		$scope.toggleSideBar = function() {
			//commonService.broadcast('toggleSideBar',$scope.toggleSideBarChecked);
			$scope.toggleSideBarChecked = !$scope.toggleSideBarChecked;
			$scope.$broadcast('resizeDoc', true);
       };
       
		$scope.getThirdPaneClass = function() {
			var thisClass = "";
			if($scope.snippets && $scope.snippets.length > 0 && $scope.toggleSideBarChecked) {
				thisClass = "col-xs-10";
			} else if(($scope.snippets ==null || $scope.snippets.length == 0) && !$scope.toggleSideBarChecked) {
				thisClass = "col-xs-9";
			} else if((($scope.snippets == null || $scope.snippets.length == 0) && $scope.toggleSideBarChecked)) {
				thisClass = "col-xs-12";
			} else if($scope.snippets && $scope.snippets.length > 0 && !$scope.toggleSideBarChecked) {
				thisClass = "col-xs-7";
			}
			
			return thisClass;
       };
       
		setSearchDefaults();
		
		$scope.deleteSavedSearch = function(savedSearch,$event) {
			if($event) {
				$event.preventDefault();
				$event.stopPropagation();
			}
			var id = savedSearch.id;
			$confirm({text: 'Do you want to delete saved search "'+savedSearch.name+'" ?'})
	        .then(function() {
	        	AdvSearchService.deleteSavedSeach(id).then(function(resp){
	        		if(resp.status == 200 && resp.data.Status) {
	        			var index = -1;
	        			var list;
	        			if(savedSearch.system) {
	        				index = _.findIndex($scope.systemsavedSearchList, {"id" : id});
	        				list = $scope.systemsavedSearchList;
	        			} else {
	        				index = _.findIndex($scope.savedSearchList, {"id" : id});
	        				list = $scope.savedSearchList;
	        			}
	        			
						if(index != -1 && list) {
							list.splice(index, 1);
							if($scope.srchObj.selected.id == id) {
								$scope.clearSearch();
								$scope.srchObj.selected = {"name" : "None"};
							}
							if($scope.srchObj.systemSearchSlctd.id == id) {
								$scope.clearSearch();
								$scope.srchObj.systemSearchSlctd = {"name" : "None"};
							}
						} 
	        		}
	        	});
	        });
		};
		
		$scope.preventClickEvent = function(event) {
			var form = this.$form;
			$('.editable-buttons [type=button]').off('click').on('click',function(event){
				event.preventDefault();
				event.stopPropagation();
				form.$cancel();
			});
		};
		
		$scope.unBindClickEvent = function() {
			$('.vdvc-srch-opt,.editable-buttons [type=button]').off('click');
			$('.vdvc-srch-opt').off(' keypress');
		};
		
		$scope.updateSearchName = function(newName,savedSearch) {
			
			return AdvSearchService.isSearchPresentByName({"name" : newName}).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					if(resp.data.Search) {
						//MessageService.showErrorMessage("ADV_SEARCH_SAVE_ERR",[newName]);
						return "Name is already present";
					} else {
						return AdvSearchService.renameSavedSearch(savedSearch.id,{"newName":newName}).then(function(saveresp) {
							if(saveresp.status == 200 && saveresp.data.Status) {
								return true;
							}else {
								return saveresp.data.Message;
							}
						});
					}	
				}
			});
			
		};
		
		$scope.editSavedSearch = function(savedSearch,$event) {
			if($event) {
				$event.preventDefault();
				$event.stopPropagation();
				
			}
			//textBtnForm.$show();
			if(savedSearch) {
				openSaveSearchModal("Edit Search",savedSearch);
				/*var modalInstance = $uibModal.open({
					 animation: $scope.animationsEnabled,
				      templateUrl: 'app/components/AdvancedSearch/EditSavedSearch/editSavedSearchModal.html',
				      controller: 'EditSavedSearchController',
				      appendTo : $('.vdvc-3ps-wrap'),
				      controllerAs: 'vm',
				      backdrop: 'static',
				      resolve: {
				    	  savedSearch : savedSearch
				      }
				 });
				 modalInstance.result.then(function (modifiedSearch) {
					if(modifiedSearch.system) {
						getSystemSavedSearches();
					} else {
						getSavedSearchCriteria();
					}
				 }, function () {
				      
				 });*/
			} 
		};
		
		$scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
			
			if(!_.contains(restrictedUrls,from.name)) {
				PreViousState = {
						"name": (from.name && !_.isEmpty(from.name)) ? from.name : "docs",
						"params": fromParams
				};
			}
		});
					
		$scope.isObjselected = function(objId,selectedObjId) {
			return objId == selectedObjId;
		};
		
		
		var saveSearch = function(postdata, cb) {
			AdvSearchService.saveSearchCriteria(postdata).then(function(result) {
				if(result.status ==200 && result.data.Status) {
					MessageService.showSuccessMessage("ADV_SEARCH_SAVE",[postdata.name]);
					if(typeof cb == "function") {
						cb(result);
					}
				}
			});
		};
		
		function prepareNotifyActionArray(search) {
			var actionsArray = [];
			var notifyAction;
			var addToTaskspaceAction;
			if(search.selected && search.selected.id && !_.isEmpty(search.selected.actions)) {
				notifyAction = _.findWhere(search.selected.actions,{"type":"notify"});
				addToTaskspaceAction = _.findWhere(search.selected.actions,{"type":"addToTaskspace"});
			} else if(search && !_.isEmpty(search.actions)) {
				notifyAction = _.findWhere(search.actions,{"type":"notify"});
				addToTaskspaceAction = _.findWhere(search.actions,{"type":"addToTaskspace"});
			}
			if(search.isNotify || notifyAction) {
				var actionObj = {
						"type" : "notify",
                        "requestBy" : $scope.userinfo.UserId
                };
				actionsArray.push(actionObj);
			}
			if(addToTaskspaceAction) {
				actionsArray.push(addToTaskspaceAction);
			}
			return actionsArray;
		}
		
		function openSaveSearchModal(title,savedSearch) {
			var modalInstance = $uibModal.open({
				 animation: $scope.animationsEnabled,
			     templateUrl: 'app/components/AdvancedSearch/SaveSearch/SaveSearchModal.html',
			     controller: 'SaveSearchController',
			     appendTo : $('.vdvc-3ps-wrap'),
			     controllerAs: 'saveSrchObj',
			     backdrop: 'static',
			     resolve: {
			    	 modalTitle : {"title":title},
			    	 savedSearch : savedSearch,
			    	 advancedInputs : $scope.advancedInputs,
			    	 query : processQuery($scope.query,true)
			     }
			 });
			 modalInstance.result.then(function (resultSearch) {
				 var data = resultSearch;
				 if(data) {
					 if(title == "Save Search" || title == "Save Search As") {
						 if(data.system) {
							 $scope.systemsavedSearchList.push(data);
							 $scope.srchObj["selected"] = {"name" : "None"};
							 $scope.srchObj.systemSearchSlctd =data;
						 } else {
							 $scope.savedSearchList.push(data);
							 $scope.srchObj["systemSearchSlctd"] = {"name" : "None"};
							 $scope.srchObj.selected = data;
						 }
					 }
					 if(title == "Edit Search") {
						 if(data.system) {
							 getSystemSavedSearches();
						 } else {
							 getSavedSearchCriteria();
						 }
					 }
					 
				 }
				 	
			 });
		}
		
		$scope.srchObj = {
			"selected":{"name" : "None"},
			"isNotify" : false,
			"systemSearchName" : '',
			"systemSearchSlctd" : {"name" : "None"},
			"criteriaName" : "",
			"systemSearch" : appdata.isSiteAdmin ? true : false,
			"group" : '',
			"isOpen" : false,
			"isDisabled" : function() {
				return (!_.isEmpty($scope.advancedInputs.documentType) || !_.isEmpty($scope.advancedInputs.subtypes)) ? false : true;
			},
			"OnchangeNotify" : function() {
				this.isNotify = !this.isNotify;
			},
			"reverseOrderFilterFn" : function(group) {
				
				return _.sortBy(group, 'name');
			},
			"close" : function($event) {
				if($event) {
					$event.stopPropagation();
				}
				this.criteriaName = "";
				this.isOpen = false;
			},
			"getGroups" : function() {
				AdvSearchService.getAllSearchGroups().then(function(resp) {
					
					if(resp.status == 200 && resp.data.Status) {
						$scope.allGroups = resp.data.Groups;
					}
				});
			},
			"toggleMenu" : function($event) {
				
				this.group = '';
				this.systemSearch = appdata.isSiteAdmin ? true : false;
				
				if(this.selected.id || (appdata.isSiteAdmin && this.systemSearchSlctd.id)) {
					this.saveCriteria();
				} else {
					openSaveSearchModal("Save Search",null);
				}
				
			},
			
			"saveCriteria" : function($event) {
				var current = this;
				if($event) {
					$event.stopPropagation();
				}
				var srch;
				if(current.systemSearchSlctd.id) {
	        		srch = current.systemSearchSlctd;
				}
	        	if(current.selected.id ) {
					srch = current.selected;
				}
				
				if(current.selected.id || (appdata.isSiteAdmin && current.systemSearchSlctd.id)) {
					$confirm({text: 'Do You want to overwrite "'+srch.name+'" ?'})
			        .then(function() {
			        	if(srch) {
							var postdata = {};
			        		var query = processQuery($scope.query,true);
			        		postdata.id = srch.id;
							postdata.name = srch.name;
							//postdata.isNotify = srch.notify;
							postdata.actions = prepareNotifyActionArray(srch);
							postdata.systemSearch = srch.system.toString();
							postdata.group = srch.group;
							postdata.systemSearchId = srch.systemSearchId;
							postdata.map = query;
			        	}
						saveSearch(postdata,function(result) {
							var data = result.data.Search;
							if(data) {
								if(data.system) {
									var index = _.findIndex($scope.systemsavedSearchList, {"id" : data.id});
									if(index != -1) {
										$scope.systemsavedSearchList[index] = data;
										current.systemSearchSlctd = data;
									} 
								} else {
									var index = _.findIndex($scope.savedSearchList, {"id" : data.id});
									if(index != -1) {
										$scope.savedSearchList[index] = data;
										current.selected = data;
									} 
								}
							}
						});
			        });
				}
			}
		};
		
		function setNotifyAction(search) {
			var isNotify = false;
			if(!_.isEmpty(search.actions)) {
				var notifyAction = _.findWhere(search.actions,{"type":"notify"});
				if(notifyAction) {
					isNotify =  true;
				}
			}
			return isNotify;
		}
		
		$scope.srchSaveAsObj = {
				"criteriaName" : '',
				"selected ":{"group" : ''},
				"systemSearch" : appdata.isSiteAdmin ? true : false,
				"isOpen" : false,
				"isNotify" : false,
				"isDisabled" : function() {
					return (($scope.srchObj.selected.id || (appdata.isSiteAdmin && $scope.srchObj.systemSearchSlctd.id)) && (!_.isEmpty($scope.advancedInputs.documentType) || !_.isEmpty($scope.advancedInputs.subtypes))) ? false : true;
				},
				"OnchangeNotify" : function() {
					this.isNotify = !this.isNotify;
				},
				"setCriteriaInfo" : function() {
					var srch;
					if($scope.srchObj.selected.id) {
						srch = $scope.srchObj.selected;
					}
					
					if(appdata.isSiteAdmin && $scope.srchObj.systemSearchSlctd.id) {
						srch = $scope.srchObj.systemSearchSlctd;
					}
					if(srch) {
						this.criteriaName = srch.name;
						this.group = [srch.group];
						this.systemSearch = srch.system;
						//this.isNotify =  srch.notify;
						this.isNotify =  setNotifyAction(srch);
					}
				},
				"ClearCriteriaInfo" : function() {
					
					if($scope.srchObj.selected.id) {
						return $scope.srchObj.selected.name;
					}
					
					if(appdata.isSiteAdmin && $scope.srchObj.systemSearchSlctd.id) {
						return $scope.srchObj.systemSearchSlctd.name;
					}
					
				},
				"close" : function($event) {
					if($event) {
						$event.stopPropagation();
					}
					this.isOpen = false;
				},
				"toggleMenu" : function($event) {
					this.setCriteriaInfo();
					var srch;
					if($scope.srchObj.selected.id) {
						srch = $scope.srchObj.selected;
					}
					
					if(appdata.isSiteAdmin && $scope.srchObj.systemSearchSlctd.id) {
						srch = $scope.srchObj.systemSearchSlctd;
					}
					if(srch) {
						openSaveSearchModal("Save Search As",srch);
					}
					
				},
				"saveCriteria" : function($event) {
					var current = this;
					if($event) {
						$event.stopPropagation();
					}
					
					var mode;
					var postdata = {};
					var query = processQuery($scope.query,true);
					postdata.name = current.criteriaName;
					//postdata.isNotify = current.isNotify;
					postdata.actions = prepareNotifyActionArray(current);
					postdata.group = !_.isEmpty(current.group) ? current.group[0] : "";
					postdata.systemSearch = current.systemSearch.toString();
					postdata.map = query;
					
					if($scope.srchObj.selected.id) {
						mode = "user";
						if($scope.srchObj.selected.systemSearchId) {
							postdata.systemSearchId = $scope.srchObj.selected.systemSearchId;
						}
					}
					
					if(appdata.isSiteAdmin && $scope.srchObj.systemSearchSlctd.id) {
						mode = "system";
					}
					
					AdvSearchService.isSearchPresentByName({"name" : postdata.name}).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							if(resp.data.Search) {
								MessageService.showErrorMessage("ADV_SEARCH_SAVE_ERR",[postdata.name]);
							} else {
								
								saveSearch(postdata,function(result) {
									var data = result.data.Search;
									if(data) {
										
										if(data.system) {
											$scope.systemsavedSearchList.push(data);
											$scope.srchObj["selected"] = {"name" : "None"};
											$scope.srchObj.systemSearchSlctd =data;
										} else {
											$scope.savedSearchList.push(data);
											$scope.srchObj["systemSearchSlctd"] = {"name" : "None"};
											$scope.srchObj.selected = data;
										}
										
										current.close();
									}
								});
							}	
						}
					});
				}
		};
		
		$scope.tickerFocused = function(){
			$("#TICKERS").addClass("ticker-expand");
		};
		
		$scope.tickerDeFocused = function(){
			$("#TICKERS").removeClass("ticker-expand");
		};
		
		var setAdvancedSearchInputs = function(advInputs,cb){
			$scope.docTypes.selectAllDocs = false;
			if(_.isEmpty(advInputs.documentType) && _.isEmpty(advInputs.subtypes)) {
				$scope.docTypes.selectAllDocs = true;
			}
			for(var i=0; i < $scope.docTypes['Documents'].length; i++) {
				if($scope.docTypes['Documents'][i].type != "News") {
					$scope.docTypes['Documents'][i].checked = $scope.docTypes.selectAllDocs;
				}
			}
			if(!advInputs.dates || _.isEmpty(advInputs.dates)) {
				var obj = _.findWhere($scope.timeframes, {"id": "Any"});
				$scope.timeFrameDate.selected = angular.copy(obj);
			}
			_.each(advInputs, function(val,key) {
				switch(key) {
				case "multiTags":
					_.each(val,function(tag){
						$scope.advancedInputs[key].push(tag);
					});
					break;
				case "tickers":
					_.each(val,function(ticker){
						if(ticker && !ticker.group) {
							ticker["group"] = "companies";
						} 
						$scope.advancedInputs[key].push(ticker);
					});
					
					break;
				case "portfolios":
					_.each(val,function(portfolio){
						if(portfolio && !portfolio.group) {
							portfolio["group"] = "portfolios";
						} 
						if(!_.isEmpty(portfolio.portfolioTickers)) {
							tickersArrayToString(portfolio);
						} else {
							if(portfolio.displayTickers && !_.isEmpty(portfolio.displayTickers)) {
								delete portfolio.displayTickers;
							}
						}
						$scope.advancedInputs["tickers"].push(portfolio);
					});
					break;
				case "subtypes":
					_.each(val,function(v,key){
						var selectedGroupList = [];
						if(key === "CompanyDoc") {
							selectedGroupList = _.where($scope.docTypes.Documents, {"subGroup": key});
						} else {
							selectedGroupList = _.where($scope.docTypes.Documents, {"group": key});
						}
						if(key !== "SECCompareFile") {
							_.each(v,function(type,index){
								var obj = _.findWhere(selectedGroupList, {"type": type});
								if(obj) {
									obj.checked = true;
								}
								if (v.length-1 == index) {
									$scope.onDocTypeChange(obj);
								}
							});
						}
					});
					break;
				case "documentType":
					_.each(val,function(v,i){
						var obj = _.findWhere($scope.docTypes.Documents, {"type": v});
						if(v === "SECFile") {
							obj = _.findWhere($scope.docTypes.Documents, {"type": "All_SEC"});
						}
						if(v === "CompanyDoc") {
							obj = _.findWhere($scope.docTypes.Documents, {"type": "CompanyDoc"});
						}
						if(obj) {
							obj.checked = true;
						}
						if (v === "SECFile" || v === "CompanyDoc" || (val.length-1 == i)) {
							$scope.onDocTypeChange(obj);
						}
					});
					
					break;
				case "isGlobal":
				case "myDocuments":
				case "sharedWithMe":
					var obj = _.findWhere($scope.docTypes.ownerShip, {"type": key});
					if(obj) {
						obj.checked = val;
					}
					break;
				case "annotatedDocs":
					//$scope.docTypes.optional[key] = val;
					var obj = _.findWhere($scope.docTypes.optional, {"type": key});
					if(obj) {
						obj.checked = val;
					}
					break;
				case "searchInAnnotation":
					//$scope.docTypes.optional[key] = val;
					var obj = _.findWhere($scope.docTypes.optional, {"type": key});
					if(obj) {
						obj.checked = val;
					}
					break;
				case "sort":
					_.each(val,function(order,field){
						$scope.advancedInputs.sort[field] = order;
					});
					break;
				case "dates":
				_.each(val,function(dateObj,type){
					
					var obj = _.findWhere($scope.timeframes, {"id": dateObj.datePublished.timeframe});
					$scope.timeFrameDate.selected = angular.copy(obj);
					
					if (dateObj.datePublished.timeframe == "Custom") {
						
						if (dateObj.datePublished.fromDate) {
							$scope.ModifiedDtModel.datePublished.fromDate = dateObj.datePublished.fromDate;
							$scope.dtObj.start = moment(dateObj.datePublished.fromDate,$scope.defaultDateFormat).toDate();
						}
						
						if (dateObj.datePublished.toDate) {
							$scope.ModifiedDtModel.datePublished.toDate = dateObj.datePublished.toDate;
							$scope.dtObj.end =  moment(dateObj.datePublished.toDate,$scope.defaultDateFormat).toDate();
						}
						
						var from = moment($scope.dtObj.start).isValid() ?  moment($scope.dtObj.start).format($scope.displayFormat) : " ";
				    	var to = moment($scope.dtObj.end).isValid() ? moment($scope.dtObj.end).format($scope.displayFormat) : " ";
				    	
				    	$scope.timeFrameDate.selected.timeAgo = from+" :: "+to;
					} else {
						if (dateObj.datePublished.fromDate) {
							$scope.ModifiedDtModel.datePublished.fromDate = dateObj.datePublished.fromDate;
							$scope.dtObj.start = moment(dateObj.datePublished.fromDate,$scope.defaultDateFormat).toDate();
						}
					}
					
				});
					
					break;
				}
			});
			if(typeof cb === "function") {
				cb();
			}
		};
		
		var getSavedSearchCriteria = function() {
			AdvSearchService.getSavedSercheCriteria().then(function(result){
				if(result.status== 200 && result.data.Status) {
					var defaultCriteria = [{"name" : "None"}];
					$scope.savedSearchList = _.union(defaultCriteria, result.data.Search);
										
					if(!commonService.searchNotification) {
				    	searchCriteriaTimer = $timeout(function () {
				    		var data = getSerachCriteria("searchCriteria"); 
				    		if(data) {
				    			var selectedSearchObj = _.findWhere($scope.savedSearchList,{id:data.id});
					    		if(selectedSearchObj) {
					    			$scope.srchObj.selected = selectedSearchObj;
					    			$scope.onSavedSearchChange($scope.srchObj.selected);
					    		}
				    		}
				    		$timeout.cancel(searchCriteriaTimer);
				        });
					}
					if(commonService.searchNotification) {
						searchAlertTimer = $timeout(function () {
							var match = commonService.searchNotification;
			    			if(match.SavedSearchId) {
			    				var selectedSearchObj = _.findWhere($scope.savedSearchList,{id:match.SavedSearchId});
					    		if(selectedSearchObj) {
					    			$scope.srchObj.selected = selectedSearchObj;
					    			$scope.onSavedSearchChange($scope.srchObj.selected);
					    			$scope.isFromNotification = true;
					    		}
				    		}
			    			commonService.searchNotification = null;
			    			$timeout.cancel(searchAlertTimer);
						});
					}
				}
			});
		};
		
		
		
		var getSystemSavedSearches = function() {
			AdvSearchService.getAllSystemSerches().then(function(result){
				if(result.status== 200 && result.data.Status) {
					var defaultCriteria = [{"name" : "None"}];
					$scope.systemsavedSearchList = _.union(defaultCriteria, result.data.Search);
					
			    	/*searchCriteriaTimer = $timeout(function () {
			    		
			    		var data = getSerachCriteria("searchCriteria"); 
			    		if(data) {
			    			var selectedSearchObj = _.findWhere($scope.savedSearchList,{id:data.id})
				    		if(selectedSearchObj) {
				    			$scope.srchObj.selected = selectedSearchObj;
				    			$scope.onSavedSearchChange($scope.srchObj.selected);
				    		}
			    		}
			    		
			    		$timeout.cancel(searchCriteriaTimer);
			        });*/
				}
			});
		};
		
		$scope.onSavedSearchChange = function(savedSearch,mode) {
			$scope.isFromNotification = false;
			switch(mode) {
			case "user":
				$scope.srchObj["systemSearchSlctd"] = {"name" : "None"};
				break;
			case "system":
				$scope.srchObj["selected"] = {"name" : "None"};
				break;
			}
			
			$scope.query["systemSearchId"] = savedSearch.systemSearchId;
			
			$scope.srchObj.systemSearchName = '';
			
			if((savedSearch.system && !appdata.isSiteAdmin) || savedSearch.systemSearchId) {
				$scope.isKeywordDisabled = true;
				$scope.query["systemSearchId"] = savedSearch.id;
				
				$scope.srchObj.systemSearchName = savedSearch.name;
				if(savedSearch.systemSearchId) {
					var systemSearch = _.findWhere($scope.systemsavedSearchList, {"id": savedSearch.systemSearchId});
					$scope.srchObj.systemSearchName = systemSearch ? systemSearch.name : "";
				}
				
			} else {
				$scope.isKeywordDisabled = false;
			}
			
			if(savedSearch.name == "None") {
				$scope.clearSearch();
			} else {
				
				setSearchDefaults();
				
				
				$scope.query["systemSearchId"] = savedSearch.systemSearchId;
				
				if(savedSearch.system && !appdata.isSiteAdmin) {
					$scope.query["systemSearchId"] = savedSearch.id;
				}
				var newObj = _.findWhere($scope.docTypes.Documents, {"type": "News"});
				
				if(newObj) {
					newObj.checked = false;
				}
				
				_.each(savedSearch.map, function(val,key) {
					switch(key) {
					case "searchString":
						$scope.query[key] = val;
						if(typeof savedSearch.map["proximity"] !=="undefined") {
							$scope.query[key] = $scope.query[key]+"~"+savedSearch.map["proximity"];
						}
						
						break;
					case "advancedInputs":
						setAdvancedSearchInputs(val);
						break;
					case "entityTypes":
						if(_.contains(val,"news")) {
							var obj = _.findWhere($scope.docTypes.Documents, {"type": "News"});
							if(obj) {
								obj.checked = true;
							}
						}
						break;
					case "queryString":
					//case "proximity":
						$scope.query["searchString"] = $scope.query["searchString"]+"~"+val;
						break;
					}
				});
				
				
				if($state.params.r) {
	    			$scope.query.advancedInputs["documentIds"] = [$state.params.r];
	    		}
				
				if(savedSearch.valid) {
					if(mode == "system") {
						$scope.searchResults = null;
						$scope.snippets = null;
						$state.go('search');
						clearLayout("srchDocViewer");
						storeSerachCriteria();
					} else {
						clearLayout("srchDocViewer");
						$scope.getEntities();
					}
				} else if(!savedSearch.valid && savedSearch.name != "None"){
					var text = "The saved search is invalid, search can't be executed; For executing - Verify the criteria and re-save the search to make saved search valid.";
    				$confirm({text:text}, { templateUrl: 'app/components/common/CustomeTemplates/confirmTemplate.html' });
				}
			}
		};
		
		
		$scope.timeframes = [{
			"timeAgo": "Any",
			"id": "Any",
			"label": "Any",
			"date": null
		},{
			"timeAgo": "1 Day",
			"id": "1_Day",
			"label": "1 Day",
			"date": moment().subtract(1, "days").format($scope.defaultDateFormat)
		},{
			"timeAgo": "1 Week",
			"id": "1_Week",
			"label": "1 Week",
			"date": moment().subtract(1, "weeks").format($scope.defaultDateFormat)
		},{
			"timeAgo": "1 Month",
			"id": "1_Month",
			"label": "1 Month",
			"date": moment().subtract(1, "months").format($scope.defaultDateFormat)
		},{
			"timeAgo": "3 Months",
			"id": "3_Montths",
			"label": "3 Months",
			"date": moment().subtract(3, "months").format($scope.defaultDateFormat)
		},{
			"timeAgo": "1 Year",
			"id": "1_Year",
			"label": "1 Year",
			"date": moment().subtract(1, "years").format($scope.defaultDateFormat)
		},{
			"timeAgo": "3 Years",
			"id": "3_Years",
			"label": "3 Years",
			"date": moment().subtract(3, "years").format($scope.defaultDateFormat)
		},{
			"timeAgo": "Custom",
			"id": "Custom",
			"label" : "Custom",
			"date": moment($scope.dtObj.start).format($scope.displayFormat)+" :: "+moment($scope.dtObj.end).format($scope.displayFormat)
		}];
		
		
		$scope.timeFrameDate = angular.copy({"selected":$scope.timeframes[0]});
		$scope.previousTimeFrameValue = angular.copy({"selected":$scope.timeframes[0]});
		
		$scope.DocTypeWrap = {
				"isOpen" : false,
				"toggle" : function() {
					$scope.custTimeFrame = false;
					var isValid = true;
					if($scope.DocTypeWrap.isOpen) {
						isValid = this.validateDocTypeSelection();
					}
					if(isValid) {
						$scope.DocTypeWrap.isOpen = !$scope.DocTypeWrap.isOpen;
					}
					
				},
				"close" : function() {
					
					var isValid = true;
					if($scope.DocTypeWrap.isOpen) {
						isValid = this.validateDocTypeSelection();
					}
					if(isValid) {
						$scope.DocTypeWrap.isOpen = false;
					}
				},
				"validateDocTypeSelection" : function() {
					var allDocs = $scope.docTypes['Documents'];
					var DocTypeSelectons = _.where(allDocs, {"checked": true});
					
					if(DocTypeSelectons.length > 0) {
						return true;
					} else {
						return false;
					}
					
				}
		};
						
		$scope.clearSearch = function() {
			
			$scope.srchObj["selected"] = {"name" : "None"};
			$scope.srchObj["systemSearchSlctd"] = {"name" : "None"};
			
			
			$scope.isKeywordDisabled = false;
			$scope.srchObj.systemSearchName = '';
			
			$scope.searchResults = null;
			$scope.snippets = null;
			$scope.uiSnippets = null;
			$scope.count = 0;
			$scope.maxCount = 0;
			
			setSearchDefaults();
			
			$scope.timeFrameDate.selected = angular.copy($scope.timeframes[0]);
			
			$scope.dtObj.start = null;
	    	$scope.dtObj.end = null;
			$scope.ModifiedDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
			if(commonService.searchNotification) {
				commonService.searchNotification = null;
			}
			clearLayout("srchDocViewer");
			if($state.current.name !== "taskspace.list.task" && _.isEmpty(TaskSpaceService.currentTaskspace)) {
				$state.go("search",{s:null,r:null,c:null},{reload:false});
	    	}
		};
		
		$scope.CloseSearch = function() {
			if (PreViousState && PreViousState.name !== "login") {
				$state.go(PreViousState.name,PreViousState.params);
			} else {
				$state.go(defaultState.name,defaultState.params);
			}
		};
		
		
		$scope.SlctdDocTypes = {
			getSelectedDocTypes : function () {
				var docTypes = [],displayDocTypes = [],subTypes = {},DocTypes=[];
				var allDocs = $scope.docTypes['Documents'];
				var ownerShip = $scope.docTypes['ownerShip'];
				var optional = $scope.docTypes['optional'];
				var DocTypeSelectons = _.where(_.union(allDocs,ownerShip,optional), {"checked": true});
				
				var ownerShipSelection =  _.where(ownerShip, {"checked": true});
				
				$scope.advancedInputs.isGlobal = false;
				$scope.advancedInputs.sharedWithMe = false;
				$scope.advancedInputs.myDocuments = false;
				$scope.advancedInputs.annotatedDocs = false;
				$scope.advancedInputs.searchInAnnotation = false;
				$scope.query.entityTypes = [];
				
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
					
					if($scope.docTypes.selectAllDocs) {
						displayDocTypes.push("ALL");
					} else if (SecArray.length > 0){
						displayDocTypes.push(SecArray[0].lable);
					} 
					if(!$scope.docTypes.selectAllDocs && CompanyDocArray.length > 0) {
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
							
							if(!_.contains($scope.query.entityTypes,"document")) {
								$scope.query.entityTypes.push("document");
							}
							
							if(SecArray.length == 0 && !$scope.docTypes.selectAllDocs) {
								displayDocTypes.push(obj.lable);
							}
							
							break;
						case "Document":
							
							if(!$scope.docTypes.selectAllDocs) {
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
								
								if(!_.contains($scope.query.entityTypes,"document")) {
									$scope.query.entityTypes.push("document");
								}
							} else if(!_.contains($scope.query.entityTypes,"news")) {
								$scope.query.entityTypes.push("news");
							} 								
							break;
						case "ownerShip":
							
							$scope.advancedInputs[obj.type] = true;
						/*	switch(obj.type) {
							case "isGlobal":
								$scope.advancedInputs.isGlobal = true;
								break;
							case "sharedWithMe":
								$scope.advancedInputs.sharedWithMe = true;
								break;
							case "myDocuments":
								$scope.advancedInputs.myDocuments = true;
								break;
							}*/
							
							if(!_.contains($scope.query.entityTypes,"document")) {
								$scope.query.entityTypes.push("document");
							}
							
							if(ownerShip.length != ownerShipSelection.length ) {
								displayDocTypes.push(obj.lable);
							}
							
							break;
						case "optional":
							if(obj.type === "annotatedDocs" && obj.checked) { 
								$scope.advancedInputs.annotatedDocs = true;
							}
							if(obj.type === "searchInAnnotation" && obj.checked) { 
								$scope.advancedInputs.searchInAnnotation = true;
							}
							if(!_.contains($scope.query.entityTypes,"document")) {
								$scope.query.entityTypes.push("document");
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
				
				$scope.advancedInputs.documentType = DocTypes;
				$scope.advancedInputs.subtypes = subTypes;

				return displayDocTypes.join(",");
			}
		};
		
		$scope.onDocTypeChange = function(doc){
			
			var allDocs = $scope.docTypes['Documents'];
			
			if (doc == "All") {
				/*if($scope.docTypes.selectAllDocs) {
					for(var i=0; i < allDocs.length; i++) {
						allDocs[i].checked = $scope.docTypes.selectAllDocs;
			        }
				} else {
					$scope.docTypes.selectAllDocs = true;
				}*/
				//$scope.docTypes.selectAllDocs = true;
				for(var i=0; i < allDocs.length; i++) {
					allDocs[i].checked = $scope.docTypes.selectAllDocs;
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
					 var ownerShip = $scope.docTypes['ownerShip'];
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
				/* if(allDocs.length == unchecked.length) {
					 $scope.docTypes.selectAllDocs = true;
					 for(var i=0; i < allDocs.length; i++) {
						allDocs[i].checked = $scope.docTypes.selectAllDocs;
				     }
				 } else if(allDocs.length == checked.length ) {
					 $scope.docTypes.selectAllDocs = true;
				 } else {
					 $scope.docTypes.selectAllDocs = false;
				 }
				 */
				 
				 if(allDocs.length == checked.length ) {
					 $scope.docTypes.selectAllDocs = true;
				 } else {
					 $scope.docTypes.selectAllDocs = false;
				 }
				 
			}
		};
		
		$scope.$on("isolateDoc",function(event, msg){
			$scope.isolateDoc = msg;
		});
		
		$scope.$on("replaceObject", function (event,msg)  {
			var gd = _.findWhere($scope.searchResults,{"ID" : msg.gdId});
			if(gd) {
				var newEntry = angular.copy(gd);
				newEntry.ID = msg.id;
				newEntry.clientId = msg.clientId;
				newEntry.isGlobal = false;
				newEntry.isRed = true;
				newEntry.docType = msg.docType;
				var index = _.findIndex($scope.searchResults, {"ID" : msg.gdId});
				if(index != -1) {
					$scope.searchResults.splice(index,0,newEntry);
				} else {
					$scope.searchResults.push(newEntry);
				}
				
				$scope.count += 1;
	        	$scope.maxCount += 1;
	        	$scope.showDocsAndSnippets(newEntry);
			}
		});
		
		
		$scope.onSelectTimeFrame = function(timeframe) {
			$scope.custStartDateErrMsg = "";
    		$scope.custEndDateErrMsg = "";
    		
			$scope.ModifiedDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
			
			$scope.custTimeFrame = false;
			
			if (timeframe.label == "Custom") {
				$scope.custTimeFrame = true;
				
/*				$scope.ModifiedDtModel.datePublished.fromDate = moment($scope.dtObj.start).format($scope.defaultDateFormat);
		    	$scope.ModifiedDtModel.datePublished.toDate = moment($scope.dtObj.end).format($scope.defaultDateFormat);
		    	
		    	var from = moment($scope.dtObj.start).isValid() ?  moment($scope.dtObj.start).format($scope.displayFormat) : " ";
		    	var to = moment($scope.dtObj.end).isValid() ? moment($scope.dtObj.end).format($scope.displayFormat) : " ";
		    	
		    	$scope.timeFrameDate.selected.timeAgo = from+" :: "+to;
		    	
				$scope.timeFrameDate.selected = timeframe;
*/
				if(previousDTObj.start != null && typeof previousDTObj.start != "undefined") {
	    			$scope.dtObj.start = angular.copy(previousDTObj.start);
		    	}
		    	if(previousDTObj.end != null && typeof previousDTObj.end != "undefined") {
		    		$scope.dtObj.end = angular.copy(previousDTObj.end);	
		    	}
				if($scope.dtObj.start != null && typeof $scope.dtObj.start != "undefined") {
					$scope.ModifiedDtModel.datePublished.fromDate = moment($scope.dtObj.start).format($scope.defaultDateFormat);
				}
				if($scope.dtObj.end != null && typeof $scope.dtObj.end != "undefined") {
					$scope.ModifiedDtModel.datePublished.toDate = moment($scope.dtObj.end).format($scope.defaultDateFormat);
				}
				
			} else {
				$scope.previousTimeFrameValue.selected = angular.copy(timeframe);
				//$scope.clearDateRange();
				$scope.timeFrameDate.selected = angular.copy(timeframe);
				$scope.ModifiedDtModel.datePublished.fromDate = $scope.timeFrameDate.selected.date;
			}
		};
		
		$scope.expandDoc = function() {
			$scope.isolateDoc = true;
			$scope.$broadcast('resizeDoc', $scope.isolateDoc);
		};
		
		$scope.enableSrchGoBtn = function() {
			var status = true;
			
			if ((!_.isEmpty($scope.query.searchString) || !_.isEmpty($scope.advancedInputs.multiTags) || !_.isEmpty($scope.advancedInputs.tickers)
			   || !_.isEmpty($scope.query.entityTypes)|| $scope.ModifiedDtModel.datePublished.fromDate
			   || $scope.ModifiedDtModel.datePublished.toDate || $scope.advancedInputs.isGlobal || $scope.advancedInputs.myDocuments 
			   || $scope.advancedInputs.sharedWithMe || $scope.advancedInputs.annotatedDocs || $scope.advancedInputs.searchInAnnotation )
			   && (!_.isEmpty($scope.advancedInputs.documentType) || !_.isEmpty($scope.advancedInputs.subtypes)) && ($scope.srchObj.selected.name == 'None' || $scope.srchObj.selected.valid)
			   && !$scope.custTimeFrame) {
				status = false;
			}
			return status;
		};
		
		 var processQuery = function(query1,saveFlag) {
			 $scope.SlctdDocTypes.getSelectedDocTypes();
			 
	    	var query = angular.copy(query1);
	    	
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
	    		/*var sortOption = {};
	    		if (_.isEmpty(query.advancedInputs.sort)){
	 				sortOption["datePublished"] = "desc";
	 				query.advancedInputs.sort = sortOption;
	 				$scope.advancedInputs.sort = sortOption;
				}*/
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
				/*delete query.advancedInputs.sort;*/
				var sortOption = {};
				sortOption["datePublished"] = "desc";
 				query.advancedInputs.sort = sortOption;
 				$scope.advancedInputs.sort = sortOption;
			}
			
			
			if (query.advancedInputs.tickers.length == 0) {
				delete query.advancedInputs.tickers;
			} else if(!saveFlag){
				/*query.advancedInputs.ciks = _.map(query.advancedInputs.tickers, function(company, index){
					return company.cik;
	    		});*/
				query.advancedInputs["ciks"] = [];
				_.each(query.advancedInputs.tickers, function(ticker, index){
					if(ticker.group == "companies"){
						query.advancedInputs.ciks.push(ticker.cik);
					} else if(ticker.group == "portfolios") {
						if(ticker.portfolioTickers && !_.isEmpty(ticker.portfolioTickers)) {
							_.each(ticker.portfolioTickers,function(elem){
								query.advancedInputs.ciks.push(elem.cik);
							});
						}
					}
	    		});
				delete query.advancedInputs.tickers;
			} else if(saveFlag){
				var tickersArray = [];
				var portfoliosArray = [];
				_.each(query.advancedInputs.tickers, function(ticker, index){
					if(ticker.group == "companies"){
						tickersArray.push(ticker);
					} else if(ticker.group == "portfolios") {
						portfoliosArray.push(ticker);
					}
	    		});
				delete query.advancedInputs.tickers;
				query.advancedInputs["tickers"] = tickersArray;
				query.advancedInputs["portfolios"] = portfoliosArray;
			}
			
			if (_.isEmpty(query.advancedInputs.subtypes)) {
				delete query.advancedInputs.subtypes;
			}
			
			if (_.isEmpty(query.advancedInputs.documentType) || $scope.docTypes.selectAllDocs) {
				delete query.advancedInputs.documentType;
			}
			
			if (query.advancedInputs.documentName == null) {
				delete query.advancedInputs.documentName;
			}
			
			if ($scope.ModifiedDtModel.datePublished.fromDate || $scope.ModifiedDtModel.datePublished.toDate) {
				var date = angular.copy($scope.ModifiedDtModel);
				date.datePublished.timeframe = $scope.timeFrameDate.selected.id;
				if (date.datePublished.fromDate) {
					//date.datePublished.fromDate = moment(date.datePublished.fromDate).format($scope.defaultDateFormat);
					
					date.datePublished.fromDate = date.datePublished.fromDate;
				} else {
					delete date.datePublished.fromDate;
				}
				if (date.datePublished.toDate) {
					
					//date.datePublished.toDate = moment(date.datePublished.toDate).format($scope.defaultDateFormat);
					date.datePublished.toDate = date.datePublished.toDate;
				} else {
					delete date.datePublished.toDate;
				}
				query.advancedInputs.dates.push(date);
			}
			
			/*if ($scope.filingDtModel.formFilingDate.fromDate || $scope.filingDtModel.formFilingDate.toDate) {
				query.advancedInputs.dates.push($scope.filingDtModel);
			}*/
			
			if ( query.advancedInputs.dates.length == 0) {
				delete  query.advancedInputs.dates;
			}
			
			$scope.processedQry = query;
			
			return query;
		};
		
		
		
		$scope.getSortIcon = function(field) {
			if ($scope.advancedInputs.sort[field] == 'asc') {
				return 'fa-caret-up';
			} else if ($scope.advancedInputs.sort[field] == 'desc') {
				return 'fa-caret-down';
			}
		};
		
		$scope.sortBy = function(field,type) {
			var sortOption = {};
			if ($scope.advancedInputs.sort[field]) {
				if ($scope.advancedInputs.sort[field] == 'asc') {
					sortOption[field] = 'desc';
				} else {
					sortOption[field] = 'asc';
				}
			} else {
				if(type == 'num') {
					sortOption[field] = 'desc';
				} else {
					sortOption[field] = 'asc';
				}	
			}
			
			$scope.advancedInputs.sort = sortOption;
			
			$scope.query.advancedInputs.sort = sortOption;
			
			$scope.getEntities();
		} ;
		var childScopes = {};
		function clearLayout(focused) {
			if(focused) {
				var divElement = angular.element(document.querySelector('.'+focused));
				if(childScopes[focused]) {
					childScopes[focused].$destroy();
					delete childScopes[focused];
				}
				if(divElement) {
					divElement.empty();
				}
			}
		}
		
		$scope.onTaskSpaceSelect = function(doc,ts) {
			openDocument(doc,ts)
		};
		
		function openDocument(doc,ts) {
			clearLayout("srchDocViewer");
			var divElement = angular.element(document.querySelector('.srchDocViewer'));
			var template = "";
			childScopes["srchDocViewer"] = $scope.$new();
			childScopes["srchDocViewer"].userinfo = $scope.userinfo;
			if(doc.group=='News') {
				template = "<search-news-doc-viewer></search-news-doc-viewer>";
	    		childScopes["srchDocViewer"].documentId = doc.ID;
	    	} else if(doc.group=='Document') {
	    		if(doc.isExternal) {
	    			template = "<search-onedrive-doc-viewer></search-onedrive-doc-viewer>";
    	    		childScopes["srchDocViewer"].oneDriveDocId = doc.externalID;
    	    	} else if(doc.documentType == "EMail") {
    	    		template = '<email-doc-viewer data-ng-init="docContext=\'FromSearch\';annotationContext=\'document\'"><email-doc-viewer/>';
    	    		childScopes["srchDocViewer"].docId = doc.ID;
    	    		childScopes["srchDocViewer"].clientId = doc.clientId;
				} else {
    	    		template = "<search-doc-viewer></search-doc-viewer>";
    	    		childScopes["srchDocViewer"].documentId = doc.ID;
    	    		childScopes["srchDocViewer"].clientId = doc.clientId;
    	    		childScopes["srchDocViewer"].annotationContext = "document";
    	    		if(!_.isEmpty(ts)) {
    	    			childScopes["srchDocViewer"].annotationContext = "taskspace";
        	    		childScopes["srchDocViewer"].tsId = ts.taskspaceId;
        	    		childScopes["srchDocViewer"].tsClientId = ts.tsClientId;
    	    		}
    	    	}
	    	}
			
			var appendHtml = $compile(template)(childScopes["srchDocViewer"]);
		    divElement.append(appendHtml);
		    
		    $scope.showSnippets(doc);
		}
		
		function renderDocument(doc,ts) {
			
			/*TaskSpaceService.listDocumentTaskspaces(doc.ID).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					doc.taskspaces = resp.data.Taskspaces;
				}
			})["finally"](function() {
				openDocument(doc);
			});
			*/
			openDocument(doc);
		}
		
		function resetPage() {
			$scope.query.pageNumber = 1;
		}
		
		$scope.getEntities = function(reset) {
			if(reset) {
				clearLayout("srchDocViewer");
				if($scope.query && $scope.query.advancedInputs && $scope.query.advancedInputs.documentIds) {
					delete $scope.query.advancedInputs.documentIds;
				}
				resetPage();
			}
			CKEDITOR.instances = [];
			$scope.searchResults = null;
			$scope.snippets = null;
			$scope.uiSnippets = null;
			//$state.go('search',{},{reload:false});
			
			storeSerachCriteria();
			
			var query = processQuery($scope.query);
			
			query.searchType = "Adhoc";
			
			if($scope.srchObj.selected.id) {
				query.searchType = "Saved";
			}
			if($scope.srchObj.systemSearchSlctd.id) {
				query.searchType = "Smart";
			}
			if($state.current.name == "taskspace.list.task" && !_.isEmpty(TaskSpaceService.currentTaskspace) && query.advancedInputs){
				query.advancedInputs.taskspaceObjects = [{"taskspaceId" : TaskSpaceService.currentTaskspace.id,"clientId" : TaskSpaceService.currentTaskspace.clientId}];
			}
			if (query) {
				AdvSearchService.getEntities(query).then(function (results) {
			        if(results.status == 200){	
			        	
			        	var data = _.omit(results.data.Search,"count","maxScore","totalHits");
			        	var countData = _.pick(results.data.Search,"count","totalHits","maxScore");
			        	
			        	$scope.count = countData.count;
			        	$scope.maxCount = countData.totalHits;
			        	$scope.maxScore = countData.maxScore;
			        	
			        	var entities = _.map(data,function(val,key){
			        		
			        		if (key != "count") {
			        			for(var i=0;i<val.length;i++) {
			        				val[i]['datePublished'] = moment(val[i]['datePublished']).format($scope.resultDateFormat);
			        				val[i]['datePublished'] = moment(val[i]['datePublished'], $scope.resultDateFormat).toDate();
			        				val[i].isRed = false;
				        			if (i == 0) {
				        				val[i].firstInGroup = true;
						        		val[i].group = key;
				        			} else {
				        				val[i].firstInGroup = false;
						        		val[i].group = key;
				        			}
				        		}
				        		
				        		
				                return val;
			        		}
			        		
			        	});
			        	
			        	$scope.searchResults = _.flatten(entities);
			        	
			        	var pn = $scope.query.pageNumber;
						
						var _from = ((pn-1)*$scope.query.pageSize);
						var _to = ((pn-1)*$scope.query.pageSize)+$scope.searchResults.length;
						$scope.resultCount["range"] = _from +" - "+_to+" of "+$scope.maxCount;
						
			        	if($scope.searchResults && $scope.searchResults.length > 0) {
			        		hideAllSectionsOnMobile();
							hideAllToggleBtnsOnMobile();
							$scope.showResultsOnMobile = true;
			        	    
			        	    $scope.ShowFiltersIconOnMobile = true;
			        	    
			        	    if(!$deviceInfo.isMobile){
			        	    	var doc = $scope.searchResults[0];
			        	    	if(!_.isEmpty(SlackSearchService.searchInfo) && 
				        	    		!_.isEmpty(SlackSearchService.searchInfo.ctx) && 
				        	    		(SlackSearchService.searchInfo.ctx == "tsp" 
				        	    			|| SlackSearchService.searchInfo.ctx == "all") && !_.isEmpty(SlackSearchService.searchInfo.d)){
				        	    	doc = _.findWhere($scope.searchResults,{"ID" : SlackSearchService.searchInfo.d})
				        	    }
			        	    	
			        	    	/*if(doc.group=='News') {
			        	    		$state.go('search.news',{"newsId":doc.ID});
			        	    	} else if(doc.group=='Document') {
			        	    		if(doc.isExternal) {
				        	    		$state.go('search.oneDrive',{"oneDriveDocId":doc.externalID});
				        	    	} else {
				        	    		$state.go('search.doc',{"docId":doc.ID,"clientId":doc.clientId});
				        	    	}
			        	    	}*/
			        	    	//renderDocument("Document",doc.ID,doc.clientId,"srchDocViewer");
			        	    	renderDocument(doc);
			        	    	
	                		}
			        	    
			        	}
			        	SlackSearchService.searchInfo = {};
			        }
			     });
			}
		};
		
		$scope.prev = function() {
			if($scope.query.pageNumber > 0) {
				$scope.query.pageNumber = ($scope.query.pageNumber-1);
				clearLayout("srchDocViewer");
				$scope.getEntities();
			}
		}
		
		$scope.next = function() {
			if($scope.searchResults.length >= $scope.query.pageSize) {
				$scope.query.pageNumber = ($scope.query.pageNumber+1);
				clearLayout("srchDocViewer");
				$scope.getEntities();
			} 
		}
		
		$scope.getDocLocation = function(result) {
			
			if(result.isGlobal) {  //result.fullpath || 
				result.fullpath = result.Name;
			} else if(!result.fullpath) {
				
				DocFactory.getDocLocation(result.ID,result.clientId).then(function(response) {
					if(response.status == 200 && response.data.Status) {
						var docHierarchy = response.data.Notes;
	        			var fullpath="";
	        			for(var i =0;i<docHierarchy.length;i++) {
	        				var doc = docHierarchy[i];
	        				if(doc.root) {
	        					fullpath +="/home";
	        				} else if(doc.displayName) {
	        					fullpath +="/"+doc.displayName;
	        				} else {
	        					fullpath +="/"+doc.name;
	        				}
	        			}
						result.fullpath = fullpath;
					} else {
						result.fullpath = result.Name;
					}
				 });
			}
			
		};
		
		$scope.showDocsAndSnippets = function(result) {
			renderDocument(result);
		};
		
		
		var snippetContextPromise;
		function updateUiSnippetContextInfo(tsVoObjectList) {
			tsVoObjectList = _.uniq(tsVoObjectList,function(obj) {
				return obj.id+obj.clientId;
			});
			
			return TaskSpaceService.getTaskSpaceInfo(tsVoObjectList); 
		}
		
		$scope.getTsName = function(tsId) {
			var tsObj = AdvSearchService.tsInfoList[tsId];
			return tsObj ? tsObj.name : tsId; 
		};
		
		$scope.showSnippets = function(result) {
			var tsVoObjectList = [];
			$scope.snippets = null;
			$scope.uiSnippets = null;
			if(_.isArray(result.Matches) && result.Matches.length > 0) {
				_.each(result.Matches,function(val,index) {
					val.index = index;
				});
				
				$scope.snippets = result.Matches;
				var uiSnippets = _.groupBy(result.Matches, function(snippet){ 
					if(!snippet.context || snippet.context == "document") {
						return "Document";
					}
					
					if(snippet.context == "taskspace") {
						var tsVo = {
							"id" : 	snippet.tsId,
							"clientId" : snippet.tsClientId
						};
						var cachedVo = AdvSearchService.tsInfoList[snippet.tsId];
						if(!cachedVo) {
							tsVoObjectList.push(tsVo);
						}
						return snippet.tsId;
					}
				});
				
				if(_.isEmpty(tsVoObjectList)) {
					$scope.uiSnippets = uiSnippets;
				} else {
					updateUiSnippetContextInfo(tsVoObjectList).then(function(resp) {
						if (resp.status == 200 && resp.data.Status) {
							if(!_.isEmpty(resp.data.Taskspaces)) {
								_.each(resp.data.Taskspaces,function(obj) {
									AdvSearchService.tsInfoList[obj.id] = obj;
								})
							}
						}
					})['finally'](function() {
						$scope.uiSnippets = uiSnippets;
					});
				}
				
			} 
			
			$scope.selectedSnippet = -1;
			result.isRed = true;
			$scope.selectedId = result.ID;
			
			commonService.DocSnippets = {
					"docId" : result.ID,
					"snippets" : $scope.snippets
			};
			
			// for mobile 
			if(!_.isEmpty($scope.snippets) && $scope.snippets.length > 0) {
				hideAllSectionsOnMobile();
				hideAllToggleBtnsOnMobile();
				$scope.showSnippetsOnMobile = true;
			} else {
				hideAllSectionsOnMobile();
				hideAllToggleBtnsOnMobile();
				$scope.showSeletcedDocOnMobile = true; 
			}
			$scope.ShowToggleSnippetIconOnMobile = false;
			$scope.ShowFiltersIconOnMobile = true;
			$scope.ShowResultsIconOnMobile = true;
		};
		
		

	    $scope.selectSnippet = function(index,$event,snip) {
	    	//commonService.searchKey = $($event.currentTarget).text();
	    	
	    	var snippet = $scope.snippets[index];
	    	commonService.searchKey = snippet.string
			 .replace(new RegExp("<em>", 'g'), "")
			 .replace(new RegExp("</em>", 'g'), "")
			 .replace("(\\r|\\n|\\r\\n)+", "\\n");
	    	
	    	if($scope.processedQry.searchString) {
	    		commonService.searchString = $scope.processedQry.searchString
		    	.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1').replace(/\s+/g, "\\s*").replace(/^\"|\"$/g, "");
	    	}
	    	
	    	
	    	commonService.broadcast('snippetChanged',{'index':index,'snippet':snippet});
	    	commonService.selectedSnippet = index;
	    	$scope.selectedSnippet = index; 
	    	
	    	$event.currentTarget.scrollIntoView(true);
	    	$(".snippet-wrap")[0].scrollTop -= 50;
	    	//$(".snippet-wrap").scrollTop($($event.currentTarget).position().top);
	    	
	    	$scope.showSeletcedDocOnMobile = true;
	    	$scope.ShowToggleSnippetIconOnMobile = true;
	    };
	    
	    var snippetWatchTimer;
	    function watchSnippets() {
	    	$scope.$watch("snippets", function (newValue, oldValue) {
		    	$timeout.cancel(snippetWatchTimer);
		    	snippetWatchTimer = $timeout(function () {
		        	$('.vdvc-snippet:first').trigger("click");
					$('.snippet-wrap').scrollTop(0);
		        });
		    });
	    }
	    
	    function searchAndSelectTickerObj(searchTickerText,lastIndex,cb) {
	    	$scope.refreshTickerInfo(searchTickerText,function(){
				if(!_.isEmpty($scope.tickersList)) {
					var matchedTkrObj = _.findWhere($scope.tickersList,function(ticker) {
						return ticker.ticker.toLowerCase() == SlackSearchService.searchInfo.tkr.toLowerCase();
					});
					matchedTkrObj.selected = true;
					$scope.advancedInputs.tickers.push(matchedTkrObj);
					if(lastIndex && typeof cb === "function") {
						cb();
					}
				}
			});
	    }
	    
	    function searchAndSelectTicker(cb) {
	    	var searchTicker = SlackSearchService.searchInfo.tkr;
	    	var searchTickerArray = [];
	    	if(searchTicker.split(",").length > 0) {
	    		searchTickerArray = searchTicker.split(",");
	    	}
	    	var lastIndex = false;
	    	_.each(searchTickerArray,function(searchTickerText,index){
	    		if(index == searchTickerArray.length - 1) {
	    			lastIndex = true;
	    		}
	    		searchAndSelectTickerObj(searchTickerText,lastIndex,function() {
	    			if(typeof cb === "function") {
						cb();
					}
	    		});
			});
	    }
	    
	    function searchAndSelectTagObj(searchTagObj,lastIndex,cb) {
	    	var searchTag = searchTagObj;
	    	var searchTagName;
	    	var searchTagValue;
	    	if(searchTag.split(":").length > 1) {
	    		searchTagName = searchTag.split(":")[0];
	    		searchTagValue = searchTag.split(":")[1];
	    	} else {
	    		searchTagName = searchTag;
	    	}
	    	$scope.refreshTagInfo(searchTagName,function(){
				if(!_.isEmpty($scope.tags)) {
					var matchedTagObj = _.filter($scope.tags,function(tag) {
						var status = false;
						if(!_.isEmpty(searchTagValue) && 
								tag.name.toLowerCase() == searchTagName.toLowerCase() && 
								!_.isEmpty(tag.value) && 
								tag.value.toLowerCase() == searchTagValue.toLowerCase()) {
							status = true;
							
						} else if(_.isEmpty(searchTagValue) && 
								tag.name.toLowerCase() == searchTagName.toLowerCase()){
							status = true;
						}
						return status;
					});
					if(!_.isEmpty(matchedTagObj)) {
						matchedTagObj[0].selected = true;
						$scope.advancedInputs.multiTags.push(matchedTagObj[0]);
					}
					if(lastIndex && typeof cb === "function") {
						cb();
					}
				}
			});
	    }
	    
	    /* Define function for escaping user input to be treated as 
	    a literal string within a regular expression */
	    function escapeRegExp(string){
	    	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	    }
	  
	    /* Define functin to find and replace specified term with replacement string */
	    function replaceAll(str, term, replacement) {
	    	return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
	    }
	  
	    /* Testing our replaceAll() function  */
	    /*var myStr = 'if the facts do not fit the theory, change the facts.';
	    var newStr = replaceAll(myStr, 'facts', 'statistics');*/
	 
	    function searchAndSelectTag(cb) {
	    	var searchTag = SlackSearchService.searchInfo.tag;
	    	var replaceString;
	    	if(searchTag.indexOf("%22") != -1) {
	    		replaceString = "%22";
	    		searchTag = replaceAll(searchTag, replaceString, '');
	    	} else if (searchTag.indexOf("\"") != -1) {
	    		replaceString = "\"";
	    		searchTag = replaceAll(searchTag, replaceString, '');
	    	}
	    	
	    	var searchTagArray = [];
	    	if(searchTag.split(",").length > 0) {
	    		searchTagArray = searchTag.split(",");
	    	}
	    	var lastIndex = false;
	    	_.each(searchTagArray,function(searchTagObj,index){
	    		if(index == searchTagArray.length - 1) {
	    			lastIndex = true;
	    		}
	    		searchAndSelectTagObj(searchTagObj,lastIndex,function() {
	    			if(typeof cb === "function") {
						cb();
					}
	    		});
			});
	    }
	    
	    function searchAndSelectDocType(cb) {
	    	var docType = SlackSearchService.searchInfo.dtp;
			var subType;
			if(!_.isEmpty(SlackSearchService.searchInfo.stp)) {
				subType = SlackSearchService.searchInfo.stp;
			}
			var docTypeObj = {documentType : [],subtypes : {}};
			if(!_.isEmpty(docType)) {
				if((docType.toLowerCase() !== "sec" && docType.toLowerCase() !== "companydoc") || 
						((docType.toLowerCase() === "sec" || docType.toLowerCase() === "companydoc") && 
								_.isEmpty(subType)
						)
				   ) {
					var docTypeObjTemp = _.findWhere(SlackSearchService.docTypeMapping,{key : docType.toLowerCase()});
					if(!_.isEmpty(docTypeObjTemp)) {
						docType = docTypeObjTemp.value;
					}
				}
				if(docType.toLowerCase() !== "sec" && docType.toLowerCase() !== "companydoc") {
					docTypeObj.documentType.push(docType);
				}
			}
			if(!_.isEmpty(subType)) {
				var subTypeObj = {};
				if(docType.toLowerCase() === "companydoc") {
					subTypeObj = _.findWhere(SlackSearchService.subTypeMapping,{type : "CompanyDocSubTypeMapping",key : subType.toLowerCase()});
					if(!_.isEmpty(subTypeObj)) {
						docTypeObj.subtypes["CompanyDoc"] = [subTypeObj.value];
					}
				} else if(docType.toLowerCase() === "sec") {
					subTypeObj = _.findWhere(SlackSearchService.subTypeMapping,{type : "SECSubTypeMapping",key : subType.toLowerCase()});
					if(!_.isEmpty(subTypeObj)) {
						docTypeObj.subtypes["SECFile"] = [subTypeObj.value];
						docTypeObj.subtypes["SECCompareFile"] = [subTypeObj.value];
					}
				}
			}
			setAdvancedSearchInputs(docTypeObj,function(){
				if(typeof cb === "function") {
					cb();
				}
			});
		}
	    
	    function searchAndSelectTimeFrame(cb) {
	    	var timeframe = SlackSearchService.searchInfo.tmf;
	    	var number = timeframe.substring(0, timeframe.length-1);
	    	var type;
	    	var subtractType;
	    	
	    	switch(timeframe.substring(timeframe.length-1, timeframe.length)) {
				case "d":
					type = "Day";
					if(parseInt(number) > 1) {
						type = type+"s"
					}
					subtractType = "days";
					break;
				case "w":
					type = "Week";
					if(parseInt(number) > 1) {
						type = type+"s"
					}
					subtractType = "weeks";
					break;
				case "m":
					type = "Month";
					if(parseInt(number) > 1) {
						type = type+"s"
					}
					subtractType = "months";
					break;
				case "y":
					type = "Year";
					if(parseInt(number) > 1) {
						type = type+"s"
					}
					subtractType = "years";
					break;
	    	}
	    	var tmfObj = {
	    			"timeAgo":number+" "+type,
	    			"id":number+"_"+type,
	    			"label":number+" "+type,
	    			"date":moment().subtract(parseInt(number), subtractType).format($scope.defaultDateFormat)
	    		};
	    	$scope.previousTimeFrameValue.selected = angular.copy(tmfObj);
			$scope.timeFrameDate.selected = angular.copy(tmfObj);
			$scope.ModifiedDtModel.datePublished.fromDate = $scope.timeFrameDate.selected.date;
			if(typeof cb === "function") {
				cb();
			}
		}
	    
	    function init() {
	    	if($state.current.name == "taskspace.list.task"){
				$scope.showOnlySearchFilters = true;
			} else {
				$scope.showOnlySearchFilters = false;
			}
	    	if($stateParams.s) {
	    		var promise = AdvSearchService.getSavedSearchCriteriaById({"id":$stateParams.s});
				promise.then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						var selectedSearchObj =  resp.data.Search;
			    		if(selectedSearchObj) {
			    			$scope.srchObj.selected = selectedSearchObj;
			    			$scope.onSavedSearchChange($scope.srchObj.selected);
			    		}
					}
				});
	    	} else {
	    		getSavedSearchCriteria();
		 	    getSystemSavedSearches();
	    	}
	    	if(!_.isEmpty(SlackSearchService.searchInfo) && !_.isEmpty(SlackSearchService.searchInfo.ctx) && (SlackSearchService.searchInfo.ctx == "tsp" || SlackSearchService.searchInfo.ctx == "all")){
				$scope.srchObj.selected["searchString"] = SlackSearchService.searchInfo.skw;
				$scope.query.searchString = SlackSearchService.searchInfo.skw;
				if(!_.isEmpty(SlackSearchService.searchInfo.tkr)) {
					searchAndSelectTicker(function(){
						if(!_.isEmpty(SlackSearchService.searchInfo.tag)) {
							searchAndSelectTag(function() {
								if(!_.isEmpty(SlackSearchService.searchInfo.dtp)) {
									searchAndSelectDocType(function() {
										if(!_.isEmpty(SlackSearchService.searchInfo.tmf) && SlackSearchService.searchInfo.tmf.length > 1) {
											searchAndSelectTimeFrame(function() {
												$scope.getEntities();
											});
										} else {
											$scope.getEntities();
										}
									});
								} else if(!_.isEmpty(SlackSearchService.searchInfo.tmf) && SlackSearchService.searchInfo.tmf.length > 1) {
									searchAndSelectTimeFrame(function() {
										$scope.getEntities();
									});
								} else {
									$scope.getEntities();
								}
							});
						} else if(!_.isEmpty(SlackSearchService.searchInfo.dtp)) {
							searchAndSelectDocType(function() {
								if(!_.isEmpty(SlackSearchService.searchInfo.tmf) && SlackSearchService.searchInfo.tmf.length > 1) {
									searchAndSelectTimeFrame(function() {
										$scope.getEntities();
									});
								} else {
									$scope.getEntities();
								}
							});
						} else {
							$scope.getEntities();
						}
					});
				} else if(!_.isEmpty(SlackSearchService.searchInfo.tag)) {
					searchAndSelectTag(function() {
						if(!_.isEmpty(SlackSearchService.searchInfo.dtp)) {
							searchAndSelectDocType(function() {
								if(!_.isEmpty(SlackSearchService.searchInfo.tmf) && SlackSearchService.searchInfo.tmf.length > 1) {
									searchAndSelectTimeFrame(function() {
										$scope.getEntities();
									});
								} else {
									$scope.getEntities();
								}
							});
						} else if(!_.isEmpty(SlackSearchService.searchInfo.tmf) && SlackSearchService.searchInfo.tmf.length > 1) {
							searchAndSelectTimeFrame(function() {
								$scope.getEntities();
							});
						} else {
							$scope.getEntities();
						}
					});
				} else if(!_.isEmpty(SlackSearchService.searchInfo.dtp)) {
					searchAndSelectDocType(function() {
						if(!_.isEmpty(SlackSearchService.searchInfo.tmf) && SlackSearchService.searchInfo.tmf.length > 1) {
							searchAndSelectTimeFrame(function() {
								$scope.getEntities();
							});
						} else {
							$scope.getEntities();
						}
					});
				} else if(!_.isEmpty(SlackSearchService.searchInfo.tmf) && SlackSearchService.searchInfo.tmf.length > 1) {
					searchAndSelectTimeFrame(function() {
						$scope.getEntities();
					});
				} else {
					$scope.getEntities();
				}
			}
	    	if(!$deviceInfo.isMobile) {
	    		watchSnippets();
	    	}
	    	if($deviceInfo.isTablet && $scope.DEVICE_ORIENT == "portrait") {
	    		WarningPopupService.open(tabOrientationWarningData);
			} else if($deviceInfo.isMobile && $scope.DEVICE_ORIENT == "landscape") {
				WarningPopupService.open(mobileOrientationWarningData);
			}
	    }
	    
	    $scope.showTagName = function(tag) {
	    	var tagName = angular.copy(tag.name);
	    	if(!_.isEmpty(tag.value)) {
	    		tagName = tagName +" : "+ tag.value;
	    	}
	    	return tagName;
	    }
	    
	    $scope.refreshTagInfo = function(searchkey,cb) {
			  if(!_.isEmpty(searchkey)) {
				 TagService.getAllTags(searchkey).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						//$scope.tags = _.pluck(resp.data.Tag, 'TagName'); 
						$scope.tags =[];
						var resultTagList = [];
						resultTagList = resp.data.Tag;
						_.each(resultTagList,function(resultTag){
							$scope.tags.push({"name" : resultTag.TagName,"value" : resultTag.Value});
						});
						if(typeof cb === "function") {
			    			cb();
			    		}
					}
				});
			  }
		};
	    
		function processTickersForDisplay (portfolios){
	    	_.each(portfolios,function(portfolio){
	    		tickersArrayToString(portfolio);
			});
	    }
	    
	    function tickersArrayToString (portfolio){
	    	if(!_.isEmpty(portfolio.portfolioTickers)){
	    		portfolio.portfolioTickers =  orderByFilter(portfolio.portfolioTickers, 'ticker', false);
		    	portfolio.displayTickers = portfolio.portfolioTickers.map(function(elem){
				    return elem.ticker;
				}).join(",");
	    	}
	    }
		
	   $scope.refreshTickerInfo = function(searchKey,cb) {
		   if(!_.isEmpty(searchKey)) {
			   SecFilingService.getCompaniesList({"searchTxt":searchKey,"infoFor":"all"}).then(function(resp){
			    	if(resp.status == 200 && resp.data.Status) {
			    		/*var tickers = _.map(resp.data.Company, function(company, index){
			    			return company.ticker;
			    		});
			    		$scope.tickersList = tickers;*/
			    		var companies = resp.data.Company;
			    		var portfolios = resp.data.Portfolio;
			    		processTickersForDisplay(portfolios);
			    		$scope.tickersList = [];
			    		if(_.isArray(companies)) {
							_.each(portfolios,function(portfolio){
								portfolio["group"] = "portfolios";
								$scope.tickersList.push(portfolio);
							});
							_.each(companies,function(comapany){
								comapany["group"] = "companies";
								$scope.tickersList.push(comapany);
							});
							if(typeof cb === "function") {
				    			cb();
				    		}
						}
			        }
			    });
		   }
	    };
	   
	    $scope.closeDateRange = function() {
	    	$scope.custTimeFrame = false;
	    };
	    
	    $scope.cancelCustomeDate = function() {
	    	$scope.timeFrameDate = angular.copy($scope.previousTimeFrameValue);
	    	if ($scope.timeFrameDate.selected && $scope.timeFrameDate.selected.label == "Custom") {
	    		if(previousDTObj.start != null && typeof previousDTObj.start != "undefined") {
	    			$scope.dtObj.start = angular.copy(previousDTObj.start);
		    	}
		    	if(previousDTObj.end != null && typeof previousDTObj.end != "undefined") {
		    		$scope.dtObj.end = angular.copy(previousDTObj.end);	
		    	}
	    	}
	    	$scope.closeDateRange();
	    };
		
	    $scope.clearDateRange = function() {
	    	if($scope.dtObj.start != null && typeof $scope.dtObj.start != "undefined") {
	    		previousDTObj.start = angular.copy($scope.dtObj.start);
	    		$scope.dtObj.start = null;
	    	}
	    	if($scope.dtObj.end != null && typeof $scope.dtObj.end != "undefined") {
	    		previousDTObj.end = angular.copy($scope.dtObj.end);	
	    		$scope.dtObj.end = null;
	    	}
	    };
	    
	    $scope.applyDateRange = function() {
/*	    	$scope.ModifiedDtModel.datePublished.fromDate = moment($scope.dtObj.start).format($scope.defaultDateFormat);
	    	$scope.ModifiedDtModel.datePublished.toDate = moment($scope.dtObj.end).format($scope.defaultDateFormat);
*/	    	
	    	if($scope.dtObj.start != null && typeof $scope.dtObj.start != "undefined") {
	    		$scope.ModifiedDtModel.datePublished.fromDate = moment($scope.dtObj.start).format($scope.defaultDateFormat);
	    	}
	    	if($scope.dtObj.end != null && typeof $scope.dtObj.end != "undefined") {
	    		$scope.ModifiedDtModel.datePublished.toDate = moment($scope.dtObj.end).format($scope.defaultDateFormat);	
	    	}
	    	var from = "";
	    	var to = "";
	    	
	    	if(typeof $scope.dtObj.start != "undefined"){
	    		if(new Date($scope.dtObj.start).getTime()<=new Date().getTime()){
	    			from = moment($scope.dtObj.start).isValid() ?  moment($scope.dtObj.start).format($scope.displayFormat) : " ";
		    		$scope.custStartDateErrMsg = "";
	    		}else{
	    			$scope.custStartDateErrMsg = "'From' date can't be future date.";
		    		return false;
	    		}
	    	} else{
	    		$scope.custStartDateErrMsg = "Please enter valid 'From' date (YYYY-MM-DD).";
	    		return false;
	    	}
	    	if(typeof $scope.dtObj.end != "undefined"){
	    	//if($scope.dtObj.end){
	    		if(new Date($scope.dtObj.end).getTime()<=new Date().getTime()){
		    		to = moment($scope.dtObj.end).isValid() ? moment($scope.dtObj.end).format($scope.displayFormat) : " ";
		    		$scope.custEndDateErrMsg = "";
	    		}else{
	    			$scope.custEndDateErrMsg = "'To' date can't be future date.";
		    		return false;
	    		}
	    	}else{
	    		$scope.custEndDateErrMsg = "Please enter valid 'To' date (YYYY-MM-DD).";
	    		return false;
	    	}
	    	if(!$scope.dtObj.start && !$scope.dtObj.end){
	    		$scope.custEndDateErrMsg = "Please select atleast one of the dates; else click on 'CANCEL'";
	    		return false;
	    	}
	    	if($scope.dtObj.end){
	    		
	    		if($scope.dtObj.start == null){
	    			//from = to;
	    		}else if(new Date($scope.dtObj.start).getTime() > new Date($scope.dtObj.end).getTime()){
	    			$scope.custStartDateErrMsg = "'From' date should not be after 'To' date.";
		    		return false;
	    		}
	    	}
    		$scope.custStartDateErrMsg = "";
    		$scope.custEndDateErrMsg = "";
    		if($scope.dtObj.end || $scope.dtObj.start) {
    			var obj = _.findWhere($scope.timeframes, {"label" : "Custom"});
				$scope.timeFrameDate.selected = angular.copy(obj);
				$scope.previousTimeFrameValue.selected = angular.copy(obj);
				previousDTObj.start = angular.copy($scope.dtObj.start);
				previousDTObj.end = angular.copy($scope.dtObj.end);	
    		}
    		if($scope.dtObj.end && $scope.dtObj.start){
    	    	$scope.timeFrameDate.selected.timeAgo = from+" :: "+to;
        		$scope.previousTimeFrameValue.selected.timeAgo = from+" :: "+to;
        		$scope.timeFrameDate.selected.date = from+" :: "+to;
        		$scope.previousTimeFrameValue.selected.date = from+" :: "+to;
        	} else if (!$scope.dtObj.start && $scope.dtObj.end){
    			$scope.timeFrameDate.selected.timeAgo = "ToDate : "+to;
        		$scope.previousTimeFrameValue.selected.timeAgo = "ToDate : "+to;
        		$scope.timeFrameDate.selected.date = "ToDate : "+to;
        		$scope.previousTimeFrameValue.selected.date = "ToDate : "+to;
    		} else if ($scope.dtObj.start && !$scope.dtObj.end) {
    			$scope.timeFrameDate.selected.timeAgo = "FromDate : "+from;
        		$scope.previousTimeFrameValue.selected.timeAgo = "FromDate : "+from;
        		$scope.timeFrameDate.selected.date = "FromDate : "+from;
        		$scope.previousTimeFrameValue.selected.date = "FromDate : "+from;
    		}
    		$scope.closeDateRange();
	    };
	    
	    function storeSerachCriteria() {
	    	var queryToSave = processQuery($scope.query,true);
			var selectedSearch = angular.copy($scope.srchObj.selected);
			selectedSearch.map = queryToSave;
	    	localStorageService.set("searchCriteria" ,JSON.stringify(selectedSearch));
	    }
	    
	   function getSerachCriteria(key) {
	    	var data = localStorageService.get(key);
	    	if(data) {
	    		return JSON.parse(data);
	    	} else {
	    		return null;
	    	}
	   }
	    
	   function removeSearchCriteria() {
	    	localStorageService.remove("searchCriteria");
	   }
	    
	   
	   
	   init();
	   
	    /* for mobile */
	    
	    $scope.isSrchNavbarOpened = false;
	    
	    $scope.showFiltersOnMobile = true;
	    $scope.showResultsOnMobile = false;
	    $scope.showSnippetsOnMobile = false;
	    $scope.showSeletcedDocOnMobile = false;
	    
	    $scope.ShowFiltersIconOnMobile = false;
	    $scope.hideFiltersIconOnMobile = false;
	    $scope.ShowResultsIconOnMobile = false;
	    $scope.ShowSnippetIconOnMobile = false;
	    $scope.ShowDocumentIconOnMobile = false;
	    $scope.ShowToggleSnippetIconOnMobile = false;
	    
	    $scope.fromCal = {
	    	    opened: false
	    	  };

	    $scope.toCal = {
	    		opened: false
	    };
	    
	    function hideAllSectionsOnMobile() {
	    	$scope.showFiltersOnMobile = false;
		    $scope.showResultsOnMobile = false;
		    $scope.showSnippetsOnMobile = false;
		    $scope.showSeletcedDocOnMobile = false;
	    }
	    
	    function hideAllToggleBtnsOnMobile() {
	    	$scope.ShowFiltersIconOnMobile = false;
		    $scope.hideFiltersIconOnMobile = false;
		    $scope.ShowResultsIconOnMobile = false;
		    $scope.ShowSnippetIconOnMobile = false;
		    $scope.ShowDocumentIconOnMobile = false;
		    $scope.ShowToggleSnippetIconOnMobile = false;
	    }
	    
	    $scope.toggleSnippetsOnMobile = function() {
	    	$scope.showSnippetsOnMobile = !$scope.showSnippetsOnMobile;
	    };
	    
	    $scope.toggleSrchNavbar = function() {
	    	$scope.isSrchNavbarOpened = !$scope.isSrchNavbarOpened;
	    };
	    
	    $scope.OpenFiltersOnMobile = function() {
	    	hideAllSectionsOnMobile();
	    	hideAllToggleBtnsOnMobile();
	    	$scope.showFiltersOnMobile = true;
	    	
		    if(!_.isEmpty($scope.searchResults) && $scope.searchResults.length > 0) {
		    	$scope.hideFiltersIconOnMobile = true;
		    }
		    
	    };
	    
		$scope.OpenResultsOnMobile = function() {
			hideAllSectionsOnMobile();
	    	hideAllToggleBtnsOnMobile();
			$scope.showResultsOnMobile = true;
			
		    $scope.ShowFiltersIconOnMobile = true;
		};
		
		$scope.OpenSnippetsOnMobile = function() {
			hideAllSectionsOnMobile();
	    	hideAllToggleBtnsOnMobile();
			$scope.showSnippetsOnMobile = true;
			
		    $scope.ShowResultsIconOnMobile = true;
		    $scope.ShowFiltersIconOnMobile = true;
		    $scope.ShowSnippetIconOnMobile = false;
		    $scope.ShowDocumentIconOnMobile = true;
		};
		
		$scope.OpenSrchDocumentOnMobile = function() {
			hideAllSectionsOnMobile();
	    	hideAllToggleBtnsOnMobile();
	    	$scope.showSeletcedDocOnMobile = true;
		    
		    $scope.ShowResultsIconOnMobile = true;
		    $scope.ShowFiltersIconOnMobile = true;
		    $scope.ShowSnippetIconOnMobile = true;
		    $scope.ShowDocumentIconOnMobile = false;
		};
		
		$scope.openFromCalendar = function() {
			$scope.fromCal.opened = true;
		};

		$scope.openToCalendar = function() {
			$scope.toCal.opened = true;
		};
		
		
		 var fileIconMap = {
					"doc" :"fl fl-docx",
					"docx" :"fl fl-docx",
					"pdf" :"fl fl-pdf",
					"xls" :"fl fl-xlx",
					"xlsx" :"fl fl-xlx",
					"pptx" :"fl fl-ppt",
					"ppt" :"fl fl-ppt",
					"jpeg" :"fl fl-img",
					"jpg" :"fl fl-img",
					"png" :"fl fl-img",
					"gif" :"fl fl-img",
					"xml" : "fl fl-txt",
					"txt" : "fl fl-txt"
			};
			
			$scope.getFileIcon = function(result) {
				if(result.isGlobal) {
					return "fl fl-globe";
				}
				return DocFactory.getFileImgIcon(result.Name,result.documentType);
			};
		    
		$scope.showTickersFilter = function(result) {
			var status = false;
			if(appdata && appdata.UserSettings && appdata.UserSettings.contentAccess_FinancialAnalyst == "Yes") {
				status = true;
			}
			return status;
		};
	}
	
})();