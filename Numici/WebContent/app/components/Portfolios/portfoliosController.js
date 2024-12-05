;(function(){
	
	'use strict';
	
	angular.module("vdvcApp").controller("portfoliosController",portfoliosController);
	
	portfoliosController.$inject = ['$state','$scope','_','$uibModal','$confirm','appData','orderByFilter',
	                                'PortfolioService','userService','MessageService','commonService',
	                                '$timeout','$deviceInfo',"AdvSearchService","$stateParams"];
	
	function portfoliosController($state,$scope,_,$uibModal,$confirm,appData,orderByFilter,
			PortfolioService,userService,MessageService,commonService,$timeout,$deviceInfo,AdvSearchService,$stateParams){
		
		var pc = this;
		var appdata = appData.getAppData();
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		var shareNotificationTimer;
		pc.deviceInfo = $deviceInfo;
		pc.portfolioListHeaders = PortfolioService.portfolioListHeaders;
		pc.portfolioActionProps = PortfolioService.portfolioActionProps;
		pc.view = userService.getUiState("portfoliosview").stateValue ? userService.getUiState("portfoliosview").stateValue : "Grid";
		pc.portfolios = [];
		pc.portfolioField =  userService.getUiState("portfoliosort").stateValue ? userService.getUiState("portfoliosort").stateValue.field : "name";
	    pc.portfolioFieldDecending = userService.getUiState("portfoliosort").stateValue ? userService.getUiState("portfoliosort").stateValue.decending : false;
	    pc.checkedItems = [];
	    pc.checkAllPortfolios = {"selected":false};
	    pc.animationsEnabled = true;
	    
		pc.isEnabled = isEnabled;
		pc.switchView = switchView;
		pc.getAllPortfolios = getAllPortfolios;
		pc.showGridCheckbox = showGridCheckbox;
		pc.unselectAll = unselectAll;
		pc.checkPortfolio = checkPortfolio;
		pc.onLongPress = onLongPress;
		pc.selectAllPortfolios = selectAllPortfolios;
		pc.sortByfield = sortByfield;
		pc.openPortfolio = openPortfolio;
		pc.OpenCreatePortfolioModal = OpenCreatePortfolioModal;
		pc.executePortfolioAction = executePortfolioAction;
		/*pc.getPortfolioById = getPortfolioById;
		pc.updatePortfolioById = updatePortfolioById;
		pc.deletePortfolioById = deletePortfolioById;
		pc.getPortfoliosByTicker = getPortfoliosByTicker;*/
		
		$scope.$on("PORTFOLIOS_LIST_CHANGED", function(event, data) {
	    	if(data && data.eventData) {
	    		getAllPortfolios();
			}
		});
		
		function isOwner(portfolio) {
	    	var status = false;
	    	if(portfolio.createdBy && portfolio.createdBy.toLowerCase() ===  appdata.UserId.toLowerCase()) {
	    		status = true;
	    	} else if(portfolio.PortfolioInfo && portfolio.PortfolioInfo.createdBy && portfolio.PortfolioInfo.createdBy.toLowerCase() ===  appdata.UserId.toLowerCase()) {
	    		status = true;
	    	}
	    	return status;
	    }
		
		function isEnabled(btn) {
	    	var status = false;
	    	if(appdata["VDVCDocButtons"]) {
	    		var btnConfig = _.findWhere(appdata["VDVCDocButtons"],{"key": btn});
	    		if(btnConfig && btnConfig.value == "Enabled") {
	    			status = true;
	    		}
	    	}
	    	return status;
	    }
		function switchView () {
	    	pc.view = pc.view == 'Grid' ? 'List' : 'Grid';
	    	userService.setUiState("portfoliosview",pc.view);
	    }
		
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
	    
	    function getPortfolioById(portfolioId) {
			PortfolioService.getPortfolioById(portfolioId).then(function(response){
				if (response.status == 200 && response.data.Status) {
					openPortfolio(response.data.Portfolio);
				}
			});
	    } 
	  
	    	    
		function getAllPortfolios() {
			PortfolioService.getAllPortfolios().then(function(response){
				if (response.status == 200 && response.data.Status) {
					processTickersForDisplay(response.data.Portfolio);
					pc.portfolios = response.data.Portfolio;
					pc.portfolios =  orderByFilter(pc.portfolios, pc.portfolioField, pc.portfolioFieldDecending);
					if(commonService.portfolioShareNotification) {
						shareNotificationTimer = $timeout(function () {
							var match = commonService.portfolioShareNotification;
			    			if(match) {
			    				getPortfolioById(match.PortfolioId);
				    		}
			    			commonService.portfolioShareNotification = null;
			    			$timeout.cancel(shareNotificationTimer);
						});
					} else if(!_.isEmpty($stateParams.portfolioId)) {
						getPortfolioById($stateParams.portfolioId);
					}
				}
			});
		}
		
		function sortByfield (hdr) {
    		if(pc.portfolioField == hdr.value) {
    			pc.portfolioFieldDecending = !pc.portfolioFieldDecending;
    		} else {
    			pc.portfolioFieldDecending = false;
    		}
    		pc.portfolioField =  hdr.value;
    		
    		pc.portfolios =  orderByFilter(pc.portfolios, pc.portfolioField, pc.portfolioFieldDecending);
    		userService.setUiState("portfoliosort",{field:pc.portfolioField,decending:pc.portfolioFieldDecending});
	    }
		
		function showGridCheckbox (){
	    	var status = false;
	    	if(pc.checkedItems.length > 0 ) {
	    		status = true;
	    	}
	    	return status;
	    }
		
		function hideAllPortfolioActions() {
			_.each(pc.portfolioActionProps,function(portfolioAction,key) {
				portfolioAction.show = false;
			});
		}
		
		function checkPortfolioActions() {
			if(pc.checkedItems.length > 0) {
				var ownedItems = _.filter(pc.checkedItems, function(portFol) {
					return portFol.createdBy.toLowerCase() == appdata.UserId.toLowerCase();
				});
				
				if(pc.checkedItems.length == 1) {
						if((pc.checkedItems[0].perms && pc.checkedItems[0].perms.Edit) || (ownedItems.length == pc.checkedItems.length)){
							pc.portfolioActionProps.Edit.show = true;
						}
				}
				
				if(ownedItems.length == pc.checkedItems.length) {
					if(!appdata.IsSharedOrganization){
						pc.portfolioActionProps.Share.show = true;
					}
					pc.portfolioActionProps.Delete.show = true;
				} else if(!appdata.IsSharedOrganization){
					var sharableItemsLength = 0;
					_.each(pc.checkedItems,function(item) {
						if(item.createdBy.toLowerCase() == appdata.UserId.toLowerCase()) {
							sharableItemsLength++;
						} else if(item.isSharable) {
							sharableItemsLength++;
						}
					});
					if(sharableItemsLength == pc.checkedItems.length) {
						pc.portfolioActionProps.Share.show = true;
					}
				}
			} 
		}
		
		function unselectAll ($event) {
			if($event) {
				$event.stopPropagation();
			}
			
			_.each(pc.checkedItems,function(item,index) {
				item.selected = false;
			});
			hideAllPortfolioActions();
			pc.checkedItems = [];
			var checkedFolders = _.where(pc.checkedItems, {_type:"Folder"});
			var checkedDocs = _.where(pc.checkedItems, {_type:"Document"});
			
			if((pc.checkedItems.length > 0) && (pc.folders.length == pc.checkedItems.length)) {
				pc.checkAllPortfolios.selected = true;
			} else {
				pc.checkAllPortfolios.selected = false;
			}
		}
		
		function onLongPress(obj) {
			if(obj.selected) {
				obj.selected = false;
			} else {
				obj.selected = true;
			}
			checkPortfolio(obj);
		}
		
		function checkPortfolio(obj) {
			hideAllPortfolioActions();
			if(obj.selected) {
				pc.checkedItems.push(obj);
			} else {
				pc.checkedItems = _.without(pc.checkedItems, _.findWhere(pc.checkedItems, {id: obj.id}));
			}
			
			if((pc.checkedItems.length > 0) && (pc.portfolios.length == pc.checkedItems.length)) {
				pc.checkAllPortfolios.selected = true;
			} else {
				pc.checkAllPortfolios.selected = false;
			}
			checkPortfolioActions();
		}
		
		function selectAllPortfolios () {
			hideAllPortfolioActions();
	    	angular.forEach(pc.portfolios, function(itm){
    			itm.selected = pc.checkAllPortfolios.selected; 
    			pc.checkedItems = _.reject(pc.checkedItems, function(portfolio){ 
	    			return portfolio.id == itm.id; 
	    		});
    		});
	    	if(pc.checkAllPortfolios.selected) {
	    		angular.forEach(pc.portfolios, function(portfolio){
	    			portfolio.selected = pc.checkAllPortfolios.selected; 
	    			pc.checkedItems.push(portfolio);
	    		});
	    	}
	    	checkPortfolioActions();
	    }
		
	    function gotoPortfolios() {
	    	$state.go('portfolios',{"portfolioId" : ""},{reload:true});
	    }
	    
		function openEditPortfolioModal (portfolio,size) {
			var modalInstance = $uibModal.open({
				animation: pc.animationsEnabled,  
				templateUrl: 'app/components/Portfolios/Edit/EditPortfolioModal.html',
			      controller: 'EditPortfolioCtrl',
			      appendTo : $('.rootContainer'),
			      controllerAs : 'ep',
			      backdrop: 'static',
			      size: size,
			      resolve : {
			    	  portfolio : portfolio,
			    	  savedSearch : function() {
			    		  if(portfolio.PortfolioInfo.searchId) {
			    			  return  AdvSearchService.getSavedSearchCriteriaById({"id" : portfolio.PortfolioInfo.searchId,"queryFor" : "portfolio"}).then(function(result) {
			    				  if(result.status ==200 && result.data.Status) {
			    					return result.data.Search;
			    				  } else {
			    					  return null;
			    				  }
			    			  });
			    		  } else {
			    			  return null;
			    		  }
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (portfolio) {
				if(portfolio) {
					tickersArrayToString(portfolio);
					pc.portfolios = _.reject(pc.portfolios,{id:portfolio.id});
					pc.portfolios.push(portfolio);
					pc.portfolios =  orderByFilter(pc.portfolios, pc.portfolioField, pc.portfolioFieldDecending);
					pc.checkedItems = [];
					pc.checkAllPortfolios.selected = false;
					hideAllPortfolioActions();
					MessageService.showSuccessMessage("PORTFOLIO_UPDATE");
					if(!_.isEmpty($stateParams.portfolioId)) {
						delete $stateParams.portfolioId
						gotoPortfolios();
					}
				}
			}, function () {
				if(!_.isEmpty($stateParams.portfolioId)) {
					delete $stateParams.portfolioId
					gotoPortfolios();
				}
			});
		}
		
		function openViewPortfolioModal (portfolio,size) {
			var modalInstance = $uibModal.open({
				animation: pc.animationsEnabled,  
				templateUrl: 'app/components/Portfolios/View/PortfolioViewModal.html',
			      controller: 'PortfolioViewCtrl',
			      appendTo : $('.rootContainer'),
			      controllerAs : 'vm',
			      backdrop: 'static',
			      size: size,
			      resolve : {
			    	  portfolio : portfolio
			      }
			});
			modalInstance.result.then(function (portfolio) {
				if(!_.isEmpty($stateParams.portfolioId)) {
					delete $stateParams.portfolioId
					gotoPortfolios();
				}
			}, function () {
				if(!_.isEmpty($stateParams.portfolioId)) {
					delete $stateParams.portfolioId
					gotoPortfolios();
				}
			});
		}
		
		function OpenPortfolioInModal (portfolio,size) {
			var portfolioId = "";
			if(portfolio && portfolio.PortfolioInfo) {
				portfolioId = portfolio.PortfolioInfo.id;
			} else {
				portfolioId = portfolio.id;
			}
			PortfolioService.getPortfolioById(portfolioId).then(function(response){
				if (response.status == 200 && response.data.Status) {
					if(isOwner(portfolio) || (!_.isEmpty(portfolio.perms) && portfolio.perms.Edit)) {
						openEditPortfolioModal(response.data.Portfolio,size);
					} else if(!_.isEmpty(portfolio.perms) && !portfolio.perms.Edit && portfolio.perms.View) {
						openViewPortfolioModal(response.data.Portfolio,size);
					}
				} else {
					var timer = $timeout(function () {
						getAllPortfolios();
		    			$timeout.cancel(timer);
					});
				}
			});
		}
		
		function openPortfolio (portfolio) {
	    	if(!pc.showGridCheckbox()) {
	    		OpenPortfolioInModal(portfolio,'lg');
	    	} else {
	    		portfolio.selected = !portfolio.selected;
	    		pc.checkPortfolio(portfolio);
			}
	    };
	    
		function OpenCreatePortfolioModal (size) {
			var modalInstance = $uibModal.open({
				animation: pc.animationsEnabled,  
				templateUrl: 'app/components/Portfolios/Create/CreatePortfolioModal.html',
			      controller: 'CreatePortfolioCtrl',
			      appendTo : $('.rootContainer'),
			      controllerAs : 'vm',
			      backdrop: 'static',
			      size: size
			    });
			
			modalInstance.result.then(function (portfolio) {
				if(portfolio) {
					tickersArrayToString(portfolio);
					pc.portfolios.push(portfolio);
					pc.portfolios =  orderByFilter(pc.portfolios, pc.portfolioField, pc.portfolioFieldDecending);
				}
			}, function () {
			      
			});
		}
		
		function handleDeleteItemsCB(items) {
			var isDeletedFalse = _.findWhere(items,{"isDeleted" : false});
			var isDeletedTrue = _.where(items,{"isDeleted" : true});
			
			
			if(!_.isEmpty(isDeletedTrue)) {
				_.each(isDeletedTrue,function(source,index) {
					pc.portfolios = _.reject(pc.portfolios, function(portfolio){ 
		    			return portfolio.id == source.portfoilioId;
		    		});
					
					pc.checkedItems = _.reject(pc.checkedItems, function(item){ 
		    			return item.id == source.portfoilioId; 
		    		});
				});
			}
			
			if(isDeletedFalse) {
				var NoPermOnObjectList = _.where(items,{"Reason" : "NoPermOnObject"});
				var ObjectNotFoundList = _.where(items,{"Reason":"ObjectNotFound"});
				
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("DELETE_ITEMS_ERR");
				}
				
				if(!_.isEmpty(ObjectNotFoundList)) {
					MessageService.showErrorMessage("ITEMS_NOT_FOUND_DELETE");
				}
				
				
			} else {
				pc.checkedItems = [];
				pc.checkAllPortfolios.selected = false;
				hideAllPortfolioActions();
				MessageService.showSuccessMessage("DELETE_ITEMS");
				
			}
			
		}
		
		function deleteSelectedItems(items) {
			var postdata = {};
        	var portfolioList = [];
        	
        	_.each(items,function(item,index) {
        		portfolioList.push(item.id);
        	});
        	
        	postdata["portfolioList"] = portfolioList;
        	PortfolioService.deletePortfolioList(postdata).then(function(result){
				if (result.status==200 && result.data.Status) {
					handleDeleteItemsCB(result.data.Portfolio);
				}
			});
		}
		
		function deleteFromNav() {
	    	if(pc.checkedItems.length>0) {
	    		var txt = 'Are you sure you want to delete selected items ?';
				
				if(pc.checkedItems.length == 1) {
					txt = 'Are you sure you want to delete Portfolio "'+pc.checkedItems[0].name+'" ?';
				}
				$confirm({text: txt})
		        .then(function() {
		        	deleteSelectedItems(pc.checkedItems);
		        });
	    	}
	    }
		
		function handleShareCB(sharedInfo) {
			
			
			var isSharedFalse = _.findWhere(sharedInfo,{"isShared" : false});
			var isSharedTrue = _.where(sharedInfo,{"isShared" : true});
			
			
			if(!_.isEmpty(isSharedTrue)) {
				_.each(isSharedTrue,function(source,index) {
					var item = _.findWhere(pc.portfolios,{"id":source.portfoilioId});
					
					pc.checkedItems = _.reject(pc.checkedItems, function(checkedItem){ 
		    			return checkedItem.id == source.portfoilioId; 
		    		});
					item.selected = false;
					//SetSharedFlag(item);
				});
			}
			
			if(isSharedFalse) {
				var NoPermOnObjectList = _.where(sharedInfo,{"Reason" : "NoPermOnObject"});
				var ObjectNotFoundList = _.where(sharedInfo,{"Reason":"ObjectNotFound"});
				
				if(!_.isEmpty(ObjectNotFoundList)) {
					MessageService.showErrorMessage("ITEMS_NOT_FOUND_SHARE");
				} else {
					MessageService.showErrorMessage("ITEMS_NOT_SHARE");
				}
				
			} else {
				pc.checkedItems = [];
				pc.checkAllPortfolios.selected = false;
				hideAllPortfolioActions();
				MessageService.showSuccessMessage("SHARE_ITEMS");
			}
		}

		function shareFromNav(){
			var modalInstance = $uibModal.open({
				animation: pc.animationsEnabled,  
				templateUrl: 'app/components/Portfolios/Share/SharePortfolioModal.html',
			      controller: 'SharePortfolioCtrl',
			      appendTo : $('.rootContainer'),
			      controllerAs : 'sp',
			      backdrop: 'static',
			      size: 'md',
			      resolve : {portfolios : function() {
		    		  				return pc.checkedItems;
		    	  				}
			      			}
			    });
			
			modalInstance.result.then(function (sharedInfo) {
				if(!_.isEmpty(sharedInfo)) {
					handleShareCB(sharedInfo);
				}
			}, function () {
				 
			});
		}
		
		function executePortfolioAction (portfolioAction) {
			switch(portfolioAction) {
				case "Share":
		    		shareFromNav();
		    		break;	
				case "Edit":
					OpenPortfolioInModal(pc.checkedItems[0],'lg');
		    		break;
				case "Delete":
		    		deleteFromNav();
		    		break;
		    }
		}
		
		pc.getAllPortfolios();
	}
})();