
;(function(){
	'use strict';
	
	angular.module("vdvcApp").controller('OneDriveController',OneDriveController);
	
	OneDriveController.$inject = ['$scope','$rootScope','$uibModalInstance','_','APIUserMessages',"$timeout",'OneDriveService','oneDriveRoot','$deviceInfo'];
	
	function OneDriveController($scope,$rootScope,$uibModalInstance,_,APIUserMessages,$timeout,OneDriveService,oneDriveRoot,$deviceInfo) {
			
			var odc = this;
			
			var currentFolder = {};
			odc.currntFolder;
			odc.folders = [];
			odc.documents = [];
			odc.fldrHierarchy = [];
			odc.checkedItems = [];
			
			odc.openDriveFolder = openDriveFolder;
			odc.openOneDrive = openOneDrive;
			odc.showGridCheckbox = showGridCheckbox;
			odc.checkFolderOrFile = checkFolderOrFile;
			odc.cancel = cancel;
			odc.ok = ok;
			odc.isIndexedDocs = isIndexedDocs;
			odc.dropFromIndex = dropFromIndex;
			
			
			function autherize() {
				OneDriveService.autherize();
			}
			
			function init(resp) {
				if(resp.status == 200 && resp.data.Status){
					var data = resp.data;
					if(data.OAuthErr && (data.OneDriveStatus == "Invalid" || data.OneDriveStatus == "NoAuth") ) {
						autherize();
					} else {
						processDriveItems(data.Items);
					}
	  			}
			} 
			
			function processDriveItems(items) {
				if(_.isArray(items)) {
					odc.folders = _.where(items,{"folder": true});
					odc.documents = _.where(items,{"folder": false});
					_.each(odc.documents,function(doc,indx) {
						OneDriveService.setIcon(doc);
					});
					
				}
			}
			
			function openDriveFolder(fldr) {
				odc.checkedItems = [];
				
				if(currentFolder.id != fldr.id) {
					OneDriveService.openFolder(fldr.id).then(function(resp) {
						if(resp.status == 200 && resp.data.Status){
							var data = resp.data;
							if(data.OAuthErr && (data.OneDriveStatus == "Invalid" || data.OneDriveStatus == "NoAuth") ) {
								autherize();
							} else {
								updateFolderHierarchy(fldr);
								processDriveItems(data.Items);
							}
			  			}
					});
				}
			}
			
			function openOneDrive() {
				odc.checkedItems = [];
				OneDriveService.getRoot().then(function(resp) {
					if(resp.status == 200 && resp.data.Status){
						var data = resp.data;
						if(data.OAuthErr && (data.OneDriveStatus == "Invalid" || data.OneDriveStatus == "NoAuth") ) {
							autherize();
						} else {
							odc.fldrHierarchy = [];
							processDriveItems(data.Items);
						}
		  			}
				});
			}
			
			function updateFolderHierarchy(fldr) {
				var index = findFolderIndex(fldr);
				if(index == -1) {
					odc.fldrHierarchy.push(fldr);
				} else {
					odc.fldrHierarchy.splice(index+1,odc.fldrHierarchy.length)
				}
			}
			
			function findFolderIndex(fldr) {
				var index = -1;
				for(var i=0;i<odc.fldrHierarchy.length;i++) {
					if(fldr.id == odc.fldrHierarchy[i].id) {
						index = i;
						break;
					}
				} 
				
				return index;
			}
			
			function showGridCheckbox(){
		    	var status = false;
		    	if(odc.checkedItems.length > 0 || $deviceInfo.isTouch) {
		    		status = true;
		    	}
		    	return status;
		    }
			
			
			function checkFolderOrFile(obj) {
				if(obj.selected) {
					odc.checkedItems.push(obj);
				} else {
					odc.checkedItems = _.without(odc.checkedItems, _.findWhere(odc.checkedItems, {id: obj.id}));
				}
			}
			
			function cancel() {
				$uibModalInstance.dismiss('cancel');
			}
			
			function isIndexedDocs() {
				var nonIndexedDocs = _.where(odc.checkedItems,{"indexed":false});
				if(_.isEmpty(odc.checkedItems) || !_.isEmpty(nonIndexedDocs)) {
					return true;
				} else {
					return false;
				}
			}
			
			function dropFromIndex() {
				var postdata = _.pluck(odc.checkedItems, 'id');
				if(!_.isEmpty(postdata)) {
					OneDriveService.deleteFromIndex(postdata).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							var data = resp.data;
							if(data.OAuthErr && (data.OneDriveStatus == "Invalid" || data.OneDriveStatus == "NoAuth") ) {
								autherize();
							} else {
								var nonDropped = _.where(data.Results,{"isDeleted":false});
								var dropped = _.where(data.Results,{"isDeleted":true});
								if(!_.isEmpty(dropped)) {
									updateIndexvalue(dropped,false);
								}
								
								if(!_.isEmpty(nonDropped)) {
									APIUserMessages.error("Selected docs are not Deleted form Index");
								} else {
									APIUserMessages.success("Selected docs are Deleted form Index");
									//$uibModalInstance.close();
								}
							}
						}
					});
				}
			}
			
			function ok() {
				
				var postdata = _.pluck(odc.checkedItems, 'id');
				if(!_.isEmpty(postdata)) {
					OneDriveService.index(postdata).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							var data = resp.data;
							if(data.OAuthErr && (data.OneDriveStatus == "Invalid" || data.OneDriveStatus == "NoAuth") ) {
								autherize();
							} else {
								var nonIndexedDocs = _.where(data.Results,{"isIndexed":false});
								var IndexedDocs = _.where(data.Results,{"isIndexed":true});
								if(!_.isEmpty(IndexedDocs)) {
									updateIndexvalue(IndexedDocs,true);
								}
								
								if(!_.isEmpty(nonIndexedDocs)) {
									APIUserMessages.error("Selected docs are not indexed");
								} else {
									APIUserMessages.success("Selected docs are indexed");
									//$uibModalInstance.close();
								}
							}
						}
					});
				}
				
			}
			
			function updateIndexvalue(items,value) {
				if(items) {
					_.each(items,function(obj,index) {
						var item = _.findWhere(odc.checkedItems, {id: obj.id});
						if(item) {
							item.indexed = value;
							item.selected = false;
							odc.checkedItems = _.without(odc.checkedItems,item);
						}
					});
				}
			}
			
			init(oneDriveRoot);
	}
})();

