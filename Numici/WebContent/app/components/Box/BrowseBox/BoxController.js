;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('BoxController',BoxController);
	
	BoxController.$inject = ['$scope','$rootScope','$uibModalInstance','_','APIUserMessages',"$timeout",'BoxService','source','$deviceInfo'];

	function BoxController($scope,$rootScope,$uibModalInstance,_,APIUserMessages,$timeout,BoxService,source,$deviceInfo) {
var self = this;
		
		var currentFolder = {};
		self.folderToSync = angular.copy(source);
		self.isSyncFolder = false;
		self.currntFolder;
		self.folders = [];
		self.fldrHierarchy = [];
		self.selectedBoxFolder = {
			"folder" : null	
		};
		
		self.openBoxFolder = openBoxFolder;
		self.openBoxRoot = openBoxRoot;
		self.unsync = unsync;
		self.cancel = cancel;
		self.ok = ok;
		self.onSelect = onSelect;
		
		function onSelect($event) {
			$event.stopPropagation();
		}
		
		function autherize() {
			BoxService.autherize();
		}
		
		function init() {
			self.isSyncFolder = false;
			self.selectedBoxFolder = {
					"folder" : null	
			};
			
			if(!_.isEmpty(self.folderToSync)) {
				var postdata = {
						"folderId": self.folderToSync.id
				};
				
				BoxService.getFolderSync(postdata).then(function(result) {
					if(result.status == 200 && result.data.Status){
						if(result.data.IsSync) {
							self.isSyncFolder = result.data.IsSync;
							self.folders.push(result.data.BoxItem);
							self.selectedBoxFolder.folder = result.data.BoxItem;
						} else {
							self.openBoxRoot();
						}
					}
				});
			}
		} 
		
		function processBoxItems(items) {
			if(_.isArray(items)) {
				self.folders = _.where(items,{"folder": true});
			}
		}
		
		function openBoxFolder(fldr) {
			self.selectedBoxFolder = {
					"folder" : null
			};
			
			if(currentFolder.id != fldr.id) {
				BoxService.getBoxFolderList(fldr.id).then(function(resp) {
					if(resp.status == 200 && resp.data.Status){
						var data = resp.data;
						if(data.OAuthErr && (data.BoxStatus == "Invalid" || data.BoxStatus == "NoAuth") ) {
							autherize();
						} else {
							updateFolderHierarchy(fldr);
							processBoxItems(data.BoxItems);
						}
		  			}
				});
			}
		}
		
		function openBoxRoot() {
			self.selectedBoxFolder = {
					"folder": null
			};
			BoxService.getRoot().then(function(resp) {
				if(resp.status == 200 && resp.data.Status){
					var data = resp.data;
					if(data.OAuthErr && (data.BoxStatus == "Invalid" || data.BoxStatus == "NoAuth") ) {
						autherize();
					} else {
						self.fldrHierarchy = [];
						processBoxItems(data.BoxItems);
					}
	  			}
			});
		}
		
		function updateFolderHierarchy(fldr) {
			var index = findFolderIndex(fldr);
			if(index == -1) {
				self.fldrHierarchy.push(fldr);
			} else {
				self.fldrHierarchy.splice(index+1,self.fldrHierarchy.length)
			}
		}
		
		function findFolderIndex(fldr) {
			var index = -1;
			for(var i=0;i<self.fldrHierarchy.length;i++) {
				if(fldr.id == self.fldrHierarchy[i].id) {
					index = i;
					break;
				}
			} 
			
			return index;
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function unsync(keepFiles) {
			if(!_.isEmpty(self.folderToSync)) {
				var postdata = {
						"folderId": self.folderToSync.id,
						"keepFiles": keepFiles,
				};
				BoxService.removeFolderSync(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						APIUserMessages.success("Unsync Successful");
						init();
					}
				});
			}
		}
		
		function ok() {
			if(!_.isEmpty(self.selectedBoxFolder.folder) && !_.isEmpty(self.folderToSync)) {
				var postdata = {
						"boxFolderId": self.selectedBoxFolder.folder.id,
						"folderId": self.folderToSync.id
				};
				if(!_.isEmpty(postdata)) {
					BoxService.setFolderSync(postdata).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							var data = resp.data;
							if(data.OAuthErr && (data.BoxStatus == "Invalid" || data.BoxStatus == "NoAuth")) {
								autherize();
							} else {
								APIUserMessages.success("Sync Successful");
								$uibModalInstance.close();
							}
						}
					});
				}
			}
		}
		init();
	}	
	
})();