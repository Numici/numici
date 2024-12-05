;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('TaskSpaceListController',TaskSpaceListController);
	TaskSpaceListController.$inject = ['$scope','$state','$stateParams','$uibModal','TaskSpaceService','_','$timeout',
									   'userService','MessageService','AnnotationService','AnnotationDigestService',
									   'appData','TagService','orderByFilter','$confirm','$deviceInfo',
										'VDVCConfirmService','notificationEvents','APIUserMessages',
										'commonService','$rootScope','LocalStorageService'];
	
	function TaskSpaceListController($scope,$state,$stateParams,$uibModal,TaskSpaceService,_,$timeout,
									userService,MessageService,AnnotationService,AnnotationDigestService,
									appData,TagService,orderBy,$confirm,$deviceInfo,
									VDVCConfirmService,notificationEvents,APIUserMessages,
									commonService,$rootScope,LocalStorageService) {
		var vm = this;
		var digestView = $stateParams.digest;
		var appdata = appData.getAppData();
		var docView_DownloadBtn;
		var tsCommentTimer;
		var taskspaceView_NewTaskspace;
		var taskspaceView_Allow1PaneOR2Pane = "Hidden";
		var taskspaceUiSettings = userService.getUiState("taskspaceUiSettings").stateValue;
		var taskSpacesList = [];
		var tsSortOptions = [{
			  "label":"Date Created",
			  "key" : "createdDate",
		  	  "type" : "number"
		    },{
			  "label":"Date Last Opened",
			  "key" : "lastOpened",
		  	  "type" : "number"
		    },{
			  "label":"Name",
			  "key" : "name",
		  	  "type" : "text"
		    }];
		
		vm.UserRole = appdata.UserRole;
		vm.deviceInfo = $deviceInfo;
		$scope.tabLimit = 3;
		vm.hiddenTabCount = 0;
		vm.curCmtId ;
		vm.tsCmtDD = {
			'isOpen' : false	
		};
		vm.addTagTSDD = {
			'isOpen' : false	
		};
		vm.favoriteBtnDisabled = false; 
		vm.tsSearchTxt;
		vm.tsList = "All";
		vm.tsListSortBy = "name";
		vm.tsListSortByDec = false;
		vm.currentUserId = appdata.UserId;
		vm.currentUser = appdata.UserName;
		vm.taskSpaces = [];
		vm.TSAnnotations = [];
		vm.activeTaskSpace;
		vm.tagLimit = 2;
		vm.selectedTags =[];
		vm.Alltags = [];
		vm.disableAddTag = disableAddTag;
		vm.saveTag = saveTag;
		vm.cancelAddTag = cancelAddTag;
		vm.unTag = unTag;
		vm.onRemoveTag = onRemoveTag;
		vm.onSelectTag = onSelectTag;
		vm.tagTransform = tagTransform;
		vm.refreshTagInfo = refreshTagInfo;
		vm.active;
		vm.newTaskSpace = newTaskSpace;
		vm.isNewTaskSpaceHidden = isNewTaskSpaceHidden;
		vm.isChangeViewHidden = isChangeViewHidden;
		vm.isNewTaskSpaceDisable = isNewTaskSpaceDisable;
		vm.isTSChangeLayoutHidden = isTSChangeLayoutHidden;
		vm.isTSChangeLayoutDisable = isTSChangeLayoutDisable;
		vm.setActivateTaskSpace = setActivateTaskSpace;
		vm.getActiveTaskSpaces = getActiveTaskSpaces;
		vm.getAllTaskSpaces = getAllTaskSpaces;
		vm.showTaskSpaces = showTaskSpaces;
		vm.sortBy = sortBy;
		vm.getTSSortedOrderIcon = getTSSortedOrderIcon;
		vm.getTSSortedField = getTSSortedField;
		vm.openTaskSpace = openTaskSpace;
		//vm.setCurrent = setCurrent;
		vm.closeTaskSpace = closeTaskSpace;
		vm.setFavorite = setFavorite;
		vm.annotationsDigest = annotationsDigest;
		vm.isTsSharable = isTsSharable;
		vm.shareTaskSpace = shareTaskSpace;
		vm.isTSConnectedToSlack = isTSConnectedToSlack;
		vm.chageLayout = chageLayout;
		vm.manageTaskSpace = manageTaskSpace;
		/*vm.getAnnotationsById = getAnnotationsById;
		vm.addTaskSpaceComment = addTaskSpaceComment;
		vm.addTSCmntDabld = addTSCmntDabld;
		vm.annotation = {"note" : ""};
		vm.reply = {};
		vm.canEditTSAnnotation = canEditTSAnnotation;
		vm.deleteComment = deleteComment;
		vm.preventClickEventOnEditComment = preventClickEventOnEditComment;
		vm.unBindClickEventonEditComment = unBindClickEventonEditComment;
		vm.updateComment = updateComment;
		vm.editComment = editComment;
		
		vm.onClickTsComment = onClickTsComment;
		vm.replyToComment = replyToComment;
		vm.cancelReplyComment = cancelReplyComment;*/
		vm.tabName = tabName;
		vm.getCollaboratorsHeading = getCollaboratorsHeading;
		vm.getDocsHeading = getDocsHeading;
		
		vm.toggleOnePaneTsList = toggleOnePaneTsList;
		vm.toggleTsListSideBarChecked = false;
		vm.changeTsView = changeTsView;
		
		
	    vm.actionProps = TaskSpaceService.actionProps;
	    vm.checkedItems = [];
	    vm.existedTaskspaces = [];
	    
		vm.isEnabled = isEnabled;
		
		vm.unTag = unTag;
		vm.selectTaskSpace = selectTaskSpace;
		vm.onLongPress = onLongPress;
		vm.showGridCheckbox = showGridCheckbox;
		vm.unselectAll = unselectAll;
		vm.executeTSAction = executeTSAction;
		vm.getTSDateLable = getTSDateLable;
		vm.getTSDateValue = getTSDateValue;
		
		if(appdata.UserSettings && appdata.UserSettings.docView_DownloadBtn) {
			docView_DownloadBtn = appdata.UserSettings.docView_DownloadBtn;
		}
		
		if(appdata.UserSettings && appdata.UserSettings.taskspaceView_NewTaskspace) {
			taskspaceView_NewTaskspace = appdata.UserSettings.taskspaceView_NewTaskspace;
		}
		
		if(appdata.UserSettings && appdata.UserSettings.taskspaceView_Allow1PaneOR2Pane) {
			taskspaceView_Allow1PaneOR2Pane = appdata.UserSettings.taskspaceView_Allow1PaneOR2Pane;
		}
				
		function toggleOnePaneTsList() {
			vm.toggleTsListSideBarChecked = !vm.toggleTsListSideBarChecked;
			$scope.$broadcast('resizeDoc', false);
        }
		
		function changeTsView(event,view) {
			if(event) {
				event.stopPropagation();
			}
			TaskSpaceService.view = view;
			$state.go($state.current.name, $state.params,{reload: true});
		}
		
		//Scope event listioners 
		
		var pendingTaskspaceListUpdates = [];
		var pendingTsDeleteUpdates = [];
		var pendingTsUnshareUpdates = [];
		var pendingTsDocUpdates = [];
		
		var hasCurrentTs = function(updates) {
			return _.findWhere(updates,{"taskspaceId": $state.params.tsId});
		}
		
		function handleTaskspaceListUpdates() {
				if(pendingTaskspaceListUpdates && pendingTaskspaceListUpdates.length == 0) {
					return;
				}
				var lastUpdate = pendingTaskspaceListUpdates[pendingTaskspaceListUpdates.length - 1];
				var events = pendingTaskspaceListUpdates.splice(0,pendingTaskspaceListUpdates.length); //pendingTaskspaceListUpdates.concat([]);
				var text = TaskSpaceService.getTaskspaceUpdateMessage(events,vm.currentUserId);
				vm.getAllTaskSpaces().finally(function() {
					if(!_.isEmpty(text)) {
						if(lastUpdate && lastUpdate.action == "SHARED") {
							var sharedTS = _.findWhere(vm.taskSpaces,{"id" : lastUpdate.taskspaceId});
							if(!_.isEmpty(sharedTS) && !_.isEmpty(sharedTS.name)){
								text = text+"'"+sharedTS.name+"'";
							}
						}
						APIUserMessages.notification(text);
					}
					//pendingTaskspaceListUpdates = [];
				});
		}
		
		function handleTaskspaceDocUpdates() {
				if(pendingTsDocUpdates && pendingTsDocUpdates.length == 0) {
					return;
				}
				var events = pendingTsDocUpdates.splice(0,pendingTsDocUpdates.length); //pendingTaskspaceListUpdates.concat([]);
				//var text = TaskSpaceService.getTaskspaceUpdateMessage(events,vm.currentUserId);
				var tsList = _.groupBy(events, function(msg){ 
					return msg.clientId+"::"+msg.taskspaceId;
				});
				
				if(!_.isEmpty(tsList)){
					_.each(tsList,function(val,key) {
						var ids = key.split("::");
						if(ids && ids.length == 2 && ids[0] && ids[1]) {
							getUpdatedTaskspace(ids[0], ids[1]).then(function(resp) {
								if (resp.status == 200 && resp.data.Status && resp.data.Taskspace) {
									var taskSpace = resp.data.Taskspace;
									if(_.isEmpty(taskSpacesList)) {
										taskSpacesList = [];
									} 
									taskSpacesList = _.map(taskSpacesList,function(ts) {
										if(taskSpace.id == ts.id) {
											return taskSpace;
										}
										return ts;
									});
									processTaskspaces();
								}
							});
						}
					});
				}
		}
		
		
		
		function handleTsDeleteUpdates() {
				if(pendingTsDeleteUpdates && pendingTsDeleteUpdates.length == 0) {
					return;
				}
				var events = pendingTsDeleteUpdates.splice(0,pendingTsDeleteUpdates.length); //pendingTsDeleteUpdates.concat([]);
				var text = TaskSpaceService.getTaskspaceUpdateMessage(events,vm.currentUserId);
				var hasCTs = hasCurrentTs(pendingTsDeleteUpdates);
				if(hasCTs && hasCTs.userId.toLowerCase() != vm.currentUserId.toLowerCase()) {
					var deleteMessage ;
					var tsObj = _.findWhere(vm.taskSpaces,{"id" : $state.params.tsId});
					if(tsObj) {
						deleteMessage = hasCTs.userId +' Deleted the taskspace '+tsObj.name;
					}
					$confirm({text:deleteMessage || text}, {
						templateUrl: 'app/components/common/CustomeTemplates/confirmTemplate.html',
						backdrop: 'static'
					})['finally'](function(){
						vm.getAllTaskSpaces().finally(function() {
							if(!_.isEmpty(text)) {
								APIUserMessages.notification(text);
							}
							//pendingTsDeleteUpdates = [];
						});
					});
				} else {
					vm.getAllTaskSpaces().finally(function() {
						if(!_.isEmpty(text)) {
							APIUserMessages.notification(text);
						}
						//pendingTsDeleteUpdates = [];
					});
				}
		}
		
		
		function handleUnshare() {
			if(pendingTsUnshareUpdates && pendingTsUnshareUpdates.length == 0) {
				return;
			}
			var lastUpdate = pendingTsUnshareUpdates[pendingTsUnshareUpdates.length - 1];
			var unsharedTS = _.findWhere(vm.taskSpaces,{"id" : lastUpdate.taskspaceId});
			var events = pendingTsUnshareUpdates.splice(0,pendingTsUnshareUpdates.length); //pendingTsUnshareUpdates.concat([]);
			var text = TaskSpaceService.getTaskspaceUpdateMessage(events,vm.currentUserId);
			var hasCTs = hasCurrentTs(pendingTsUnshareUpdates);
			if(hasCTs && hasCTs.userId.toLowerCase() != vm.currentUserId.toLowerCase()) {
				var unshareMessage ;
				var tsObj = _.findWhere(vm.taskSpaces,{"id" : $state.params.tsId});
				if(tsObj) {
					unshareMessage = hasCTs.userId +' Unshared the taskspace '+tsObj.name;
				}
				
				$confirm({text: unshareMessage || text}, {
					templateUrl: 'app/components/common/CustomeTemplates/confirmTemplate.html',
					backdrop: 'static'
				})['finally'](function(){
					vm.getAllTaskSpaces().finally(function() {
						if(!_.isEmpty(text)) {
							if(!_.isEmpty(unsharedTS.name)){
								text = text+"'"+unsharedTS.name+"'";
							}
							APIUserMessages.notification(text);
						}
						//pendingTsUnshareUpdates = [];
					});
				/*	var index = _.findIndex(vm.taskSpaces, {"id" : tsObj.id});
					var Orgindex = _.findIndex(taskSpacesList, {"id" : msg.taskspaceId});
					if(Orgindex >= 0) {
						taskSpacesList.splice(Orgindex,1);
					}
					if(index >= 0) {
						vm.taskSpaces.splice(index,1);
						if(vm.taskSpaces.length > 0) {
							vm.activeTaskSpace = vm.taskSpaces[vm.taskSpaces.length-1];
							vm.activeTaskSpace.current = true;
							vm.active = vm.activeTaskSpace.orderNumber;
							if(digestView) {
								$state.go('taskspace.list.digest' ,{"tsId" : vm.activeTaskSpace.id,"tsc" : vm.activeTaskSpace.clientId});
							} else {
								$state.go('taskspace.list.task' ,{"tsId" : vm.activeTaskSpace.id,"tsc" : vm.activeTaskSpace.clientId,d:null,dc:null,da:null});
							}						
						} else {
							vm.activeTaskSpace = vm.taskSpaces[0];
							$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":"List"});
							if(digestView) {
								$state.go('taskspace.digest',{digest:true});
								
							} else {
								$state.go('taskspace.list');
							}
						}
					}*/
				});
			} else {
				vm.getAllTaskSpaces().finally(function() {
					if(!_.isEmpty(text)) {
						if(!_.isEmpty(unsharedTS.name)){
							text = text+"'"+unsharedTS.name+"'";
						}
						APIUserMessages.notification(text);
					}
					//pendingTsUnshareUpdates = [];
				});
			}
		}
		
		var debounceHandleTaskspaceListUpdates = _.debounce(handleTaskspaceListUpdates, TaskSpaceService.notificationHandledelayTime);
		var debounceHandleTaskspaceDocUpdates = _.debounce(handleTaskspaceDocUpdates, TaskSpaceService.notificationHandledelayTime);
		var debounceHandleTsDeleteUpdates = _.debounce(handleTsDeleteUpdates, TaskSpaceService.notificationHandledelayTime);
		var debounceHandleUnshare = _.debounce(handleUnshare, TaskSpaceService.notificationHandledelayTime);

		
		function getUpdatedTaskspace(clientId, id) {
			return TaskSpaceService.getTaskSpaceById(clientId, id);
		}
		
		var loadEvents = [notificationEvents.TS_CREATED,
                    	  notificationEvents.TS_RENAMED,
                          notificationEvents.TS_OWNER_CHANGED,
						  notificationEvents.SHARED
						];
						
		var loadDocEvents = [notificationEvents.DOCS_ADDED,
                          notificationEvents.DOCUMENT_MOVED,
						  notificationEvents.DOCS_REMOVED,
				          notificationEvents.PERMISSIONS_CHANGED,
						];
						
						
  
		loadEvents.forEach(function (event) {
		   	$scope.$on(event, function (evt, msg) {
		    	pendingTaskspaceListUpdates.push(msg);
				debounceHandleTaskspaceListUpdates.cancel();
				if(pendingTaskspaceListUpdates.length < TaskSpaceService.maxNotifications) {
					debounceHandleTaskspaceListUpdates();
				} else {
					handleTaskspaceListUpdates();
				}
		    });
		});
		
		loadDocEvents.forEach(function (event) {
		   	$scope.$on(event, function (evt, msg) {
			  if(msg.taskspaceId && msg.clientId) {
				pendingTsDocUpdates.push(msg);
				if(pendingTsDocUpdates.length < TaskSpaceService.maxNotifications) {
					debounceHandleTaskspaceDocUpdates();
				} else {
					handleTaskspaceDocUpdates();
				}
			  }
		    });
		});
		
		$scope.$on(notificationEvents.TS_DELETED, function (evt, msg) {
	    	pendingTsDeleteUpdates.push(msg);
			debounceHandleTsDeleteUpdates.cancel();
			if(pendingTsDeleteUpdates.length < TaskSpaceService.maxNotifications) {
				debounceHandleTsDeleteUpdates();
			} else {
				handleTsDeleteUpdates();
			}
		});
		
		$scope.$on(notificationEvents.UNSHARED,function(event,msg) {
		    pendingTsUnshareUpdates.push(msg);
			debounceHandleUnshare.cancel();
			if(pendingTsUnshareUpdates.length < TaskSpaceService.maxNotifications) {
				debounceHandleUnshare();
			} else {
				handleUnshare();
			}
		});
		
		$scope.$on('TASKSPACE_ADDED',function(event,msg) {
			addToTaskSpacesList(msg.taskspace);
		});
		
		
		$scope.$watch('vm.TSAnnotations', function(oldValue,newValue) {
			$timeout(function() {
				if(TaskSpaceService.tsCommentId) {
					vm.tsCmtDD.isOpen = true;
					$timeout(function() {
						vm.curCmtId = null;
						vm.curCmtId = angular.copy(TaskSpaceService.tsCommentId);
						vm.selectedComment = {"id": vm.curCmtId};
						TaskSpaceService.tsCommentId = null;
					}, 0);
				}
			}, 0);
		});
		
		vm.layout;
		
		$scope.$on('currentLayout', function(event,msg) {
			vm.layout = msg;
			vm.layoutLable = msg == "Single" ? 2 : 1;
		});
		
		$scope.$on("TsObjectsChanged",function(event,msg){
			var currentTs = _.findWhere(taskSpacesList,{"id" : msg.taskspaceId});
			if(currentTs) {
				if(msg.action === "add") {
					_.each(msg.tsObjs,function(tsObj,index) {
						if (angular.isArray(currentTs.objects)) {
							if(_.isEmpty(_.findWhere(currentTs.objects,{"objectId": tsObj.objectId}))) {
								currentTs.objects.push({"objectId" : tsObj.objectId,"clientId" : tsObj.clientId,"type" : tsObj.type});
							}
						} else {
							currentTs.objects = [];
							currentTs.objects.push({"objectId" : tsObj.objectId,"clientId" : tsObj.clientId,"type" : tsObj.type});
						}
					});
				}
				if(msg.action === "remove") {
					currentTs.objects = _.reject(currentTs.objects, function(currentTsObj){
						return currentTsObj.objectId == msg.tsObj.objectId;
					});
				}
				var currentTsFromTaskspaces = _.findWhere(vm.taskSpaces,{"id" : msg.taskspaceId});
				if(currentTsFromTaskspaces) {
					currentTsFromTaskspaces.objects = angular.copy(currentTs.objects);
				}
			}
		});
		
		var isTSpaneCollapsed;
		$scope.$on("TipsWizardStarted", function(event, msg) {
			isTSpaneCollapsed = angular.copy(vm.toggleTsListSideBarChecked);
			if(isTSpaneCollapsed) {
				toggleOnePaneTsList();
			}
		});
		
		$scope.$on("TipsWizardStopped",function(event, msg){
			if(isTSpaneCollapsed != undefined && isTSpaneCollapsed == true) {
				toggleOnePaneTsList();
			}
		});
		
		function tabName(tab) {
			var tabname = tab.name;
			if(tab.tickers.length > 0 && tab.tickers[0] && tab.tickers[0] != null && tab.tickers[0] != "" && tab.tickers[0].length > 0) {
				tabname = tab.tickers[0]+ " - " +tab.name;
			}
			return tabname;
		}
		
		function getCollaboratorsHeading(ts) {
			if(ts.collaborators && ts.collaborators.length > 0) {
				let count = ts.collaborators.length+1;
				return count+" Members"
			}
			
			return "1 Member";
		}
		
		function getDocsHeading(ts) {
			if(ts.objects) {
				if(ts.objects.length == 1) {
					return "1 Document";
				} 
				
				if(ts.objects.length > 1) {
					return ts.objects.length+" Documents";
				}
			}
			return "0 Documents";
		}
		
		/*function onClickTsComment(event,ts) {
			vm.selectedComment = ts;
		}
		
		function replyToComment(event,ts) {
			
			if(!_.isEmpty(vm.reply[ts.id])) {
				var comment = {};
				
				comment["note"] = vm.reply[ts.id];
				comment["resourceType"] = "taskspace";
				comment["resourceId"] = ts.id;
				comment["cellKey"] = ts.id;
				comment["clientId"] = vm.activeTaskSpace.clientId;
				AnnotationService.replyToComment(comment,ts.id).then(function(response){
					if(response.status == 200 && response.data.Status) {
						delete vm.reply[ts.id];
						getAnnotationsById(false,true);
					}
				});
			}
		}
		
		function cancelReplyComment(event,ts) {
			delete vm.reply[ts.id];
			vm.selectedComment = null;
			
		}*/
		
		function getItemTags () {
			TagService.getItemTags('high',vm.activeTaskSpace).then(function(response){
				if (response.status == 200) {
					vm.activeTaskSpace.tags = response.data.Tag;
					vm.activeTaskSpace.tags =  orderBy(vm.activeTaskSpace.tags, "TagName");
					vm.selectedTags = angular.copy(vm.activeTaskSpace.tags);
				}
			});
		}
		
		function onRemoveTag (tag) {
			vm.addTagTSDD.isOpen = true;
		  	if(tag.TagId) {
		  		var isCurrentTSTag = _.findWhere(vm.activeTaskSpace.tags,{"TagId":tag.TagId});
		  		if(isCurrentTSTag) {
		  			unTag(tag);
		  		}
		  		
		  	}
		 }
		 
		 function onSelectTag (tag) {
			  	tag.isNew = true;
		 }
		 
		 function tagTransform (tagname) {
			  	return {
			  		"TagId":null,
			  		"TagName" : tagname,
			  		"isNew" : true
			  	};
		 }
				
		 function refreshTagInfo (searchkey) {
			  if(!_.isEmpty(searchkey)) {
				  TagService.getAllTags(searchkey).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							vm.Alltags = resp.data.Tag; 
						}
					});
			  }
		 }
		 
		 var processItems = function(items) {
			 var processedItems = [];
			 _.each(items,function(item,index) {
				 var obj = {};
				 obj["Type"] = "Taskspace";
				 obj["TopObjectId"] = item.id;
				 obj["TopObjectClientId"] = item.clientId;
				 processedItems.push(obj);
			 });
			 return processedItems;
		 };
		 
		 function disableAddTag() {
			 var status = false;
			 if(vm.activeTaskSpace && vm.activeTaskSpace.permissions.readOnly) {
				 status = true;
			 }
			 return status;
		 }
		 
		 function handleTagCB(taggedInfo) {
			 var isTaggedFalse = _.findWhere(taggedInfo,{"isTagged" : false});
			 var isTaggedTrue = _.where(taggedInfo,{"isTagged" : true});
			 if(isTaggedFalse) {
				 var NoPermOnObjectList = _.where(taggedInfo,{"Reason" : "NoPermOnObject"});
				 var ObjectNotFoundList = _.where(taggedInfo,{"Reason":"ObjectNotFound"});
				 var NoReasonObjectList = _.where(taggedInfo,{"Reason" : null});
				
				 if(!_.isEmpty(NoPermOnObjectList)) {
					 MessageService.showErrorMessage("TAG_ITEMS_ERR");
				 } else if(!_.isEmpty(ObjectNotFoundList)) {
					 MessageService.showErrorMessage("ITEMS_NOT_FOUND_TAG");
				 } else if(!_.isEmpty(NoReasonObjectList)) {
					 MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
				 } else {
					MessageService.showErrorMessage("BACKEND_ERR_MSG",[isTaggedFalse.Reason]);
				 }
			 } else if(!_.isEmpty(isTaggedTrue)) {
				 vm.addTagTSDD.isOpen = false;
				 MessageService.showSuccessMessage("TAG_ITEMS",[vm.activeTaskSpace.name]);
			 }
		 }
		 
		 function saveTag($event) {
			$event.preventDefault();
			$event.stopPropagation(); 
			var tagsToSave = _.pluck(_.where(vm.selectedTags, {isNew: true}), 'TagName');
			if(!_.isEmpty(tagsToSave)) {
				var postdata = {};
				postdata["Tags"] = tagsToSave;
				postdata["Items"] = processItems([vm.activeTaskSpace]);
				TagService.tagItems(postdata).then(function(response) {
					if (response.status == 200 && response.data.Status) {
						//TagService.getItemTagsById(vm.activeTaskSpace);
						getItemTags();
						handleTagCB(response.data.resultList);
					}
				});
			} else {
				vm.addTagTSDD.isOpen = false;
			}
		 }
		 
		 function cancelAddTag($event) {
			 vm.selectedTags = angular.copy(vm.activeTaskSpace.tags);
			 vm.addTagTSDD.isOpen = false;
		 }
		 
		function unTag(tag,$event) {
			if($event) {
				$event.preventDefault();
			    $event.stopPropagation();
			}
			if(tag) {
				var text = "Are you sure you want to delete Tag "+tag.TagName+" ?";
	  			$confirm({text: text})
		        .then(function() {
		        	TagService.unTag(tag,vm.activeTaskSpace).then(function(response){
						if (response.status == 200) {
							getItemTags();
						}
					});
			    }, function() {
			    	
			    });
			}
		 }
		
		$scope.$on("$destroy",function() {
			//cancelCommentTimer();
			debounceHandleTsDeleteUpdates.cancel();
			debounceHandleTaskspaceListUpdates.cancel();
			debounceHandleTaskspaceDocUpdates.cancel();
			debounceHandleUnshare.cancel();
			
		});
		
		$scope.$on("currentTs",function(event,taskSpace) {
			var t = $timeout(function() {
				var ts = _.findWhere(vm.taskSpaces,{"id":taskSpace.id });
				if(ts) {
					ts.lastOpened = moment.utc().valueOf();
					if(vm.activeTaskSpace) {
						vm.activeTaskSpace.current = false;
					}
					vm.activeTaskSpace = ts;
					vm.activeTaskSpace.current = true;
					vm.activeTaskSpace.tags = taskSpace.tags;
					vm.activeTaskSpace.tags =  orderBy(vm.activeTaskSpace.tags, "TagName");
					vm.selectedTags = angular.copy(vm.activeTaskSpace.tags);
					if(vm.activeTaskSpace.tickers.length > 0 && vm.activeTaskSpace.tickers[0] && vm.activeTaskSpace.tickers[0] != null && vm.activeTaskSpace.tickers[0] != "" && vm.activeTaskSpace.tickers[0].length > 0){
						$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":vm.activeTaskSpace.tickers[0] +"-"+vm.activeTaskSpace.name});
					} else {
						$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":vm.activeTaskSpace.name});
					}
					
					//vm.sortBy(null,vm.tsListSortBy,vm.tsListSortByDec);
				}
				$timeout.cancel(t);
            },0);
		});
		
		function addToTaskSpacesList(taskSpace) {
			taskSpacesList.push(taskSpace);
			showTaskSpaces(null,vm.tsList);
		}
		
		function removeFromTaskSpacesList(taskSpace) {
			var index = _.findIndex(taskSpacesList, {"id" : taskSpace.id});
			if(index >= 0) {
				taskSpacesList.splice(index,1);
			}
		}
		
		function setActivateTaskSpace($event,taskSpace) {
			if($event) {
				$event.stopPropagation();
			}
			if(!vm.showGridCheckbox()) {
				var currentTs = _.findWhere(vm.taskSpaces,{"current" : true});
				if(currentTs && currentTs.id !== taskSpace.id) {
					updateTsActiveStatus(currentTs.id,false);
					//currentTs.current = false;
				}
				//vm.annotation.note = "";
				var tsListStateObj = {};
				if($state.params.tsId === taskSpace.id && $state.params.tsc === taskSpace.clientId) {
					tsListStateObj = {"tsId": $state.params.tsId,"tsc" : $state.params.tsc,d:$state.params.d,dc:$state.params.dc,da:$state.params.da};
				} else {
					tsListStateObj = {"tsId": taskSpace.id,"tsc" : taskSpace.clientId,d:null,dc:null,da:null};
				}
				
				if(digestView) {
					$state.go('taskspace.list.digest',tsListStateObj);
				} else {
					$state.go('taskspace.list.task',tsListStateObj);
				}	
		    } else {
		    	taskSpace.selected = !taskSpace.selected;
				vm.selectTaskSpace(taskSpace);
			}
			_.each(vm.taskSpaces,function(ts){
				if(ts.id == taskSpace.id) {
					ts.current = true;
				} else {
					ts.current = false;
				}
			});
			_.each(taskSpacesList,function(ts){
				if(ts.id == taskSpace.id) {
					ts.current = true;
				} else {
					ts.current = false;
				}
			});
		}
		
		function handleShareAtCreateCB(resultedTs,sharedInfo) {
			var isSharedFalse = _.findWhere(sharedInfo,{"isInvited" : false});
			if(isSharedFalse) {
				var NoPermOnObjectList = _.where(sharedInfo,{"Reason" : "Insufficient privileges"});
				var ObjectNotFoundList = _.where(sharedInfo,{"Reason":"Invalid taskspace"});
				var NoReasonObjectList = _.where(sharedInfo,{"Reason" : null});
				
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("SHARE_ITEMS_ERR");
				} else if(!_.isEmpty(NoReasonObjectList)) {
					MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
				} else {
					MessageService.showErrorMessage("BACKEND_ERR_MSG",[isSharedFalse.reason]);
				}
			} else {
				MessageService.showSuccessMessage("TS_CREATE_N_SHARE",[resultedTs.name]);
			}
		}
		
		function newTaskSpace() {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/TaskSpace/NewTaskSpace/newTaskSpace.html',
			      controller: 'NewTaskSpaceController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      backdrop: 'static',
			    });
			
			modalInstance.result.then(function (results) {
				newTaskSpaceCallBack(results.taskspace);
				if(!_.isEmpty(results.sharedObjectsList)) {
					handleShareAtCreateCB(results.taskspace,results.sharedObjectsList);
				} else {
					MessageService.showSuccessMessage("TASKSPACE_CREATE",[results.taskspace.name]);
				}
			}, function () {
				
			});
		}
		
		function isNewTaskSpaceHidden() {
			var status = false;
			if(taskspaceView_NewTaskspace == "Hidden" || digestView) {
				status = true;
			}
			return status;
		}
		
		function isChangeViewHidden() {
			return digestView;
		}
		
		function isNewTaskSpaceDisable() {
			var status = false;
			if(taskspaceView_NewTaskspace == "Disable") {
				status = true;
			}
			return status;
		}
		
		function isTSChangeLayoutHidden() {
			var status = false;
			if(taskspaceView_Allow1PaneOR2Pane == "Hidden") {
				status = true;
			}
			return status;
		}
		
		function isTSChangeLayoutDisable() {
			var status = false;
			if(taskspaceView_Allow1PaneOR2Pane == "Disable") {
				status = true;
			}
			return status;
		}
		
		function changeObjectBasedOnState(currentTs,objectIdFormState) {
			var currentObj = _.findWhere(currentTs.objects,{"objectId" : objectIdFormState});
			if(currentObj) {
				if(currentTs.focusObject1 != objectIdFormState && currentTs.focusObject2 != objectIdFormState) {
					currentTs.focusObject1 = objectIdFormState;
					var obj = {
						 "objectId":currentObj.objectId,
						 "type":currentObj.type,
						 "position":0
					};
					$scope.$broadcast("objectOnChange",obj);
				}
			}
		}
				
		function changeActiveTSBasedOnState(currentTs) {
			vm.active = currentTs.orderNumber;
			vm.activeTaskSpace = currentTs;
			//getAnnotations();
			if(vm.activeTaskSpace.tickers == null || vm.activeTaskSpace.tickers.length == 0) {
				$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":vm.activeTaskSpace.name});
			} else if(vm.activeTaskSpace.tickers.length > 0  && vm.activeTaskSpace.tickers[0] && vm.activeTaskSpace.tickers[0] != null && vm.activeTaskSpace.tickers[0] != "" && vm.activeTaskSpace.tickers[0].length > 0){
				$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":vm.activeTaskSpace.tickers[0] +"-"+vm.activeTaskSpace.name});
			}
		}
		
		function getActiveTaskSpaces() {
			TaskSpaceService.getActiveTaskSpaces().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					taskSpacesList = resp.data.Taskspaces;
					processTaskspaces();
				}
			});
		}
		
		
		function getAllTaskSpaces() {
			return TaskSpaceService.getAllTaskSpaces().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					taskSpacesList = resp.data.Taskspaces;
					processTaskspaces();
					$rootScope.$broadcast('TSCountToShowTourTipIcon',{"noOfTaskspaces" : taskSpacesList.length});
					var showTourTipOnlogin = LocalStorageService.getLocalStorage(LocalStorageService.SHOW_TOUR_TIP_ON_LOGIN);
					if(showTourTipOnlogin) {
						openTourTipOnlogin(taskSpacesList);
					}
				}
			});
		}
		
		function openTourTipOnlogin(taskSpacesList) {
			if(taskSpacesList.length > 0) {
				var t = $timeout(function() {
					$rootScope.$broadcast('ShowTourTipOnlogin',{"showTourTipOnlogin" : true});
					$timeout.cancel(t);
	            },2500);
			} else {
				LocalStorageService.removeLocalStorage(LocalStorageService.SHOW_TOUR_TIP_ON_LOGIN);
			}
		}
		
		function showTaskSpaces(event,value) {
			vm.tsList = value;
			var filteredTaskspace = [];
			if(value == "All") {
				filteredTaskspace = taskSpacesList;
				vm.taskSpaces = angular.copy(filteredTaskspace);
			} else if(value == "Favorites") {
				filteredTaskspace =  _.where(taskSpacesList,{"favorite" : true});
				vm.taskSpaces = angular.copy(filteredTaskspace);
			} else if(value == "Owned by Me" || value == "My Taskspaces") {
				filteredTaskspace =  _.filter(taskSpacesList,function(obj) {
					return obj.permissions && obj.permissions.owner;
				});
				vm.taskSpaces = angular.copy(filteredTaskspace);
			} else if(value == "Shared with me") {
				filteredTaskspace =  _.filter(taskSpacesList,function(obj) {
					return obj.permissions && !obj.permissions.owner;
				});
				vm.taskSpaces = angular.copy(filteredTaskspace);
			}
			sortBy(null,vm.tsListSortBy,vm.tsListSortByDec,function() {
				if(!_.isEmpty(vm.taskSpaces) && event) {
					var currentTS = _.findWhere(vm.taskSpaces,{"current" : true});
					if(_.isEmpty(currentTS)) {
						setActivateTaskSpace(false,vm.taskSpaces[0]);
					} else if(!_.isEmpty(currentTS)) {
						//setActivateTaskSpace(false,currentTS);
					}
				}
			});
		}
		
		function sortBy(event,field,reverse,cb) {
			if(event){
				vm.tsListSortByDec = !vm.tsListSortByDec;
			}
			if(vm.tsListSortBy != field) {
				vm.tsListSortByDec = false;
			}
			vm.tsListSortBy = !_.isEmpty(field) ? field : "name";
			vm.taskSpaces = orderBy(vm.taskSpaces,vm.tsListSortBy,vm.tsListSortByDec);
			taskSpacesList = orderBy(taskSpacesList,vm.tsListSortBy,vm.tsListSortByDec);
			userService.setUiState("taskspaceUiSettings",{"filter": {field:vm.tsList},"sort" : {field:vm.tsListSortBy,decending:vm.tsListSortByDec}});
			
			var t = $timeout(function() {
				var activeTsList = $(".ts-li.active");
				if(activeTsList.length > 0) {
					activeTsList[0].scrollIntoView();
				}
				$timeout.cancel(t);
            },100);
			if(typeof cb === "function") {
				cb();
			}
		}
		
		function getTSSortedOrderIcon() {
			return commonService.getSortedOrderIcon(tsSortOptions, vm.tsListSortBy, vm.tsListSortByDec);
		}
		
		function getTSSortedField() {
			var sortedLable = "";
			var selectedSortOption = _.findWhere(tsSortOptions,{"key": vm.tsListSortBy});
			return selectedSortOption.label;
		}
		
		function updateTsActiveStatus(tsId,value) {
			var ts = tsFromAllUserTsList(tsId);
			var uiTs = tsFromFilteredLis(tsId);
			if(ts) {
				ts.current = value;
			}
			if(uiTs) {
				uiTs.current = value;
			}
		}
		
	    function tsFromFilteredLis(tsId) {
	    	return _.findWhere(vm.taskSpaces,{"id" : tsId});
	    }
	    
	    function tsFromAllUserTsList(tsId) {
	    	return _.findWhere(taskSpacesList,{"id" : tsId});
	    }
	    
	    function setCurrentfalse() {
	    	_.each(vm.taskSpaces,function(ts){
	    		ts.current = false;
			});
			_.each(taskSpacesList,function(ts){
				ts.current = false;
			});
	    }
		
	    
	    function updateViewByTaskspace(ts) {
	    	var current;
			var objectIdFormState = $state.params.d;
	    	setCurrentfalse();
			updateTsActiveStatus(ts.id,true); 
			showTaskSpaces(null,vm.tsList);
			current = _.findWhere(vm.taskSpaces,{"current" : true}); 
			if(current && ts.id == current.id) {
				if(objectIdFormState && !_.isEmpty(current.objects)) {
					changeObjectBasedOnState(current,objectIdFormState);
				}
				changeActiveTSBasedOnState(current);
			} else {
				vm.tsList = "All";
				setCurrentfalse();
				updateTsActiveStatus(ts.id,true); 
				showTaskSpaces(null,vm.tsList);
				if(objectIdFormState && !_.isEmpty(ts.objects)) {
					changeObjectBasedOnState(ts,objectIdFormState);
				}
				changeActiveTSBasedOnState(ts);
			}
	    }
	    
		function processTaskspaces() {
			if($state.current.name.indexOf("taskspace.list") != -1) {
				if(!_.isEmpty(taskSpacesList)) {
					if($state.params.tsId && _.findWhere(taskSpacesList,{"id" : $state.params.tsId})) {
						updateViewByTaskspace(_.findWhere(taskSpacesList,{"id" : $state.params.tsId}));
					} else {
						showTaskSpaces(null,vm.tsList);
						var current = _.findWhere(vm.taskSpaces,{"current" : true});
						if(!current){
							var currentTempTs = vm.taskSpaces[0];
							if(currentTempTs) {
								setCurrentfalse();
								updateTsActiveStatus(currentTempTs.id,true);
								//currentTempTs.current = true;
								changeActiveTSBasedOnState(currentTempTs);
								if(digestView) {
									$state.go('taskspace.list.digest',{"tsId": currentTempTs.id,"tsc": currentTempTs.clientId});
								} else {
									$state.go('taskspace.list.task',{"tsId": currentTempTs.id,"tsc": currentTempTs.clientId,d:null,dc:null,da:null});
								}
							}
						} else {
							changeActiveTSBasedOnState(current);
							
							if(digestView) {
								$state.go('taskspace.list.digest',{"tsId": current.id,"tsc": current.clientId});
							} else {
								$state.go('taskspace.list.task',{"tsId": current.id,"tsc": current.clientId,d:null,dc:null,da:null});
							}
						}
					}
					
				} else if($state.params.tsId){
					openTaskSpace($state.params.tsc, $state.params.tsId);
				}
				
		/*		if(_.isEmpty(taskSpacesList) && !$state.params.tsId) {
					//manageTaskSpace();	
					//Do Nothing
				}  else if(_.isEmpty(taskSpacesList) && $state.params.tsId){
					openTaskSpace($state.params.tsc, $state.params.tsId);
				} else if(!_.isEmpty(taskSpacesList)) {
					var current;
					if($state.params.tsId) {
						var ts = _.findWhere(taskSpacesList,{"id" : $state.params.tsId});
						if(ts) {
							updateViewByTaskspace(ts);
						} else {
							openTaskSpace($state.params.tsc, $state.params.tsId);
						}
					} else {
						showTaskSpaces(null,vm.tsList);
						current = _.findWhere(vm.taskSpaces,{"current" : true});
						if(!current){
							var currentTempTs = vm.taskSpaces[0];
							if(currentTempTs) {
								setCurrentfalse();
								updateTsActiveStatus(currentTempTs.id,true);
								//currentTempTs.current = true;
								changeActiveTSBasedOnState(currentTempTs);
								if(digestView) {
									$state.go('taskspace.list.digest',{"tsId": currentTempTs.id,"tsc": currentTempTs.clientId});
								} else {
									$state.go('taskspace.list.task',{"tsId": currentTempTs.id,"tsc": currentTempTs.clientId,d:null,dc:null,da:null});
								}
							}
						} else {
							changeActiveTSBasedOnState(current);
							
							if(digestView) {
								$state.go('taskspace.list.digest',{"tsId": current.id,"tsc": current.clientId});
							} else {
								$state.go('taskspace.list.task',{"tsId": current.id,"tsc": current.clientId,d:null,dc:null,da:null});
							}
						}
					}
				}*/
			}
		}
		
		function openTaskSpace(clientId,id) {
			TaskSpaceService.openTaskSpace(clientId,id).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					getTaskSpaceById(clientId,id);
				}
			});
		}
		
		function getTaskSpaceById(clientId,id) {
			TaskSpaceService.getTaskSpaceById(clientId,id).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					if(vm.activeTaskSpace) {
						vm.activeTaskSpace.current = false;
					}
					//vm.taskSpaces.push(resp.data.Taskspace);
					addToTaskSpacesList(resp.data.Taskspace);
					updateViewByTaskspace(resp.data.Taskspace);
					vm.activeTaskSpace = resp.data.Taskspace;
					vm.activeTaskSpace.current = true;
					var t = $timeout(function() {
						vm.active = resp.data.Taskspace.orderNumber;
						vm.setActivateTaskSpace(false,vm.activeTaskSpace);
						$timeout.cancel(t);
	                },100);
				}
			});
		}
		
		function newTaskSpaceCallBack(taskSpace) {
			vm.openTaskSpace(taskSpace.clientId,taskSpace.id);
		}
		
		
		function closeTaskSpace(event,tab) {
			if(event) {
				event.stopPropagation();
			}
			TaskSpaceService.closeTaskSpace(tab.clientId,tab.id).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					var index = _.findIndex(vm.taskSpaces, {"id" : tab.id});
					if(index >= 0) {
						vm.taskSpaces.splice(index,1);
						removeFromTaskSpacesList(tab);
						if(tab.current) {
							if(vm.taskSpaces.length > 0) {
								vm.activeTaskSpace = vm.taskSpaces[vm.taskSpaces.length-1];
								vm.activeTaskSpace.current = true;
								vm.active = vm.activeTaskSpace.orderNumber;
								if(digestView) {
									$state.go('taskspace.list.digest' ,{"tsId" : vm.activeTaskSpace.id,"tsc" : vm.activeTaskSpace.clientId});
								} else {
									$state.go('taskspace.list.task' ,{"tsId" : vm.activeTaskSpace.id,"tsc" : vm.activeTaskSpace.clientId,d:null,dc:null,da:null});
								}
							} else {
								//manageTaskSpace();
								//Do Nothing
							}
						}
					}
				}
			});
		}
		
		function setFavorite(event,ts) {
			
			if(event) {
				event.stopPropagation();
			}
			
			if(ts.favoriteBtnDisabled) {
				return false;
			}
			var setFavoritePromise;
			ts.favoriteBtnDisabled = true;
			if(ts.favorite) {
				setFavoritePromise = TaskSpaceService.unfavorite(ts.clientId,ts.id);
			} else {
				setFavoritePromise = TaskSpaceService.favorite(ts.clientId,ts.id);
			}
			
			setFavoritePromise.then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					var tsObj = _.findWhere(taskSpacesList,{"id": ts.id});
					if(tsObj) {
						var favVal = !ts.favorite;
						ts.favorite = favVal;
						tsObj.favorite = favVal;
					}
				}
			})['finally'](function() {
				ts.favoriteBtnDisabled = false;
			});
		}
		
		
		
		function viewAnnotationDigest(data,filters) {
			
			if(_.isEmpty(data)) {
				MessageService.showInfoMessage("ANNOTATION_DIGEST_NODATA_INFO");
			} else {
				var modalInstance = $uibModal.open({
				      animation: true,
				      templateUrl: 'app/components/AnnotationDigest/DigestViewer/AnnotationDigestViewer.html',
				      controller: 'AnnotationDigestViewerController',
				      appendTo : $('.rootContainer'),
				      controllerAs: 'adv',
				      backdrop: 'static',
				      size: "adv",
				      resolve : {
				    	  digestData : function() {
				    		  return data;
				    	  },
				    	  digestFilters : function() {
				    		  return filters;
				    	  },
				    	  tsClientId : function() {
				    		  return vm.activeTaskSpace.clientId;
				    	  }
				      }
				    });
				
				modalInstance.result.then(function (obj) {
					
				});
			}
		}
		
		function createAnnotationDigest(postdata) {
			AnnotationDigestService.create(postdata).then(function(resp) {
				
				if(resp.status == 200 && resp.data.Status) {
					viewAnnotationDigest(resp.data.AnnotationDigest,postdata);
				}
			});
		}
		
		function annotationsDigest(event,tab) {
			if(event) {
				event.stopPropagation();
			}
			
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/AnnotationDigest/create/AnnotationDigest.html',
			      controller: 'AnnotationDigestController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'ad',
			      backdrop: 'static',
			      size: "lg",
			      resolve: {
			    	  filters: function() {
			    		  return null;
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (obj) {	
				var postdata = {
						"objectId": tab.id, 
						"clientId": tab.clientId,
						"context" : "taskspace",
						"filterOptions" : obj.filterOptions,
						"sortOptions" : obj.sortOptions
				};
				
				if( !moment(postdata.filterOptions.endDate).isValid()) {
					postdata.filterOptions.endDate = null;
				}
				
				if( !moment(postdata.filterOptions.startDate).isValid()) {
					postdata.filterOptions.startDate = null;
				}
				//delete postdata.filterOptions.endTime;
				//delete postdata.filterOptions.startTime;
				//delete postdata.sortOptions.timestamp;
				
				createAnnotationDigest(postdata);
			});
		}
		
		function handleShareCB(sharedInfo,items) {
				var isSharedFalse = _.findWhere(sharedInfo,{"isInvited" : false});
				var isSharedTrue = _.where(sharedInfo,{"isInvited" : true});
								
				if(!_.isEmpty(isSharedTrue)) {
					_.each(isSharedTrue,function(source,index) {
						var item = _.findWhere(items,{"id":source.id});
						item.selected = false;
						//SetSharedFlag(item);
					});
				}
				
				if(isSharedFalse) {
					var NoPermOnObjectList = _.where(sharedInfo,{"Reason" : "Insufficient privileges"});
					var ObjectNotFoundList = _.where(sharedInfo,{"Reason":"Invalid taskspace"});
					var NoReasonObjectList = _.where(sharedInfo,{"Reason" : null});
					
					if(!_.isEmpty(NoPermOnObjectList)) {
						MessageService.showErrorMessage("SHARE_ITEMS_ERR");
					} else if(!_.isEmpty(NoReasonObjectList)) {
						MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
					}
				} else if(!_.isEmpty(isSharedTrue)) {
					MessageService.showSuccessMessage("SHARE_ITEMS");
				}
		 }
		 
		function isTsSharable(ts) {
			return TaskSpaceService.isTsSharable(ts,vm.currentUserId);
		}
		 
		function shareTaskSpace(event) {
			event.stopPropagation();
			var modalInstance = $uibModal.open({
			      animation: true,
			      appendTo: $('.rootContainer'),
			      templateUrl: 'app/components/TaskSpace/ShareTaskSpace/shareTaskSpaceModal.html',
			      controller: 'ShareTSController',
			      controllerAs: 'vm',
			      backdrop: 'static',
			      resolve: {
			    	  items : function() {
			    		  return [vm.activeTaskSpace];
			    	  }
			      }
			 });
			 modalInstance.result.then(function (sharedInfo) {
				 if(sharedInfo.status == "Ownership Transferred") {
					 MessageService.showSuccessMessage("TRANSFER_OWNERSHIP");
					 var t = $timeout(function() {
						 $state.go('taskspace.list',{'digest': false},{reload: true});
						 $timeout.cancel(t);
					 },1000);
					 
				 } else {
					 handleShareCB(sharedInfo,[vm.activeTaskSpace]); 
				 }
			 }, function () {
			      
			 });	
		}
		
		function isTSConnectedToSlack(taskSpace) {
			return taskSpace.slackChannelType == 'C' || taskSpace.slackChannelType == 'G';
		}
		
		function chageLayout(event) {
			event.stopPropagation();
			
			switch(vm.layout) {
			case 'Single':
				vm.layout = 'Double';
				break;
			case 'Double':
				vm.layout = 'Single';
				break;
			}
			
			$scope.$broadcast("LayoutChange",{layout : vm.layout});
		}
		
		function manageTaskSpace(event) {
			$state.go('taskspace.manage');
		}
		
		
		function init() {
		  if(!_.isEmpty(taskspaceUiSettings)) {
			vm.tsList = taskspaceUiSettings["filter"]["field"];
			vm.tsListSortBy = taskspaceUiSettings["sort"]["field"];
			vm.tsListSortByDec =  taskspaceUiSettings["sort"]["decending"];
		  }
		  $timeout(function() {
			//vm.getActiveTaskSpaces();
			vm.getAllTaskSpaces();
		  }, 100);
		}
		init();
		
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
		
		
		
		function handleShareAtCreateCB(resultedTs,sharedInfo) {
			var isSharedFalse = _.findWhere(sharedInfo,{"isInvited" : false});
			if(isSharedFalse) {
				var NoPermOnObjectList = _.where(sharedInfo,{"Reason" : "Insufficient privileges"});
				var ObjectNotFoundList = _.where(sharedInfo,{"Reason":"Invalid taskspace"});
				var NoReasonObjectList = _.where(sharedInfo,{"Reason" : null});
				
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("SHARE_ITEMS_ERR");
				} else if(!_.isEmpty(NoReasonObjectList)) {
					MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
				} else {
					MessageService.showErrorMessage("BACKEND_ERR_MSG",[isSharedFalse.reason]);
				}
			} else {
				MessageService.showSuccessMessage("TS_CREATE_N_SHARE",[resultedTs.name]);
			}
		}
		
		function hideAllTSActions() {
			_.each(vm.actionProps,function(item,key) {
				item.show = false;
			});
    	}
		
		function showAllTSActions() {
			_.each(vm.actionProps,function(item,key) {
				item.show = true;
			});
    	}
		
		function onLongPress(obj) {
			obj.selected = true;
			selectTaskSpace(obj);
		}
		
		function selectTaskSpace(obj) {
			hideAllTSActions();
			if(obj.selected) {
				vm.checkedItems.push(obj);
			} else {
				vm.checkedItems = _.without(vm.checkedItems, _.findWhere(vm.checkedItems, {id: obj.id }));
			}
			
			if(vm.checkedItems.length == 1 && vm.checkedItems[0].permissions.owner && vm.actionProps.Rename) {
				vm.actionProps.Rename.show = true;
			} 
			
			if(vm.checkedItems.length == 1 && vm.checkedItems[0].permissions.owner && vm.actionProps.Download) {
				if(docView_DownloadBtn == "Enabled") {
					vm.actionProps.Download.show = true;	
				}
			}
			
			if(vm.checkedItems.length > 0) {
				
				var permissions = [];
				_.each(vm.checkedItems,function(item,index) {
					permissions.push(item.permissions);
				});
				var slackPrivateChannelObj = _.findWhere(vm.checkedItems,{'slackChannelType': "G"});
				var invitePerm = _.findWhere(permissions,{'invite': false});
				var viewPerm = _.findWhere(permissions,{'view': false});
				var deletePerm = _.findWhere(permissions,{'delete': false});
				var copyPerm = _.findWhere(permissions,{'copy': false});
				var editPerm = _.findWhere(permissions,{'edit': false});
				var ownerPerm = _.findWhere(permissions,{'owner': false});
				
				if(!invitePerm && !editPerm && vm.actionProps.Invite && !slackPrivateChannelObj) {
					vm.actionProps.Invite.show = true;
				}
				if(!ownerPerm ) {
					if(vm.actionProps.Properties) {
						vm.actionProps.Properties.show = true;
					}
					if(vm.actionProps.Copy) {
						vm.actionProps.Copy.show = true;
					}
				}
				if(!viewPerm && vm.actionProps.Tag) {
					vm.actionProps.Tag.show = true;
				}
				if(!deletePerm && vm.actionProps.Delete) {
					vm.actionProps.Delete.show = true;
				}
			} 
		}
		
		function unselectAll($event) {
			if($event) {
				$event.stopPropagation();
			}
			
			_.each(vm.checkedItems,function(item,index) {
				item.selected = false;
			});
			hideAllTSActions();
			vm.checkedItems = [];
		 }
		
		 function showGridCheckbox(){
	    	var status = false;
	    	if(vm.checkedItems.length > 0 ) {
	    		status = true;
	    	}
	    	return status;
	     }
			
		function setCurrent(ts,cb) {
			TaskSpaceService.setCurrent(ts.clientId,ts.id).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					if(typeof cb == "function") {
						cb(ts);
					}
				}
			});
		}
		
		 function handleShareCB(sharedInfo,items) {
				var isSharedFalse = _.findWhere(sharedInfo,{"isInvited" : false});
				var isSharedTrue = _.where(sharedInfo,{"isInvited" : true});
				if(!_.isEmpty(isSharedTrue)) {
					_.each(isSharedTrue,function(source,index) {
						var item = _.findWhere(items,{"id":source.id});
						vm.checkedItems = _.reject(vm.checkedItems, function(taskspace){
							return taskspace.id == source.id;
						});
						item.selected = false;
					});
				}
				
				if(isSharedFalse) {
					var NoPermOnObjectList = _.where(sharedInfo,{"Reason" : "Insufficient privileges"});
					var ObjectNotFoundList = _.where(sharedInfo,{"Reason":"Invalid taskspace"});
					var NoReasonObjectList = _.where(sharedInfo,{"Reason" : null});
					
					if(!_.isEmpty(NoPermOnObjectList)) {
						MessageService.showErrorMessage("SHARE_ITEMS_ERR");
					} else if(!_.isEmpty(NoReasonObjectList)) {
						MessageService.showErrorMessage("DEFAULT_ERROR_MSG");
					} else {
						MessageService.showErrorMessage("BACKEND_ERR_MSG",[isSharedFalse.reason]);
					}
					
				} else if(!_.isEmpty(isSharedTrue)){
					vm.checkedItems = [];
					hideAllTSActions();
					MessageService.showSuccessMessage("SHARE_ITEMS");
				}
		 }
		 
		 function OpenShareTSModal(items,size) {
			 var modalInstance = $uibModal.open({
				  animation: true,
				  appendTo: $('.rootContainer'),
			      templateUrl: 'app/components/TaskSpace/ShareTaskSpace/shareTaskSpaceModal.html',
			      controller: 'ShareTSController',
			      controllerAs: 'vm',
			      size: size,
			      backdrop: 'static',
			      resolve: {
			    	  items : function() {
			    		  return items;
			    	  }
			      }
			 });
			 modalInstance.result.then(function (sharedInfo) {
				 if(sharedInfo.status == "Ownership Transferred") {
					 MessageService.showSuccessMessage("TRANSFER_OWNERSHIP");
					 items[0].selected = false;
					 vm.checkedItems = [];
					 var t = $timeout(function() {
						 $state.go('taskspace.list',{'digest': false},{reload: true});
						 $timeout.cancel(t);
					 },1000);
				 } else {
					 handleShareCB(sharedInfo,items); 
				 }
			 });
		 }
		 
		 function OpenShareModalFromNav() {
		    	if(vm.checkedItems.length > 0) {
		    		OpenShareTSModal(vm.checkedItems);
		    	}
		 }
		 
		 function processItems(items) {
			 var processedItems = [];
			 _.each(items,function(item,index) {
				 var obj = {};
				 obj["Type"] = "Taskspace";
				 obj["TopObjectId"] = item.id;
				 obj["TopObjectClientId"] = item.clientId;
				 processedItems.push(obj);
			 });
			 return processedItems;
		 }
		
		 function saveTag(items,tags) {
			var postdata = {};
			postdata["Tags"] = tags;
			postdata["Items"] = processItems(items);
			
			TagService.tagItems(postdata).then(function(response) {
				if (response.status == 200 && response.data.Status) {
					_.each(items,function(item,idx) {
						item.selected = false;
						TagService.getItemTagsById(item);
					});
					hideAllTSActions();
					vm.checkedItems = [];
				}
			});
		 }
		 
		 function unTag(tag,item,$event) {
			$event.preventDefault();
		    $event.stopPropagation();
		    if(tag) {
				var text = "Are you sure you want to delete Tag "+tag.TagName+" ?";
	  			$confirm({text: text})
		        .then(function() {
		        	TagService.unTag(tag,item).then(function(response){
						if (response.status == 200) {
							TagService.getItemTagsById(item);
						}
					});
			    }, function() {
			    	
			    });
			}
		 }
		
		 function OpenAddTSTagModal(item,size) {
			if(!angular.isArray(item)) {
				item = [item];
			}
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/TagDocuments/addTagModal.html',
			      controller: 'TagDocumentsController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      size: size,
			      resolve: {
			    	  item : function() {
			    		  return item;
			    	  },
			    	  userinfo : function() {
			    		  return $scope.userinfo;
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (obj) {
				saveTag(obj.items,obj.tags);
			});
		 }
		 
		 function OpenAddTagModalFromNav() {
			 if(vm.checkedItems.length > 0) {
	    		 OpenAddTSTagModal(vm.checkedItems);
	    	 }
		 }
		 
		 function RenameTS(ts){
			var postdata = {
				"id" : ts.id,
				"clientId" : ts.clientId
			};
			postdata.name = ts.name;
			TaskSpaceService.renameTaskSpace(postdata).then(function(response){
				if (response.status == 200 && response.data.Status) {
					var orgTS = _.findWhere(taskSpacesList,{"id":ts.id});
					if(orgTS) {
						orgTS.name = ts.name;
						orgTS.selected = false;
						hideAllTSActions();
						vm.checkedItems = [];
						MessageService.showSuccessMessage("TASKSPACE_RENAME");
					}
					
					vm.showTaskSpaces(null,vm.tsList);
					//vm.sortBy(null,vm.tsListSortBy,vm.tsListSortByDec);
				}
			});
			
		 }
	 
	 	 function OpenRenameTSModal (ts,size) {
	 		ts._type = "Taskspace";
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/Documents/Rename/renameDoc.html',
			      controller: 'RenameDocController',
			      appendTo : $('.rootContainer'),
			      controllerAs : 'vm',
			      size: size,
			      resolve: {
			    	 doc : function() {
			    		 return ts;
			    	 }
			      }
			    });
			modalInstance.result.then(function (renamedTS) {
				RenameTS(renamedTS);
			});
 		 }
		 
		 function OpenRenameModalFromNav() {
	    	if(vm.checkedItems.length == 1) {
	    		OpenRenameTSModal(vm.checkedItems[0]);
	    	}
	     }
	    
		function downloadTS() {
			var confirmTxt = "My Notes, Notes, Other documents ..., are zipped together and zip file would downloaded and saved on user's computer (download would be initiated in new browser tab). <br>Based on number of documents present in the Taskspace, it would take few minutes. <br> <br> Are you sure you want to download the taskspace?";
						
			var VDVCConfirmModalInstance;
    		VDVCConfirmModalInstance = VDVCConfirmService.open({text : confirmTxt, title : "CONFIRM"});
    		VDVCConfirmModalInstance.result.then(function() {
    			DownloadFromNav();
    		});
		}
		
		function DownloadFromNav() {
			var tsId = vm.checkedItems[0].id;
			var tsClientId = vm.checkedItems[0].clientId;
			if(tsId && tsClientId) {
				TaskSpaceService.downloadTs(tsClientId,tsId);
			}
			vm.checkedItems = [];
			hideAllTSActions();
			vm.showTaskSpaces(null,vm.tsList);
		}
		
		 function removeForceDeleteFlag () {
			 if(!_.isEmpty(vm.checkedItems)) {
					_.each(vm.checkedItems,function(item) {
						delete item["forceDelete"];
					});
				} 
		 }
		 
		 function handleMoveToTrashCB(items) {
			removeForceDeleteFlag();
			var isDeletedFalse = _.findWhere(items,{"isDeleted" : false});
			var isDeletedTrue = _.where(items,{"isDeleted" : true});
			if(isDeletedTrue) {
				_.each(isDeletedTrue,function(source,index) {
					taskSpacesList = _.reject(taskSpacesList, function(taskspace){ 
		    			return taskspace.id == source.id; 
		    		});
					vm.checkedItems = _.reject(vm.checkedItems, function(item){ 
		    			return item.id == source.id; 
		    		});
				});
			}
			if(isDeletedFalse) {
				var NoPermOnObjectList = _.where(items,{"Reason" : "Insufficient privileges"});
				var ObjectNotFoundList = _.where(items,{"Reason":"Invalid taskspace"});
				if(!_.isEmpty(NoPermOnObjectList)) {
					MessageService.showErrorMessage("DELETE_ITEMS_ERR");
				} else {
					MessageService.showErrorMessage("BACKEND_ERR_MSG",[isDeletedFalse.reason]);
				}
			} else {
				if(!_.isEmpty(vm.checkedItems)) {
					_.each(vm.checkedItems,function(item) {
						if(item.selected) {
							item.selected = false;
						}
					});
				}
				vm.checkedItems = [];
				hideAllTSActions();
				MessageService.showSuccessMessage("DELETE_ITEMS");
			}
			
			vm.showTaskSpaces(true,vm.tsList);
			//vm.sortBy(null,vm.tsListSortBy,vm.tsListSortByDec);
		}
			
		function moveToTrash(items) {
			var postdata = {};
        	var itemList = [];
        	
        	_.each(items,function(item,index) {
        		var ts = {
        			id : item.id,
        			clientId : item.clientId
        		};
        		if(item.forceDelete) {
        			ts.status = "forceDelete";
        		}
        		itemList.push(ts);
        	});
        	
        	postdata = itemList;
        	TaskSpaceService.deleteTaskSpace(postdata).then(function(result){
				if (result.status==200 && result.data.Status) {
					handleMoveToTrashCB(result.data.Results);
				}
			});
		}
		
		function OpenConfirmDeleteTsModal(results,items) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/TaskSpace/ManageTaskSpace/TSDeleteConfirmation/TSDeleteConfirmationModal.html',
			      controller: 'TSDeleteConfirmationController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'tsdcc',
			      backdrop: 'static',
			      size : 'md',
			      resolve: {
			    	  existedTaskspaces : function() {
			    		  return vm.existedTaskspaces;
			    	  },
			    	  selectedTaskspaces : function() {
			    		  return items;
			    	  }
			      }
			});
			modalInstance.result.then(function (obj) {
				if(obj.action === "skip") {
					items = _.reject(items, function(item){ 
						var existedTs = _.findWhere(vm.existedTaskspaces,{taskspaceId : item.id});
						if(existedTs && !item.forceDelete) {
							return true;
						}
		    		});
				} else if(obj.action === "remove") {
					items = _.reject(items, function(item){ 
						var existedTs = _.findWhere(vm.existedTaskspaces,{taskspaceId : item.id});
						if(existedTs && !item.forceDelete) {
							return true;
						} else {
							return false;
						}
		    		});
				}
				moveToTrash(items);
			}, function () {
				removeForceDeleteFlag();
			});
		}
		
		function checkIsExistAndDelete(results,items) {
			vm.existedTaskspaces = [];
		   _.each(results,function(result) {
			   if((result.savedSearches && !_.isEmpty(result.savedSearches)) || 
					   (result.slackConfig && !_.isEmpty(result.slackConfig))) {
				   vm.existedTaskspaces.push(result);
			   }
	       });
		   if(vm.existedTaskspaces.length > 0){
				OpenConfirmDeleteTsModal(results,items); 
		   } else if(items.length > 0){
			   moveToTrash(items);
		   }
		}
		
		function checkTSBeforeDelete(items) {
			var postdata = {};
        	var itemList = [];
        	
        	_.each(items,function(item,index) {
        		itemList.push(item.id);
        	});
        	
        	postdata["taskspaceIds"] = itemList;
        	
        	TaskSpaceService.checkTSBeforeDelete(postdata).then(function(result){
				if (result.status==200 && result.data.Status) {
					checkIsExistAndDelete(result.data.Search,items);
				}
			});
		}
		
		function deleteItems(items) {
			var confirmTxt = "";
			var channelTs = _.findWhere(items,{"slackChannelType" : "C"});
			var groupTs = _.findWhere(items,{"slackChannelType" : "G"});
			if(!_.isEmpty(channelTs) || !_.isEmpty(groupTs)) {
				if(items.length == 1) {
					confirmTxt = "Selected taskspace is connected to slack channel '"+items[0].slackChannelName+"'.<br><br>Do you still want to delete the taskspace ?";
				} else {
					confirmTxt = "Some of the selected taskspaces connected to slack channel.<br><br>Do you still want to delete selected taskspaces ?";
				}
			} else {
				if(items.length == 1) {
					confirmTxt = 'Are you sure you want to delete the taskspace ?';
				} else {
					confirmTxt = 'Are you sure you want to delete selected taskspaces ?';
				}
				
			}
						
			var VDVCConfirmModalInstance;
    		VDVCConfirmModalInstance = VDVCConfirmService.open({text : confirmTxt,title : "CONFIRM"});
    		VDVCConfirmModalInstance.result.then(function() {
    			checkTSBeforeDelete(items);
    		});
    		
			/*$confirm({text: txt}).then(function() {
				checkTSBeforeDelete(items);
	        }, function () {
				$('body').removeClass('modal-open');
			});*/
		}
			
		function deleteFromNav() {
	    	if(vm.checkedItems.length>0) {
	    		deleteItems(vm.checkedItems);
	    	}
	    }
	     
	    function handlePropertiesCB(items,data) {
			var isUpdatedFalse = _.findWhere(items,{"isUpdated" : false});
			var isUpdatedTrue = _.where(items,{"isUpdated" : true});
			
			if(isUpdatedTrue) {
				var count = 0;
				_.each(data.original,function(source,index) {
					var tsObj = _.findWhere(taskSpacesList,{"id" :source.id});
					if(data.modified[count].name) {
						source.name=data.modified[count].name;
						tsObj ? tsObj.name = data.modified[count].name : false;
					}
					if(data.modified[count].defaultFolderId) {
						source.defaultFolderId=data.modified[count].defaultFolderId;
						tsObj ? tsObj.defaultFolderId = data.modified[count].defaultFolderId : false;
					}
					if(data.modified[count].tickers) {
						source.tickers=data.modified[count].tickers;
						tsObj ? tsObj.tickers = data.modified[count].tickers : false;
					}
					if(data.modified[count].autoSummarize != data.original[count].autoSummarize) {
						source.autoSummarize=data.modified[count].autoSummarize;
						tsObj ? tsObj.autoSummarize = data.modified[count].autoSummarize : false;
					}
					if(data.modified[count].autoSummarizeUsing != data.original[count].autoSummarizeUsing) {
						source.autoSummarizeUsing=data.modified[count].autoSummarizeUsing;
						tsObj ? tsObj.autoSummarizeUsing = data.modified[count].autoSummarizeUsing : false;
					}
					source.selected = false;
					vm.checkedItems = _.reject(vm.checkedItems, function(doc){ 
		    			return doc.id == source.id; 
		    		});
					count++;
				});
				count = 0;
			}
			
			if(isUpdatedFalse) {
				var NoPermOnObjectList = _.where(items,{"Reason" : "Insufficient privileges"});
				var ObjectNotFoundList = _.where(items,{"Reason":"Invalid taskspace"});
				
				if(NoPermOnObjectList) {
					MessageService.showErrorMessage("EDIT_PROPERTIES_ERR");
				}
				
			} else {
				vm.checkedItems = [];
				hideAllTSActions();
				MessageService.showSuccessMessage("EDIT_PROPERTIES");
			}
						 
     	 }
     	 
		 function OpenPropertiesModal (source,size) {
			var modalInstance = $uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'app/components/TaskSpace/EditTSProperties/editTSProperties.html',
			      controller: 'TSPropertiesController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'vm',
			      size: size,
			      resolve: {
			    	  source : function() {
			    		  return source;
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (data) {
				TaskSpaceService.updateTSProperties(data.modified).then(function(resp) {
					 if(resp.status == 200 && resp.data.Status) {
						 handlePropertiesCB(resp.data.Results,data);
					 }
				 });
			});
		 }
     
		 function OpenPropertiesModalFromNav() {
	    	if(vm.checkedItems.length > 0) {
	    		OpenPropertiesModal(vm.checkedItems);
	    	}
    	 }
    	 
		 function executeTSAction(TSAction) {
	    	
	    	switch(TSAction) {
		    	case "Invite / Edit Collaborators":
		    		OpenShareModalFromNav();
		    		break;
		    	case "Tag":
		    		OpenAddTagModalFromNav();
		    		break;
		    	case "Rename":
		    		OpenRenameModalFromNav();
		    		break;
		    	case "Delete":
		    		deleteFromNav();
		    		break;
		    	case "Properties":
		    		OpenPropertiesModalFromNav();
		    		break;
		    	case "Download":
		    		downloadTS();
		    		break;
	    	}
	    	
	    }
	    
		 function getTSDateLable() {
				var tsDateLable = "Created";
				if(vm.tsListSortBy == 'lastOpened'){
					tsDateLable = "Last Opened";
				}
				return tsDateLable;
			}
			
			function getTSDateValue(taskSpace) {
				var tsDateValue = taskSpace['createdDate'];
				if(vm.tsListSortBy == 'lastOpened') {
					tsDateValue = taskSpace['lastOpened'];
				}
				return tsDateValue;
			}
			
		 $scope.searchTaskspace = function (item) { 
			 var status = true;
			 var itemName = item.name.toLowerCase();
			 var itemOwner = item.owner.toLowerCase();
			 if(!_.isEmpty(vm.tsSearchTxt) && itemName.indexOf(vm.tsSearchTxt.toLowerCase()) == -1 && itemOwner.indexOf(vm.tsSearchTxt.toLowerCase()) == -1) {
				 status = false;
			 }
		    return status; 
		 };
		
		/*function startTSCommentTimer() {
			cancelCommentTimer();
			tsCommentTimer = $timeout(function(){
				getAnnotations();
			}, 10000);
		}*/
		
		/*function cancelCommentTimer() {
			$timeout.cancel(tsCommentTimer);
		}*/
		
		/*function getAnnotations(cb) {
			if(vm.activeTaskSpace) {
				var postdata = {};
				postdata["resourceType"] = "taskspace";
				postdata["resourceId"] = vm.activeTaskSpace.id;
				postdata["cellKey"] = vm.activeTaskSpace.id;
				postdata["clientId"] = vm.activeTaskSpace.clientId;
				
				AnnotationService.getAnnotationsById(postdata).then(function(response){
					if (response.status == 200 && response.data.Status) {
						vm.TSAnnotations = response.data.Annotations;
						startTSCommentTimer();
						if(typeof cb == "function") {
							cb(vm.TSAnnotations);
						}
					}
				});
			}
		}*/
		
		/*function getAnnotationsById(event,isOpen,cb) {
			if(isOpen) {
				vm.annotation.note = "";
				getAnnotations(cb);
			} else{
				cancelCommentTimer();
			}
		}*/
		
		/*function addTaskSpaceComment(event,comment) {
			if(comment["note"]) {
				comment["resourceType"] = "taskspace";
				comment["resourceId"] = vm.activeTaskSpace.id;
				comment["cellKey"] = vm.activeTaskSpace.id;
				comment["clientId"] = vm.activeTaskSpace.clientId;
				
				AnnotationService.save(comment).then(function(response){
					if(response.status == 200 && response.data.Status) {
						vm.annotation.note = "";
						getAnnotationsById(false,true,function(comments) {
							if(comments && comments.length > 0) {
								vm.curCmtId = comments[comments.length-1].id;
							}
						});
					}
				});
			}
			
		}*/
		
		/*function addTSCmntDabld() {
			var flag = true;
			if(!_.isEmpty(vm.annotation.note)) {
				flag = false;
			}
			return flag;
		}
		
		function canEditTSAnnotation (conv) {
			var status = false;
			var user = conv.userId;
			var loginUser = _.isString(appdata.UserId) ? appdata.UserId.trim() : "";
			var commentOwner = _.isString(user)  ? user.trim() : "";
			if(vm.activeTaskSpace){
				var isTSOwner = loginUser.toUpperCase() === vm.activeTaskSpace.owner.toUpperCase();
				var areEqual = loginUser.toUpperCase() === commentOwner.toUpperCase();
				if(areEqual || isTSOwner) {
					status =  true;
				}
			}
			return status;
		}*/
		
		/*function deleteComment (conversation,annotation) {
			$('.comment-conv-wrap').off('click');
			var postdata = {};
			postdata["annotationId"] = annotation.id;
			postdata["commentId"] = conversation.id;
			postdata["clientId"] = vm.activeTaskSpace.clientId;
			
			if(annotation.conversations && annotation.conversations.length == 1) {
        		AnnotationService.deleteAnnotation(postdata).then(function(resp){
        			
        			if(resp.status == 200 && resp.data.Status) {
        				vm.annotation.note = "";
						getAnnotationsById(false,true);
        			}
        		});
			} else {
				AnnotationService.deleteComment(postdata).then(function(response){
					if(response.status == 200 && response.data.Status) {
						vm.annotation.note = "";
						getAnnotationsById(false,true);
					}
				});
			}
			
		}
		
		$scope.preventClickEventOnEditComment = function (event) {
			var form = this.$form;
			$('.editable-buttons [type=button]').off('click').on('click',function(event){
				//event.preventDefault();
				event.stopPropagation();
				form.$cancel();
			});
			
			$('.comment-conv-wrap').off('click').on('click',function(event){
				event.stopPropagation();
			});
		};
		
		function unBindClickEventonEditComment () {
			$('.vdvc-srch-opt,.editable-buttons [type=button]').off('click');
		}
		
		function editComment (editcommentForm,$event) {
			$('.comment-conv-wrap').off('click');
			if($event) {
				$event.stopPropagation();
			}
			
			editcommentForm.$show();
		}
		
		
		function updateComment (newcomment,conv,annotation) {
			var postdata = {
					"annotationId" : annotation.id,
					"commentId" : conv.id,
					"comment" : newcomment,
					"clientId" : vm.activeTaskSpace.clientId
			};
			
			return AnnotationService.editComment(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					return true;
				}else {
					return resp.data.Message;
				}
			});
			
		}*/
	}
	
})();
