; (function() {
	'use strict';
	angular.module('vdvcApp').filter('sortDatePublished', function() {
		return function(items, field, dec) {
			return items.sort(function(a, b) {
				var aObjectDate = a[field];
				var bObjectDate = b[field];
				if ((a.objectInfo && b.objectInfo) && (field == "datePublished" || field == "dateModified")) {
					aObjectDate = a.objectInfo[field];
					bObjectDate = b.objectInfo[field];
				}
				if (!dec) {
					if (parseInt(aObjectDate) > parseInt(bObjectDate))
						return 1;
					if (parseInt(aObjectDate) < parseInt(bObjectDate))
						return -1;
				} else {
					if (parseInt(aObjectDate) < parseInt(bObjectDate))
						return 1;
					if (parseInt(aObjectDate) > parseInt(bObjectDate))
						return -1;
				}
				return 0;
			});
		}
	});
	angular.module('vdvcApp').controller('TaskSpaceController',
		TaskSpaceController);

	TaskSpaceController.$inject = ['$rootScope', '$scope', '$state', '$stateParams',
		'$uibModal', '$timeout', '$confirm', 'TaskSpaceService', '_', 'DocFactory',
		'appData', 'AnnotationService', 'AnnotationDigestService', 'commonService', 
		'ToolTipService', 'orderByFilter', '$window', 'pendingRequests', 'AdvSearchService', 
		'MessageService', 'sortDatePublishedFilter', 'SlackSearchService', 'DeepLinkService',
		'APIUserMessages', '$deviceInfo', 'VDVCConfirmService', 'orderByFilter',
		'UploadFileFactory', 'EvernoteService', 'notificationEvents','$location'];

	function TaskSpaceController($rootScope, $scope, $state, $stateParams, $uibModal,
		$timeout, $confirm, TaskSpaceService, _, DocFactory, appData, AnnotationService, 
		AnnotationDigestService, commonService, ToolTipService, orderBy, $window, 
		pendingRequests, AdvSearchService, MessageService, sortDatePublishedFilter, 
		SlackSearchService, DeepLinkService, APIUserMessages, $deviceInfo, VDVCConfirmService, 
		orderByFilter, UploadFileFactory, EvernoteService, notificationEvents, $location) {

		var fileBaseUrl = commonService.getContext();
		var vm = this;
		var appdata = appData.getAppData();
		var getTaskSpacePromise;
		var getTsStatePromise;
		var getTaskSpaceState = getTaskSpaceState;
        var focusedOneId;
	    var focusedTwoId;
		var dummyTSObj = {
			"name": "Add Document to your Taskspace",
		};
		var taskSpaceDocsList = [];
		var docButtonsList = [];
		var tsButtonsList = [];
		var uploadOptionsList = [];
		var openObjectByUser = false;
		var tsDocTypeSortOptions = [{
			  "label":"Date Added",
			  "key" : "dateAdded",
		  	  "type" : "number"
		    },{
			  "label":"Date Annotated",
			  "key" : "annotatedDate",
		  	  "type" : "number"
		    },{
			  "label":"Date Modified",
			  "key" : "dateModified",
		  	  "type" : "number"
		    },{
			  "label":"Name",
			  "key" : "name",
		  	  "type" : "text"
		    }];
		
		vm.UserRole = appdata.UserRole;
		vm.deviceInfo = $deviceInfo;
		vm.orientation = $scope.DEVICE_ORIENT;
		vm.docSearchTxt;
		vm.tsId = $stateParams.tsId;
		vm.clientId = $stateParams.tsc;
		vm.taskSpace;
		vm.taskSpaceState;
		vm.currentLayout;
		vm.dummyTSObjList = [];
        vm.sectionConfig  = {};

		vm.tsDocList = "All";
		vm.tsSectionListSortBy = "name";
		vm.tsDocListSortBy = "name";
		vm.tsDocListSortByDec = false;

		vm.digestObject = {
			"objectId": "_digest_",
			"type": "Digest",
			"name": "View Digest",
			"tsId": $stateParams.tsId,
			"objectInfo": { "docType": "Digest" }
		};

		vm.objDragUIOptions = {
			revert: 'invalid',
			containment: ".rootContainer",
			appendTo: "body",
			helper: "clone",
			zIndex: 100
		};

		vm.sortableOptions = {
			handle: '.sort-obj',
			update: function(e, ui) {
				vm.taskSpaceState.objects = vm.taskSpace.objects;
				saveTaskSpaceState();
			},
			start: function() {

			}
		};

		vm.hasPermOnTsDefaultFolder = false;
		vm.savedState = true;
		vm.toggleSideBarChecked = false;
		vm.toggleTwoPaneObjectList = false;

		vm.showTSObjectsSearch = false;
		vm.srchObjects = { "selected": {} };
		vm.searchObjText = "";
		vm.query = {};
		vm.advancedInputs = {};
		vm.ModifiedDtModel = {};
		vm.docTypes = {};
		vm.searchedObjects = [];
		vm.tsDocTypeFilters = angular.copy(TaskSpaceService.tsDocTypeFilters);
		vm.selectedTSDocTypeFilters = [];

		vm.getRemoveObjBtnClass = getRemoveObjBtnClass;
		vm.getTaskSpaceById = getTaskSpaceById;

		vm.showCurrentDocName = showCurrentDocName;
		vm.postDocuDigestToSlack = postDocuDigestToSlack;
		vm.shareDocumentLink = shareDocumentLink;
		vm.showPostDocuDigestToSlack = showPostDocuDigestToSlack;
		vm.showDocumentLinkAction = showDocumentLinkAction;
		vm.showMoveTsObjAction = showMoveTsObjAction;
		vm.showSortTsObjAction = showSortTsObjAction;
		vm.moveTsObj = moveTsObj;
		vm.removeTsObj = removeTsObj;
		vm.setTsObjFavorite = setTsObjFavorite;
		vm.addObjectToTsSection = addObjectToTsSection;
		vm.getToolTip = getToolTip;

		vm.toggleOnePaneTsObjects = toggleOnePaneTsObjects;
		vm.toggleTwoPaneTsObjects = toggleTwoPaneTsObjects;

		vm.tsobjectsToggleColor = tsobjectsToggleColor;


		vm.getFileIcon = getFileIcon;
		vm.getDocIcon = getDocIcon;
		vm.getAnnotCount = getAnnotCount;
		vm.getExtDocIcon = getExtDocIcon;
		vm.toggleTSObjectsSearch = toggleTSObjectsSearch;
		vm.selectSearchObj = selectSearchObj;
		vm.refreshSearchObjects = refreshSearchObjects;
		vm.showTaskSpaceDocs = showTaskSpaceDocs;
		vm.sortDocsBy = sortDocsBy;
		vm.openObjectInLayout = openObjectInLayout;
		vm.onObjectClick = onObjectClick;
		vm.hasEditPermission = hasEditPermission;
		vm.addObjectToTSToolTip = addObjectToTSToolTip;

		vm.getTSSectionDocCount = getTSSectionDocCount;
		vm.renameTsSection = renameTsSection;
		vm.addSectionToTSToolTip = addSectionToTSToolTip;
		vm.addSectionToTS = addSectionToTS;
		vm.getRemoveSectionBtnClass = getRemoveSectionBtnClass;
		vm.removeTsSection = removeTsSection;
		vm.toggleTsSection = toggleTsSection;
		vm.sectionHasDocuments = sectionHasDocuments;
		vm.getDocDateLable = getDocDateLable;
		vm.getDocDateValue = getDocDateValue;
		vm.isTSDocTypeFilterSelected = isTSDocTypeFilterSelected;
		vm.selectTSDocTypeFilter = selectTSDocTypeFilter;
		vm.getAllFilter = getAllFilter;
		vm.getSortedField = getSortedField;
		vm.getTSDocSortedOrderIcon = getTSDocSortedOrderIcon;
		vm.showDocsButton = showDocsButton;
		vm.showTSButton = showTSButton;
		vm.disableDocsButton = disableDocsButton;
		vm.disableTSButton = disableTSButton;
		vm.openNewDocumentModal = openNewDocumentModal;
		vm.uploadAndAddDocument = uploadAndAddDocument;
		vm.uploadFilesFromClient = uploadFilesFromClient;
		vm.uploadAndAddEvernoteDocument = uploadAndAddEvernoteDocument;
		vm.isDocOwner = isDocOwner;
		vm.renameTsObject = renameTsObject;
		vm.showTSSectionOrObjectInfo = showTSSectionOrObjectInfo;
		vm.openedDefaultObject = false;

		var pendingTaskspaceUpdates = [];
		var pendingTsDocDeleteUpdates = [];
		var pendingTsCmtEvents = [];
		var pendingIndextEvents = [];

		$scope.$on("annotCount", function(event, msg) {
			if (msg.taskspaceId == vm.tsId && msg.tsClientId == vm.clientId) {
				$timeout(function() {
					var tsObj = _.findWhere(vm.taskSpace.objects, { 'objectId': msg.documentId });
					if (tsObj && tsObj.objectInfo) {
						tsObj.objectInfo.annotCount = msg.annotCount;
					}
				}, 1000);
			}
		});

		$scope.$on("objectOnChange", function(event, msg) {
			$timeout(function() {
				if (vm.savedState) {
					vm.savedState = false;
					saveObjectSettings(msg);
				}
			}, 1000);
		});

		$scope.$on("upload-completed", function(event, msg) {
			$timeout(function() {
				onObjectAdded(msg);
			}, 1000);
		});

		$scope.$on("windowResize", function(event, msg) {
			if (vm.taskSpace) {
				processTSObjects(vm.taskSpace.objects);
			}
		});
		function updateAnnotatedDateOnDocList(msg) {
			var updatedDocIndex = _.findIndex(vm.taskSpace.objects, { 'objectId': msg.documentId });
			if (updatedDocIndex >= 0) {
				if (msg.annotatedDate) {
					vm.taskSpace.objects[updatedDocIndex].annotatedDate = msg.annotatedDate;
				} else if (msg.timestamp) {
					vm.taskSpace.objects[updatedDocIndex].annotatedDate = msg.timestamp;
				}
			}
		}

		$scope.$on("UPDATE_ANNOTATED_DATE_ON_TS", function(event, msg) {
			updateAnnotatedDateOnDocList(msg);
		});

		function notifyDigestUpdate(msg) {
			updateAnnotatedDateOnDocList(msg);
			var tsObj = _.findWhere(vm.taskSpace.objects, { 'objectId': msg.documentId });
			if (tsObj) {
				$rootScope.$broadcast("updateDigest");
			}
		}

		$scope.$on("COMMENTED", function(event, msg) {
			notifyDigestUpdate(msg);
		});


		$scope.$on("COMMENTDELETED", function(event, msg) {
			notifyDigestUpdate(msg);
		});






		var loadEvents = [
			notificationEvents.DOCS_ADDED,
			notificationEvents.SECTION_ADDED,
			notificationEvents.SECTION_REMOVED,
			notificationEvents.SECTION_RENAMED,
			notificationEvents.DOCUMENT_MOVED,
			notificationEvents.PERMISSIONS_CHANGED,
		];
		
		var commentEvents = [
			notificationEvents.COMMENT_CREATED_OR_UPDATED,
			notificationEvents.COMMENT_DELETED,
		];

		loadEvents.forEach(function(event) {
			$scope.$on(event, function(evt, msg) {
				if(notificationEvents.shouldHandle(msg)) {
					if (vm.tsId == msg.taskspaceId) {
						pendingTaskspaceUpdates.push(msg);
						debounceHandleTaskspaceUpdates.cancel();
						if(pendingTaskspaceUpdates.length < TaskSpaceService.maxNotifications) {
							debounceHandleTaskspaceUpdates();
						} else {
							handleTaskspaceUpdates();
						}
					}
				}
			});
		});
		
		commentEvents.forEach(function(event) {
			$scope.$on(event, function(evt, msg) {
				if(notificationEvents.shouldHandle(msg)) {
					if (vm.tsId == msg.taskspaceId) {
						pendingTsCmtEvents.push(msg);
						debounceHandleTaskspaceCmtUpdates.cancel();
						if(pendingTsCmtEvents.length < TaskSpaceService.maxNotifications) {
							debounceHandleTaskspaceCmtUpdates();
						} else {
							handleTaskspaceCmtUpdates();
						}
					}
				}
			});
		});
		
		$scope.$on(notificationEvents.DOCS_REMOVED, function(event, msg) {
			if (notificationEvents.shouldHandle(msg) && vm.tsId == msg.taskspaceId) {
				if (msg.docIds && msg.docIds.length > 0) {
					pendingTsDocDeleteUpdates.push(msg);
					debounceHandleTsDocDeleteUpdates.cancel();
					if(pendingTsDocDeleteUpdates.length < TaskSpaceService.maxNotifications) {
						debounceHandleTsDocDeleteUpdates();
					} else {
						handleTsDocDeleteUpdates();
					}
				}
			}
		});
		
		$scope.$on(notificationEvents.DOCUMENT_INDEXED, function(event, msg) {
			if (notificationEvents.shouldHandle(msg) && vm.tsId == msg.taskspaceId) {
				pendingIndextEvents.push(msg);
				debounceHandleTsDocIndexedUpdates.cancel();
				if(pendingIndextEvents.length < TaskSpaceService.maxNotifications) {
					debounceHandleTsDocIndexedUpdates();
				} else {
					handleTsDocIndexedUpdates();
				}
			}
		});

        var getDocDeleteMessageById = function(pendingTsDocDeleteUpdates) {
			return  _.findWhere(pendingTsDocDeleteUpdates, function(msg) {
				return msg.docIds[0] == focusedOneId;
			});
        }
		
		function handleTaskspaceUpdates() {
			if (pendingTaskspaceUpdates && pendingTaskspaceUpdates.length == 0) {
				return;
			}
			
			var events = pendingTaskspaceUpdates.splice(0,pendingTaskspaceUpdates.length); //pendingTaskspaceUpdates.concat([]);
			
			var text = TaskSpaceService.getTaskspaceUpdateMessage(events,appdata.UserId);
			getUpdatedTaskspace(vm.clientId, vm.tsId).then(function(resp) {
				if (resp.status == 200 && resp.data.Status && !_.isEmpty(text)) {
					APIUserMessages.notification(text);
				}
			}).finally(function() {
				//pendingIndextEvents = [];
				$rootScope.$broadcast("updateDigest",{"action" : "DOC_OR_SECTION_UPDATE"});
			});
		}
		
		function handleTaskspaceCmtUpdates() {
			if (pendingTsCmtEvents && pendingTsCmtEvents.length == 0) {
				return;
			}
		    var events = pendingTsCmtEvents.splice(0,pendingTsCmtEvents.length); //pendingTsCmtEvents.concat([]);
			var text = TaskSpaceService.getTaskspaceUpdateMessage(events,appdata.UserId);
			getUpdatedTaskspace(vm.clientId, vm.tsId).then(function(resp) {
				if (resp.status == 200 && resp.data.Status && !_.isEmpty(text)) {
					APIUserMessages.notification(text);
				}
			});
		}
		
		function isDeletedDocFocused(deletedDocIds) {
			var isDeletedDocFocused1 = _.findIndex(deletedDocIds, vm.taskSpaceState.focusObject1);
			var isDeletedDocFocused2 = _.findIndex(deletedDocIds, vm.taskSpaceState.focusObject2);
			if(isDeletedDocFocused1 != -1) {
				return isDeletedDocFocused1;
			} else if(isDeletedDocFocused2 != -1){
				return isDeletedDocFocused2;
			}
			return -1;
		}
		
		function handleTsDocDeleteUpdates() {
			if (pendingTsDocDeleteUpdates && pendingTsDocDeleteUpdates.length == 0) {
				return;
			}
			
			var events = pendingTsDocDeleteUpdates.splice(0,pendingTsDocDeleteUpdates.length); //pendingTsDocDeleteUpdates.concat([]);
			var text = TaskSpaceService.getTaskspaceUpdateMessage(events,appdata.UserId);
			
			var deletedObj = getDocDeleteMessageById(events);
			if(deletedObj && deletedObj.userId.toLowerCase() != appdata.UserId.toLowerCase()) {
				var tsObj = _.findWhere(vm.taskSpace.objects, { 'objectId':deletedObj.docIds[0] });
				if (tsObj) {
					var deletetext = deletedObj.userId + ' Removed "' + tsObj.name + '" from the taskspace';
					$confirm({ text: deletetext || text }, {
						templateUrl: 'app/components/common/CustomeTemplates/confirmTemplate.html',
						backdrop: 'static'
					})['finally'](function() {
						if(!_.isEmpty(text)) {
							APIUserMessages.notification(text);
						}
						getUpdatedTaskspace(vm.clientId, vm.tsId);
						//removeObjFormTaskSpace(tsObj);
						$rootScope.$broadcast("updateDigest",{"action" : "DOCS_REMOVED"});
						var deletedDocFocusedIndex = isDeletedDocFocused(deletedObj.docIds);
						if(deletedDocFocusedIndex != -1){
							var tsObj = _.findWhere(vm.taskSpace.objects, { 'objectId':deletedObj.docIds[deletedDocFocusedIndex] });
							if (tsObj) {
								openDefaultObject(tsObj);
							}
						}
					});
				}
			} else {
				if(!_.isEmpty(text)) {
					APIUserMessages.notification(text);
				}
				getUpdatedTaskspace(vm.clientId, vm.tsId);
				$rootScope.$broadcast("updateDigest",{"action" : "DOCS_REMOVED"});
				if(deletedObj){
					var deletedDocFocusedIndex = isDeletedDocFocused(deletedObj.docIds);
					if(deletedDocFocusedIndex != -1){
						var tsObj = _.findWhere(vm.taskSpace.objects, { 'objectId':deletedObj.docIds[deletedDocFocusedIndex] });
						if (tsObj) {
							openDefaultObject(tsObj);
						}
					}
				}
			}
		}
		
		function handleTsDocIndexedUpdates() {
			$rootScope.$broadcast("updateDigest",{"action" : "DOCUMENT_INDEXED"});
			pendingIndextEvents = [];
		}
		
		var debounceHandleTaskspaceUpdates = _.debounce(handleTaskspaceUpdates, TaskSpaceService.notificationHandledelayTime);
		var debounceHandleTaskspaceCmtUpdates = _.debounce(handleTaskspaceCmtUpdates, TaskSpaceService.notificationHandledelayTime);
		var debounceHandleTsDocDeleteUpdates = _.debounce(handleTsDocDeleteUpdates, TaskSpaceService.notificationHandledelayTime);
		var debounceHandleTsDocIndexedUpdates = _.debounce(handleTsDocIndexedUpdates, TaskSpaceService.notificationHandledelayTime);

		$scope.$on('SEECTION_ADDED', function(event, msg) {
			if (vm.tsId == msg.taskspace.id) {
				if (!vm.taskSpace.sections) {
					vm.taskSpace.sections = [];
				}
				vm.taskSpace.sections.push(msg.section);
				sortDocsBy(null, vm.tsDocListSortBy);
			}
		});

		function getRemoveObjBtnClass(index) {
			return "remove-ts-object-" + index;
		}

		function setLayout(layout) {
			var postdata = {
				layout: layout,
				id: vm.tsId,
				clientId: vm.clientId
			};

			TaskSpaceService.setLayout(postdata).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					//vm.currentLayout = postdata.layout;
					//vm.taskSpaceState.currentLayout = vm.currentLayout;
					$state.transitionTo($state.current, $state.params, { reload: true });
				}
			});
		}

		$scope.$on("LayoutChange", function(event, msg) {
			setLayout(msg.layout);
		});

		$scope.$on("objectLoaded", function(event, msg) {
			if (msg) {
				var objSettings = _.findWhere(vm.taskSpaceState.objSettings, { "objectId": msg.objectId });

				if (objSettings) {
					$scope.$broadcast("objectSettings", objSettings);
				}
			}
		});

		$scope.$on("$destroy", function(event, msg) {
			pendingRequests.cancel(getTaskSpacePromise);
			pendingRequests.cancel(getTsStatePromise);
			debounceHandleTaskspaceUpdates.cancel();
			debounceHandleTaskspaceCmtUpdates.cancel();
			debounceHandleTsDocDeleteUpdates.cancel();
			debounceHandleTsDocIndexedUpdates.cancel();
		});
		var isDocpaneCollapsed;
		$scope.$on("TipsWizardStarted", function(event, msg) {
			if(vm.taskSpaceState.focusObject1 != "_digest_") {
				onObjectClick(false,vm.digestObject);
			}
			isDocpaneCollapsed = angular.copy(vm.toggleSideBarChecked);
			if(isDocpaneCollapsed) {
				toggleOnePaneTsObjects();
			}
		});
		
		$scope.$on("TipsWizardStopped",function(event, msg){
			if(vm.taskSpaceState.focusObject1 != "_digest_") {
				openFocusObject();
			}
			if(isDocpaneCollapsed != undefined && isDocpaneCollapsed == true) {
				toggleOnePaneTsObjects();
			}
		});
		
		function toggleOnePaneTsObjects() {
			vm.toggleSideBarChecked = !vm.toggleSideBarChecked;
			$scope.$broadcast('resizeDoc', false);
		}

		function toggleTwoPaneTsObjects() {
			vm.toggleTwoPaneObjectList = !vm.toggleTwoPaneObjectList;
			$scope.$broadcast('resizeDoc', false);
		}

		function tsobjectsToggleColor() {
			var toggleStripColor = { "background": appdata.toggleStripClrCde };
			return toggleStripColor;
		}
		
		function setTsObjectSettings(objSettings) {
			var postdata = {
					"id" : vm.taskSpace.id,
					"clientId" : vm.clientId,
					"objSettings" : objSettings
			};
			var setTsObjSettings = TaskSpaceService.setTsObjectSettings(postdata);
			setTsObjSettings.then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					vm.savedState = true;
				}
			});
			return setTsObjSettings;
		}
		
		function saveObjectSettings(settings) {
			if (vm.taskSpaceState) {
				var objSettings = _.find(vm.taskSpaceState.objSettings, function(obj) {
					return obj.objectId == settings.objectId;
				});
				if (objSettings) {
					if (objSettings.position != settings.position) {
						objSettings.position = settings.position;
						setTsObjectSettings(vm.taskSpaceState.objSettings);
					} else {
						vm.savedState = true;
					}
				} else {
					vm.taskSpaceState.objSettings.push(settings);
					setTsObjectSettings(vm.taskSpaceState.objSettings);
				}
			}
		}

		$scope.$on("updateTsState", function(event, msg) {
			updateObjects(msg.obj, msg.focused);
		});
		
		$scope.$on("openedObjectByUserOnDrop",function(event,msg){
			openObjectByUser = true;
		});
		
		$scope.$on("tsStateChanged", function(event, msg) {
			vm.taskSpaceState = msg;
			commonService.taskSpaceState = angular.copy(vm.taskSpaceState);
		});

		$scope.$on("updateTSObject", function(event, msg) {
			var tsObj = _.findWhere(vm.taskSpace.objects, { "objectId": msg.obj.curId });
			if (tsObj) {
				tsObj.objectId = msg.obj.objectId;
				tsObj.clientId = msg.obj.clientId;
				updateObjects(msg.obj, msg.focused);
			}
		});

		function updateObjects(object, focused) {
			vm.openedDefaultObject = false;
			if(openObjectByUser) {
				switch(focused) {
				case 'One':
					vm.taskSpaceState.focusObject1 = object.objectId;
					break;
				case 'Two':
					vm.taskSpaceState.focusObject2 = object.objectId;
					break;
				}
				return setTsCurrentObject();
			} else {
			 	if(object.objectId == "_digest_") {
					vm.openedDefaultObject = true;
				}
			}
			return {};
		}

		function setTsCurrentObject() {
			var postdata = {
					"id" : vm.taskSpace.id,
					"clientId" : vm.clientId,
					"layout" : vm.currentLayout,
					"currentObjId1" : vm.taskSpaceState.focusObject1,
					"currentObjId2" : vm.taskSpaceState.focusObject2,
			};
			var setTsCurrentObj = TaskSpaceService.setTsCurrentObject(postdata);
			setTsCurrentObj.then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					vm.savedState = true;
					openObjectByUser = false;
				}
			});
			return setTsCurrentObj;
		}
		
		function saveTaskSpaceState(cb) {
			vm.taskSpaceState.currentLayout = vm.currentLayout;
			vm.taskSpaceState.clientId = vm.clientId;
			var saveTsState = TaskSpaceService.saveTaskSpaceState(vm.taskSpaceState);
			saveTsState.then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					vm.savedState = true;
					if (typeof cb == 'function') {
						cb();
					}
				}
			});
			return saveTsState;
		}

		function checkDefaultFolderHasPerm() {
			if (!_.isEmpty(vm.taskSpace.defaultFolderId)) {
				if (vm.taskSpace.owner.toLowerCase() === appdata.UserId.toLowerCase()) {
					vm.hasPermOnTsDefaultFolder = true;
				}
			}
		}


        function getUpdatedTaskspace(clientId, id) {
			var promise = TaskSpaceService.getTaskSpaceById(clientId, id);
			promise.then(function(resp) {
					if (resp.status == 200 && resp.data.Status) {
						vm.taskSpace = resp.data.Taskspace;
						taskSpaceDocsList = angular.copy(vm.taskSpace.objects);
						checkDefaultFolderHasPerm();
						processTSObjects(vm.taskSpace.objects);
						showTaskSpaceDocs(null, vm.tsDocList);
						TaskSpaceService.currentTaskspace = vm.taskSpace;
					}
				});
			return promise;
		}
		
		function getTaskSpaceById(clientId, id) {
			pendingRequests.cancel(getTaskSpacePromise);
			if (id) {
				getTaskSpacePromise = TaskSpaceService.getTaskSpaceById(clientId, id);
				getTaskSpacePromise.then(function(resp) {
					if (resp.status == 200 && resp.data.Status) {
						vm.taskSpace = resp.data.Taskspace;
						/*var defaultSection = {
								"id": null,
						        "name": TaskSpaceService.defaultSectionName,
						        "description": TaskSpaceService.defaultSectionDescription
						};
						if(_.isArray(vm.taskSpace.sections) && !_.isEmpty(vm.taskSpace.sections)) {
							vm.taskSpace.sections.unshift(defaultSection);
						} else if(_.isArray(vm.taskSpace.sections) && _.isEmpty(vm.taskSpace.sections)) {
							vm.taskSpace.sections.push(defaultSection);
						} else if(!_.isArray(vm.taskSpace.sections)) {
							vm.taskSpace.sections = [defaultSection];
						}*/
						//vm.taskSpace = TaskSpaceService.insertDefaultSection(vm.taskSpace);
						taskSpaceDocsList = angular.copy(vm.taskSpace.objects);
						checkDefaultFolderHasPerm();
						processTSObjects(vm.taskSpace.objects);
						if (vm.taskSpace.orderNumber == 0) {
							TaskSpaceService.openTaskSpace(clientId, id).then(function(resp) {
								if (resp.status == 200 && resp.data.Status) {
									setCurrent(clientId, id);
									getTaskSpaceState(clientId, id);
								}
							});
						} else {
							setCurrent(clientId, id);
							getTaskSpaceState(clientId, id);
						}
						TaskSpaceService.currentTaskspace = vm.taskSpace;
						if (!_.isEmpty(SlackSearchService.searchInfo) && !_.isEmpty(SlackSearchService.searchInfo.ctx) && SlackSearchService.searchInfo.ctx == "tsp") {
							toggleTSObjectsSearch();
						}
						var uploadSession = sessionStorage.getItem("uploadSession");
				    	sessionStorage.removeItem("uploadSession");
						if(uploadSession) {
							var uploadSessionObj = JSON.parse(uploadSession);
							if(!_.isEmpty(uploadSessionObj)){
								uploadAndAddEvernoteDocument(uploadSessionObj.TSSection,uploadSessionObj.uploadFrom);
							}
						}
					}
				});
			}
		}

		//function for open next or previous object of removed object.
		function openNOPObjOfRTsObject(tsObj, focused) {
			if (!_.isEmpty(tsObj)) {
				var msg = {
					type: "Document",
					id: tsObj.objectId,
					focused: focused,
					clientId: tsObj.clientId,
					docType: tsObj.objectInfo.docType
				};
				$scope.$broadcast('openObject', msg);
			}
		}
		function isOpenedInAnotherPane(tsObj, currentPane) {
			var status = false;
			if (currentPane === "One" && vm.taskSpaceState.focusObject2 === tsObj.objectId) {
				status = true;
			} else if (currentPane === "Two" && vm.taskSpaceState.focusObject1 === tsObj.objectId) {
				status = true;
			}
			return status;
		}
		function getFocusObject(index, focusPane) {
			var focusObj = {};
			var tsObjsLength = vm.taskSpace.objects.length;
			if (index > 0 && tsObjsLength > index) {
				if (!isOpenedInAnotherPane(vm.taskSpace.objects[index], focusPane)) {
					focusObj = vm.taskSpace.objects[index];
				} else if (tsObjsLength > (index + 1)) {
					focusObj = vm.taskSpace.objects[index + 1];
				} else {
					focusObj = vm.taskSpace.objects[index - 1];
				}
			} else if (index > 0 && tsObjsLength == index) {
				if (!isOpenedInAnotherPane(vm.taskSpace.objects[index - 1], focusPane)) {
					focusObj = vm.taskSpace.objects[index - 1];
				} else if (0 <= (index - 2)) {
					focusObj = vm.taskSpace.objects[index - 2];
				}
			} else if (index == 0 && tsObjsLength > 0) {
				if (!isOpenedInAnotherPane(vm.taskSpace.objects[index], focusPane)) {
					focusObj = vm.taskSpace.objects[index];
				} else if (tsObjsLength > (index + 1)) {
					focusObj = vm.taskSpace.objects[index + 1];
				}
			}
			return focusObj;
		}
		
		function openDefaultObject(tsObj) {
			var focusPane = "One";
			if (vm.taskSpaceState.focusObject1 == tsObj.objectId) {
				vm.taskSpaceState.focusObject1 = null;
				$scope.$broadcast("RemoveTsObject", { focused: focusPane });
				$scope.$broadcast('openObject',{type:vm.digestObject.type,id:vm.digestObject.objectId,clientId:vm.digestObject.clientId,focused:focusPane, docType : vm.digestObject.objectInfo.docType});
			}

			if (vm.taskSpaceState.focusObject2 == tsObj.objectId) {
				focusPane = "Two";
				vm.taskSpaceState.focusObject2 = null;
				$scope.$broadcast("RemoveTsObject", { focused: focusPane });
				$scope.$broadcast('openObject',{type:vm.digestObject.type,id:vm.digestObject.objectId,clientId:vm.digestObject.clientId,focused:focusPane, docType : vm.digestObject.objectInfo.docType});
			}
		}
		
		function removeObjFormTaskSpace(tsObj) {
			var index = _.findIndex(vm.taskSpace.objects, {
				"objectId": tsObj.objectId
			});
			if (index >= 0) {
				vm.taskSpace.objects.splice(index, 1);
			}
			
			var tsStateIndex = _.findIndex(vm.taskSpaceState.objSettings, {
				"objectId": tsObj.objectId
			});
			if (tsStateIndex >= 0) {
				vm.taskSpaceState.objSettings.splice(tsStateIndex, 1);
				setTsObjectSettings(vm.taskSpaceState.objSettings);
			}
			
			$scope.$emit("TsObjectsChanged", { "action": "remove", "taskspaceId": vm.taskSpace.id, "tsObj": tsObj });
			openDefaultObject(tsObj);
			processTSObjects(vm.taskSpace.objects);
			if (vm.taskSpaceState.focusObject1 == "_digest_" || vm.taskSpaceState.focusObject1 == "_digest_") {
				TaskSpaceService.currentTaskspace = vm.taskSpace;
				$rootScope.$broadcast("updateDigest",{"action" : "DOCS_REMOVED"});
			}
		}

		function showCurrentDocName(tsObj) {
			var currentDocName = "TASKSPACE  DOCUMENTS";
			if (vm.taskSpaceState && !_.isEmpty(vm.taskSpaceState.focusObject1)) {
				var currentTsObj = _.findWhere(vm.taskSpace.objects, { "objectId": vm.taskSpaceState.focusObject1 });
				if (currentTsObj && !_.isEmpty(currentTsObj.objectInfo)) {
					currentDocName = currentTsObj.objectInfo.name;
				} else if (vm.taskSpaceState.focusObject1 === "_digest_") {
					currentDocName = "DIGEST";
				}
			}

			return currentDocName;
		}

		$scope.$on("postDocuAnnotDigestToSlack", function(event, msg) {
			if (msg.doc && msg.annotation) {
				postDocuDigestToSlack(msg);
			}
		});

		function postDocuDigestToSlack(msg) {
			var postdata = {
				"clientId": vm.taskSpace.clientId,
				"taskspaceId": vm.taskSpace.id,
				"docClientId": msg.doc.clientId,
				"documentId": msg.doc.id,
				"annotationId": msg.annotation.id
			};
			TaskSpaceService.postAnnotationToSlack(postdata).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					MessageService.showSuccessMessage("POST_ANNOTATION_TO_SLACK", [vm.taskSpace.slackChannelName]);
				}
			});
		}

		$scope.$on("shareDocuAnnotation", function(event, msg) {
			if (msg.doc && msg.annotation) {
				shareDocumentLink({
					"objectId": msg.doc.id,
					"digestDocAnnotId": msg.annotation.id,
					"objectInfo": msg.doc,
					"name": msg.doc.displayName
				});
			}
		});

		vm.docLinkInfo = {};

		function shareDocumentLink(tsObj) {

			if (event) {
				event.stopPropagation();
			}

			var digestFor = { "digestFor": "DigestDocument" };
			digestFor["digestName"] = AnnotationDigestService.getDigestNameForDoc(tsObj);
			digestFor.documentInfo = tsObj;

			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: 'app/components/common/ShareLink/ShareLink.html',
				controller: 'ShareLinkController',
				appendTo: $('.rootContainer'),
				controllerAs: 'slc',
				backdrop: 'static',
				size: "md",
				resolve: {
					taskspaceInfo: function() {
						return {
							"tsId": vm.tsId,
							"tsClientId": vm.clientId
						}
					},
					systemSttings: function() {
						return commonService.getNavMenuItems({ type: "GlobalSettings", key: "DigestTableOfContents" }).then(function(resp) {
							if (resp.data.Status && !_.isEmpty(resp.data.listAppKeyValues)) {
								return resp.data.listAppKeyValues[0];
							} else {
								return {};
							}
						});
					},
					settings: function() {
						return TaskSpaceService.getTaskSpaceState(vm.clientId, vm.tsId).then(function(resp) {
							if (resp.status == 200 && resp.data.Status) {
								var settings = resp.data.TaskspaceState;
								settings.digestsettings = AnnotationDigestService.getDocuDigetFilters();
								return settings;
							}
						});
					},
					digestFor: function() {
						return digestFor;
					},
					linkInfo: function() {
						var postdata = {
							"objectType": "DigestDocument",
							"linkObjectId": vm.tsId,
							"clientId": vm.clientId,
							"documentId": tsObj.objectId,
							"digestDocAnnotId": tsObj.digestDocAnnotId
						};
						return DeepLinkService.checkLinkExists(postdata).then(function(resp) {
							if (resp.status == 200 && resp.data.Status) {
								if (!_.isEmpty(resp.data.Link)) {
									return resp.data.Link;
								} else {
									var digestSettings = AnnotationDigestService.getDefaultDigestSettings(vm.tsId, vm.clientId, tsObj);
									var lnk = AnnotationDigestService.processLinkInfo(digestFor, vm.tsId, vm.clientId, digestSettings);
									return DeepLinkService.createLink(lnk).then(function(createLinkResp) {
										if (createLinkResp.status == 200 && createLinkResp.data.Status) {
											return createLinkResp.data.Link;
										}
									});
								}
							}
						});
					}
				}
			});

			modalInstance.result.then(function(result) {

			});
		}

		vm.docLinkUIProperties = {
			templateUrl: 'app/components/TaskSpace/TSDocDeepLinkPopOver.html',
			trigger: 'none',
			cpToClipBoard: DeepLinkService.isCpToClipSupported,
			copySuccess: function() {
				APIUserMessages.info("Link copied to clipboard.");
			},
			copyfail: function(err) {

			},
			close: function() {
				hideAllDocLinkPopup();
			}
		};

		function hideAllDocLinkPopup() {
			var docObj = _.findWhere(vm.taskSpace.objects, { 'showDocLink': true });
			docObj ? delete docObj.showDocLink : false;
		}

		function showPostDocuDigestToSlack() {
			var status = false;
			if (!_.isEmpty(vm.taskSpace) &&
				!_.isEmpty(vm.taskSpace.permissions) &&
				vm.taskSpace.permissions.edit &&
				vm.taskSpace.permissions.share &&
				(vm.taskSpace.slackChannelType == 'C' || vm.taskSpace.slackChannelType == 'G') &&
				!vm.taskSpace.slackAutoPostAnns) {
				status = true;
			}
			return status;
		}

		function showDocumentLinkAction() {
			var status = false;
			if (!_.isEmpty(vm.taskSpace) &&
				!_.isEmpty(vm.taskSpace.permissions) &&
				vm.taskSpace.permissions.edit &&
				vm.taskSpace.permissions.share) {
				status = true;
			}
			return status;
		}

		function showMoveTsObjAction(tsObj) {
			var status = false;
			if (!_.isEmpty(tsObj.objectInfo) && tsObj.objectInfo.createdBy === appdata.UserId) {
				status = true;
			}
			return status;
		}

		function showSortTsObjAction() {
			var status = false;
			if (vm.tsDocListSortBy == "docOrder") {
				status = true;
			}
			return status;
		}

		function moveObject(tsObj, postdata) {
			TaskSpaceService.moveObject(postdata).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					MessageService.showSuccessMessage("TASKSPACE_OBJ_MOVE", [tsObj.name]);
					$scope.$emit("TsObjectsChanged", { "action": "add", "taskspaceId": postdata.toTaskspaceId, "tsObjs": [tsObj] });
					removeObjFormTaskSpace(tsObj)
				}
			});
		}


		function getDocAnnotations(tsObj, cb) {
			var postdata = {
				"annotationContext": "taskspace",
				"taskspaceId": vm.taskSpace.id,
				"tsClientId": vm.taskSpace.clientId
			};
			AnnotationService.getAllDocAnnotations(tsObj.objectId, tsObj.clientId, postdata).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					if (typeof cb === "function") {
						cb(resp.data.Annotations);
					}
				}
			});
		}

		function confirmAnnotContextOnMove(tsObj) {
			return $uibModal.open({
				animation: true,
				templateUrl: 'app/components/TaskSpace/AddToTaskSpace/ConfirmMoveTSObjAnnotContext/ConfirmMoveTSObjAnnotContextTemp.html',
				controller: 'ConfirmMoveTSObjAnnotContextCtrl',
				appendTo: $('.rootContainer'),
				backdrop: 'static',
				size: 'md',
				windowClass: 'uploadFileWindow',
				resolve: {
					tsObj: tsObj
				}
			});
		}

		function confirmAnnotContextOnRemove(tsObj) {
			return $uibModal.open({
				animation: true,
				templateUrl: 'app/components/TaskSpace/AddToTaskSpace/ConfirmRemoveTSObjAnnotContext/ConfirmRemoveTSObjAnnotContextTemp.html',
				controller: 'ConfirmRemoveTSObjAnnotContextCtrl',
				appendTo: $('.rootContainer'),
				backdrop: 'static',
				size: 'md',
				windowClass: 'uploadFileWindow',
				resolve: {
					tsObj: tsObj
				}
			});
		}

		function handleMoveTsObject(tsObj, selectedOption) {
			var modalInstance = $uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'app/components/TaskSpace/AddToTaskSpace/addToTaskSpace.html',
				controller: 'AddToTaskSpaceController',
				appendTo: $('.rootContainer'),
				controllerAs: 'vm',
				backdrop: 'static',
				size: "lg",
				resolve: {
					item: {},
					selectedChannelInfo: {},
					slackChannelConfigs: {},
					moveObjectInfo: function() {
						return {
							"currentTaskspace": vm.taskSpace,
							"tsObj": tsObj,
							"HeaderLabel": "Move Document",
							"SubmitBtnLabel": "MOVE",
							"actionOnAnnotations": selectedOption
						};
					},
					addObjectsFromDocsInfo: {},
					asanaconfig: {}
				}
			});
			modalInstance.result.then(function(postdata) {
				moveObject(tsObj, postdata);
			}, function() {

			});
		}

		function checkLinkExists(tsObj, cb) {
			var postdata = {
				"objectType": "DigestDocument",
				"linkObjectId": vm.tsId,
				"clientId": vm.clientId,
				"documentId": tsObj.objectId
			};
			if (!_.isEmpty(tsObj.digestDocAnnotId)) {
				postdata["digestDocAnnotId"] = tsObj.digestDocAnnotId
			}
			DeepLinkService.checkLinkExists(postdata).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					if (typeof cb === "function") {
						cb(resp.data.Link);
					}
				}
			});
		}

		function moveTsObjToTS(event, tsObj) {
			checkLinkExists(tsObj, function(Link) {
				if (!_.isEmpty(Link)) {
					var text = "<div class='col-xs-12'>The Document is Shared as a link; on moving " +
						"the Document the link would be deleted " +
						"permanently (shared link will not be accessible)" +
						"<br><br>" +
						"Are you sure you want to move the Document?</div>"
					var confirm = VDVCConfirmService.open({ title: "CONFIRM", text: text });
					confirm.result.then(function() {
						getDocAnnotations(tsObj, function(annotList) {
							if (!_.isEmpty(annotList)) {
								confirmAnnotContextOnMove(tsObj).result.then(function(selectedOption) {
									handleMoveTsObject(tsObj, selectedOption);
								}, function() {

								});
							} else {
								handleMoveTsObject(tsObj, null);
							}
						});
					});
				} else {
					getDocAnnotations(tsObj, function(annotList) {
						if (!_.isEmpty(annotList)) {
							confirmAnnotContextOnMove(tsObj).result.then(function(selectedOption) {
								handleMoveTsObject(tsObj, selectedOption);
							}, function() {

							});
						} else {
							handleMoveTsObject(tsObj, null);
						}
					});
				}
			});
		}

		function confirmMoveTsObject() {
			return $uibModal.open({
				animation: true,
				templateUrl: 'app/components/TaskSpace/confirmMoveTsObject/confirmMoveTsObject.html',
				controller: 'confirmMoveTsObjectController',
				appendTo: $('.rootContainer'),
				backdrop: 'static',
				size: 'md',
				windowClass: 'uploadFileWindow'
			});
		}

		function moveToTSSection(tsObj) {
			var modalInstance = $uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'app/components/TaskSpace/MoveToSection/MoveToSection.html',
				controller: 'MoveToSectionController',
				appendTo: $('.rootContainer'),
				controllerAs: 'vm',
				backdrop: 'static',
				size: "md",
				windowClass: 'move-ts-document',
				resolve: {
					moveObjectInfo: function() {
						return {
							"currentTaskspace": vm.taskSpace,
							"tsObj": tsObj
						};
					},
					tsList: function() {
						return TaskSpaceService.getAllTaskSpaces().then(function(resp) {
							if (resp.status == 200 && resp.data.Status) {
								var taskSpaces = orderByFilter(resp.data.Taskspaces, "name", false);
								return taskSpaces;
							} else {
								return [];
							}
						});
					}
				}
			});
			modalInstance.result.then(function(postdata) {
				if (!_.isEmpty(postdata)) {
					moveObject(tsObj, postdata);
				} else {
					MessageService.showSuccessMessage("MOVE_DOCUMENT_TO_TS_SECTION", [tsObj.name]);
					getTaskSpaceById(vm.clientId, vm.tsId);
				}
			}, function() {

			});
		}

		function moveTsObj(event, tsObj) {
			/*if(!_.isEmpty(vm.taskSpace.sections)) {
				confirmMoveTsObject().result.then(function (selectedOption) {
					if(selectedOption == "taskspace") {
						moveTsObjToTS(event, tsObj);
					} else if(selectedOption == "section") {
						moveToTSSection(tsObj);
					}
				}, function () {
					
				});
			} else {
				moveTsObjToTS(event, tsObj);
			}*/
			moveToTSSection(tsObj);
		}

		function handleMoveToTrashCB(items, docInfo) {
			var isTrashedFalse = _.findWhere(items, { "isTrashed": false });
			var isTrashedTrue = _.findWhere(items, { "isTrashed": true });
			if (isTrashedFalse) {
				var NoPermOnObjectList = _.where(items, { "Reason": "NoPermOnObject" });
				var ObjectNotFoundList = _.where(items, { "Reason": "ObjectNotFound" });
				var ObjectAssociatedWithTaskSpace = _.where(items, { "Reason": "ObjectAssociatedWithTaskSpace" });

				if (!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("DELETE_ITEMS_ERR");
				}
				if (!_.isEmpty(ObjectNotFoundList)) {
					MessageService.showErrorMessage("ITEMS_NOT_FOUND_DELETE");
				}
				if (!_.isEmpty(ObjectAssociatedWithTaskSpace)) {
					MessageService.showErrorMessage("ITEMS_ASSOCIATED_WITH_TASKSPACE_DELETE");
				}
			} else if (isTrashedTrue) {
				MessageService.showSuccessMessage("DELETE_DOCUMENT_FROM_TS", [docInfo.name]);
			}
		}

		function deleteDocument(docInfo) {
			var postdata = {};
			postdata["objectList"] = [{
				"objectType": docInfo.type,
				"objectId": docInfo.objectId,
				"clientId": docInfo.clientId
			}];
			DocFactory.deleteItems(postdata).then(function(result) {
				if (result.status == 200 && result.data.Status) {
					handleMoveToTrashCB(result.data.resultList, docInfo);
				}
			});
		}

		function removeFormTaskSpace(selectedOptions, tsObj, selectedOptionOnAnnot) {
			var pd = {
				"id": vm.tsId,
				"clientId": vm.clientId,
				"objects": [{
					"type": tsObj.type,
					"objectId": tsObj.objectId,
					"clientId": tsObj.clientId
				}],
				"actionOnAnnotations": selectedOptionOnAnnot
			};
			TaskSpaceService.removeFormTaskSpace(pd).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					removeObjFormTaskSpace(tsObj);
					if (selectedOptions.deleteObject) {
						deleteDocument(tsObj);
					}
				}
			});
		}

		function confirmAndRemoveTsObj(tsObj, docLinkInfo) {
			var modalInstance = $uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'app/components/TaskSpace/RemoveFromTaskSpace/removeFromTaskSpace.html',
				controller: 'RemoveFromTaskSpaceController',
				appendTo: $('.rootContainer'),
				controllerAs: 'rftc',
				backdrop: 'static',
				size: "md",
				resolve: {
					tsObj: tsObj,
					docLinkInfo: docLinkInfo
				}
			});
			modalInstance.result.then(function(selectedOptions) {
				getDocAnnotations(tsObj, function(annotList) {
					if (!_.isEmpty(annotList)) {
						confirmAnnotContextOnRemove(tsObj).result.then(function(selectedOptionOnAnnot) {
							//handleMoveTsObject(tsObj,selectedOption);
							removeFormTaskSpace(selectedOptions, tsObj, selectedOptionOnAnnot);
						}, function() {

						});
					} else {
						removeFormTaskSpace(selectedOptions, tsObj);
					}
				});
			}, function() {

			});
		}

		function removeTsObj(event, tsObj) {
			checkLinkExists(tsObj, function(Link) {
				var docLinkInfo = { "hasDocLink": false };
				if (!_.isEmpty(Link)) {
					docLinkInfo.hasDocLink = true;
				}
				confirmAndRemoveTsObj(tsObj, docLinkInfo);
			});
		}

		function setTsObjFavorite($event, tsObj) {
			if ($event) {
				$event.stopPropagation();
			}
			if (!tsObj.favorite) {
				tsObj.favorite = true;
			} else {
				tsObj.favorite = false;
			}
			_.findWhere(taskSpaceDocsList, { "objectId": tsObj.objectId })["favorite"] = tsObj.favorite;
		}

		function setCurrent(clientId, id) {
			TaskSpaceService.setCurrent(clientId, id).then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					$scope.$emit("currentTs", vm.taskSpace);
				}
			});
		}

		function isObjectPresent(id) {
			var status = false;
			var objSettings = _.findWhere(vm.taskSpace.objects, { "objectId": id });

			if (objSettings) {
				status = objSettings;
			} else if (id === vm.digestObject.objectId) {
				status = vm.digestObject;
			}

			return status;
		}

		function reOrderObjects() {

			if (vm.taskSpace.objects) {
				if (!_.isEmpty(vm.taskSpaceState.objects)) {
					var newOrder = [];
					var tsObjs = {};
					_.each(vm.taskSpace.objects, function(ts, i) {
						tsObjs[ts.objectId] = ts;
					});

					_.each(vm.taskSpaceState.objects, function(ts, i) {
						var obj = _.findWhere(vm.taskSpace.objects, { "objectId": ts.objectId });
						if (obj) {
							newOrder.push(obj);
							delete tsObjs[ts.objectId];
						}
					});

					if (!_.isEmpty(tsObjs)) {
						_.each(tsObjs, function(obj, key) {
							newOrder.push(obj);
						});
					}

					vm.taskSpace.objects = newOrder;
					vm.taskSpaceState.objects = newOrder;
				} else {
					vm.taskSpaceState.objects = vm.taskSpace.objects;
				}
			}
		}

		function openFocusObject(stateParamObject) {
			if(!_.isEmpty(stateParamObject)) {
				$scope.$broadcast('openObject',{type:stateParamObject.type,id:stateParamObject.objectId,clientId:stateParamObject.clientId,focused:"One", docType : stateParamObject.objectInfo.docType});
			} else if(vm.taskSpaceState.focusObject1 && isObjectPresent(vm.taskSpaceState.focusObject1)) {
				var tsobj1 = isObjectPresent(vm.taskSpaceState.focusObject1);
				if(tsobj1) {
					$scope.$broadcast('openObject',{type:tsobj1.type,id:tsobj1.objectId,clientId:tsobj1.clientId,focused:"One", docType : tsobj1.objectInfo.docType});
				}
			} else if (vm.taskSpace.objects && vm.taskSpace.objects.length > 0) {
				var defaultObjectToOpen = vm.digestObject;
				updateObjects(defaultObjectToOpen,'One');
				$timeout(function() {
					$scope.$broadcast('openObject',{type: defaultObjectToOpen.type,id: defaultObjectToOpen.objectId,clientId:defaultObjectToOpen.clientId,focused: "One", docType : defaultObjectToOpen.objectInfo.docType});
				}, 100);
			}
			if(!_.isEmpty(vm.taskSpaceState.focusObject1)) {
				var currentDoc = _.findWhere(vm.taskSpace.objects,{"objectId" : vm.taskSpaceState.focusObject1});
				if(!_.isEmpty(currentDoc)) {
					var currentTSSection = _.findWhere(vm.taskSpace.sections,{"id" : currentDoc.sectionId});
					if(!_.isEmpty(currentTSSection)) {
						//vm.taskSpace.sections[currentTSSectionIxdex].collabOpen = true;
						vm.sectionConfig[currentTSSection.id] = !vm.sectionConfig[currentTSSection.id];
					}
				}
			}
			if(vm.taskSpaceState.focusObject2) {
				var tsobj2 = isObjectPresent(vm.taskSpaceState.focusObject2);
				if(tsobj2 && vm.currentLayout == 'Double') {
					$scope.$broadcast('openObject',{type:tsobj2.type,id:tsobj2.objectId,clientId:tsobj2.clientId,focused:"Two", docType : tsobj2.objectInfo.docType});
				}
			}
		}
		
		function getTaskSpaceState(clientId, id) {

			pendingRequests.cancel(getTsStatePromise);

			getTsStatePromise = TaskSpaceService.getTaskSpaceState(clientId, id);
			getTsStatePromise.then(function(resp) {

				if (resp.status == 200 && resp.data.Status) {
					vm.taskSpaceState = resp.data.TaskspaceState;
					commonService.taskSpaceState = angular.copy(vm.taskSpaceState);
					vm.currentLayout = vm.taskSpaceState.currentLayout ? vm.taskSpaceState.currentLayout : 'Single';

					$scope.$emit('currentLayout', vm.currentLayout);
					vm.tsDocList = !_.isEmpty(vm.taskSpaceState.docsFilterBy) ? vm.taskSpaceState.docsFilterBy : "All";
					if(!_.isEmpty(vm.taskSpaceState.docsSortBy)) {
						vm.tsDocListSortBy = vm.taskSpaceState.docsSortBy.field;
						vm.tsDocListSortByDec = vm.taskSpaceState.docsSortBy.descending;
					}
					if(!_.isEmpty(vm.taskSpaceState.docTypeFilterBy)) {
						if(vm.taskSpaceState.docTypeFilterBy.length == 1 && vm.taskSpaceState.docTypeFilterBy[0] == "All"){
							vm.selectedTSDocTypeFilters = _.where(vm.tsDocTypeFilters,function(tsDocTypeFilterObj){
								return tsDocTypeFilterObj.enabled;
							});
						} else {
							vm.selectedTSDocTypeFilters = _.filter(vm.tsDocTypeFilters, function(tsDocTypeFilterObj) {
								var status = false;
								if (tsDocTypeFilterObj.enabled) {
									var isSelectedObj = _.contains(vm.taskSpaceState.docTypeFilterBy, tsDocTypeFilterObj.key);
									if (isSelectedObj) {
										status = true;
									}
								}
								return status;
							});
						}
					}
					showTaskSpaceDocs(null,vm.tsDocList,function() {
						//reOrderObjects();
						var objectId = $state.params.d;
						if(!_.isEmpty(objectId) && (vm.taskSpace.focusObject1 != objectId && vm.taskSpace.focusObject2 != objectId)) {
							var stateParamObject = _.findWhere(vm.taskSpace.objects,{"objectId" : objectId});
							if(stateParamObject) {
								vm.taskSpace.focusObject1 = stateParamObject.objectId;
								vm.taskSpaceState.focusObject1 = stateParamObject.objectId;
								openFocusObject(stateParamObject);
							} else if(_.findWhere(taskSpaceDocsList,{"objectId" : objectId})) {
								vm.tsDocList = "All";
								vm.selectedTSDocTypeFilters = _.where(vm.tsDocTypeFilters,function(tsDocTypeFilterObj){
									return tsDocTypeFilterObj.enabled;
								});
								showTaskSpaceDocs(null,vm.tsDocList,function() {
									var nestedStateParamObject = _.findWhere(vm.taskSpace.objects,{"objectId" : objectId});
									if(nestedStateParamObject) {
										vm.taskSpace.focusObject1 = nestedStateParamObject.objectId;
										vm.taskSpaceState.focusObject1 = nestedStateParamObject.objectId;
										openFocusObject(nestedStateParamObject);
									}
								});
							} else if($state.params.dc == "g") {
								var currentGlobalObj = _.find(vm.taskSpace.objects,function(tsObject){
									return tsObject.objectInfo.sourceGlobalId == objectId;
								});
								if(currentGlobalObj) {
									vm.taskSpace.focusObject1 = currentGlobalObj.objectId;
									vm.taskSpaceState.focusObject1 = currentGlobalObj.objectId;
								}
								openFocusObject();
							} else {
								MessageService.showErrorMessage("OBJECT_NOT_EXISTS",[objectId]);
								openFocusObject();
							}
						} else if(!_.isEmpty(objectId) && (vm.taskSpace.focusObject1 == objectId)) {
							var stateParamObject = _.findWhere(vm.taskSpace.objects,{"objectId" : objectId});
							if(stateParamObject){
								openFocusObject(stateParamObject);
							} else if(!stateParamObject) {
								vm.tsDocList = "All";
								vm.selectedTSDocTypeFilters = _.where(vm.tsDocTypeFilters,function(tsDocTypeFilterObj){
									return tsDocTypeFilterObj.enabled;
								});
								showTaskSpaceDocs(null,vm.tsDocList,function() {
									var nestedStateParamObject = _.findWhere(vm.taskSpace.objects,{"objectId" : objectId});
									if(nestedStateParamObject) {
										vm.taskSpace.focusObject1 = nestedStateParamObject.objectId;
										vm.taskSpaceState.focusObject1 = nestedStateParamObject.objectId;
										openFocusObject(nestedStateParamObject);
									}
								});
							}
						} else {
							openFocusObject();
						}
					});
				}
			});
		}

		function hasEditPermission() {
			var status = false;
			if (vm.taskSpace && vm.taskSpace.permissions && vm.taskSpace.permissions.edit) {
				status = true;
			}
			return status;
		}

		function addObjectToTSToolTip() {
			if (hasEditPermission()) {
				return "Add to Taskspace";
			}

			return "Add to Taskspace (read-only permission)";
		}

		function addObjectToTsSection(TsSection) {
			if (!hasEditPermission()) {
				return false;
			}
			var modalInstance = $uibModal.open({
				animation: 'true',
				appendTo: $('.rootContainer'),
				templateUrl: 'app/components/BrowseFileOrFolder/BrowseFileOrFolder.html',
				controller: 'BrowseFileOrFolderController',
				controllerAs: 'vm',
				backdrop: 'static',
				size: "lg",
				resolve: {
					resources: function() {
						var resourcesObj = {
							"tsId": vm.taskSpace.id,
							"clientId": vm.taskSpace.clientId,
							"tsSectionsList": vm.taskSpace.sections,
							"selectedTSSection": TsSection,
							"source": undefined,
							"folderId": null,
							"btnLable": "ADD",
							"action": "addToTS",
							"enableAction": "Document",
							"disableDocuments": false,
							"validateFolderPerms": false,
							"supportMultiSelectDoc": true,
							"supportMultiSelectFolder": false,
							"showAddFolder": true,
							"showNewDoc": true,
							"showUploadDoc": true
						};
						if (!_.isEmpty(vm.taskSpace.defaultFolderId) && vm.hasPermOnTsDefaultFolder) {
							resourcesObj.defaultUploadFolderId = vm.taskSpace.defaultFolderId;
						} else {
							var previousUploadedFolderId = _.findWhere(appdata.UiUserState, { stateKey: "uploadedFolderId" });
							if (!_.isEmpty(previousUploadedFolderId) && !_.isEmpty(previousUploadedFolderId.stateValue)) {
								resourcesObj.defaultUploadFolderId = previousUploadedFolderId.stateValue;
							}
						}
						return resourcesObj;
					},
					foldersList: function() {
						return DocFactory.getDocsUnderFolder(appdata.rootFolderId);
					}
				}
			});

			modalInstance.result.then(function(resultsData) {
				openObjectByUser = true;
				onObjectAdded(resultsData);
			});
		}

		function onObjectAdded(resultsData) {
			if (!_.isEmpty(resultsData)) {
				var msg = {
					type: "Document",
					id: resultsData[0].objectId,
					focused: "One",
					clientId: resultsData[0].clientId,
					docType: resultsData[0].objectInfo.docType
				};

				var objectsUpdated = updateObjects({objectId: msg.id},msg.focused);
				if(!_.isEmpty(objectsUpdated)) {
					objectsUpdated.then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							getTaskSpaceById(vm.clientId,vm.tsId);
						}
					});
				} else {
					getTaskSpaceById(vm.clientId,vm.tsId);
				}
				/*$scope.$broadcast('openObject',msg);
				_.each(resultsData, function(obj, i) {
					if (angular.isArray(vm.taskSpace.objects)) {
						if(_.isEmpty(_.findWhere(vm.taskSpace.objects,{"objectId": obj.objectId}))) {
							vm.taskSpace.objects.push(obj);
						}
					} else {
						vm.taskSpace.objects = [];
						vm.taskSpace.objects.push(obj);
					}
					if (angular.isArray(vm.taskSpaceState.objects)) {
						if(_.isEmpty(_.findWhere(vm.taskSpaceState.objects,{"objectId": obj.objectId}))) {
							vm.taskSpaceState.objects.push(obj);
						}
					} else {
						vm.taskSpaceState.objects = [];
						vm.taskSpaceState.objects.push(obj);
					}
				});
				processTSObjects(vm.taskSpace.objects);
				$scope.$emit("TsObjectsChanged", {"action" : "add","taskspaceId" : vm.taskSpace.id,"tsObjs" : resultsData});*/
			}
		}

		function getToolTip(key) {
			return ToolTipService.showToolTip(key);
		}

		function getFileIcon(name) {
			var fileType = "";
			if (name) {
				fileType = name.split('.').pop();
			}
			var fileIcon = DocFactory.fileIconMap[fileType];
			if (!fileIcon) {
				fileIcon = DocFactory.fileIconMap['txt'];
			}
			return fileIcon;
		}

		var fileIconMap = {
			"doc": "fl fl-docx",
			"docx": "fl fl-docx",
			"pdf": "fl fl-pdf",
			"xls": "fl fl-xlx",
			"xlsx": "fl fl-xlx",
			"pptx": "fl fl-ppt",
			"ppt": "fl fl-ppt",
			"jpeg": "fl fl-img",
			"jpg": "fl fl-img",
			"png": "fl fl-img",
			"gif": "fl fl-img",
			"xml": "fl fl-txt",
			"txt": "fl fl-txt"
		};

		function getDocIcon(doc) {
			if (!_.isEmpty(doc)) {
				return DocFactory.getFileImgIcon(doc.name, doc.docType);
			}
		}

		function getExtDocIcon(objectInfo) {
			if (objectInfo && !_.isEmpty(objectInfo.docSource)) {
				let type = objectInfo.docSource.toLowerCase();
				return DocFactory.getExtFileIcon(type);
			}
		}

		function getAnnotCount(objectInfo) {
			return TaskSpaceService.getAnnotCount(objectInfo);
		}

		function getBreakpoint() {
			var windowWidth = $window.innerWidth;

			if (windowWidth < 768) {
				return 'xs';
			} else if (windowWidth >= 768 && windowWidth < 992) {
				return 'sm';
			} else if (windowWidth >= 992 && windowWidth < 1200) {
				return 'md';
			} else if (windowWidth >= 1200) {
				return 'lg';
			}
		}

		var noOfEmptyCards = {
			xs: 1,
			sm: 3,
			md: 4,
			lg: 5
		};

		function processTSObjects(objs) {
			taskSpaceDocsList = angular.copy(objs);
			var bp = getBreakpoint();
			var nd = noOfEmptyCards[bp];
			var dmList = [];
			if (objs) {
				nd -= objs.length;
			}
			for (var i = 0; i < nd; i++) {
				dmList.push(dummyTSObj);
			}

			vm.dummyTSObjList = dmList;
		}

		function showTaskSpaceDocs(event, value, cb) {
			vm.tsDocList = value;
			if (value == "All") {
				vm.taskSpace.objects = angular.copy(taskSpaceDocsList);
			} else if (value == "Favorites") {
				vm.taskSpace.objects = _.where(taskSpaceDocsList, { "favorite": true });
			} else if (value == "Owned by Me") {
				vm.taskSpace.objects = _.filter(taskSpaceDocsList, function(obj) {
					return appdata.UserId == obj.objectInfo.createdBy;
				});
			} else if (value == "Shared with me") {
				vm.taskSpace.objects = _.filter(taskSpaceDocsList, function(obj) {
					return appdata.UserId != obj.objectInfo.createdBy;
				});
			}
			applyTSDocTypeFilter(event, cb);
		}

		function saveTsDocsSortByOpt(postdata) {
			TaskSpaceService.saveTsDocsSortByOpt(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					vm.savedState = true;
				}
			});
		}

		function sortDocsBy(event, field) {
			var taskSpaceDocs = [];
			var taskSpaceSections = [];
			if (vm.tsDocListSortBy != field) {
				vm.tsDocListSortByDec = false;
			}
			vm.tsDocListSortBy = !_.isEmpty(field) ? field : "name";
			vm.tsSectionListSortBy = !_.isEmpty(field) ? field : "name";;
			if (!_.isEmpty(field) && (field === "datePublished" || field == "dateModified" || field == "annotatedDate" || field == "dateAdded")) {
				vm.tsSectionListSortBy = "dateAdded";
			}
			taskSpaceSections = orderBy(vm.taskSpace.sections, vm.tsSectionListSortBy, vm.tsDocListSortByDec);
			if (field === "datePublished" || field == "dateModified" || field == "annotatedDate" || field == "dateAdded") {
				taskSpaceDocs = sortDatePublishedFilter(vm.taskSpace.objects, vm.tsDocListSortBy, vm.tsDocListSortByDec);
			} else {
				taskSpaceDocs = orderBy(vm.taskSpace.objects, vm.tsDocListSortBy, vm.tsDocListSortByDec);
			}
			if (!_.isEmpty(taskSpaceSections)) {
				vm.taskSpace.sections = taskSpaceSections;
			}
			if (!_.isEmpty(taskSpaceDocs)) {
				vm.taskSpace.objects = taskSpaceDocs;
			}
			var docTypeFilterBy = [];
			if (isTSDocTypeFilterSelected({ "key": "All" })) {
				docTypeFilterBy = ["All"]
			} else {
				_.each(vm.selectedTSDocTypeFilters, function(selectedTSDocType) {
					docTypeFilterBy.push(selectedTSDocType.key);
				});
			}

			if (event) {
				var postdata = {
					"id": vm.taskSpace.id,
					"clientId": vm.taskSpace.clientId,
					"docsFilterBy": vm.tsDocList,
					"docTypeFilterBy": docTypeFilterBy,
					"docsSortBy": { "field": vm.tsDocListSortBy, "descending": vm.tsDocListSortByDec }
				};
				saveTsDocsSortByOpt(postdata);
			}

			/*if(field === "datePublished") {
				// The below commented code will use full if our date long values are coming as string
				//angular.forEach(vm.taskSpace.sections, function (section) {
					//section.age = parseInt(section.age);
				//});
				taskSpaceSections = orderBy(vm.taskSpace.sections, vm.tsSectionListSortBy,vm.tsDocListSortByDec);
				taskSpaceDocs =  sortDatePublishedFilter(vm.taskSpace.objects);
			}*/
		}

		function checkIsGlobalAllowed() {
			if (appdata && appdata.UserSettings && appdata.UserSettings.contentAccess_FinancialAnalyst === "No") {
				var ownerShipDoctypes = vm.docTypes["ownerShip"];
				_.findWhere(ownerShipDoctypes, { type: "isGlobal" }).checked = false;
				_.findWhere(ownerShipDoctypes, { type: "isGlobal" }).disable = true;
			}
		}

		function setSearchDefaults() {
			vm.query = angular.copy(AdvSearchService.SearchQuery);
			vm.query.userId = appdata.UserId;
			vm.query.enterprises = [appdata.Organization];

			vm.advancedInputs = vm.query.advancedInputs;
			vm.ModifiedDtModel = angular.copy(AdvSearchService.ModifiedDtModel);

			vm.docTypes = angular.copy(AdvSearchService.docTypes);
			checkIsGlobalAllowed();
		}

		function toggleTSObjectsSearch() {
			var modalInstance = $uibModal.open({
				animation: 'true',
				appendTo: $('.rootContainer'),
				templateUrl: 'app/components/TaskSpace/SearchTsObjects/searchTsObjects.html',
				controller: 'SearchTsObjectsController',
				controllerAs: 'sto',
				backdrop: 'static',
				windowClass: 'search-ts-objects-modal',
				size: "lg"
			});
			modalInstance.result.then(function(resultsData) {

			});
		}

		function selectSearchObj($event) {
			if ($event) {
				$event.preventDefault();
				$event.stopPropagation();
			}
		}

		var SlctdDocTypes = {
			getSelectedDocTypes: function() {
				var docTypes = [], displayDocTypes = [], subTypes = {}, DocTypes = [];
				var allDocs = vm.docTypes['Documents'];
				var ownerShip = vm.docTypes['ownerShip'];
				var optional = vm.docTypes['optional'];
				var DocTypeSelectons = _.where(_.union(allDocs, ownerShip, optional), { "checked": true });

				var ownerShipSelection = _.where(ownerShip, { "checked": true });

				vm.advancedInputs.isGlobal = false;
				vm.advancedInputs.sharedWithMe = false;
				vm.advancedInputs.myDocuments = false;
				vm.advancedInputs.annotatedDocs = false;
				vm.query.entityTypes = [];

				if (DocTypeSelectons) {

					var filteredArray = _.filter(DocTypeSelectons, function(obj) {
						return obj.type != "All_SEC";
					});

					var SecArray = _.filter(DocTypeSelectons, function(obj) {
						return obj.type == "All_SEC";
					});

					var CompanyDocArray = _.filter(DocTypeSelectons, function(obj) {
						return obj.type == "CompanyDoc";
					});

					if (vm.docTypes.selectAllDocs) {
						displayDocTypes.push("ALL");
					} else if (SecArray.length > 0) {
						displayDocTypes.push(SecArray[0].lable);
					}
					if (!vm.docTypes.selectAllDocs && CompanyDocArray.length > 0) {
						displayDocTypes.push(CompanyDocArray[0].lable);
					}

					if (SecArray.length > 0) {
						DocTypes.push("SECFile");
						DocTypes.push("SECCompareFile");
					} else if (SecArray.length == 0) {
						subTypes["SECFile"] = [];
						subTypes["SECCompareFile"] = [];
					}

					if (CompanyDocArray.length == 0) {
						subTypes["CompanyDoc"] = [];
					}

					_.each(filteredArray, function(obj, index) {
						switch (obj.group) {
							case "SECFile":

								if (SecArray.length == 0) {
									subTypes.SECFile.push(obj.type);
									subTypes.SECCompareFile.push(obj.type);
								}

								if (!_.contains(vm.query.entityTypes, "document")) {
									vm.query.entityTypes.push("document");
								}

								if (SecArray.length == 0 && !vm.docTypes.selectAllDocs) {
									displayDocTypes.push(obj.lable);
								}

								break;
							case "Document":

								if (!vm.docTypes.selectAllDocs) {
									if (!obj.subGroup) {
										displayDocTypes.push(obj.lable);
									}
									if (CompanyDocArray.length == 0 && obj.type != "CompanyDoc" && obj.subGroup && obj.subGroup === "CompanyDoc") {
										displayDocTypes.push(obj.lable);
									}
								}

								if (obj.type === "CompanyDoc" && obj.checked) {
									DocTypes.push(obj.type);
								} else if (obj.subGroup && obj.subGroup === "CompanyDoc" && CompanyDocArray.length == 0 && obj.type != "CompanyDoc") {
									subTypes.CompanyDoc.push(obj.type);
								}

								if (obj.type != "News") {
									if (!obj.subGroup || obj.subGroup !== "CompanyDoc") {
										DocTypes.push(obj.type);
									}

									if (!_.contains(vm.query.entityTypes, "document")) {
										vm.query.entityTypes.push("document");
									}
								} else if (!_.contains(vm.query.entityTypes, "news")) {
									vm.query.entityTypes.push("news");
								}
								break;
							case "ownerShip":

								vm.advancedInputs[obj.type] = true;
								if (!_.contains(vm.query.entityTypes, "document")) {
									vm.query.entityTypes.push("document");
								}

								if (ownerShip.length != ownerShipSelection.length) {
									displayDocTypes.push(obj.lable);
								}

								break;
							case "optional":
								vm.advancedInputs.annotatedDocs = true;
								if (!_.contains(vm.query.entityTypes, "document")) {
									vm.query.entityTypes.push("document");
								}

								displayDocTypes.push(obj.lable);
								break;
						}
					});
				}

				if (SecArray.length == 0) {
					if (subTypes.SECFile.length == 0) {
						delete subTypes.SECFile;
						delete subTypes.SECCompareFile
					}
				}

				if (CompanyDocArray.length == 0) {
					if (subTypes.CompanyDoc.length == 0) {
						delete subTypes.CompanyDoc;
					}
				}

				vm.advancedInputs.documentType = DocTypes;
				vm.advancedInputs.subtypes = subTypes;

				return displayDocTypes.join(",");
			}
		};

		function processQuery(query1, saveFlag) {
			SlctdDocTypes.getSelectedDocTypes();

			var query = angular.copy(query1);

			if (_.isString(query.searchString) && !_.isEmpty(query.searchString)) {

				if (_.startsWith(query.searchString, "~")) {
					query.queryString = _.strRight(query.searchString, "~");
					delete query.searchString;
				} else if (query.searchString.indexOf('"') != -1 && query.searchString.indexOf('~') != -1) {
					var n = query.searchString.split('~');
					if (n.length >= 2) {
						query.searchString = n[0];
						if (_.isEmpty(n[0])) {
							MessageService.showErrorMessage("PROXIMITY_VAL_ERR");
							return false;
						} else {
							var re = new RegExp(/\w+\s\w+/);
							if (!_.isEmpty(n[0]) && !isNaN(n[1]) && n[0].match(re)) {
								query.proximity = n[1].trim();
							} else {
								MessageService.showErrorMessage("PROXIMITY_VAL_ERR");
								return false;
							}
						}
					}
				}
			} else {
				delete query.searchString;
				var sortOption = {};
				if (_.isEmpty(query.advancedInputs.sort)) {
					sortOption["datePublished"] = "desc";
					query.advancedInputs.sort = sortOption;
					vm.advancedInputs.sort = sortOption;
				}
			}

			if (!query.systemSearchId) {
				delete query.systemSearchId;
			}

			if (query.entityTypes.length == 0) {
				delete query.entityTypes;
			}

			if (query.advancedInputs.tags.length == 0) {
				delete query.advancedInputs.tags;
			}


			if (_.isEmpty(query.advancedInputs.sort)) {
				delete query.advancedInputs.sort;
			}


			if (query.advancedInputs.tickers.length == 0) {
				delete query.advancedInputs.tickers;
			} else if (!saveFlag) {
				query.advancedInputs["ciks"] = [];
				_.each(query.advancedInputs.tickers, function(ticker, index) {
					if (ticker.group == "companies") {
						query.advancedInputs.ciks.push(ticker.cik);
					} else if (ticker.group == "portfolios") {
						if (ticker.portfolioTickers && !_.isEmpty(ticker.portfolioTickers)) {
							_.each(ticker.portfolioTickers, function(elem) {
								query.advancedInputs.ciks.push(elem.cik);
							});
						}
					}
				});
				delete query.advancedInputs.tickers;
			} else if (saveFlag) {
				var tickersArray = [];
				var portfoliosArray = [];
				_.each(query.advancedInputs.tickers, function(ticker, index) {
					if (ticker.group == "companies") {
						tickersArray.push(ticker);
					} else if (ticker.group == "portfolios") {
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

			if (_.isEmpty(query.advancedInputs.documentType) || vm.docTypes.selectAllDocs) {
				delete query.advancedInputs.documentType;
			}

			if (query.advancedInputs.documentName == null) {
				delete query.advancedInputs.documentName;
			}

			if (vm.ModifiedDtModel.datePublished.fromDate || vm.ModifiedDtModel.datePublished.toDate) {
				var date = angular.copy(vm.ModifiedDtModel);
				date.datePublished.timeframe = vm.timeFrameDate.selected.id;
				if (date.datePublished.fromDate) {
					//date.datePublished.fromDate = moment(date.datePublished.fromDate).format(vm.defaultDateFormat);

					date.datePublished.fromDate = date.datePublished.fromDate;
				} else {
					delete date.datePublished.fromDate;
				}
				if (date.datePublished.toDate) {

					//date.datePublished.toDate = moment(date.datePublished.toDate).format(vm.defaultDateFormat);
					date.datePublished.toDate = date.datePublished.toDate;
				} else {
					delete date.datePublished.toDate;
				}
				query.advancedInputs.dates.push(date);
			}

			/*if (vm.filingDtModel.formFilingDate.fromDate || vm.filingDtModel.formFilingDate.toDate) {
				query.advancedInputs.dates.push(vm.filingDtModel);
			}*/

			if (query.advancedInputs.dates.length == 0) {
				delete query.advancedInputs.dates;
			}

			return query;
		}

		function refreshSearchObjects(searchText) {
			if (!_.isEmpty(searchText)) {
				vm.query.searchString = searchText;
				var query = processQuery(vm.query, false);
				if (query.advancedInputs) {
					query.advancedInputs.taskspaceIds = [vm.tsId];
				}
				query.searchType = "Adhoc";
				if (!_.isEmpty(query)) {
					AdvSearchService.getEntities(query).then(function(results) {
						if (results.status == 200) {
							var data = _.omit(results.data.Search, "count", "maxScore", "totalHits");
							var entities = _.map(data, function(val, key) {
								if (key != "count") {
									for (var i = 0; i < val.length; i++) {
										val[i]['datePublished'] = moment(val[i]['datePublished'], vm.defaultDateFormat).toDate();
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
							vm.searchedObjects = _.flatten(entities);
						}
					});
				}
			}
		}

		function openObjectInLayout(layout, searchText, selectedObject) {
			vm.query.searchString = "";
			searchText = "";
			toggleTSObjectsSearch();
			$state.go('taskspace.list.task', { 'tsId': vm.tsId, 'tsc': vm.clientId, 'd': selectedObject.ID, 'dc': selectedObject.clientId });
			$timeout(function() {
				setLayout(layout);
			}, 0);

		}

		function onObjectClick($event,tsObj) {
			if($event) {
				openObjectByUser = true;
			}
			var msg = {
				type: tsObj.type,
				id: tsObj.objectId,
				focused: "One",
				clientId: tsObj.clientId,
				docType: tsObj.objectInfo.docType
			};
			$scope.$broadcast('openObject', msg);
		}

		function getTSSectionDocCount(TsSection) {
			var count = 0;
			var sectionDocs = _.where(vm.taskSpace.objects, { "sectionId": TsSection.id });
			if (_.isEmpty(vm.docSearchTxt) && !_.isEmpty(sectionDocs)) {
				count = sectionDocs.length;
			} else if (!_.isEmpty(vm.docSearchTxt)) {
				count = $('#' + TsSection.id + ' .ts-card-wrap').length;
			}
			return count;
		}

		function renameTsSection(TsSection) {
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: 'app/components/TaskSpace/RenameTsSection/RenameTsSection.html',
				controller: 'RenameTsSectionController',
				appendTo: $('.rootContainer'),
				controllerAs: 'vm',
				resolve: {
					taskspace: function() {
						return vm.taskSpace;
					},
					TsSection: function() {
						return TsSection;
					}
				}
			});

			modalInstance.result.then(function(results) {
				getUpdatedTaskspace(vm.clientId, vm.tsId);
				MessageService.showSuccessMessage("RENAME_TASKSPACE_SECTION", [results.name]);
			}, function() {

			});
		}

		function addSectionToTSToolTip() {
			if (hasEditPermission()) {
				return "Add Section to Taskspace";
			}
			return "Add Section to Taskspace (read-only permission)";
		}

		function addSectionToTS() {
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: 'app/components/TaskSpace/NewTSSecton/NewTSSecton.html',
				controller: 'NewTSSectonController',
				appendTo: $('.rootContainer'),
				controllerAs: 'vm',
				backdrop: 'static',
				resolve: {
					taskspace: function() {
						return vm.taskSpace;
					}
				}
			});

			modalInstance.result.then(function(results) {
				//getTaskSpaceById(vm.clientId, vm.tsId);
				getUpdatedTaskspace(vm.clientId, vm.tsId);
				MessageService.showSuccessMessage("TASKSPACE_SECTION_CREATE", [results.name]);
			}, function() {

			});
		}

		function getRemoveSectionBtnClass(index) {
			return "remove-ts-section-" + index;
		}

		function removeTsSection(event, TsSection) {
			var text = "Are you sure you want to remove Section '" + TsSection.name + "' from taskspace ?";
			$confirm({ text: text }).then(function() {
				var postdata = {
					"clientId": vm.taskSpace.clientId,
					"taskspaceId": vm.taskSpace.id,
					"sectionId": TsSection.id // id of the section to be deleted	
				};
				TaskSpaceService.removeSectionFromTS(postdata).then(function(resp) {
					if (resp.status == 200 && resp.data.Status) {
						//getTaskSpaceById(vm.clientId, vm.tsId);
						getUpdatedTaskspace(vm.clientId, vm.tsId);
						MessageService.showSuccessMessage("REMOVE_SECTION_FROM_TS", [TsSection.name]);
					}
				});
			}, function() {

			});
		}
		function toggleTsSection(TsSection) {
			/*if(getTSSectionDocCount(TsSection) > 0){
				TsSection.collabOpen = !TsSection.collabOpen;
			}*/
			if (vm.sectionHasDocuments(TsSection)) {
				//TsSection.collabOpen = !TsSection.collabOpen;
				vm.sectionConfig[TsSection.id] = !vm.sectionConfig[TsSection.id];
			}
		}

		function sectionHasDocuments(TsSection) {
			var status = false;
			var sectionObj = _.findWhere(vm.taskSpace.objects, { "sectionId": TsSection.id })
			if (!_.isEmpty(sectionObj)) {
				status = true;
			}
			return status;
		}

		function getDocDateLable() {
			var docDateLable = "Annotated";
			if (vm.tsDocListSortBy == 'dateAdded') {
				docDateLable = "Added";
			} else if (vm.tsDocListSortBy == 'dateModified') {
				docDateLable = "Modified";
			}
			return docDateLable;
		}

		function getDocDateValue(TsObj) {
			var docDateValue = TsObj['annotatedDate'];
			if (vm.tsDocListSortBy == 'dateAdded') {
				docDateValue = TsObj['dateAdded'];
			} else if (vm.tsDocListSortBy == 'dateModified' && !_.isEmpty(TsObj.objectInfo)) {
				docDateValue = TsObj.objectInfo['dateModified'];
			}
			return docDateValue;
		}

		function isTSDocTypeFilterSelected(tsDocTypeFilter) {
			var status = false;
			if (tsDocTypeFilter.key == "All") {
				var isSelectedAll = true;
				_.each(vm.tsDocTypeFilters, function(selectedTSDocTypeFilter) {
					var selectedTSDocTypeFilterIndex = _.findIndex(vm.selectedTSDocTypeFilters, { "key": selectedTSDocTypeFilter.key });
					if (selectedTSDocTypeFilter.enabled && selectedTSDocTypeFilterIndex == -1) {
						isSelectedAll = false;
					}
				});
				status = isSelectedAll;
			} else {
				status = _.findWhere(vm.selectedTSDocTypeFilters, { "key": tsDocTypeFilter.key }) && tsDocTypeFilter.enabled;
			}
			return status;
		}
		
		function applyTSDocTypeFilter(event, cb) {
			var allSelectedDocTypeTSObjs = [];
			_.each(vm.selectedTSDocTypeFilters, function(selectedTSDocType) {
				var selectedDocTypeTSObjs = [];
				if (selectedTSDocType.key != "Other" && selectedTSDocType.enabled) {
					selectedDocTypeTSObjs = _.filter(vm.taskSpace.objects, function(obj) {
						return obj.objectInfo.docType == selectedTSDocType.key;
					});
				} else if (selectedTSDocType.key == "Other" && selectedTSDocType.enabled) {
					selectedDocTypeTSObjs = _.filter(vm.taskSpace.objects, function(obj) {
						var status = false;
						var uploadDocTypes = angular.copy(DocFactory.uploadDocTypes);
						uploadDocTypes = _.reject(uploadDocTypes, function(tsDocTypeFilter) {
							return tsDocTypeFilter.key == "WebClip";
						});
						var selectedUploadDoctype = _.findWhere(DocFactory.uploadDocTypes, { "type": obj.objectInfo.docType });
						if (!_.isEmpty(selectedUploadDoctype)) {
							status = true;
						}
						return status;
					});
				}

				if (_.isEmpty(allSelectedDocTypeTSObjs) && !_.isEmpty(selectedDocTypeTSObjs)) {
					allSelectedDocTypeTSObjs = selectedDocTypeTSObjs;
				} else if (!_.isEmpty(allSelectedDocTypeTSObjs) && !_.isEmpty(selectedDocTypeTSObjs)) {
					allSelectedDocTypeTSObjs = allSelectedDocTypeTSObjs.concat(selectedDocTypeTSObjs);
				}
			});
			vm.taskSpace.objects = allSelectedDocTypeTSObjs;
			var focusedObject = _.findWhere(vm.taskSpace.objects,{"objectId" : vm.taskSpaceState.focusObject1});
			if(event && _.isEmpty(focusedObject)) {
				focusedObject = vm.digestObject;
			}
			if(event && !_.isEmpty(focusedObject)) {
				$scope.$broadcast('openObject',{type:focusedObject.type,id:focusedObject.objectId,clientId:focusedObject.clientId,focused:"One", docType : focusedObject.objectInfo.docType});
			}
			if(typeof cb == "function") {
				cb();
			}
			sortDocsBy(event,vm.tsDocListSortBy);
		}
		
		function selectTSDocTypeFilter(event,tsDocTypeFilter) {
			if(tsDocTypeFilter.key == "All") {
				if(isTSDocTypeFilterSelected(tsDocTypeFilter)) {
					vm.selectedTSDocTypeFilters = [];
				} else {
					vm.selectedTSDocTypeFilters = _.where(vm.tsDocTypeFilters, function(tsDocTypeFilterObj) {
						return tsDocTypeFilterObj.enabled;
					});
				}
			} else {
				var isDocTypeContains = _.findWhere(vm.selectedTSDocTypeFilters, { "key": tsDocTypeFilter.key });
				if (!_.isEmpty(isDocTypeContains)) {
					vm.selectedTSDocTypeFilters = _.reject(vm.selectedTSDocTypeFilters, function(selectedTSDocTypeFilter) {
						return selectedTSDocTypeFilter.key == isDocTypeContains.key;
					});
				} else {
					vm.selectedTSDocTypeFilters.push(tsDocTypeFilter);
				}
			}
			showTaskSpaceDocs(event,vm.tsDocList);
		}

		function getAllFilter() {
			var filterLable = "";
			if (vm.tsDocList == 'All' && isTSDocTypeFilterSelected({ "key": "All" })) {
				filterLable = "All";
			}
			return filterLable;
		}

		function getSortedField() {
			var sortedLable = "";
			var selectedSortOption = _.findWhere(tsDocTypeSortOptions,{"key": vm.tsDocListSortBy});
			if(selectedSortOption) {
				sortedLable = selectedSortOption.label;
			} else {
				sortedLable = tsDocTypeSortOptions[0].label;
			}
			return sortedLable;
		}
		
		function getTSDocSortedOrderIcon() {
			return commonService.getSortedOrderIcon(tsDocTypeSortOptions, vm.tsDocListSortBy, vm.tsDocListSortByDec);
		}
		
		function showDocsButton(key, uploadFrom) {
			var status = false;
			var docButton = {};
			if (!_.isEmpty(docButtonsList)) {
				docButton = _.findWhere(docButtonsList, { "key": key });
			}
			if (docButton && docButton.show) {
				if (key === "researchView_Upload") {
					if (!_.isEmpty(uploadOptionsList)) {
						var uploadFromOption = _.findWhere(uploadOptionsList, { "key": uploadFrom });
						if (!_.isEmpty(uploadFromOption) && uploadFromOption.show) {
							status = true;
						}
					}
				} else {
					status = true;
				}
			}
			return status;
		}

		function showTSButton(key) {
			return TaskSpaceService.showTSButton(key, tsButtonsList);
		}

		function disableDocsButton(key, uploadFrom) {
			var status = true;
			var docButton = {};
			if (!_.isEmpty(docButtonsList)) {
				docButton = _.findWhere(docButtonsList, { "key": key });
			}
			if (docButton && docButton.isEnabled) {
				if (key === "researchView_Upload") {
					if (!_.isEmpty(uploadOptionsList)) {
						var uploadFromOption = _.findWhere(uploadOptionsList, { "key": uploadFrom });
						if (!_.isEmpty(uploadFromOption) && uploadFromOption.isEnabled) {
							status = false;
						}
					}
				} else {
					status = false;
				}
			}
			return status;
		}

		function disableTSButton(key) {
			return TaskSpaceService.disableTSButton(key, tsButtonsList);
		}

		var folderId = "";
		var fileInfo = {};

		function openNewDocumentModal(TSSection, docType) {
			getTSCurrentFolder(function() {
				var modalInstance = $uibModal.open({
					animation: $scope.animationsEnabled,
					templateUrl: 'app/components/Documents/NewDocument/NewDocument.html',
					controller: 'NewDocumentController',
					appendTo: $('.rootContainer'),
					controllerAs: 'vm',
					backdrop: 'static',
					size: 'md',
					resolve: {
						selectedTS: function() {
							return vm.taskSpace;
						},
						selectedTSSection: function() {
							return TSSection;
						},
						parentFolder: function() {
							return { "id": folderId };
						},
						docType: function() {
							return { "key": docType };
						}
					}
				});
				modalInstance.result.then(function(resultsData) {
					if (!_.isEmpty(resultsData)) {
						openObjectByUser = true;
						var msg = {
							type: "Document",
							id: resultsData[0].objectId,
							focused: "One",
							clientId: resultsData[0].clientId,
							docType: docType == "Notes" ? "Notes" : resultsData[0].objectInfo.docType
						};
						var objectsUpdated = updateObjects({objectId: msg.id},msg.focused);
						if(!_.isEmpty(objectsUpdated)) {
							objectsUpdated.then(function(resp) {
								if(resp.status == 200 && resp.data.Status) {
									getTaskSpaceById(vm.clientId,vm.tsId);
								}
							});
						} else {
							getTaskSpaceById(vm.clientId,vm.tsId);
						}
					}
				}, function() {

				});
			});
		}

		function uploadFilesFromClient(file, errFiles, TSSection, uploadDocFrom) {
			fileInfo.file = file;
			fileInfo.errFiles = errFiles;
			fileInfo.filesFrom = uploadDocFrom;
			UploadFileFactory.$scope = $rootScope.$new(true);
			UploadFileFactory.$scope.showProgress = false;
			UploadFileFactory.currntFolderId = folderId;
			//UploadFileFactory.$uibModalInstance = $uibModalInstance;
			UploadFileFactory.action = "addToTS";
			UploadFileFactory.selectedTS = { "id": vm.taskSpace.id, "clientId": vm.taskSpace.clientId };;
			UploadFileFactory.selectedTSSection = TSSection;
			if (fileInfo.file) {
				openObjectByUser = true;
			}
			UploadFileFactory.uploadFiles(fileInfo);
		}

		function uploadAndAddToSection(TSSection, uploadDocFrom) {
			var modalInstance = $uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'app/components/Documents/UploadAndAddToSection/UploadAndAddToSection.html',
				controller: 'UploadAndAddToSectionController',
				appendTo: $('.rootContainer'),
				controllerAs: 'vm',
				backdrop: 'static',
				size: 'md',
				resolve: {
					selectedTS: function() {
						return vm.taskSpace;
					},
					selectedTSSection: function() {
						return TSSection;
					},
					parentFolder: function() {
						return { "id": folderId };
					},
					uploadDocFrom: function() {
						return { "key": uploadDocFrom };
					}
				}
			});
			modalInstance.result.then(function(resultsData) {
				openObjectByUser = true;
				onObjectAdded(resultsData);
			}, function() {

			});
		}

		function getDefaultDownloadFolder(cb) {
			DocFactory.getDownloadFolder().then(function(response) {
				if (response.status == '200' && response.data.Status) {
					if (typeof cb == "function") {
						cb(response.data.Folders);
					}
				}
			});
		}

		function getTSCurrentFolder(cb) {
			if (!_.isEmpty(vm.taskSpace) && (vm.taskSpace.owner.toLowerCase() === appdata.UserId.toLowerCase()) && !_.isEmpty(vm.taskSpace.defaultFolderId)) {
				folderId = vm.taskSpace.defaultFolderId;
				fileInfo.fldrId = folderId;
				if (typeof cb == "function") {
					cb();
				}
			} else {
				getDefaultDownloadFolder(function(downloadFolder) {
					folderId = downloadFolder.id;
					fileInfo.fldrId = folderId;
					if (typeof cb == "function") {
						cb();
					}
				});
			}
		}

		function uploadAndAddDocument(TSSection, uploadDocFrom) {
			getTSCurrentFolder(function() {
				if (!_.isEmpty(vm.taskSpace.sections)) {
					if (!_.isEmpty(TSSection) && TSSection.id != null) {
						angular.element('#upload-from-section-'+TSSection.id).triggerHandler('click');
					} else {
						uploadAndAddToSection(TSSection, uploadDocFrom);
					}
				} else {
					angular.element('#upload-from-ts').triggerHandler('click');
				}
			});
		}

		function browseFromEvernotes(noteBooksList, TSSection, uploadDocFrom) {
			var modalInstance = $uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'app/components/Documents/Evernote/BrowseEvernotes/browseFromEvernotes.html',
				controller: 'BrowseFromEvernotesController',
				controllerAs: 'vm',
				appendTo: $('.rootContainer'),
				backdrop: 'static',
				resolve: {
					fileInfo: fileInfo,
					noteBooksList: { noteBooksList: noteBooksList }
				}
			});

			modalInstance.result.then(function(evernotes) {
				openObjectByUser = true;
				var evernoteids = [];
				var files = [];
				_.each(evernotes, function(evernote) {
					files.push({ "guid": evernote.guid, "name": evernote.title });
				});
				uploadFilesFromClient(files, null, TSSection, uploadDocFrom);
			}, function() {

			});
		}

		function uploadEvernoteAndAddToTS(TSSection, uploadDocFrom) {
			EvernoteService.getNotebookList().then(function(resp) {
				if (resp.status == 200 && resp.data.Status) {
					if (!resp.data.OAuthErr) {
						var noteBooksList = resp.data.NoteBooks;
						browseFromEvernotes(noteBooksList, TSSection, uploadDocFrom);
					} else {
						var confirmText = "";
						switch (resp.data.EverNoteStatus) {
							case "NoAuth":
								confirmText = "Your evernote account is not authorized with 'numici'. Do you want to Authorize to access your Evernote account";
								break;
							case "Invalid":
								confirmText = "Authentication token is not valid. Do you want to Re-Authorize to access your Evernote account";
								break;
							case "Expired":
								confirmText = "User authentication time expired. Do you want to Re-Authorize to access your Evernote account";
								break;
						}

						$confirm({ text: confirmText })
							.then(function() {
								var postdata = { "redirectURL": $location.$$absUrl };
								EvernoteService.requestUserAuthrization(postdata).then(function(resp) {
									if (resp.status == 200 && resp.data.authUrl) {
										var uploadSessionLocal = {};
										uploadSessionLocal["uploadFrom"] = uploadDocFrom;
										uploadSessionLocal["selectedFolderId"] = fileInfo.fldrId;
										uploadSessionLocal["TSSection"] = TSSection;
										sessionStorage.setItem("uploadSession", JSON.stringify(uploadSessionLocal));
										$window.location.href = resp.data.authUrl;
									}
								});
							});
					}
				}
			});
		}

		function uploadAndAddEvernoteDocument(TSSection, uploadDocFrom) {
			getTSCurrentFolder(function() {
				if (!_.isEmpty(vm.taskSpace.sections)) {
					if (!_.isEmpty(TSSection) && TSSection.id != null) {
						uploadEvernoteAndAddToTS(TSSection, uploadDocFrom);
					} else {
						uploadAndAddToSection(TSSection, uploadDocFrom);
					}
				} else {
					uploadEvernoteAndAddToTS(TSSection, uploadDocFrom);
				}
			});
		}

		function isDocOwner(TsObj) {
			var status = false;
			if (TsObj.objectInfo && appdata && TsObj.objectInfo.createdBy == appdata.UserId) {
				status = true;
			}
			return status;
		}

		function RenameDoc(doc) {
			var postdata = {
				"id": doc.objectId,
				"clientId": doc.clientId,
				"newDisplayName": doc.name,
			};
			DocFactory.renameDocument(postdata).then(function(response) {
				if (response.status == 200 && response.data.Status) {
					var renamedDocIndex = _.findIndex(vm.taskSpace.objects, { "objectId": doc.objectId })
					if (renamedDocIndex != -1) {
						vm.taskSpace.objects[renamedDocIndex].name = doc.name;
						if (!_.isEmpty(vm.taskSpace.objects[renamedDocIndex].objectInfo)) {
							vm.taskSpace.objects[renamedDocIndex].objectInfo.name = doc.name;
						}
						MessageService.showSuccessMessage("DOC_RENAME");
					}
				}
			});
		}

		function renameTsObject(doc) {
			var modalInstance = $uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'app/components/Documents/Rename/renameDoc.html',
				controller: 'RenameDocController',
				appendTo: $('.rootContainer'),
				controllerAs: 'vm',
				backdrop: 'static',
				size: 'md',
				resolve: {
					doc: function() {
						return doc;
					}
				}
			});
			modalInstance.result.then(function(renamedDoc) {
				RenameDoc(renamedDoc);
			}, function() {

			});
		}

		function showTSSectionOrObjectInfo(infoFor, TSSectionOrObject) {
			var modalInstance = $uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'app/components/TaskSpace/TSSectionOrObjectInfo/TSSectionOrObjectInfo.html',
				controller: 'TSSectionOrObjectInfoController',
				appendTo: $('.rootContainer'),
				controllerAs: 'vm',
				backdrop: 'static',
				size: 'md',
				resolve: {
					source: function() {
						var sourceObj = {
							"infoFor": infoFor,
							"docsSortBy": { "field": vm.tsDocListSortBy, "descending": vm.tsDocListSortByDec }
						};
						if (infoFor == "section") {
							sourceObj["sectionInfo"] = TSSectionOrObject;
							sourceObj["documentInfo"] = {};
						} else if (infoFor == "document") {
							sourceObj["sectionInfo"] = {};
							sourceObj["documentInfo"] = TSSectionOrObject;
						}
						return sourceObj;
					}
				}
			});
			modalInstance.result.then(function() {

			}, function() {

			});
		}

		function initTSController() {
			docButtonsList = DocFactory.getDocButtons();
			tsButtonsList = TaskSpaceService.getTSButtons();
			uploadOptionsList = UploadFileFactory.getUploadOptions();
			vm.selectedTSDocTypeFilters = _.reject(vm.tsDocTypeFilters, function(tsDocTypeFilter) {
				return !tsDocTypeFilter.enabled;
			});
			getTaskSpaceById(vm.clientId, vm.tsId);
		}
		initTSController();
	}
})();
