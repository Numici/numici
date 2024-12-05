;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('TSPropertiesController',TSPropertiesController);
	
	TSPropertiesController.$inject = ['$scope','appData','$uibModalInstance','_','source','DocFactory',
	                                  'SecFilingService','TaskSpaceService','MessageService','$uibModal',
	                                  'ActionItemsService'];

	function TSPropertiesController($scope,appData,$uibModalInstance,_,source,DocFactory,SecFilingService,
			TaskSpaceService,MessageService,$uibModal,ActionItemsService) {
		var appdata = appData.getAppData();
		var vm = this;
		
		vm.source = source;
		vm.sourceFolderHierarchy = [];
		vm.properTiesForm = {
				$visible: false
			};
		vm.sourceCopy = angular.copy(source);
		vm.taskSpaceName = "";
		vm.companiesList = [];
		vm.selectedTicker = {'tickerObj':
			selectedTickerObj()
		};
		vm.folderHierarchy = [];
		vm.selectedDefaultFolder = {"id" : ""};
		
		vm.TaskSync = {};
		vm.user_GenerativeAI = (appdata.UserSettings && appdata.UserSettings.user_GenerativeAI && appdata.UserSettings.user_GenerativeAI == "Yes") ? true : false;
		vm.isAutoSummarize = false;
		vm.autoSummarizeOptionsList = angular.copy(TaskSpaceService.autoSummarizeOptions);
		vm.autoSummarizeOption = vm.autoSummarizeOptionsList[1];
		
		vm.editProperties = editProperties;
		vm.showTickersFilter = showTickersFilter;
		vm.cancelEdit = cancelEdit;
		vm.getSuggestedName = getSuggestedName;
		vm.refreshTickers = refreshTickers;
		vm.clear = clear;
		vm.removeDefaultFolder = removeDefaultFolder;
		vm.browseFolders = browseFolders;
		vm.onChangeAutoSummarize = onChangeAutoSummarize;
		vm.cancel = cancel;
		vm.ok = ok;
		
		vm.showSyncActionItemBtn = showSyncActionItemBtn;
		vm.showSyncActionItemInfo = showSyncActionItemInfo;
		vm.removeSyncActionItem = removeSyncActionItem;
		vm.syncActionItem = syncActionItem;
		
		function selectedDefaultFolderId() {
			var diffrentDefaultFolder = false;
			if(vm.sourceCopy.length > 1) {
				firstLoop:
				    for (var i in vm.sourceCopy) {
				    	var ts = vm.sourceCopy[i];
				    	var initialDefaultFolderId = !_.isEmpty(ts.defaultFolderId) ? ts.defaultFolderId : "";
				    	for (var j in vm.sourceCopy) {
				    		var ts2 = vm.sourceCopy[j];
					    	var otherDefaultFolderId = !_.isEmpty(ts2.defaultFolderId) ? ts2.defaultFolderId : "";
					    	if(initialDefaultFolderId != otherDefaultFolderId) {
					    		diffrentDefaultFolder = true;
								break firstLoop;
							}
					    }
				    }
			}
			if(diffrentDefaultFolder){
				return "<varies>";
			} else {
				return vm.sourceCopy[0].defaultFolderId;
			}
		}
		
		function setDefaults() {
			if(vm.sourceCopy.length == 1 && !_.isEmpty(vm.sourceCopy[0].defaultFolderId)) {
	    		vm.taskSpaceName = angular.copy(vm.sourceCopy[0].name);
	    	}
			vm.selectedTicker.tickerObj = selectedTickerObj();
    		vm.selectedDefaultFolder.id = selectedDefaultFolderId();
    		getHierarchy(vm.selectedDefaultFolder.id,function(docHierarchy) {
    			vm.folderHierarchy = docHierarchy;
    		});
		}
		
		function showTickersFilter() {
			var status = false;
			appdata = appData.getAppData();
			if(appdata && appdata.UserSettings && appdata.UserSettings.contentAccess_FinancialAnalyst == "Yes") {
				status = true;
			}
			return status;
		}
		
		function editProperties() {
			setDefaults();
			vm.properTiesForm.$visible = true;
		}
		
		function cancelEdit() {
			vm.properTiesForm.$visible = false;
		}
		
		function getSuggestedName () {
			var suggestedName = vm.taskSpaceName;
			if(vm.selectedTicker.tickerObj && vm.selectedTicker.tickerObj.ticker && vm.selectedTicker.tickerObj.ticker != null && vm.selectedTicker.tickerObj.ticker != "") {
				suggestedName = vm.selectedTicker.tickerObj.ticker+" - ";
				if(vm.taskSpaceName) {
					suggestedName += vm.taskSpaceName;
				}
			}
			return suggestedName;
		}
		
		function selectedTickerObj(){
			var diffrentTicker = false;
			if(vm.sourceCopy.length > 1) {
				firstLoop:
				    for (var i in vm.sourceCopy) {
				    	var ts = vm.sourceCopy[i];
				    	var initialTicker = !_.isEmpty(ts.tickers[0]) ? ts.tickers[0] : "";
				    	for (var j in vm.sourceCopy) {
				    		var ts2 = vm.sourceCopy[j];
					    	var otherTicker = !_.isEmpty(ts2.tickers[0]) ? ts2.tickers[0] : "";
					    	if(initialTicker != otherTicker) {
								diffrentTicker = true;
								break firstLoop;
							}
					    }
				    }
			}
			if(diffrentTicker){
				return {"ticker": "<varies>"};
			} else {
				return {"ticker": vm.sourceCopy[0].tickers[0]};
			}
		}
			
		
		function refreshTickers(searchKey) {
			if(!_.isEmpty(searchKey)) {
				SecFilingService.getCompaniesList({"searchTxt":searchKey}).then(function(resp){
					if(resp.status == 200 && resp.data.Status) {
						vm.companiesList = resp.data.Company;
				    }
				});
			}
		}
		
		function onChangeAutoSummarize () {
			vm.isAutoSummarize = !vm.isAutoSummarize;
		}
		
		function clear($event) {
			if($event) {
				$event.stopPropagation(); 
			}
		    vm.selectedTicker.tickerObj.ticker = '';
		}
		
		function removeDefaultFolder() {
			vm.selectedDefaultFolder.id = null;
			vm.folderHierarchy = [];
		}
		
		function getHierarchy(folderId,cb) {
			if(!_.isEmpty(folderId) && folderId != "<varies>") {
				DocFactory.getDocHierarchy(folderId,function(docHierarchy) {
					if(typeof cb == "function") {
						cb(docHierarchy);
					}
				});
  		  	} else if(folderId == "<varies>") {
	  		  	if(typeof cb == "function") {
					cb([{"name" : "<varies>"}]);
				}
  		  	}
		}
		
		function browseFolders(size,browseFor,initialFolderId,cb) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/BrowseFileOrFolder/BrowseFileOrFolder.html',
			      controller: 'BrowseFileOrFolderController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			      size: size,
			      resolve: {
			    	  resources : function () {
			    		  return {
			    			  "source" : browseFor === "ActionItemSync" ? vm.sourceCopy[0] : undefined,
			    			  "folderId" :  !_.isEmpty(initialFolderId) ? initialFolderId : (!_.isEmpty(vm.selectedDefaultFolder.id) ? vm.selectedDefaultFolder.id : appdata.rootFolder.id),
			    			  "btnLable" : "SELECT",
			    			  "action" : browseFor === "ActionItemSync" ? "Action Item Sync" : "Browse For TS Default",
			    			  "enableAction" : "Folder",
			    			  "disableDocuments" : true,
			    			  "validateFolderPerms" : true,
			    			  "supportMultiSelectDoc" : false,
			    			  "supportMultiSelectFolder" : false,
			    			  "showAddFolder" : true,
			    			  "showNewDoc" : false,
			    			  "showUploadDoc" : false
			    		  };
			    	  },
			    	  foldersList : function() {
			    		  var folderList = [];
			    		  if(!_.isEmpty(initialFolderId)) {
			    			  folderList = DocFactory.getDocsUnderFolder(initialFolderId);
			    		  } else if(!_.isEmpty(vm.selectedDefaultFolder.id)) {
			    			  folderList = DocFactory.getDocsUnderFolder(vm.selectedDefaultFolder.id);
			    		  } else {
			    			  folderList = DocFactory.getDocsUnderFolder(appdata.rootFolder.id);
			    		  }
			    		  return folderList;
			    	  }
			      }
			});
			modalInstance.result.then(function (data) {
				if(browseFor === "ActionItemSync") {
					if(typeof cb === "function"){
						cb(data);
					}
				} else {
					vm.selectedDefaultFolder.id = data.moveTo.id;
					if(data.moveTo.isLink) {
						vm.selectedDefaultFolder.id = data.moveTo.linkSourceFolderId;
					}
					getHierarchy(vm.selectedDefaultFolder.id,function(docHierarchy) {
		    			vm.folderHierarchy = docHierarchy;
		    		});
				}
			}, function () {
				if(browseFor === "ActionItemSync") {
					cancel();
				}
			});
		}
	    function cancel() {
			 $uibModalInstance.dismiss('cancel');
	    }
		
	    function ok() {
	    	if(vm.sourceCopy.length == 1) {
	    		if(!_.isEmpty(vm.taskSpaceName)) {
		    		vm.sourceCopy[0].name = vm.taskSpaceName;
				}
		    }
	    	for(var i= 0; i < vm.sourceCopy.length;i++) {
	    		delete vm.sourceCopy[i].selected;
 			   	if(vm.selectedTicker.tickerObj.ticker != '<varies>') {
 			   		vm.sourceCopy[i].tickers = [vm.selectedTicker.tickerObj.ticker];
 			   	}
				if(vm.sourceCopy.length == 1) {
 			   		vm.sourceCopy[i].autoSummarize = vm.isAutoSummarize;
					if(vm.isAutoSummarize) {
						vm.sourceCopy[i].autoSummarizeUsing = vm.autoSummarizeOption.name;
					} else {
						vm.sourceCopy[i].autoSummarizeUsing = null;
					}
 			   	}
 			   	if(vm.selectedDefaultFolder.id != '<varies>') {
 			   		vm.sourceCopy[i].defaultFolderId = vm.selectedDefaultFolder.id;
 			   	}
 			}
 		   	if(vm.selectedTicker.tickerObj.ticker != '<varies>') {
 		   		$uibModalInstance.close({"modified":vm.sourceCopy,"original":source});
 		   	} else{
 				cancel();
 		   	}
	    }
	    
	    function getActionItemSync() {
	    	ActionItemsService.getActionItemSync(vm.sourceCopy[0].clientId,vm.sourceCopy[0].id).then(function(resp) {
	    		if(resp.status == 200 && resp.data.Status) {
	    			vm.TaskSync = resp.data.TaskSync;
	    			if(!_.isEmpty(vm.TaskSync)){
	    				DocFactory.getDocHierarchy(vm.TaskSync.folderId,function(docHierarchy) {
							vm.TaskSync.fldrHierarchy = docHierarchy;
						});
	    			}
	    		}
			});
	    }
	    
	    function showSyncActionItemBtn() {
	    	var status = false;
	    	if(vm.sourceCopy.length == 1) {
	    		if(vm.sourceCopy[0].owner === appdata["UserId"] && _.isEmpty(vm.TaskSync)) {
	    			status = true;
				}
		    }
	    	return status;
	    }
	    
	    function showSyncActionItemInfo() {
	    	var status = false;
	    	if(vm.sourceCopy.length == 1) {
	    		if(vm.sourceCopy[0].owner === appdata["UserId"] && !_.isEmpty(vm.TaskSync)) {
	    			status = true;
				}
		    }
	    	return status;
	    }
	    
	    function removeSyncActionItem() {
	    	ActionItemsService.removeActionItemSync(vm.sourceCopy[0].clientId,vm.sourceCopy[0].id).then(function(resp) {
	    		if(resp.status == 200 && resp.data.Status) {
	    			MessageService.showSuccessMessage("ACTION_ITEM_SYNC_RM_WITH_TS");
	    			vm.TaskSync = {};
	    		}
			});
	    }
	    
	    function syncActionItem() {
	    	if(vm.sourceCopy.length == 1) {
	    		if(_.isEmpty(vm.TaskSync)) {
	    			browseFolders("lg","ActionItemSync",appdata.rootFolder.id,function(TaskSync){
	    				vm.TaskSync = TaskSync;
	    				MessageService.showSuccessMessage("ACTION_ITEM_SYNC_WITH_TS");
	    			});
				}
	    	}
	    }
	    
	    function init() {
	    	if(vm.sourceCopy.length == 1 && !_.isEmpty(vm.source[0])) {
	    		vm.taskSpaceName = angular.copy(vm.source[0].name);
	    		if(!_.isEmpty(vm.source[0].defaultFolderId)) {
		    		getHierarchy(vm.source[0].defaultFolderId,function(docHierarchy) {
		    			vm.sourceFolderHierarchy = docHierarchy;
			    	});
		    	}
		    	vm.isAutoSummarize = angular.copy(vm.source[0].autoSummarize);
		    	if(vm.isAutoSummarize) {
					if(!_.isEmpty(vm.source[0].autoSummarizeUsing)) {
						vm.autoSummarizeOption = _.findWhere(vm.autoSummarizeOptionsList,{name:vm.source[0].autoSummarizeUsing});
					}
				}
	    		if(vm.sourceCopy[0].owner === appdata["UserId"]) {
	    			getActionItemSync();
				}
	    	} else if(vm.sourceCopy.length > 1){
	    		vm.taskSpaceName = "<varies>";
	    		vm.multiTaskSpaceTicker = selectedTickerObj();
	    		vm.selectedDefaultFolder.id = selectedDefaultFolderId();
				getHierarchy(vm.selectedDefaultFolder.id,function(docHierarchy) {
					vm.sourceFolderHierarchy = docHierarchy;
	    		});
	    	}
	    	
	    }
	    init();
	}
})();