;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('BrowseFromEvernotesController',BrowseFromEvernotesController);
	
	BrowseFromEvernotesController.$inject = ['$scope','$uibModal', '$uibModalInstance',
	                                         'MessageService','fileInfo','noteBooksList',
	                                         'EvernoteService','_','TaskSpaceService',
	                                         'APIUserMessages','$confirm','orderByFilter',
	                                         'userService'];

	function BrowseFromEvernotesController($scope,$uibModal,$uibModalInstance,
			MessageService,fileInfo,noteBooksList,EvernoteService,_,TaskSpaceService,
			APIUserMessages,$confirm,orderByFilter,userService) {
		var vm = this;
		
		// Instance variables
		vm.fileInfo = fileInfo;
		vm.noteOrNotebookSearchString = "";
		vm.noteBooksList = noteBooksList.noteBooksList;
		vm.noteList = [];
		vm.currntNoteBook = {};
		vm.selectedNotes = [];
		vm.noteBooksListHeaders = EvernoteService.noteBooksListHeaders;
		vm.noteBooksField =  userService.getUiState("evernotebooksort").stateValue ? userService.getUiState("evernotebooksort").stateValue.field : "updatedDate";
		vm.noteBooksFieldDecending = userService.getUiState("evernotebooksort").stateValue ? userService.getUiState("evernotebooksort").stateValue.decending : true;
		vm.supportMultiSelectNoteBooks = false;
		
		vm.noteListHeaders = EvernoteService.noteListHeaders;
		vm.noteField =  userService.getUiState("evernotesort").stateValue ? userService.getUiState("evernotesort").stateValue.field : "updatedDate";
		vm.noteFieldDecending = userService.getUiState("evernotesort").stateValue ? userService.getUiState("evernotesort").stateValue.decending : true;
		vm.supportMultiSelectNote = true;
		vm.checkAllNotes = {"selected":false};
		
		// Methods
		vm.getNotebookListCount = getNotebookListCount;
		vm.getNoteListCount = getNoteListCount;
		vm.noteOrNotebookSearchFilter = noteOrNotebookSearchFilter;
		vm.openEvernotes = openEvernotes;
		vm.openNoteBook = openNoteBook;
		vm.selectNote = selectNote;
		vm.isSelectedNote = isSelectedNote;
		vm.enableOpen = enableOpen;
		
		vm.selectColumn = selectColumn;
		vm.sortByfield = sortByfield;
		vm.selectAllNotes = selectAllNotes;
		
		vm.ok = ok;
		vm.cancel = cancel;
		
		function getNotebookListCount() {
			var shownedNotebooksCount = $('#notebooks-table tbody tr.notebook-row').length;
			return shownedNotebooksCount;
		}
		
		function getNoteListCount() {
			var shownedNotesCount = $('#notes-table tbody tr.note-row').length;
			return shownedNotesCount;
		}
		
		function noteOrNotebookSearchFilter(noteOrNotebook,type) {
			var status = false;
			var noteOrNotebookListHeaders = [];
			if(type == "noteBook") {
				noteOrNotebookListHeaders = vm.noteBooksListHeaders;
			}
			if(type == "note") {
				noteOrNotebookListHeaders = vm.noteListHeaders;
			}
			for(var i=0;i<noteOrNotebookListHeaders.length;i++) {
				var noteOrNotebookHeader = noteOrNotebookListHeaders[i];
				var fieldValue = noteOrNotebook[noteOrNotebookHeader.DValue];
				if(vm.noteOrNotebookSearchString.trim() == "" || 
						(noteOrNotebookHeader.checked && noteOrNotebookHeader.type != "Date" && 
								fieldValue && _.isString(fieldValue)&& fieldValue.toLowerCase().indexOf(vm.noteOrNotebookSearchString.toLowerCase()) != -1)) {
					status = true;
					break;
				}
			}
			return status;
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
		};
		
		function sortByfield (hdr,type) {
	    	switch(type) {
	    	case "noteBooks":
	    		if(vm.noteBooksField == hdr.value) {
	    			vm.noteBooksFieldDecending = !vm.noteBooksFieldDecending;
	    		} else {
	    			vm.noteBooksFieldDecending = false;
	    		}
	    		vm.noteBooksField =  hdr.value;
	    		vm.noteBooksList =  orderByFilter(vm.noteBooksList, vm.noteBooksField, vm.noteBooksFieldDecending);
	    		userService.setUiState("evernotebooksort",{field:vm.noteBooksField,decending:vm.noteBooksFieldDecending});
	    		break;
	    	case "note":
	    		if(vm.noteField == hdr.value) {
	    			vm.noteFieldDecending =  !vm.noteFieldDecending;
	    		} else {
	    			vm.noteFieldDecending = false;
	    		}
	    		vm.noteField =  hdr.value;
	    	    vm.noteList =  orderByFilter(vm.noteList, vm.noteField, vm.noteFieldDecending);
	    	    userService.setUiState("evernotesort",{field:vm.noteField,decending:vm.noteFieldDecending});
	    		break;
	    	}
	    }
		
		function selectAllNotes() {
			angular.forEach(vm.noteList, function(itm){ 
    			itm.selected = vm.checkAllNotes.selected;
    			vm.selectedNotes = _.reject(vm.selectedNotes, function(obj){ 
	    			return obj.id == itm.id; 
	    		});
    		});
	    	if(vm.checkAllNotes.selected) {
	    		angular.forEach(vm.noteList, function(note){ 
					note.selected = vm.checkAllNotes.selected;
	    			vm.selectedNotes.push(note);
	    		});
	    	}
		}
		
		function openEvernotes() {
			vm.currntNoteBook = {};
			EvernoteService.getNotebookList().then(function (resp) {
				if(resp.status == 200 && resp.data.Status) {
					vm.noteList = [];
					vm.noteBooksList = resp.data.NoteBooks;
					vm.noteBooksList =  orderByFilter(vm.noteBooksList, vm.noteBooksField, vm.noteBooksFieldDecending);
				}
			});
		}
		
		function openNoteBook(noteBook) {
			vm.currntNoteBook = noteBook;
			
			EvernoteService.getNoteList(noteBook.guid).then(function (resp) {
				if(resp.status == 200 && resp.data.Status) {
					vm.noteBooksList = [];
					vm.noteList = resp.data.Notes;
					vm.noteList =  orderByFilter(vm.noteList, vm.noteField, vm.noteFieldDecending);
				}
			});
		}
		
		function selectNote(note) {
			
			if(_.isEmpty(vm.selectedNotes)) {
				vm.selectedNotes.push(note);
	    	} else {
	    		var isSNote = _.findWhere(vm.selectedNotes,{"guid":note.guid});
	    		if(isSNote) {
	    			vm.selectedNotes = _.reject(vm.selectedNotes, function(sNote){ 
	    				return sNote.guid == note.guid; 
		    		});
	    		} else{
	    			vm.selectedNotes.push(note);
	    		}
	    	}
			if(vm.selectedNotes.length > 0 && vm.noteList.length == vm.selectedNotes.length) {
				vm.checkAllNotes.selected = true;
			} else {
				vm.checkAllNotes.selected = false;
			}
		}
		
		function isSelectedNote(note) {
			var status = false;
			var isSNote = _.findWhere(vm.selectedNotes,{"guid":note.guid});
			if(isSNote) {
				status = true;
			}
			return status;
		}
		
		function enableOpen() {
			var status = false;
			if(_.isEmpty(vm.selectedNotes)) {
				status = true;
			}
			return status;
		}
		
		function ok() {
			
			$uibModalInstance.close(vm.selectedNotes);
		}

		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function init() {
			vm.noteBooksList =  orderByFilter(vm.noteBooksList, vm.noteBooksField, vm.noteBooksFieldDecending);
		}
		init();
	}
	
})();