;(function(){
	angular.module("vdvcApp").factory('TaskSpaceService',TaskSpaceService);
	
	TaskSpaceService.$inject = ["$http",'commonService',"httpService","SessionService","APIUserMessages","$uibModal","_","userService","$window"];
	
	function TaskSpaceService($http,commonService,httpService,SessionService,APIUserMessages,$uibModal,_,userService,$window) {
		var actionProps = {
				"Invite": {type:"TSActionProps",action:"invite",title:"Invite / Edit Collaborators",show:false,class:"fa-users"},
				//"Tag" : {type:"TSActionProps",action:"tag",title:"Tag",show:false,class:"fa-tag fa-flip-horizontal"},
		        "Rename" : {type:"TSActionProps",action:"rename",title:"Rename",show:false,class:"fa-pencil"},
		        //"Comment" : {type:"TSActionProps",action:"comment",title:"Comment",show:false,class:"fa-comment-o "},
		        "Delete" : {type:"TSActionProps",action:"delete",title:"Delete",show:false,class:"fa-trash-o"},
		       // "Copy" : {type:"TSActionProps",action:"copy",title:"Copy",show:false,class:"fa-files-o"},
		        "Properties" : {type:"TSActionProps",action:"properties",title:"Properties",show:false,class:"fa-info"},
		        "Download" : {type:"TSActionProps",action:"download",title:"Download",show:false,class:"fa-download"}
		    };
		var TaskSpaceListHeaders = [
				  	                  {
				  	                	  "label":"TASKSPACE NAME",
				  	                	  "value":"name",
				  	                	  "checked" : true,
				  		                  "type" : "text",
				  		                  "class" : "col-md-4"
				  	                  },{
				  	                	  "label":"TICKER",
				  	                	  "value":"tickers",
				  	                	  "checked" : true,
				  		                  "type" : "list",
				  		                  "class" : "col-md-1"
				  	                  },{
				  	                	  "label":"# OF DOCUMENTS",
				  	                	  "value":"objects",
				  	                	  "checked" : true,
				  	                	  "type" : "list",
				  	                	  "class" : "col-md-2"
				  	                  },{
				  	                	  "label":"TASKSPACE OWNER",
				  	                	  "value":"owner",
				  	                	  "checked" : false,
				  	                	  "type" : "text",
				  	                	  "class" : "col-md-2"
				  	                  },{
				  	                	  "label":"DATE OF CREATION",
				  	                	  "value":"createdDate",
				  	                	  "checked" : false,
				  	                	  "type" : "Date",
				  	                	  "class" : "col-md-2"
				  	                  },{
				  	                	  "label":"STATUS",
				  	                	  "value":"status",
				  	                	  "checked" : false,
				  	                	  "type" : "text",
				  	                	  "class" : "col-md-1"
				  	                  }   
				  	            ];  
		var AddToTaskSpaceListHeaders = [
				  	                  {
				  	                	  "label":"TASKSPACE NAME",
				  	                	  "value":"name",
				  	                	  "checked" : true,
				  		                  "type" : "text",
				  		                  "class" : "col-md-3"
				  	                  },{
				  	                	  "label":"TASKSPACE OWNER",
				  	                	  "value":"owner",
				  	                	  "checked" : true,
				  		                  "type" : "text",
				  		                  "class" : "col-md-3"
				  	                  },{
				  	                	  "label":"DATE OF CREATION",
				  	                	  "value":"createdDate",
				  	                	  "checked" : true,
				  	                	  "type" : "Date",
				  	                	  "class" : "col-md-3"
				  	                  },{
				  	                	  "label":"LAST OPENED",
				  	                	  "value":"lastOpened",
				  	                	  "checked" : true,
				  	                	  "type" : "Date",
				  	                	  "class" : "col-md-3"
				  	                  }
				  	               ];
		
		var taskSpaceSectionsHeaders = [
		                                {
										  "label":"SECTION NAME",
										  "value":"name",
										  "checked" : true,
									      "type" : "text",
									      "class" : "col-md-3"
		                                },{
										  "label":"DESCRIPTION",
										  "value":"description",
										  "checked" : true,
									      "type" : "text",
									      "class" : "col-md-3"
		                                }
		                             ];
		var tsDocTypeFilters = [
                                {
								  "label":"Document",
								  "key" : "VidiViciNotes",
								  "enabled" : true,
								  "show" : true,
							    },{
								  "label":"EMail",
								  "key" : "EMail",
								  "enabled" : true,
								  "show" : true,
							    },{
								  "label":"Notes",
								  "key" : "Notes",
								  "enabled" : true,
								  "show" : true,
							    },{
								  "label":"Web Clip",
								  "key" : "WebClip",
								  "enabled" : true,
								  "show" : true,
							    },{
								  "label":"Web Page",
								  "key" : "WebResource",
								  "enabled" : true,
								  "show" : true,
							    },{
								  "label":"Others",
								  "key" : "Other",
								  "enabled" : true,
								  "show" : true,
							    }
                             ];
                             
		var autoSummarizeOptions = [
            {
				"name" : "chatgpt",
				"displayName" : "Chat GPT"
			},
            {
				"name" : "vertexai",
				"displayName" : "Vertex AI"
			}
        ];
		
		var TaskSpace = {
				 currentTaskspace : {},
				 showOpenInTaskspaceBtn : false,
				 tsCommentId : null,
				 TaskSpaceViweStyle : "List",
				 actionProps : actionProps,
				 TaskSpaceListHeaders : TaskSpaceListHeaders,
				 AddToTaskSpaceListHeaders : AddToTaskSpaceListHeaders,
				 taskSpaceSectionsHeaders : taskSpaceSectionsHeaders,
				 tsDocTypeFilters : tsDocTypeFilters,
				 newTaskSpace : newTaskSpace,
				 getActiveTaskSpaces : getActiveTaskSpaces,
				 getAllTaskSpaces : getAllTaskSpaces,
				 getTaskSpaceById : getTaskSpaceById,
				 openTaskSpace : openTaskSpace,
				 setCurrent : setCurrent,
				 setLayout : setLayout,
				 saveTaskSpaceState : saveTaskSpaceState,
				 saveTsDocsSortByOpt : saveTsDocsSortByOpt,
				 getTaskSpaceState : getTaskSpaceState,
				 getSharedStates : getSharedStates,
				 deActivateTaskSpace : deActivateTaskSpace,
				 closeTaskSpace : closeTaskSpace,
				 favorite : favorite,
				 unfavorite : unfavorite,
				 autoSummarizeOptions : autoSummarizeOptions,
				 
				 addToTaskSpace : addToTaskSpace,
				 moveObject : moveObject,
				 removeFormTaskSpace : removeFormTaskSpace,
				 isObjectInTaskSpace : isObjectInTaskSpace,
				 replaceObject : replaceObject,
				 
				 inviteToTaskSpace : inviteToTaskSpace,
				 inviteToTaskSpaceList : inviteToTaskSpaceList,
				 inviteProvisionalUsersToTaskSpace : inviteProvisionalUsersToTaskSpace,
				 removeCollaborator : removeCollaborator,
				 checkTSBeforeDelete : checkTSBeforeDelete,
				 deleteTaskSpace : deleteTaskSpace,
				 renameTaskSpace : renameTaskSpace,
				 updateTSProperties : updateTSProperties,
				 
				 listDocumentTaskspaces : listDocumentTaskspaces,
				 getTaskSpaceInfo : getTaskSpaceInfo,
				 downloadTs : downloadTs,
				 
				 isTsSharable : isTsSharable,
				 isObjPresantInTaskSpace : isObjPresantInTaskSpace,
				 openTaskSpaceObject : openTaskSpaceObject,
				 view : "3pane",
				 transferTSOwnership : transferTSOwnership,
				 postAnnotationToSlack : postAnnotationToSlack,
				 renameTSSection : renameTSSection,
				 addTSSection : addTSSection,
				 removeSectionFromTS : removeSectionFromTS,
				 defaultSectionName : "Default Section",
				 defaultSectionDescription : "Which has documents does not belongs to any section.",
				 moveToTSSection : moveToTSSection,
				 insertDefaultSection : insertDefaultSection,
				 newNote : newNote,
				 getAnnotCount : getAnnotCount,
				 getTSButtons : getTSButtons,
				 showTSButton : showTSButton,
				 disableTSButton : disableTSButton,
				 getTaskspaceUpdateMessage: getTaskspaceUpdateMessage,
			     notificationHandledelayTime: 2000,
                 maxNotifications: 5,
                 setTsCurrentObject : setTsCurrentObject,
                 setTsObjectSettings : setTsObjectSettings
		};
		 
		return TaskSpace;
		 
		 
		function newTaskSpace(postdata) {
			return httpService.httpPost('taskspace/new', postdata);
		}
		
		function getActiveTaskSpaces(postdata) {
			return httpService.httpGet('taskspace/listactive');
		}
		
		function getAllTaskSpaces() {
			return httpService.httpGet('taskspace/listall');
		}
		
		function openTaskSpace(clientId,id) {
			return httpService.httpGet('taskspace/opened/'+clientId+'/'+id);
		}
		
		function setCurrent(clientId,id) {
			return httpService.httpGet('taskspace/setcurrent/'+clientId+'/'+id);
		}
		
		function setLayout(postdata) {
			return httpService.httpPost('taskspace/setlayout', postdata);
		}
		
		function saveTaskSpaceState(postdata) {
			return httpService.httpPost('taskspace/savestate', postdata);
		}
		
		function saveTsDocsSortByOpt(postdata) {
			return httpService.httpPost('taskspace/setTsDocsSortByOpt', postdata);
		}
		
		function getTaskSpaceState(clientId,id) {
			return httpService.httpGet('taskspace/getstate/'+clientId+'/'+id);
		}
		
		function getSharedStates(clientId,id) {
			return httpService.httpGet('taskspace/getSharedStates/'+clientId+'/'+id);
		}
		
		function getTaskSpaceById(clientId,id) {
			return httpService.httpGet('taskspace/'+clientId+'/'+id);
		}
		
		function deActivateTaskSpace(postdata) {
			return httpService.httpPost('taskspace/deactivate', postdata);
		}
		
		function closeTaskSpace(clientId,id) {
			return httpService.httpGet('taskspace/closed/'+clientId+'/'+id);
		}
		
		function favorite(clientId,id) {
			return httpService.httpGet('taskspace/favorite/'+clientId+'/'+id);
		}
		
		function unfavorite(clientId,id) {
			return httpService.httpGet('taskspace/unfavorite/'+clientId+'/'+id);
		}
		
		function addToTaskSpace(taskSpace) {
			return httpService.httpPost('taskspace/addobjects', taskSpace);
		}
		
		function moveObject(postdata) {
			return httpService.httpPost('taskspace/resource/moveobject', postdata);
		}
		
		function removeFormTaskSpace(taskSpace) {
			return httpService.httpPost('taskspace/removeobjects', taskSpace);
		}
		 
		function isObjectInTaskSpace(clientId,tsId,ObjId) {
			return httpService.httpGet('taskspace/checkobject/'+clientId+'/'+tsId+'/'+ObjId);
		}
		
		function replaceObject(postdata) {
			return httpService.httpPost('taskspace/replaceobject', postdata);
		}
		
		function inviteToTaskSpace(taskSpace) {
			return httpService.httpPost('taskspace/minvite', taskSpace);
		}
		
		function inviteToTaskSpaceList(postdata) {
			return httpService.httpPost('taskspace/inviteTSList', postdata);
		}
		
		function inviteProvisionalUsersToTaskSpace(taskSpace) {
	    	return httpService.httpPost('user/shareObjectListToProvisionalUser', taskSpace);
	    }
		
		function removeCollaborator(taskSpace) {
			return httpService.httpPost('taskspace/removeusers', taskSpace);
		}
		
		function checkTSBeforeDelete(taskSpace) {
			return httpService.httpPost('taskspace/checkTSBeforeDelete', taskSpace);
		}
		
		function deleteTaskSpace(taskSpace) {
			return httpService.httpPost('taskspace/delete', taskSpace);
		}
		
		function renameTaskSpace(taskSpace) {
			return httpService.httpPost('taskspace/rename', taskSpace);
		}
		
		function updateTSProperties(taskSpace) {
			return httpService.httpPost('taskspace/updateprops', taskSpace);
		}
		
		function listDocumentTaskspaces(docId) {
			return httpService.httpGet('taskspace/ts/'+docId);
		}
		
		
		function getTaskSpaceInfo(listTsVoObj) {
			return httpService.httpPost('taskspace/tslistinfo', listTsVoObj);
		}
		
		function downloadTs(tsClientId,tsId) {
			$window.open(commonService.getContext()+"api/taskspace/downloadresearch/"+tsClientId+"/"+tsId);
		}
		
		function isTsSharable(ts,loggedInUser) {
			var collaborators = angular.copy(ts.collaborators);
			var status = false;
			var tsOwner = ts.owner;
			if(!_.isEmpty(tsOwner) && !_.isEmpty(loggedInUser) && tsOwner.toLowerCase() === loggedInUser.toLowerCase()) {
				status = true;
			}
			var loggedInUserObjFromColbrtrs = _.findWhere(collaborators,{userId : loggedInUser.toLowerCase()});
			if(!_.isEmpty(loggedInUserObjFromColbrtrs) && loggedInUserObjFromColbrtrs.permissions == "Edit" && loggedInUserObjFromColbrtrs.propagateShare) {
				status = true;
			}
			return status;
		}
		
		function isObjPresantInTaskSpace(id,clientId,objectId,cb) {
			 isObjectInTaskSpace(clientId,id,objectId).then(function(isPresentResp) {
				 if(isPresentResp.status == 200 && isPresentResp.data) {
					 if(isPresentResp.data.Status == 1) {
						 if(typeof cb === "function") {
							 cb(isPresentResp.data.Status);
						 }
					 }
					 if(isPresentResp.data.Status == -1) {
						 APIUserMessages.error('Insufficient privileges to open the Document');
					 }
					 if(isPresentResp.data.Status == 0) {
						 APIUserMessages.error('The requested Document is removed form the Taskspace');
					 }
				 }
			 });
		 }
		 
		 function openTaskSpaceObject(id,clientId,objectId,cb) {
			 getTaskSpaceById(clientId,id).then(function(TsResp) {
				 if (TsResp.status == 200 && TsResp.data.Status) {
					 setCurrent(clientId,id).then(function(SCresp) {
							if (SCresp.status == 200 && SCresp.data.Status) {
								openTaskSpace(clientId,id).then(function(OPTresp) {
									if(OPTresp.status == 200 && OPTresp.data.Status) {
										if(objectId) {
											getTaskSpaceState(clientId,id).then(function(resp) {
												if (resp.status == 200 && resp.data.Status) {
													var taskSpaceState = resp.data.TaskspaceState;
													taskSpaceState.focusObject1 = objectId;
													taskSpaceState.clientId = clientId;
													saveTaskSpaceState(taskSpaceState).then(function(STSresp) {
														if(STSresp.status == 200 && STSresp.data.Status) {
															if(typeof cb === "function") {
																cb(STSresp.data.Status);
															}
														}
													});
												}
											});
										} else {
											APIUserMessages.error('The requested Document ID is invalid');
										}
									}
								});
							}
					  });
				 }
			 });
		 }
		 
		 function handleTransferTSOwnershipCB(Report) {
				var items = {
							"Report" : Report
						};
				var modalInstance = $uibModal.open({
					  animation: true,
				      templateUrl: 'app/components/common/TransferOwnership/HandleResponse/HandleTransferOwnershipResp.html',
				      controller: 'HandleTransferOwnershipRespController',
				      appendTo : $('.rootContainer'),
				      controllerAs: 'htorc',
				      backdrop: 'static',
				      size: 'lg',
				      resolve: {
				    	  items : function() {
				    		  return items;
				    	  },
				    	  responseFor :  function() {
				    		  return {"type" : "Taskspace"};
				    	  }
				      }
				 });
			}
		 
		 function transferTSOwnership(postdata) {
			 return httpService.httpPost('taskspace/transfer', postdata).then(function(resp){
				 if(resp && resp.status == 200 && resp.data.Status) {
					 if(!_.isEmpty(resp.data.resultList)) {
						 handleTransferTSOwnershipCB(resp.data.Report);
					 }
					 return resp;
				 }
				 return resp;
			});
		 }
		 
		 function postAnnotationToSlack(postdata) {
			 return httpService.httpPost('taskspace/postann2slack', postdata);
		 }
		 
		 function renameTSSection(postdata) {
			 return httpService.httpPost('taskspace/renamesection', postdata);
		 }
		 
		 function addTSSection(postdata) {
			 return httpService.httpPost('taskspace/addsection', postdata);
		 }
		 
		 function removeSectionFromTS(postdata) {
			 return httpService.httpPost('taskspace/removesection', postdata);
		 }
		 
		 function moveToTSSection(postdata) {
			 return httpService.httpPost('taskspace/movedoc2section', postdata);
		 }
		 
		 function insertDefaultSection(selectedTS) {
			 var defaultSection = {
						"id": null,
				        "name": defaultSectionName,
				        "description": defaultSectionDescription
				};
				if(_.isArray(selectedTS.sections) && !_.isEmpty(selectedTS.sections)) {
					selectedTS.sections.unshift(defaultSection);
				} else if(_.isArray(selectedTS.sections) && _.isEmpty(selectedTS.sections)) {
					selectedTS.sections.push(defaultSection);
				} else if(!_.isArray(selectedTS.sections)) {
					selectedTS.sections = [defaultSection];
				}
			 return selectedTS;
		 }
		 
		 function newNote(postdata) {
			 return httpService.httpPost('taskspace/newnote', postdata);
		 }
		 
		 function getAnnotCount(objectInfo) {
			if(objectInfo) {
				let count = 0;
				if(_.isNumber(objectInfo.annotCount)) {
					count = objectInfo.annotCount;
				} else if(_.isNumber(objectInfo.annotationsCount) && _.isNumber(objectInfo.highlightsCount)) {
					count = objectInfo.annotationsCount+objectInfo.highlightsCount;
				}
				if(count == 1) {
					return count+" Annotation";
				}
				return count+" Annotations";
			}
			return 0+" Annotations";
		}
		 
		 function getTSButtons() {
	    	var tsButtonsList = [];
			var tsButtons = userService.getUserSettingsKeyList("taskspaceView_");
			if(!_.isEmpty(tsButtons)) {
				_.each(tsButtons,function(item){
					var tsButton = {};
					switch(item) {
						case "taskspaceView_Allow1PaneOR2Pane":
							tsButton = userService.getUiSetting(item);
							if(tsButton.show) {
								tsButtonsList.push(tsButton);
							}
							break;
						case "taskspaceView_NewTaskspace":
						case "taskspaceView_NewSection":
							tsButton = userService.getUiSetting(item,"modal");
							if(tsButton.show) {
								tsButtonsList.push(tsButton);
							}
							break;
					}
				});
			}
			return tsButtonsList;
		 }
		 
		 function showTSButton(key,tsButtonsList) {
	    	var status = false;
			var tsButton = {};
	    	if(!_.isEmpty(tsButtonsList)) {
	    		tsButton = _.findWhere(tsButtonsList,{"key": key});
	    	}
	    	if(tsButton && tsButton.show) {
	    		status = true;
	    	}
	    	return status;
		 }
		 
		 function disableTSButton(key,tsButtonsList) {
			var status = true;
			var tsButton = {};
			if(!_.isEmpty(tsButtonsList)) {
				tsButton = _.findWhere(tsButtonsList,{"key": key});
	    	}
			if(tsButton && tsButton.isEnabled) {
				status = false;
			}
			return status;
		 }
	
		function getTaskspaceUpdateMessage(tsUpdates,currentUser) {
			var text = "";
			var updates = _.groupBy(tsUpdates, function(msg) {
				return msg.action;
			});

			_.each(updates, function(msg, key) {
				_.each(msg, function(val, index) {
					if(val.userId && currentUser && val.userId.toLowerCase() != currentUser.toLowerCase()) {
						if (key == "DOCS_ADDED") {
							text = text + val.userId + ' Added a Document to the taskspace \n';
						}
						if (key == "SECTION_ADDED") {
							text = text + val.userId + ' Added a Section to the taskspace \n';
						}
						if (key == "SECTION_REMOVED") {
							text = text + val.userId + ' Removed a Section from the taskspace \n';
						}
						if (key == "SECTION_RENAMED") {
							text = text + val.userId + ' Renamed a Taskspace Section  \n';
						}
						
						if (key == "COMMENT_CREATED_OR_UPDATED") {
							text = text + val.userId + ' Added a comment \n';
						}
						
						if (key == "COMMENT_DELETED") {
							text = text + val.userId + ' Deleted a comment \n';
						}
						
						if (key == "DOCS_REMOVED") {
							text = text + val.userId + ' Removed a document from the taskspace \n';
						}
						
						if(key == "TS_RENAMED") {
							text = text+ val.userId +' Renamed the taskspace \n';
						}
						if(key == "TS_DELETED") {
							text = text+ val.userId +' Deleted the taskspace \n';
						}
						if(key == "TS_CREATED") {
							text = text+ val.userId +' Added a taskspace \n';
						}
						if(key == "TS_OWNER_CHANGED") {
							text = text+ val.userId +' Changed  the taskspace Owner \n';
						}
						
						if(key == "DOCUMENT_MOVED") {
							text = text+ val.userId +' Moved the taskspace Document \n';
						}
						
						if(key == "SHARED") {
							text = text+ val.userId +' Shared the taskspace \n';
						}
						
						if(key == "UNSHARED") {
							text = text+ val.userId +' Unshared the taskspace \n';
						}
						
						if(key == "PERMISSIONS_CHANGED") {
							text = text+ val.userId +' changed the taskspace permission \n';
						}
					}
				});
			});
			return text;
		};
		
		function setTsCurrentObject(postdata) {
			return httpService.httpPost('taskspace/setTsCurrentObj', postdata);
		}
		
		function setTsObjectSettings(postdata) {
			return httpService.httpPost('taskspace/setTsObjSettings', postdata);
		}
	}
})();