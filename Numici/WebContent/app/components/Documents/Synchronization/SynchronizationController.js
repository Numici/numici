;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('SynchronizationController',SynchronizationController);
	
	SynchronizationController.$inject = ['$scope', '$uibModalInstance','source','_','MessageService','EvernoteService','$confirm','$window','$location','sessionStorage','userService','orderByFilter'];

	function SynchronizationController($scope, $uibModalInstance,source,_,MessageService,EvernoteService,$confirm,$window,$location,sessionStorage,userService,orderByFilter) {
		var vm = this;
		
		// Instance variables
		vm.source = source;
		vm.sourceCopy = angular.copy(source);
		var isFolderExist = _.findWhere(vm.sourceCopy,{"_type":"Folder"});
		vm.noteBookSearchString = "";
		vm.noteBooksList = [];
		vm.sourceNoteBookList = [];
		vm.syncedNoteBook = [];
		vm.selectedNoteBook = [];
		vm.twoWaySync = (_.isArray(vm.sourceCopy) && vm.sourceCopy.length > 0 ) ? vm.sourceCopy[0].NoteBookTwoWaySync : false;
		vm.noteBooksListHeaders = EvernoteService.noteBooksListHeaders;
		vm.noteBooksField =  userService.getUiState("evernotebooksort").stateValue ? userService.getUiState("evernotebooksort").stateValue.field : "updatedDate";
		vm.noteBooksFieldDecending = userService.getUiState("evernotebooksort").stateValue ? userService.getUiState("evernotebooksort").stateValue.decending : true;
		vm.supportMultiSelectNoteBooks = false;
		
		// Methods
		vm.getNoteBooksListCount = getNoteBooksListCount;
		vm.noteBooksSearchStringFilter = noteBooksSearchStringFilter;
		vm.selectColumn = selectColumn;
		vm.sortByfield = sortByfield;
		vm.disableSubmitBtn = disableSubmitBtn;
		vm.setFolderSync = setFolderSync;
		vm.removeFolderSync = removeFolderSync;
		vm.selectNoteBookToSync = selectNoteBookToSync;
		vm.cancel = cancel;
		
		function getNoteBooksListCount() {
			var shownedFoldersCount = $('#notebooks-table tbody tr.notebook-row').length;
			return shownedFoldersCount;
		}
		
		function noteBooksSearchStringFilter(notebook) {
			var status = false;
			for(var i=0;i<vm.noteBooksListHeaders.length;i++) {
				var noteBookHeader = vm.noteBooksListHeaders[i];
				var fieldValue = notebook[noteBookHeader.DValue];
				if(vm.noteBookSearchString.trim() == "" || 
						(noteBookHeader.checked && noteBookHeader.type != "Date" && 
								fieldValue && _.isString(fieldValue)&& fieldValue.toLowerCase().indexOf(vm.noteBookSearchString.toLowerCase()) != -1)) {
					status = true;
					break;
				}
			}
			return status;
		}
		
		function getNotebookList() {
			EvernoteService.getNotebookList().then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					if(!resp.data.OAuthErr) {
						vm.sourceNoteBookList = resp.data.NoteBooks;
			    		vm.noteBooksList = angular.copy(vm.sourceNoteBookList);
			    		userService.setUiState("evernotebooksort",{field:vm.noteBooksField,decending:vm.noteBooksFieldDecending});
			    		vm.syncedNoteBook = [];
						if(vm.sourceCopy[0].NoteBookGuids && vm.sourceCopy[0].NoteBookGuids.length > 0 && vm.sourceNoteBookList.length > 0) {
							vm.selectedNoteBook.push(_.findWhere(vm.sourceNoteBookList,{"guid":vm.sourceCopy[0].NoteBookGuids[0]}));
							vm.syncedNoteBook.push(_.findWhere(vm.sourceNoteBookList,{"guid":vm.sourceCopy[0].NoteBookGuids[0]}));
							vm.noteBooksList = [];
						}
						
					} else {
						var confirmText = "";
						switch(resp.data.EverNoteStatus) {
							case "NoAuth" :
								confirmText = "Your evernote account is not authorized with 'numici'. Do you want to Authorize to access your Evernote account";
								break;
							case "Invalid" :
								confirmText = "Authentication token is not valid. Do you want to Re-Authorize to access your Evernote account";
								break;
							case "Expired" :
								confirmText = "User authentication time expired. Do you want to Re-Authorize to access your Evernote account";
								break;
						}
							
			    		$confirm({text: confirmText})
				        .then(function() {
				        	var postdata = {"redirectURL" : $location.$$absUrl};
				        	EvernoteService.requestUserAuthrization(postdata).then(function(resp){
				        		if(resp.status == 200 && resp.data.authUrl) {
				    				var syncSessionLocal = {};
				    				syncSessionLocal["selectedFolder"] = vm.sourceCopy[0];
				    				sessionStorage.setItem("setFolderSyncSession",JSON.stringify(syncSessionLocal));
				    				$window.location.href=resp.data.authUrl;
				    			}	
				    		});
					    });
					}
				} else {
		    		vm.noteBooksList = [];
		    	}
		    });
		}
		
		function selectColumn (hdr,hdrList){
			var selectedColumns = _.where(hdrList,{"checked" : true});
			 if(hdr.checked) {
				 if(!_.isEmpty(selectedColumns) && selectedColumns.length > 1) {
					 hdr.checked = false;
				 }
			 } else {
				 hdr.checked = true;
			}
		}
		
		function sortByfield (hdr) {
			if(vm.noteBooksField == hdr.value) {
    			vm.noteBooksFieldDecending = !vm.noteBooksFieldDecending;
    		} else {
    			vm.noteBooksFieldDecending = false;
    		}
    		vm.noteBooksField =  hdr.value;
    		vm.noteBooksList =  orderByFilter(vm.noteBooksList, vm.noteBooksField, vm.noteBooksFieldDecending);
    		userService.setUiState("evernotebooksort",{field:vm.noteBooksField,decending:vm.noteBooksFieldDecending});
	    }
		
		function disableSubmitBtn() {
			var status = true;
			/*if(_.isEmpty(vm.syncedNoteBook) && !_.isEmpty(vm.selectedNoteBook)) {
				status = false;
			} else if(!_.isEmpty(vm.syncedNoteBook) && !_.isEmpty(vm.sourceCopy)) {
				if(vm.sourceCopy[0].NoteBookTwoWaySync != undefined && vm.sourceCopy[0].NoteBookTwoWaySync != vm.twoWaySync) {
					status = false;
				} else if(vm.sourceCopy[0].NoteBookTwoWaySync == undefined && vm.twoWaySync) {
					status = false;
				}
			}*/
			if(!_.isEmpty(vm.selectedNoteBook)) {
				status = false;
			}
			return status;
		}
		
		function setFolderSync(evernotebooks) {
			if(vm.selectedNoteBook[0]) {
				var postdata = {
						folderId:vm.sourceCopy[0].id, 
						noteBookGuid:vm.selectedNoteBook[0].guid,
						twoWaySync : vm.twoWaySync
				};
				EvernoteService.setFolderSync(postdata).then(function(resp){
					if(resp.status == 200 && resp.data.Status) {
						vm.syncedNoteBook = vm.selectedNoteBook[0];
						source[0].isSyncedWithEvernote = true;
						source[0].NoteBookGuids = [postdata.noteBookGuid];
						source[0].selected = false;
						source[0].NoteBookTwoWaySync = postdata.twoWaySync;
						MessageService.showSuccessMessage("FOLDER_CONNECTED_WITH_EVERNOTE",[vm.selectedNoteBook[0].name]);
						$uibModalInstance.close(source);
			    	} 
			    });
			}
		}
		
		function removeFolderSync() {
			if(vm.sourceCopy[0].isSyncedWithEvernote) {
				var txt = "Are you sure you want to remove Evernote Notebook synchronization from "+vm.sourceCopy[0].name+" ?";
				$confirm({text: txt})
		        .then(function() {
		        	var postdata = {folderId:vm.sourceCopy[0].id};
					EvernoteService.removeFolderSync(postdata).then(function(resp){
						if(resp.status == 200 && resp.data.Status) {
							vm.syncedNoteBook = [];
							vm.twoWaySync = false;
							vm.selectedNoteBook = [];
							vm.noteBooksList = angular.copy(vm.sourceNoteBookList);
							delete vm.sourceCopy[0]["NoteBookGuids"];
							delete source[0]["NoteBookGuids"];
							vm.sourceCopy[0].isSyncedWithEvernote = false;
							source[0].isSyncedWithEvernote = vm.sourceCopy[0].isSyncedWithEvernote;
							MessageService.showSuccessMessage("REMOVE_FOLDER_SYNC_EVERNOTE");
				    	} 
				    });
		        },function (){
		        	vm.syncedNoteBook = [];
					if(vm.sourceCopy[0].NoteBookGuids && vm.sourceCopy[0].NoteBookGuids.length > 0 && vm.sourceNoteBookList.length > 0) {
						vm.syncedNoteBook.push(_.findWhere(vm.sourceNoteBookList,{"guid":vm.sourceCopy[0].NoteBookGuids[0]}));
					}
		        });
			} else {
				vm.noteBooksList = angular.copy(vm.sourceNoteBookList);
			}
		}
		
		function selectNoteBookToSync(noteBook) {
			var isNoteBookSelected = _.any(vm.selectedNoteBook, function(item){ 
				return _.isEqual(item, _.findWhere(vm.selectedNoteBook, {
					guid: noteBook.guid
				}));
			});
			if(isNoteBookSelected) {
				vm.selectedNoteBook = _.without(vm.selectedNoteBook, _.findWhere(vm.selectedNoteBook, {
					guid: noteBook.guid
				}));
				noteBook.selected = false;
				vm.selectedNoteBook = [];
			} else {
				if(!vm.supportMultiSelectNoteBooks && !_.isEmpty(vm.selectedNoteBook)) {
					_.each(vm.selectedNoteBook, function(selectedFolder){
						selectedFolder.selected = false;
					});
					vm.selectedNoteBook = [];
				}
				noteBook.selected = true;
				vm.selectedNoteBook.push(noteBook);
			}
		}
		
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		getNotebookList();
	}	
	
})();