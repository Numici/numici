;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('BrowseOnenoteController',BrowseOnenoteController);
	
	BrowseOnenoteController.$inject = ['$state','$rootScope','$scope','$uibModal', '$uibModalInstance',
                                       'MessageService','DigestLinkinfo',"DigestContent",'noteBookList',
                                       'OnenoteService','_','TaskSpaceService',
                                       'APIUserMessages','VDVCConfirmService','orderByFilter',
                                       'userService','$timeout','$q'];

	function BrowseOnenoteController($state,$rootScope,$scope,$uibModal,$uibModalInstance,
			MessageService,DigestLinkinfo,DigestContent,noteBookList,OnenoteService,_,TaskSpaceService,
			APIUserMessages,VDVCConfirmService,orderByFilter,userService,$timeout,$q) {
		
		var bonc = this;
		var windowClass = "";
		
		bonc.showLoader = true;
		bonc.pageOrSectionOrNotebookSearchString = "";
		bonc.noteBookList = [];
		bonc.sectionList = [];
		bonc.pageList = [];
		bonc.currntNoteBook = {};
		bonc.currntSection = {};
		bonc.selectedPages = [];
		bonc.noteBookListHeaders = OnenoteService.noteBookListHeaders;
		bonc.noteBookField =  userService.getUiState("onenotebooksort").stateValue ? userService.getUiState("onenotebooksort").stateValue.field : "lastModifiedDateTime";
		bonc.noteBookFieldDecending = userService.getUiState("onenotebooksort").stateValue ? userService.getUiState("onenotebooksort").stateValue.decending : true;
		bonc.supportMultiSelectNoteBooks = false;
		
		bonc.sectionListHeaders = OnenoteService.sectionListHeaders;
		bonc.sectionField =  userService.getUiState("onenotesectionsort").stateValue ? userService.getUiState("onenotesectionsort").stateValue.field : "lastModifiedDateTime";
		bonc.sectionFieldDecending = userService.getUiState("onenotesectionsort").stateValue ? userService.getUiState("onenotesectionsort").stateValue.decending : true;
		bonc.supportMultiSelectSections = false;
		
		bonc.pageListHeaders = OnenoteService.pageListHeaders;
		bonc.pageField =  userService.getUiState("onenotepagesort").stateValue ? userService.getUiState("onenotepagesort").stateValue.field : "lastModifiedDateTime";
		bonc.pageFieldDecending = userService.getUiState("onenotepagesort").stateValue ? userService.getUiState("onenotepagesort").stateValue.decending : true;
		bonc.supportMultiSelectPages = false;
		bonc.isServiceCallInProgress = false;
		
		// Methods
		bonc.getNotebookListCount = getNotebookListCount;
		bonc.getSectionListCount = getSectionListCount;
		bonc.getPageListCount = getPageListCount;
		bonc.pageOrSectionOrNotebookSearchFilter = pageOrSectionOrNotebookSearchFilter;
		bonc.openOnenotes = openOnenotes;
		bonc.openNoteBook = openNoteBook;
		bonc.openSection = openSection;
		bonc.selectPage = selectPage;
		bonc.viewPage = viewPage;
		bonc.disableAppendToPageBtn = disableAppendToPageBtn;
		bonc.disableOverridePageBtn = disableOverridePageBtn;
		bonc.appendToPage = appendToPage;
		bonc.overridePage = overridePage;
		bonc.selectColumn = selectColumn;
		bonc.sortByfield = sortByfield;
		
		bonc.showOnenotePageButton = showOnenotePageButton;
		bonc.createNotebook = createNotebook;
		bonc.createSection = createSection;
		bonc.createPage = createPage;
		bonc.cancel = cancel;
		
		function getNotebookListCount() {
			var shownedNotebooksCount = $('#notebooks-table tbody tr.notebook-row').length;
			return shownedNotebooksCount;
		}
		
		function getSectionListCount() {
			var shownedSectionsCount = $('#sections-table tbody tr.section-row').length;
			return shownedSectionsCount;
		}
		
		function getPageListCount() {
			var shownedPagesCount = $('#pages-table tbody tr.page-row').length;
			return shownedPagesCount;
		}
		
		function pageOrSectionOrNotebookSearchFilter(pageOrSectionOrNotebook,type) {
			var status = false;
			var pageOrSectionOrNotebookListHeaders = [];
			if(type == "noteBook") {
				pageOrSectionOrNotebookListHeaders = bonc.noteBookListHeaders;
			}
			if(type == "section") {
				pageOrSectionOrNotebookListHeaders = bonc.sectionListHeaders;
			}
			if(type == "page") {
				pageOrSectionOrNotebookListHeaders = bonc.pageListHeaders;
			}
			for(var i=0;i<pageOrSectionOrNotebookListHeaders.length;i++) {
				var pageOrSectionOrNotebookHeader = pageOrSectionOrNotebookListHeaders[i];
				var fieldValue = pageOrSectionOrNotebook[pageOrSectionOrNotebookHeader.DValue];
				if(bonc.pageOrSectionOrNotebookSearchString.trim() == "" || 
						(pageOrSectionOrNotebookHeader.checked && pageOrSectionOrNotebookHeader.type != "Date" && 
								fieldValue && _.isString(fieldValue)&& fieldValue.toLowerCase().indexOf(bonc.pageOrSectionOrNotebookSearchString.toLowerCase()) != -1)) {
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
	    	case "noteBook":
	    		if(bonc.noteBookField == hdr.value) {
	    			bonc.noteBookFieldDecending = !bonc.noteBookFieldDecending;
	    		} else {
	    			bonc.noteBookFieldDecending = false;
	    		}
	    		bonc.noteBookField =  hdr.value;
	    		bonc.noteBookList =  orderByFilter(bonc.noteBookList, bonc.noteBookField, bonc.noteBookFieldDecending);
	    		userService.setUiState("onenotebooksort",{field:bonc.noteBookField,decending:bonc.noteBookFieldDecending});
	    		break;
	    	case "section":
	    		if(bonc.sectionField == hdr.value) {
	    			bonc.sectionFieldDecending = !bonc.sectionFieldDecending;
	    		} else {
	    			bonc.sectionFieldDecending = false;
	    		}
	    		bonc.sectionField =  hdr.value;
	    		bonc.sectionList =  orderByFilter(bonc.sectionList, bonc.sectionField, bonc.sectionFieldDecending);
	    		userService.setUiState("onenotesectionsort",{field:bonc.sectionField,decending:bonc.sectionFieldDecending});
	    		break;
	    	case "page":
	    		if(bonc.pageField == hdr.value) {
	    			bonc.pageFieldDecending =  !bonc.pageFieldDecending;
	    		} else {
	    			bonc.pageFieldDecending = false;
	    		}
	    		bonc.pageField =  hdr.value;
	    	    bonc.pageList =  orderByFilter(bonc.pageList, bonc.pageField, bonc.pageFieldDecending);
	    	    userService.setUiState("onenotepagesort",{field:bonc.pageField,decending:bonc.pageFieldDecending});
	    		break;
	    	}
	    }
		
		function showOnenotePageButton(btnFor) {
			var status = false;
			if(btnFor == "notebook" && _.isEmpty(bonc.currntNoteBook)) {
				status = true;
			} else if(btnFor == "section" && !_.isEmpty(bonc.currntNoteBook) && _.isEmpty(bonc.currntSection)) {
				status = true;
			} else if(btnFor == "page" && !_.isEmpty(bonc.currntNoteBook) && !_.isEmpty(bonc.currntSection)) {
				status = true;
			}
			return status;
		}
		
		function createNotebook() {
			var modalInstance = $uibModal.open({
				  animation: true,
				  templateUrl: 'app/components/Onenote/Create/CreateNoteBook.html',
				  controller: 'CreateNoteBookController',
				  appendTo : $('.rootContainer'),
				  controllerAs: 'vm',
				  backdrop: 'static',
				  size : 'md'
			});
			modalInstance.result.then(function (notebook) {	
				bonc.noteBookList.push(notebook);
				bonc.noteBookList = orderByFilter(bonc.noteBookList, bonc.noteBookField, bonc.noteBookFieldDecending);
			});
		}
		
		function createSection() {
			var modalInstance = $uibModal.open({
				  animation: true,
				  templateUrl: 'app/components/Onenote/Create/CreateSection.html',
				  controller: 'CreateSectionController',
				  appendTo : $('.rootContainer'),
				  controllerAs: 'vm',
				  backdrop: 'static',
				  size : 'md',
				  resolve: {
					  CurrntNoteBook : function() {
						  return bonc.currntNoteBook;
					  }
				  }
			});
			modalInstance.result.then(function (section) {	
				bonc.sectionList.push(section);
				bonc.sectionList = orderByFilter(bonc.sectionList, bonc.sectionField, bonc.sectionFieldDecending);
			});
		}
		
		function createPage() {
			bonc.isServiceCallInProgress = true;
			bonc.showLoader = true;
			var postdata = {
					"notebookId" : bonc.currntNoteBook.id,
					"sectionId" : bonc.currntSection.id,
					"object" : DigestContent.object,
					"fromSource" : DigestContent.fromSource,
					"htmlContent" : DigestContent.content
			};
			
			OnenoteService.createPage(postdata).then(function(result){
				if (result.status==200 && result.data.Status) {
					var page = result.data.Data;
					page["id"] = page.pageId;
					bonc.pageList.push(page);
					bonc.pageList = orderByFilter(bonc.pageList, bonc.pageField, bonc.pageFieldDecending);
					MessageService.showSuccessMessage("CREATE_ONENOTE_PAGE",[page.title]);
				}
			}).finally(function() {
				bonc.isServiceCallInProgress = false;
				bonc.showLoader = false;
			});
		}
		
		function openOnenotes() {
			bonc.showLoader = true;
			OnenoteService.getNotebookList().then(function (resp) {
				if(resp.status == 200 && resp.data.Status) {
					bonc.sectionList = [];
					bonc.pageList = [];
					var noteBookListTemp = resp.data.Data;
					bonc.noteBookList =  orderByFilter(noteBookListTemp, bonc.noteBookField, bonc.noteBookFieldDecending);
					bonc.currntNoteBook = {};
					bonc.currntSection = {};
				}
			}).finally(function() {
				bonc.showLoader = false;
			});
		}
		
		function handleSectionListResp(noteBook,RespData) {
			bonc.noteBookList = [];
			bonc.pageList = [];
			var sectionListTemp = RespData;
			bonc.sectionList = orderByFilter(sectionListTemp, bonc.sectionField, bonc.sectionFieldDecending);
			bonc.currntSection = {};
		}
		
		function openNoteBook(noteBook,cb) {
			bonc.showLoader = true;
			OnenoteService.getSectionList(noteBook.id).then(function (resp) {
				if(resp.status == 200 && resp.data.Status) {
					if(typeof cb == "function") {
						cb(resp.data.Data);
					} else {
						handleSectionListResp(noteBook,resp.data.Data);
						bonc.showLoader = false;
					}
					bonc.currntNoteBook = noteBook;
				}
			}, function error(response) {
				bonc.showLoader = false;
			});
		}
		
		function handlePageListResp(respData) {
			bonc.noteBookList = [];
			bonc.sectionList = [];
			var pageListTemp = respData;
			bonc.pageList = orderByFilter(pageListTemp, bonc.pageField, bonc.pageFieldDecending);
		}
		
		function openSection(section,cb) {
			var deferred = $q.defer();
			bonc.showLoader = true;
			OnenoteService.getPageList(section.id).then(function (resp) {
				if(resp.status == 200 && resp.data.Status) {
					if(typeof cb == "function") {
						cb(resp.data.Data);
					} else {
						handlePageListResp(resp.data.Data);
					}
					bonc.currntSection = section;
					deferred.resolve();
				}
			}).finally(function() {
				var timer1 = $timeout(function() {
					bonc.showLoader = false;
					$timeout.cancel(timer1);
				}, 100);
			});
			return deferred.promise;
		}
		
		function selectPage(page,cb) {
			if(_.isEmpty(bonc.selectedPages)) {
				page.selected = true;
				bonc.selectedPages.push(page);
	    	} else {
	    		var isSelectedNote = _.findWhere(bonc.selectedPages,{"id":page.id});
	    		if(isSelectedNote) {
	    			bonc.selectedPages = _.reject(bonc.selectedPages, function(selectedNote){ 
	    				return selectedNote.id == page.id; 
		    		});
	    			page.selected = false;
	    		} else {
	    			bonc.selectedPages[0]["selected"] = false;
	    			bonc.selectedPages = [];
	    			page.selected = true;
	    			bonc.selectedPages.push(page);
	    		}
	    	}
			if(typeof cb == "function") {
				cb();
			}
		}
		
		function viewPage(event,page) {
			if(event) {
				event.stopPropagation();
			}
			bonc.showLoader = true;
			if($state.current.name == "sharelinks") {
				 windowClass = "onenote-viewer-modal-window";
			}
			OnenoteService.getPageContent(page.id).then(function (resp) {
				if(resp.status == 200 && resp.data.Status) {
					var cotentInfo = resp.data.Data;
					var modalInstance = $uibModal.open({
						  animation: true,
						  templateUrl: 'app/components/Onenote/View/OnenoteViewer.html',
						  controller: 'OnenoteViewerController',
						  appendTo : $('.rootContainer'),
						  controllerAs: 'onvc',
						  windowClass: windowClass,
						  backdrop: 'static',
						  size : 'lg',
						  resolve: {
							  PageInfo : function() {
								  var pageInfo = angular.copy(page);
								  pageInfo["notebookId"] = bonc.currntNoteBook.id,
								  pageInfo["sectionId"] = bonc.currntSection.id,
								  pageInfo["cotentInfo"] = cotentInfo;
								  return pageInfo;
							  },
							  DigestContent1 : function() {
								  return {"content" : DigestContent.content};
							  }
						  }
					});
					modalInstance.result.then(function (result) {	
						if($state.current.name == "sharelinks") {
							$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "onenote"});
						}
					},function () {	
						if($state.current.name == "sharelinks") {
							$rootScope.$broadcast("fit-to-popup",{"status" : "closed", "parent" : "sharelinks","fitFor" : "onenote"});
						}
					});
					modalInstance.rendered.then(function(){
						if($state.current.name == "sharelinks") {
							$rootScope.$broadcast("fit-to-popup",{"status" : "opened", "windowClass" : windowClass, "fitFor" : "onenoteViewer"});
						}
			        });
				}
			}).finally(function() {
				bonc.showLoader = false;
			});
		}
		
		function disableAppendToPageBtn() {
			var status = false;
			if(_.isEmpty(bonc.selectedPages) || bonc.isServiceCallInProgress) {
				status = true;
			}
			return status;
		}
		
		function disableOverridePageBtn() {
			var status = false;
			if(_.isEmpty(bonc.selectedPages) || bonc.isServiceCallInProgress) {
				status = true;
			}
			return status;
		}
		
		function appendToPage() {
			bonc.isServiceCallInProgress = true;
			bonc.showLoader = true;
			 var postdata = {
					 	"notebookId" : bonc.currntNoteBook.id,
						"sectionId" : bonc.currntSection.id,
						"pageId" : bonc.selectedPages[0].id,
						"object" : DigestContent.object,
						"fromSource" : DigestContent.fromSource,
						"htmlContent" : "<br><br>"+DigestContent.content
					};
				
			 OnenoteService.appendToPage(postdata).then(function(result){
				 if (result.status==200 && result.data.Status) {
					 var page = result.data.Data;
					 MessageService.showSuccessMessage("APPEND_TO_ONENOTE_PAGE");
				 }
			 }).finally(function() {
				 bonc.isServiceCallInProgress = false;
				 bonc.showLoader = false;
			 });
		 }
		 
		 function overridePage() {
			 var onenoteAuthUsrConfMsgText = "Are you sure, do you want to overwrite the page content with digest content ?";
			 var VDVCConfirmModalInstance = VDVCConfirmService.open({text : onenoteAuthUsrConfMsgText,title : "Confirm Overwrite Page"});
	    	 VDVCConfirmModalInstance.result.then(function() {
	    		 bonc.isServiceCallInProgress = true;
	    		 bonc.showLoader = true;
	    		 var postdata = {
	    				"notebookId" : bonc.currntNoteBook.id,
	 					"sectionId" : bonc.currntSection.id,
						"pageId" : bonc.selectedPages[0].id,
						"object" : DigestContent.object,
						"fromSource" : DigestContent.fromSource,
						"htmlContent" : DigestContent.content
					};
				
				 OnenoteService.overridePage(postdata).then(function(result){
					 if (result.status==200 && result.data.Status) {
						 var page = result.data.Data;
						 MessageService.showSuccessMessage("OVERWRITE_ONENOTE_PAGE");
					 }
				 }).finally(function() {
					 bonc.isServiceCallInProgress = false;
					 bonc.showLoader = false;
				 });
	    	 },function() {
   			
	    	 });
		 }
				
		function cancel() {
			$uibModalInstance.dismiss('cancel');
		}
		
		function init() {
			if(!_.isEmpty(noteBookList.userLastUsedNotebookSection)){
				var lastUsedNotebook = _.findWhere(noteBookList.noteBooks,{id : noteBookList.userLastUsedNotebookSection.notebookId});
				if(!_.isEmpty(lastUsedNotebook)){
					openNoteBook(lastUsedNotebook,function(sectionList) {
						bonc.showLoader = true;
						var lastUsedSection = _.findWhere(sectionList,{id : noteBookList.userLastUsedNotebookSection.sectionId});
						if(!_.isEmpty(lastUsedSection)) {
							openSection(lastUsedSection,function(pageList) {
								handlePageListResp(pageList);
								var lastUsedPage = _.findWhere(pageList,{id : noteBookList.userLastUsedNotebookSection.pageId});
								if(!_.isEmpty(lastUsedPage)) {
									var timer1 = $timeout(function() {
										selectPage(lastUsedPage,function() {
											bonc.showLoader = false;
										});
										$timeout.cancel(timer1);
									}, 100);
								} else {
									bonc.showLoader = false;
								}
							});
						} else {
							handleSectionListResp(lastUsedSection,sectionList);
							bonc.showLoader = false;
						}
					});
				} else {
					bonc.noteBookList = angular.copy(noteBookList.noteBooks);
					bonc.noteBookList =  orderByFilter(bonc.noteBookList, bonc.noteBookField, bonc.noteBookFieldDecending);
					bonc.showLoader = false;
				}
			} else {
				bonc.noteBookList = angular.copy(noteBookList.noteBooks);
				bonc.noteBookList =  orderByFilter(bonc.noteBookList, bonc.noteBookField, bonc.noteBookFieldDecending);
				bonc.showLoader = false;
			}
		}
		init();
	}	
})();